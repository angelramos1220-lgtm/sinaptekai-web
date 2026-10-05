#!/usr/bin/env node
/*
 * scripts/comparar.js — compara el sitio actual (bundle, rama main) con el nuevo (Astro).
 *
 *   node scripts/comparar.js                    capturas + diferencias a 375, 768, 1280 y 1440 px
 *   node scripts/comparar.js --widths 375,1280  solo esos anchos
 *   node scripts/comparar.js --comportamiento   además: enlaces de WhatsApp, formulario del
 *                                               checklist, chat y popup, en los dos sitios
 *   node scripts/comparar.js --actual http://localhost:8080 --nuevo http://localhost:8081
 *
 * Deja las capturas en .work/comparacion/actual y .work/comparacion/nuevo, y el
 * informe en .work/comparacion/informe.md.
 *
 * Qué compara, sección por sección: el texto visible, la posición y el tamaño de cada
 * bloque de texto y de cada tarjeta, la tipografía y el color, y las reglas :hover y
 * :focus de cada elemento.
 *
 * No toca producción: las llamadas a n8n y a Google Analytics se responden aquí mismo
 * con datos simulados. Herramienta de la migración: se borra con el bundle viejo.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i === -1 ? def : args[i + 1]; };
const SITIOS = {
  actual: opt('actual', 'http://localhost:8080').replace(/\/$/, ''),
  nuevo: opt('nuevo', 'http://localhost:8081').replace(/\/$/, ''),
};
const OUT = path.resolve(ROOT, opt('out', '.work/comparacion'));
const WIDTHS = opt('widths', '375,768,1280,1440').split(',').map((n) => parseInt(n, 10)).filter(Boolean);
const COMPORTAMIENTO = args.includes('--comportamiento');
const PORT = 9340;
const TOLERANCIA = 1; // px

const SECCIONES = [
  { name: 'cabecera', sel: 'header.site-header' },
  { name: 'hero', sel: '#inicio' },
  { name: 'servicios', sel: '#servicios' },
  { name: 'como-funciona', sel: '#como-funciona' },
  { name: 'casos', sel: '#casos' },
  { name: 'diseno-web', sel: '#diseno-web' },
  { name: 'paquetes', sel: '#paquetes' },
  { name: 'recursos', sel: '#recursos' },
  { name: 'contacto', sel: '#contacto' },
  { name: 'comentarios', sel: '#comentarios' },
  { name: 'footer', sel: 'footer' },
];

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
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
    } catch (e) { /* arrancando */ }
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
    } else if (msg.method) handlers.forEach((h) => h(msg.method, msg.params));
  };
  return {
    send(method, params) { const id = ++seq; ws.send(JSON.stringify({ id, method, params: params || {} })); return new Promise((res, rej) => pending.set(id, { res, rej })); },
    on(fn) { handlers.push(fn); },
    close() { ws.close(); },
  };
}

