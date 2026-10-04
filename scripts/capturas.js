#!/usr/bin/env node
/*
 * scripts/capturas.js — revisa el sitio en un navegador real (Chrome o Edge sin ventana).
 *
 *   node scripts/capturas.js                      capturas a 375, 768 y 1280 px en .work/capturas/
 *   node scripts/capturas.js --widths 375,1280    solo esos anchos
 *   node scripts/capturas.js --eventos            lista los enlaces a wa.me y prueba el evento contacto_whatsapp
 *   node scripts/capturas.js --estados            captura lo que está oculto: comparativa, "Ver ejemplo", menú hamburguesa y chat
 *   node scripts/capturas.js --url http://localhost:8080 --out .work/capturas
 *
 * Además de capturar, avisa si hay errores en consola, desborde horizontal, una
 * cabecera que ocupa más de una fila o una llamada a n8n al cargar la página.
 *
 * No toca producción: las llamadas a n8n y a Google Analytics se responden aquí
 * mismo con datos simulados, así que no llega nada al webhook real ni a GA4.
 * Sin dependencias: habla con el navegador por el protocolo DevTools (Node 22+).
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
function opt(name, def) {
  const i = args.indexOf('--' + name);
  return i === -1 ? def : args[i + 1];
}
const URL_BASE = opt('url', 'http://localhost:8080').replace(/\/$/, '');
const OUT = path.resolve(ROOT, opt('out', '.work/capturas'));
const WIDTHS = opt('widths', '375,768,1280').split(',').map((n) => parseInt(n, 10)).filter(Boolean);
const SOLO_EVENTOS = args.includes('--eventos');
const ESTADOS = args.includes('--estados');
const PORT = 9339;

// Qué se captura. "hasta" recorta desde el inicio de un elemento hasta el final de otro.
const TARGETS = [
  { name: 'cabecera', sel: 'header.site-header' },
  { name: 'hero', sel: '#inicio' },
  { name: 'servicios', sel: '#servicios' },
  { name: 'como-funciona', sel: '#como-funciona' },
  { name: 'casos', sel: '#casos' },
  { name: 'diseno-web', sel: '#diseno-web' },
  { name: 'renueva-web', sel: '.promo-banner', pad: 24 },
  { name: 'paquetes', sel: '#paquetes', hasta: '#comparativa', pad: 24 },
  { name: 'mas-servicios', sel: '#mas-servicios', pad: 24 },
  { name: 'complementarios', sel: '#complementarios', pad: 24 },
];

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect() {
  let target;
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json();
      target = list.find((t) => t.type === 'page');
      if (target) break;
    } catch (e) { /* el navegador todavía está arrancando */ }
    await sleep(250);
  }
  if (!target) throw new Error('el navegador no abrió el puerto de depuración');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('no se pudo conectar al navegador')); });
  let seq = 0;
  const pending = new Map();
  const handlers = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) rej(new Error(msg.error.message)); else res(msg.result);
    } else if (msg.method) {
      handlers.forEach((h) => h(msg.method, msg.params));
    }
  };
  return {
    send(method, params) {
      const id = ++seq;
      ws.send(JSON.stringify({ id, method, params: params || {} }));
      return new Promise((res, rej) => pending.set(id, { res, rej }));
    },
    on(fn) { handlers.push(fn); },
    close() { ws.close(); },
  };
}

async function main() {
  const exe = BROWSERS.find((p) => fs.existsSync(p));
  if (!exe) throw new Error('no encontré Chrome ni Edge instalados');
  const profile = path.join(os.tmpdir(), 'synaptekai-capturas-perfil');
  fs.rmSync(profile, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const browser = spawn(exe, [
    '--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + profile,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio', 'about:blank',
  ], { stdio: 'ignore' });

  const problemas = [];
  let cdp;
  try {
    cdp = await connect();
    const peticionesExternas = [];
    let anchoActual = 0;
    let interactuando = false; // true mientras el script abre el chat o hace clics de prueba

    cdp.on((method, p) => {
      if (method === 'Runtime.exceptionThrown') {
        const d = p.exceptionDetails;
        problemas.push('[' + anchoActual + 'px] excepción: ' + ((d.exception && d.exception.description) || d.text));
      } else if (method === 'Runtime.consoleAPICalled' && (p.type === 'error' || p.type === 'warning')) {
        problemas.push('[' + anchoActual + 'px] console.' + p.type + ': ' + p.args.map((a) => a.value || a.description || '').join(' '));
      } else if (method === 'Log.entryAdded' && (p.entry.level === 'error' || p.entry.level === 'warning')) {
        problemas.push('[' + anchoActual + 'px] ' + p.entry.level + ': ' + p.entry.text + (p.entry.url ? ' (' + p.entry.url + ')' : ''));
      } else if (method === 'Fetch.requestPaused') {
        // Producción nunca recibe estas llamadas: se contestan aquí con datos simulados.
        const url = p.request.url;
        peticionesExternas.push(p.request.method + ' ' + url.split('?')[0]);
        let body = '';
        let type = 'application/javascript';
        if (url.includes('easypanel.host')) {
          type = 'application/json';
          body = '{}';
          // Cargar y recorrer la página no debe llamar a n8n: solo el formulario del
          // checklist y el chat lo hacen, y esos se prueban aparte (--estados, --eventos).
          if (!interactuando) problemas.push('[' + anchoActual + 'px] la página llamó a n8n sin interacción: ' + url.split('?')[0]);
        }
        cdp.send('Fetch.fulfillRequest', {
          requestId: p.requestId,
          responseCode: 200,
          responseHeaders: [
            { name: 'Content-Type', value: type },
            { name: 'Access-Control-Allow-Origin', value: '*' },
            { name: 'Access-Control-Allow-Headers', value: '*' },
          ],
          body: Buffer.from(body).toString('base64'),
        }).catch(() => {});
      }
    });

    await cdp.send('Page.enable');
    // El modal del checklist se abre solo al 70% de scroll y taparía las capturas:
    // se marca como ya mostrado antes de que cargue la página.
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: 'try { localStorage.setItem("synaptekai-lead-modal-shown", "1"); } catch (e) {}',
    });
    await cdp.send('Runtime.enable');
    await cdp.send('Log.enable');
    await cdp.send('Fetch.enable', { patterns: [
      { urlPattern: '*easypanel.host*' },
      { urlPattern: '*googletagmanager.com*' },
      { urlPattern: '*google-analytics.com*' },
      { urlPattern: '*analytics.google.com*' },
    ] });

    const evalJs = async (expression) => {
      const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error('evaluate: ' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description));
      return r.result.value;
    };
    const shot = async (file, clip) => {
      const params = { format: 'png' };
      if (clip) { params.clip = Object.assign({ scale: 1 }, clip); params.captureBeyondViewport = true; }
      const r = await cdp.send('Page.captureScreenshot', params);
      fs.writeFileSync(path.join(OUT, file), Buffer.from(r.data, 'base64'));
    };
    const cargar = async (w) => {
      anchoActual = w;
      const movil = w < 1024;
      const h = w < 768 ? 812 : (w < 1024 ? 1024 : 800);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: movil });
      await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: movil });
      await cdp.send('Page.navigate', { url: URL_BASE + '/' });
      for (let i = 0; i < 80; i++) {
        await sleep(250);
        if (await evalJs('!!document.getElementById("paquetes") && !!document.getElementById("sk-launcher")')) return h;
      }
      throw new Error('el sitio no terminó de cargar a ' + w + 'px');
    };

    if (SOLO_EVENTOS) {
      await cargar(1280);
      await sleep(1500);
      interactuando = true;
      const res = await evalJs(`(() => {
        // Evita que los clics de prueba abran WhatsApp; el evento se dispara igual.
        window.addEventListener('click', (e) => e.preventDefault(), true);
        document.getElementById('sk-launcher').click();
        const chip = document.querySelector('#sk-chips .sk-chip');
        if (chip) chip.click();
        const links = Array.from(document.querySelectorAll('a[href*="wa.me"]'));
        const antes = window.dataLayer.length;
        links.forEach((a) => a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
        const eventos = Array.from(window.dataLayer).slice(antes).map((x) => Array.from(x)).filter((x) => x[0] === 'event');
        return {
          enlaces: links.map((a) => ({ origen: a.getAttribute('data-origen') || (a.closest('[data-origen]') || { getAttribute: () => null }).getAttribute('data-origen'), texto: a.textContent.trim().replace(/\\s+/g, ' ').slice(0, 40), mensaje: decodeURIComponent((a.href.split('text=')[1] || '')) })),
          eventos: eventos.map((x) => x[1] + ' ' + JSON.stringify(x[2])),
          configs: Array.from(window.dataLayer).map((x) => Array.from(x)).filter((x) => x[0] === 'config').length,
        };
      })()`);
      console.log('Enlaces a wa.me: ' + res.enlaces.length);
      res.enlaces.forEach((e) => console.log('  [' + (e.origen || 'SIN ORIGEN') + '] ' + e.texto + '  ->  ' + e.mensaje));
      console.log('Eventos disparados: ' + res.eventos.length);
      const cuenta = {};
      res.eventos.forEach((e) => { cuenta[e] = (cuenta[e] || 0) + 1; });
      Object.keys(cuenta).forEach((k) => console.log('  ' + cuenta[k] + ' x ' + k));
      console.log('Llamadas gtag("config"): ' + res.configs + ' (debe ser 1)');
    } else {
      for (const w of WIDTHS) {
        if (interactuando) {
          // El chat envía su resumen al salir de la página: se sale aquí, antes de
          // empezar a vigilar la siguiente carga, para no atribuírselo a ella.
          await cdp.send('Page.navigate', { url: 'about:blank' });
          await sleep(500);
        }
        interactuando = false;
        const h = await cargar(w);
        await sleep(3200); // deja que el diagrama del hero llegue a su estado encendido
        await shot('portada-' + w + '.png');
        // La cabecera debe caber en una sola fila: se mide su alto y cuánto espacio le sobra.
        const cab = await evalJs(`(() => {
          const hd = document.querySelector('header.site-header');
          const cs = getComputedStyle(hd);
          const hijos = Array.from(hd.children).filter((el) => el.getBoundingClientRect().width > 0);
          const tops = hijos.map((el) => { const r = el.getBoundingClientRect(); return Math.round(r.top + r.height / 2); });
          const ancho = hd.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
          const usado = hijos.reduce((s, el) => s + el.getBoundingClientRect().width, 0) + (parseFloat(cs.columnGap) || 0) * (hijos.length - 1);
          const nav = document.querySelector('.desktop-nav');
          const botonTexto = document.querySelector('.desktop-actions');
          const hamburguesa = document.getElementById('mobile-nav-toggle');
          const visible = (el) => !!el && el.getBoundingClientRect().width > 0;
          return {
            alto: Math.round(hd.getBoundingClientRect().height),
            unaFila: Math.max.apply(null, tops) - Math.min.apply(null, tops) < 8 && hd.scrollWidth <= hd.clientWidth,
            holgura: Math.round(ancho - usado),
            modo: (visible(nav) ? 'menú completo' : 'hamburguesa') + (visible(botonTexto) ? ' + botón con texto' : ' + botón ícono') + (visible(hamburguesa) && visible(nav) ? ' (ERROR: hamburguesa y menú a la vez)' : ''),
          };
        })()`);
        console.log('  cabecera a ' + w + 'px: ' + cab.alto + 'px de alto, ' + cab.modo + ', holgura ' + cab.holgura + 'px');
        if (!cab.unaFila || cab.holgura < 0) problemas.push('[' + w + 'px] la cabecera no cabe en una sola fila (alto ' + cab.alto + 'px, holgura ' + cab.holgura + 'px)');
        // Recorre la página para activar las animaciones de entrada antes de capturar.
        const total = await evalJs('document.documentElement.scrollHeight');
        for (let y = 0; y < total; y += Math.round(h * 0.5)) {
          await evalJs('window.scrollTo(0, ' + y + ')');
          await sleep(120);
        }
        await evalJs('window.scrollTo(0, 0)');
        await sleep(1400);
        const info = await evalJs(`({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, alto: document.documentElement.scrollHeight })`);
        if (info.sw > info.iw) problemas.push('[' + w + 'px] desborde horizontal: el contenido mide ' + info.sw + 'px en una ventana de ' + info.iw + 'px');
        for (const t of TARGETS) {
          const rect = await evalJs(`(() => {
            const a = document.querySelector(${JSON.stringify(t.sel)});
            if (!a) return null;
            const ra = a.getBoundingClientRect();
            const b = ${t.hasta ? 'document.querySelector(' + JSON.stringify(t.hasta) + ')' : 'null'};
            const bottom = b ? b.getBoundingClientRect().bottom : ra.bottom;
            return { x: 0, y: ra.top + window.scrollY, width: window.innerWidth, height: bottom - ra.top };
          })()`);
          if (!rect) { console.log('  (no existe ' + t.sel + ' a ' + w + 'px)'); continue; }
          const pad = t.pad || 0;
          rect.y = Math.max(0, rect.y - pad);
          rect.height = Math.ceil(rect.height + pad * 2);
          await shot(t.name + '-' + w + '.png', rect);
        }
        if (ESTADOS) {
          interactuando = true;
          // Abre la comparativa y los "Ver ejemplo", y los captura.
          const abierto = await evalJs(`(() => {
            const btn = Array.from(document.querySelectorAll('#paquetes button')).find((b) => /comparativa/i.test(b.textContent));
            if (btn) btn.click();
            const det = Array.from(document.querySelectorAll('details[data-ejemplo]'));
            det.forEach((d) => { d.open = true; });
            return { comparativa: !!btn, ejemplos: det.length };
          })()`);
          await sleep(900);
          const posters = await evalJs(`Array.from(document.querySelectorAll('details[data-ejemplo] video')).map((v) => v.getAttribute('poster') || '(sin póster)')`);
          console.log('  comparativa: ' + (abierto.comparativa ? 'abierta' : 'NO ENCONTRADA') + ' | ejemplos abiertos: ' + abierto.ejemplos + ' | pósters: ' + posters.join(', '));
          const recorte = (desde, hasta) => evalJs(`(() => {
            const a = document.querySelector(${JSON.stringify(desde)}).getBoundingClientRect();
            const b = document.querySelector(${JSON.stringify(hasta)}).getBoundingClientRect();
            return { x: 0, y: Math.max(0, a.top + window.scrollY - 24), width: window.innerWidth, height: Math.ceil(b.bottom - a.top + 48) };
          })()`);
          await shot('estado-comparativa-' + w + '.png', await recorte('#paquetes .pkg-grid', '#comparativa'));
          await shot('estado-ejemplos-' + w + '.png', await recorte('#complementarios', '#complementarios'));
          // Menú hamburguesa (solo donde existe): lo abre, lo captura y lo cierra.
          await evalJs('window.scrollTo(0, 0)');
          const hayHamburguesa = await evalJs(`(() => {
            const b = document.getElementById('mobile-nav-toggle');
            if (!b || b.getBoundingClientRect().width === 0) return false;
            b.click();
            return true;
          })()`);
          if (hayHamburguesa) {
            await sleep(400);
            const enlaces = await evalJs(`Array.from(document.querySelectorAll('#mobile-nav-panel a')).map((a) => a.textContent.trim()).join(' | ')`);
            console.log('  menú hamburguesa: ' + (enlaces || 'NO SE ABRIÓ'));
            if (!enlaces) problemas.push('[' + w + 'px] el menú hamburguesa no se abrió');
            await shot('estado-menu-' + w + '.png');
            await evalJs(`document.getElementById('mobile-nav-toggle').click()`);
            await sleep(300);
          }
          // Abre el chat y elige el primer servicio "bajo pedido".
          await evalJs('window.scrollTo(0, 0)');
          await evalJs(`(() => {
            document.getElementById('sk-launcher').click();
            const chip = document.querySelector('#sk-chips .sk-chip-bajo-pedido');
            if (chip) chip.click();
          })()`);
          await sleep(700);
          await shot('estado-chat-' + w + '.png');
        }
        console.log('OK ' + w + 'px — página de ' + info.alto + 'px de alto');
      }
      console.log('Capturas en ' + path.relative(ROOT, OUT));
    }

    const unicas = Array.from(new Set(peticionesExternas));
    console.log('Llamadas externas simuladas (no llegaron a producción): ' + (unicas.length ? '' : 'ninguna'));
    unicas.forEach((u) => console.log('  ' + u));
    console.log(problemas.length ? 'PROBLEMAS EN CONSOLA / LAYOUT:' : 'Consola sin errores ni advertencias.');
    Array.from(new Set(problemas)).forEach((p) => console.log('  ' + p));
  } finally {
    if (cdp) cdp.close();
    browser.kill();
  }
  process.exitCode = problemas.length ? 2 : 0;
}

main().catch((e) => { console.error('ERROR: ' + e.message); process.exit(1); });