// Corre dentro de la página: mide todo lo que se compara.
const MEDIR = `(async (secciones) => {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const norm = (s) => s.replace(/\\s+/g, ' ').trim();
  const r1 = (n) => Math.round(n * 10) / 10;
  const out = { alto: document.documentElement.scrollHeight, ancho: document.documentElement.scrollWidth, ventana: window.innerWidth, secciones: {} };
  // Reglas :hover / :focus por clase (las del motor viejo: .scpN; las nuevas: .hv-x / .fc-x).
  const reglas = {};
  for (const sheet of Array.from(document.styleSheets)) {
    let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
    for (const rule of Array.from(rules || [])) {
      const m = rule.selectorText && rule.selectorText.match(/^\\.((?:scp|hv-|fc-)[a-z0-9-]+):(hover|focus)$/);
      if (!m) continue;
      const decls = Array.from(rule.style).map((p) => p + ':' + rule.style.getPropertyValue(p).replace(/\\s+/g, '')).sort().join(';');
      (reglas[m[1]] = reglas[m[1]] || []).push(m[2] + '{' + decls + '}');
    }
  }
  for (const s of secciones) {
    const root = document.querySelector(s.sel);
    if (!root) { out.secciones[s.name] = null; continue; }
    const base = root.getBoundingClientRect();
    const sec = { alto: r1(base.height), ancho: r1(base.width), textos: [], tarjetas: [], estados: [], controles: [] };
    // Textos: se agrupan por bloque (el ancestro más cercano que no es "inline") y se
    // mide la tinta real del texto con Range. Así da igual que el motor viejo envuelva
    // cada dato en un <span class="sc-interp"> y Astro no: se compara lo que se ve.
    const bloqueDe = new Map();
    const bloque = (el) => {
      let e = el;
      while (e && e !== root && getComputedStyle(e).display === 'inline') e = e.parentElement;
      return e || root;
    };
    const grupos = new Map();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let nodo;
    while ((nodo = walker.nextNode())) {
      if (!nodo.textContent.trim()) continue;
      const padre = nodo.parentElement;
      if (!padre || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(padre.tagName)) continue;
      const rango = document.createRange();
      rango.selectNodeContents(nodo);
      const rects = Array.from(rango.getClientRects()).filter((q) => q.width > 0 && q.height > 0);
      if (!rects.length) continue; // texto no dibujado (display:none, hidden, <details> cerrado)
      if (!bloqueDe.has(padre)) bloqueDe.set(padre, bloque(padre));
      const b = bloqueDe.get(padre);
      if (!grupos.has(b)) grupos.set(b, { partes: [], l: Infinity, t: Infinity, r: -Infinity, bt: -Infinity, estilos: [] });
      const g = grupos.get(b);
      g.partes.push(nodo.textContent);
      for (const q of rects) { g.l = Math.min(g.l, q.left); g.t = Math.min(g.t, q.top); g.r = Math.max(g.r, q.right); g.bt = Math.max(g.bt, q.bottom); }
      const cs = getComputedStyle(padre);
      const firma = [cs.fontSize, cs.fontWeight, cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), cs.color, cs.lineHeight, cs.letterSpacing, cs.textTransform].join(' | ');
      if (g.estilos[g.estilos.length - 1] !== firma) g.estilos.push(firma);
    }
    for (const g of grupos.values()) {
      sec.textos.push({ t: norm(g.partes.join(' ')), x: r1(g.l - base.left), y: r1(g.t - base.top), w: r1(g.r - g.l), h: r1(g.bt - g.t), estilo: g.estilos.join(' / ') });
    }
    const todos = [root].concat(Array.from(root.querySelectorAll('*')));
    for (const el of todos) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (el.hasAttribute('data-tilt-card')) {
        sec.tarjetas.push({ x: r1(r.left - base.left), y: r1(r.top - base.top), w: r1(r.width), h: r1(r.height), radio: cs.borderTopLeftRadius, pad: cs.paddingTop + ' ' + cs.paddingRight, fondo: cs.backgroundImage.slice(0, 80) });
      }
      if (/^(a|button|input|textarea)$/i.test(el.tagName)) {
        sec.controles.push({ tag: el.tagName.toLowerCase(), x: r1(r.left - base.left), y: r1(r.top - base.top), w: r1(r.width), h: r1(r.height), radio: cs.borderTopLeftRadius, fondo: cs.backgroundColor, col: cs.color, borde: cs.borderTopWidth + ' ' + cs.borderTopColor });
      }
      const est = Array.from(el.classList).filter((c) => reglas[c]).map((c) => reglas[c].join('|')).sort().join(' || ');
      if (est) sec.estados.push({ tag: el.tagName.toLowerCase(), est });
    }
    out.secciones[s.name] = sec;
  }
  return out;
})`;

async function main() {
  const exe = BROWSERS.find((p) => fs.existsSync(p));
  if (!exe) throw new Error('no encontré Chrome ni Edge instalados');
  const profile = path.join(os.tmpdir(), 'synaptekai-comparar-perfil');
  fs.rmSync(profile, { recursive: true, force: true });
  for (const k of Object.keys(SITIOS)) fs.mkdirSync(path.join(OUT, k), { recursive: true });

  const browser = spawn(exe, ['--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + profile,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio', 'about:blank'], { stdio: 'ignore' });

  const informe = [];
  const log = (s) => { console.log(s); informe.push(s); };
  let cdp;
  try {
    cdp = await connect();
    const consola = [];
    let capturadas = []; // peticiones a n8n interceptadas
    let etiqueta = '';
    cdp.on((method, p) => {
      if (method === 'Runtime.exceptionThrown') consola.push(etiqueta + ' excepción: ' + ((p.exceptionDetails.exception && p.exceptionDetails.exception.description) || p.exceptionDetails.text));
      else if (method === 'Runtime.consoleAPICalled' && (p.type === 'error' || p.type === 'warning')) consola.push(etiqueta + ' console.' + p.type + ': ' + p.args.map((a) => a.value || a.description || '').join(' '));
      else if (method === 'Log.entryAdded' && (p.entry.level === 'error' || p.entry.level === 'warning')) consola.push(etiqueta + ' ' + p.entry.level + ': ' + p.entry.text);
      else if (method === 'Fetch.requestPaused') {
        const url = p.request.url;
        const esN8n = url.includes('easypanel.host');
        if (esN8n) capturadas.push({ url, metodo: p.request.method, tipo: p.request.headers['Content-Type'] || p.request.headers['content-type'] || '', cuerpo: p.request.postData || '' });
        cdp.send('Fetch.fulfillRequest', {
          requestId: p.requestId, responseCode: 200,
          responseHeaders: [{ name: 'Content-Type', value: esN8n ? 'application/json' : 'application/javascript' }, { name: 'Access-Control-Allow-Origin', value: '*' }, { name: 'Access-Control-Allow-Headers', value: '*' }],
          body: Buffer.from(esN8n ? '{}' : '').toString('base64'),
        }).catch(() => {});
      }
    });
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Log.enable');
    await cdp.send('Fetch.enable', { patterns: [{ urlPattern: '*easypanel.host*' }, { urlPattern: '*googletagmanager.com*' }, { urlPattern: '*google-analytics.com*' }, { urlPattern: '*analytics.google.com*' }] });

    const evalJs = async (expression) => {
      const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error('evaluate: ' + ((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text));
      return r.result.value;
    };
    const shot = async (file, clip) => {
      const params = { format: 'png' };
      if (clip) { params.clip = Object.assign({ scale: 1 }, clip); params.captureBeyondViewport = true; }
      const r = await cdp.send('Page.captureScreenshot', params);
      fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
    };
    let popupMostrado = true;
    let movimientoReducido = false;
    let idScript = null;
    const prepararAlmacen = async (mostrado) => {
      if (idScript) await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: idScript });
      popupMostrado = mostrado;
      const r = await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: mostrado ? 'try { localStorage.setItem("synaptekai-lead-modal-shown", "1"); } catch (e) {}' : 'try { localStorage.removeItem("synaptekai-lead-modal-shown"); sessionStorage.clear(); } catch (e) {}' });
      idScript = r.identifier;
    };
    await prepararAlmacen(true);
    const cargar = async (sitio, w) => {
      etiqueta = '[' + sitio + ' ' + w + 'px]';
      const movil = w < 1024;
      const h = w < 768 ? 812 : (w < 1024 ? 1024 : 800);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: movil });
      await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: movil });
      // El equipo puede tener las animaciones del sistema apagadas: se fuerza el modo
      // con movimiento para probar las animaciones (el modo reducido se prueba aparte).
      await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: movimientoReducido ? 'reduce' : 'no-preference' }] });
      await cdp.send('Page.navigate', { url: 'about:blank' });
      await sleep(200);
      await cdp.send('Page.navigate', { url: SITIOS[sitio] + '/' });
      for (let i = 0; i < 80; i++) {
        await sleep(250);
        if (await evalJs('!!document.getElementById("paquetes") && !!document.getElementById("sk-launcher") && document.readyState === "complete"')) return h;
      }
      throw new Error('no terminó de cargar: ' + sitio + ' a ' + w + 'px');
    };

    // ---------------- Capturas y medidas ----------------
    const total = { textos: 0, geom: 0, estilo: 0, estados: 0 };
    for (const w of WIDTHS) {
      const medidas = {};
      for (const sitio of Object.keys(SITIOS)) {
        const h = await cargar(sitio, w);
        await sleep(3200);
        await shot(path.join(OUT, sitio, 'portada-' + w + '.png'));
        const alto = await evalJs('document.documentElement.scrollHeight');
        for (let y = 0; y < alto; y += Math.round(h * 0.5)) { await evalJs('window.scrollTo(0, ' + y + ')'); await sleep(120); }
        await evalJs('window.scrollTo(0, 0)');
        await sleep(3200);
        medidas[sitio] = await evalJs(MEDIR + '(' + JSON.stringify(SECCIONES) + ')');
        for (const s of SECCIONES) {
          const rect = await evalJs(`(() => { const a = document.querySelector(${JSON.stringify(s.sel)}); if (!a) return null; const r = a.getBoundingClientRect(); return { x: 0, y: r.top + window.scrollY, width: window.innerWidth, height: Math.ceil(r.height) }; })()`);
          if (rect) await shot(path.join(OUT, sitio, s.name + '-' + w + '.png'), rect);
        }
      }
      log('\n## ' + w + ' px');
      const A = medidas.actual, N = medidas.nuevo;
      log('Alto de la página: actual ' + A.alto + ' px, nuevo ' + N.alto + ' px (diferencia ' + (N.alto - A.alto) + ' px). Desborde horizontal: actual ' + (A.ancho > A.ventana ? 'SÍ' : 'no') + ', nuevo ' + (N.ancho > N.ventana ? 'SÍ' : 'no') + '.');
      for (const s of SECCIONES) {
        const a = A.secciones[s.name], n = N.secciones[s.name];
        if (!a || !n) { log('- **' + s.name + '**: ' + (!a ? 'no existe en el actual' : 'NO EXISTE EN EL NUEVO')); continue; }
        const dif = [];
        if (Math.abs(a.alto - n.alto) > TOLERANCIA) dif.push('alto ' + a.alto + ' → ' + n.alto + ' px');
        // textos
        const ta = a.textos.map((x) => x.t), tn = n.textos.map((x) => x.t);
        let textoIgual = ta.length === tn.length && ta.every((x, i) => x === tn[i]);
        if (!textoIgual) {
          total.textos++;
          const faltan = ta.filter((x) => !tn.includes(x)), sobran = tn.filter((x) => !ta.includes(x));
          dif.push('TEXTO distinto (' + ta.length + ' bloques → ' + tn.length + ')' + (faltan.length ? '; faltan: ' + faltan.slice(0, 4).map((x) => '"' + x.slice(0, 70) + '"').join(', ') : '') + (sobran.length ? '; sobran: ' + sobran.slice(0, 4).map((x) => '"' + x.slice(0, 70) + '"').join(', ') : '') + (!faltan.length && !sobran.length ? '; mismo texto en otro orden' : ''));
        } else {
          let movidos = 0, maxd = 0, ejemplo = '';
          const estilos = [];
          for (let i = 0; i < a.textos.length; i++) {
            const p = a.textos[i], q = n.textos[i];
            const d = Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y), Math.abs(p.w - q.w), Math.abs(p.h - q.h));
            if (d > TOLERANCIA) { movidos++; if (d > maxd) { maxd = d; ejemplo = '"' + p.t.slice(0, 40) + '" (x ' + p.x + '→' + q.x + ', y ' + p.y + '→' + q.y + ', ancho ' + p.w + '→' + q.w + ', alto ' + p.h + '→' + q.h + ')'; } }
            if (p.estilo !== q.estilo) estilos.push('"' + p.t.slice(0, 30) + '": ' + p.estilo + ' → ' + q.estilo);
          }
          if (movidos) { total.geom++; dif.push(movidos + ' de ' + a.textos.length + ' textos desplazados más de ' + TOLERANCIA + ' px (máx. ' + Math.round(maxd * 10) / 10 + ' px: ' + ejemplo + ')'); }
          if (estilos.length) { total.estilo++; dif.push('tipografía/color: ' + estilos.slice(0, 5).join('; ') + (estilos.length > 5 ? ' … (' + estilos.length + ' en total)' : '')); }
        }
        // tarjetas
        if (a.tarjetas.length !== n.tarjetas.length) dif.push('tarjetas: ' + a.tarjetas.length + ' → ' + n.tarjetas.length);
        else {
          let mov = 0; const est = [];
          a.tarjetas.forEach((p, i) => {
            const q = n.tarjetas[i];
            if (Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y), Math.abs(p.w - q.w), Math.abs(p.h - q.h)) > TOLERANCIA) mov++;
            for (const k of ['radio', 'pad', 'fondo']) if (p[k] !== q[k]) est.push('tarjeta ' + (i + 1) + ' ' + k + ': ' + p[k] + ' → ' + q[k]);
          });
          if (mov) dif.push(mov + ' de ' + a.tarjetas.length + ' tarjetas con otra posición o tamaño');
          if (est.length) dif.push(est.slice(0, 4).join('; '));
        }
        // controles (enlaces, botones, campos)
        if (a.controles.length !== n.controles.length) dif.push('enlaces/botones/campos: ' + a.controles.length + ' → ' + n.controles.length);
        else {
          const est = [];
          let mov = 0, ej = '';
          a.controles.forEach((p, i) => {
            const q = n.controles[i];
            for (const k of ['radio', 'fondo', 'col', 'borde']) if (p[k] !== q[k]) est.push(p.tag + ' ' + (i + 1) + ' ' + k + ': ' + p[k] + ' → ' + q[k]);
            if (Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y), Math.abs(p.w - q.w), Math.abs(p.h - q.h)) > TOLERANCIA) { mov++; if (!ej) ej = p.tag + ' ' + (i + 1) + ' (x ' + p.x + '→' + q.x + ', y ' + p.y + '→' + q.y + ', ancho ' + p.w + '→' + q.w + ', alto ' + p.h + '→' + q.h + ')'; }
          });
          if (mov) dif.push(mov + ' de ' + a.controles.length + ' enlaces/botones/campos con otra posición o tamaño (p. ej. ' + ej + ')');
          if (est.length) dif.push('controles: ' + est.slice(0, 4).join('; ') + (est.length > 4 ? ' … (' + est.length + ')' : ''));
        }
        // estados hover / focus
        const ea = a.estados.map((x) => x.tag + ' ' + x.est), en = n.estados.map((x) => x.tag + ' ' + x.est);
        if (ea.length !== en.length || !ea.every((x, i) => x === en[i])) { total.estados++; dif.push('reglas hover/foco distintas (' + ea.length + ' elementos → ' + en.length + ')'); }
        log('- **' + s.name + '**: ' + (dif.length ? dif.join(' · ') : 'sin diferencias (' + a.textos.length + ' textos, ' + a.tarjetas.length + ' tarjetas, ' + a.controles.length + ' controles, ' + ea.length + ' con hover/foco)'));
      }
    }

    // ---------------- Comportamiento ----------------
    if (COMPORTAMIENTO) {
      log('\n## Comportamiento (1280 px)');
      const res = {};
      for (const sitio of Object.keys(SITIOS)) {
        const r = (res[sitio] = {});
        // 1. Enlaces de WhatsApp y evento
        await prepararAlmacen(true);
        await cargar(sitio, 1280);
        await sleep(1500);
        r.enlaces = await evalJs(`(() => {
          window.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); }, true);
          const eventos = [];
          const original = window.gtag;
          window.gtag = function () { if (arguments[0] === 'event') eventos.push(arguments[1] + ' ' + JSON.stringify(arguments[2])); if (original) original.apply(this, arguments); };
          const infoOrig = console.info;
          console.info = function (m, p) { if (typeof m === 'string' && m.indexOf('[GA4') === 0) eventos.push(m.replace(/^\\[GA4[^\\]]*\\] /, '') + ' ' + JSON.stringify(p)); else infoOrig.apply(console, arguments); };
          const links = Array.from(document.querySelectorAll('a[href*="wa.me"]'));
          links.forEach((a) => a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
          return { lista: links.map((a) => (a.getAttribute('data-origen') || (a.closest('[data-origen]') ? a.closest('[data-origen]').getAttribute('data-origen') : 'SIN ORIGEN')) + ' | ' + decodeURIComponent(a.href.split('text=')[1] || '')), eventos };
        })()`);
        // 2. Formulario del checklist (sección): la petición se intercepta, no llega a n8n
        capturadas = [];
        await cargar(sitio, 1280);
        await sleep(1200);
        r.validacion = await evalJs(`(() => {
          const f = document.querySelector('form[data-lead-source="seccion"]');
          f.querySelector('button[type="submit"]').click();
          return Array.from(f.querySelectorAll('[data-error-for]')).map((e) => e.textContent);
        })()`);
        await evalJs(`(() => {
          const f = document.querySelector('form[data-lead-source="seccion"]');
          const set = (n, v) => { const i = f.elements[n]; i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); };
          set('nombre', ' Prueba Local '); set('email', 'prueba@ejemplo.com'); set('negocio', 'Negocio de prueba');
          f.querySelector('button[type="submit"]').click();
        })()`);
        await sleep(1500);
        r.lead = capturadas.filter((c) => c.metodo === 'POST').map((c) => ({ ruta: c.url.replace(/^https?:\/\/[^/]+/, ''), tipo: c.tipo, cuerpo: c.cuerpo }));
        r.despuesDelEnvio = await evalJs('location.pathname + " | clave=" + localStorage.getItem("synaptekai-lead-modal-shown")');
        // 3. Chat: abrir, elegir un servicio bajo pedido, escribir, cerrar
        capturadas = [];
        await cargar(sitio, 1280);
        await sleep(1200);
        r.chat = await evalJs(`(() => {
          document.getElementById('sk-launcher').click();
          const chips = Array.from(document.querySelectorAll('#sk-chips .sk-chip')).map((c) => c.getAttribute('data-id') + (c.classList.contains('sk-chip-bajo-pedido') ? '*' : '') + '=' + c.textContent);
          document.querySelector('#sk-chips .sk-chip[data-id="redes"]').click();
          const input = document.getElementById('sk-input');
          input.value = 'rescatar mi web y dominio';
          document.getElementById('sk-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          input.value = 'xyz sin sentido';
          document.getElementById('sk-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          const mensajes = Array.from(document.querySelectorAll('#sk-log .sk-msg')).map((m) => m.className.replace('sk-msg ', '') + ': ' + m.textContent.replace(/\\s+/g, ' ').trim());
          const enlaces = Array.from(document.querySelectorAll('#sk-log a')).map((a) => decodeURIComponent(a.href.split('text=')[1] || a.href));
          document.getElementById('sk-close').click();
          return { chips, mensajes, enlaces, headerWa: decodeURIComponent(document.getElementById('sk-header-wa').href.split('text=')[1] || '') };
        })()`);
        await sleep(800);
        r.chatEnvios = capturadas.filter((c) => c.metodo === 'POST').map((c) => {
          let j = {}; try { j = JSON.parse(c.cuerpo); } catch (e) {}
          return { ruta: c.url.replace(/^https?:\/\/[^/]+/, ''), tipo: c.tipo, claves: Object.keys(j).join(','), servicioElegido: j.servicioElegido, mensajes: (j.mensajes || []).map((m) => m.from + ': ' + m.text), clavesMensaje: j.mensajes && j.mensajes[0] ? Object.keys(j.mensajes[0]).join(',') : '' };
        });
        // 4. Popup: aparece al 70 % del scroll y solo una vez
        await prepararAlmacen(false);
        await cargar(sitio, 1280);
        await sleep(800);
        const estadoPopup = 'getComputedStyle(document.getElementById("lead-modal-overlay")).display';
        const antes = await evalJs(estadoPopup);
        await evalJs('window.scrollTo(0, document.documentElement.scrollHeight * 0.45)'); await sleep(500);
        const al45 = await evalJs(estadoPopup);
        await evalJs('window.scrollTo(0, document.documentElement.scrollHeight * 0.72)'); await sleep(700);
        const al72 = await evalJs(estadoPopup);
        const foco = await evalJs('document.activeElement && document.activeElement.id');
        const clave = await evalJs('localStorage.getItem("synaptekai-lead-modal-shown")');
        await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await sleep(300);
        const trasEscape = await evalJs(estadoPopup);
        r.popup = 'inicio=' + antes + ' · al 45 %=' + al45 + ' · al 72 %=' + al72 + ' · foco=' + foco + ' · clave=' + clave + ' · tras Escape=' + trasEscape;
        // 5. Saludo del chat (burbuja a los 3 s, una vez por sesión)
        await cargar(sitio, 1280);
        await sleep(3900);
        r.saludo = await evalJs('(() => { const b = document.getElementById("sk-greet-bubble"); return "burbuja " + (b.hidden ? "oculta" : "visible: " + b.textContent) + " · clave=" + sessionStorage.getItem("synaptekai-chat-greeted-session"); })()');
        await prepararAlmacen(true);

        // 6. Animaciones e interacciones de la página (escritorio, puntero fino)
        await cargar(sitio, 1280);
        await sleep(1500);
        r.hero = await evalJs('(() => { const d = window.__heroConstellationDebug(); return { nodos: d.nodeCount, ancho: d.cssW, alto: d.cssH, modo: d.mode || "interactivo", enMarcha: d.running }; })()');
        const centro = await evalJs(`(() => { const c = document.querySelector('#paquetes .pkg-grid [data-tilt-card]'); c.scrollIntoView({ block: 'center' }); const q = c.getBoundingClientRect(); return { x: Math.round(q.left + q.width * 0.75), y: Math.round(q.top + q.height * 0.25) }; })()`);
        await sleep(900);
        const c2 = await evalJs(`(() => { const q = document.querySelector('#paquetes .pkg-grid [data-tilt-card]').getBoundingClientRect(); return { x: Math.round(q.left + q.width * 0.75), y: Math.round(q.top + q.height * 0.25) }; })()`);
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c2.x - 3, y: c2.y - 3 });
        await sleep(120);
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c2.x, y: c2.y });
        await sleep(400);
        r.tarjeta = await evalJs(`(() => { const c = document.querySelector('#paquetes .pkg-grid [data-tilt-card]'); const v = (n) => c.style.getPropertyValue(n).trim(); return { activa: c.classList.contains('is-active'), entro: c.classList.contains('tc-in'), tiltX: v('--tilt-x'), tiltY: v('--tilt-y'), tiltZ: v('--tilt-z'), mx: v('--mx'), my: v('--my'), borde: v('--border-angle'), sombra: getComputedStyle(c).boxShadow.slice(0, 60) }; })()`);
        void centro;
        // banner de Diseño Web: se inclina menos
        const b2 = await evalJs(`(() => { const c = document.querySelector('.promo-banner'); c.scrollIntoView({ block: 'center' }); return true; })()`);
        void b2;
        await sleep(900);
        const pb = await evalJs(`(() => { const q = document.querySelector('.promo-banner').getBoundingClientRect(); return { x: Math.round(q.left + q.width * 0.9), y: Math.round(q.top + q.height * 0.5) }; })()`);
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pb.x - 3, y: pb.y });
        await sleep(120);
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pb.x, y: pb.y });
        await sleep(400);
        r.banner = await evalJs(`(() => { const c = document.querySelector('.promo-banner'); return { activa: c.classList.contains('is-active'), tiltY: c.style.getPropertyValue('--tilt-y').trim() }; })()`);
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 5 });
        // comparativa
        r.comparativa = await evalJs(`(async () => {
          const pausa = (ms) => new Promise((ok) => setTimeout(ok, ms));
          const boton = Array.from(document.querySelectorAll('#paquetes button')).find((b) => /comparativa/i.test(b.textContent));
          const leer = () => { const t = document.querySelector('.cmp-table'); const visible = !!t && t.getClientRects().length > 0; return { boton: boton.textContent.replace(/\\s+/g, ' ').trim(), visible, filas: visible ? Array.from(t.querySelectorAll('.cmp-row')).map((f) => f.textContent.replace(/\\s+/g, ' ').trim()) : [] }; };
          const cerrada = leer(); boton.click(); await pausa(300); const abierta = leer(); boton.click(); await pausa(300); const otraVez = leer();
          return { cerrada, abierta, otraVez };
        })()`);
        // "Ver ejemplo": al abrir aparece el póster; al cerrar se va
        r.ejemplos = await evalJs(`(async () => {
          const pausa = (ms) => new Promise((ok) => setTimeout(ok, ms));
          const ds = Array.from(document.querySelectorAll('details[data-ejemplo]'));
          const antes = ds.map((d) => { const v = d.querySelector('video'); return (v.getAttribute('poster') || 'sin póster') + ' / src=' + (v.getAttribute('src') || 'sin src'); });
          ds.forEach((d) => { d.open = true; }); await pausa(300);
          const despues = ds.map((d) => { const v = d.querySelector('video'); return (v.getAttribute('poster') || 'sin póster') + ' / src=' + (v.getAttribute('src') || 'sin src') + ' / preload=' + v.getAttribute('preload'); });
          return { antes, despues, resumen: ds.map((d) => d.querySelector('summary').textContent.replace(/\\s+/g, ' ').trim()) };
        })()`);
        // aparición al hacer scroll y pasos de "Cómo funciona"
        const altoPag = await evalJs('document.documentElement.scrollHeight');
        for (let y = 0; y < altoPag; y += 400) { await evalJs('window.scrollTo(0, ' + y + ')'); await sleep(120); }
        await sleep(3000);
        r.revelado = await evalJs(`(() => ({
          fade: Array.from(document.querySelectorAll('[data-fade]')).map((e) => e.style.opacity + '/' + e.style.transform).join(','),
          tarjetasDentro: document.querySelectorAll('[data-tilt-card].tc-in').length + ' de ' + document.querySelectorAll('[data-tilt-card]').length,
          pasosActivos: document.querySelectorAll('[data-how-step].is-active').length,
          linea: document.querySelector('.how-line').style.transform,
        }))()`);
        // 7. Menú hamburguesa (375 px)
        await cargar(sitio, 375);
        await sleep(1200);
        r.menu = await evalJs(`(async () => {
          const pausa = (ms) => new Promise((ok) => setTimeout(ok, ms));
          const boton = document.getElementById('mobile-nav-toggle');
          const leer = () => { const p = document.getElementById('mobile-nav-panel'); const visible = !!p && p.getClientRects().length > 0; return { visible, expandido: boton.getAttribute('aria-expanded'), etiqueta: boton.getAttribute('aria-label'), barras: Array.from(boton.querySelectorAll('.hamburger-bar')).map((b) => b.style.transform + b.style.opacity).join(' '), enlaces: visible ? Array.from(p.querySelectorAll('a')).map((a) => a.textContent.trim() + '→' + (a.getAttribute('href') || '').slice(0, 14)).join(' | ') : '', foco: document.activeElement ? document.activeElement.tagName + (document.activeElement.id ? '#' + document.activeElement.id : '') + (document.activeElement.tagName === 'A' ? ' ' + document.activeElement.textContent.trim() : '') : '' }; };
          const cerrado = leer(); boton.click(); await pausa(350); const abierto = leer();
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await pausa(350); const trasEscape = leer(); const focoTrasEscape = document.activeElement && document.activeElement.id;
          boton.click(); await pausa(350); document.body.click(); await pausa(350); const trasClicFuera = leer().visible;
          boton.click(); await pausa(350); document.querySelector('#mobile-nav-panel a').click(); await pausa(350); const trasElegir = leer().visible;
          return { cerrado, abierto, trasEscape, focoTrasEscape, trasClicFuera, trasElegir };
        })()`);
        r.heroMovil = await evalJs('(() => { const d = window.__heroConstellationDebug(); return { nodos: d.nodeCount, ancho: d.cssW, alto: d.cssH, modo: d.mode || "interactivo", apilado: d.flowStacked }; })()');
        // 8. prefers-reduced-motion
        movimientoReducido = true;
        await cargar(sitio, 1280);
        await sleep(1500);
        r.movimientoReducido = await evalJs(`(() => { const d = window.__heroConstellationDebug(); return { hero: d.mode || 'interactivo', tarjetasVisibles: document.querySelectorAll('[data-tilt-card].tc-in').length + ' de ' + document.querySelectorAll('[data-tilt-card]').length, fadeOcultos: Array.from(document.querySelectorAll('[data-fade]')).filter((e) => e.style.opacity === '0').length, pasosOcultos: Array.from(document.querySelectorAll('[data-how-step]')).filter((e) => e.style.getPropertyValue('--enter-o').trim() === '0').length, animacionChat: getComputedStyle(document.getElementById('sk-launcher'), '::before').animationName }; })()`);
        movimientoReducido = false;
      }
      const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const fila = (titulo, a, b, detalle) => log('- **' + titulo + '**: ' + (igual(a, b) ? 'igual en los dos sitios' : 'DISTINTO') + (detalle ? ' — ' + detalle : '') + (igual(a, b) ? '' : '\n  - actual: ' + JSON.stringify(a) + '\n  - nuevo:  ' + JSON.stringify(b)));
      fila('Enlaces a WhatsApp (origen y mensaje)', res.actual.enlaces.lista, res.nuevo.enlaces.lista, res.nuevo.enlaces.lista.length + ' enlaces');
      fila('Eventos contacto_whatsapp al pulsarlos', res.actual.enlaces.eventos, res.nuevo.enlaces.eventos, res.nuevo.enlaces.eventos.length + ' eventos');
      fila('Mensajes de validación del checklist', res.actual.validacion, res.nuevo.validacion, JSON.stringify(res.nuevo.validacion));
      fila('Petición del checklist (ruta del webhook, tipo y cuerpo)', res.actual.lead, res.nuevo.lead, JSON.stringify(res.nuevo.lead));
      fila('Después de enviar el checklist', res.actual.despuesDelEnvio, res.nuevo.despuesDelEnvio, res.nuevo.despuesDelEnvio);
      fila('Chat: chips, respuestas y enlaces', res.actual.chat, res.nuevo.chat, res.nuevo.chat.chips.join(', '));
      fila('Chat: envío al webhook', res.actual.chatEnvios, res.nuevo.chatEnvios, JSON.stringify(res.nuevo.chatEnvios));
      fila('Popup del checklist', res.actual.popup, res.nuevo.popup, res.nuevo.popup);
      fila('Saludo del chat', res.actual.saludo, res.nuevo.saludo, res.nuevo.saludo);
      fila('Hero en escritorio (constelación)', res.actual.hero, res.nuevo.hero, JSON.stringify(res.nuevo.hero));
      fila('Tarjeta 3D al pasar el cursor', res.actual.tarjeta, res.nuevo.tarjeta, JSON.stringify(res.nuevo.tarjeta));
      fila('Banner de Diseño Web al pasar el cursor', res.actual.banner, res.nuevo.banner, JSON.stringify(res.nuevo.banner));
      fila('Comparativa (abrir y cerrar)', res.actual.comparativa, res.nuevo.comparativa, 'botón "' + res.nuevo.comparativa.cerrada.boton + '" → "' + res.nuevo.comparativa.abierta.boton + '", ' + res.nuevo.comparativa.abierta.filas.length + ' filas');
      fila('"Ver ejemplo" (póster y video diferidos)', res.actual.ejemplos, res.nuevo.ejemplos, JSON.stringify(res.nuevo.ejemplos));
      fila('Aparición al hacer scroll y pasos', res.actual.revelado, res.nuevo.revelado, 'tarjetas ' + res.nuevo.revelado.tarjetasDentro + ', pasos activos ' + res.nuevo.revelado.pasosActivos + ', línea ' + res.nuevo.revelado.linea);
      fila('Menú hamburguesa a 375 px', res.actual.menu, res.nuevo.menu, 'abierto: ' + res.nuevo.menu.abierto.enlaces);
      fila('Hero en móvil (dibujo estático)', res.actual.heroMovil, res.nuevo.heroMovil, JSON.stringify(res.nuevo.heroMovil));
      fila('Con prefers-reduced-motion', res.actual.movimientoReducido, res.nuevo.movimientoReducido, JSON.stringify(res.nuevo.movimientoReducido));
    }

    log('\n## Consola');
    log(consola.length ? Array.from(new Set(consola)).map((c) => '- ' + c).join('\n') : 'Sin errores ni advertencias en ninguno de los dos sitios.');
    log('\nResumen: secciones con texto distinto ' + total.textos + ' · con textos desplazados ' + total.geom + ' · con tipografía o color distintos ' + total.estilo + ' · con hover/foco distinto ' + total.estados + ' (sumando todos los anchos).');
    fs.writeFileSync(path.join(OUT, 'informe.md'), '# Comparación sitio actual vs. sitio nuevo\n\nActual: ' + SITIOS.actual + ' · Nuevo: ' + SITIOS.nuevo + '\nTolerancia de posición y tamaño: ' + TOLERANCIA + ' px.\n' + informe.join('\n') + '\n', 'utf8');
    console.log('\nCapturas e informe en ' + path.relative(ROOT, OUT));
  } finally {
    if (cdp) cdp.close();
    browser.kill();
  }
}

main().catch((e) => { console.error('ERROR: ' + e.message); process.exit(1); });
