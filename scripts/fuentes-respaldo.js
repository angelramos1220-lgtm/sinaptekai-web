#!/usr/bin/env node
/*
 * scripts/fuentes-respaldo.js — mide las fuentes del sitio contra las del sistema y calcula
 * los ajustes de las fuentes de respaldo que están en src/styles/global.css.
 *
 *   node scripts/fuentes-respaldo.js                 contra http://localhost:8081
 *   node scripts/fuentes-respaldo.js --base URL
 *
 * Para qué sirve: mientras Manrope y Space Grotesk se descargan, el texto se dibuja con
 * una fuente del sistema. Si ocupa otro ancho, al llegar la definitiva los renglones se
 * reparten distinto y la página salta. Las caras "respaldo" de global.css escalan la
 * fuente del sistema para que ocupe lo mismo. Este script saca los números:
 *
 *   1. Por peso: size-adjust (ancho de la fuente del sitio / ancho de la de respaldo,
 *      medido con todo el texto de la portada) y las medidas verticales equivalentes
 *      (ascent-override, descent-override, line-gap-override).
 *   2. Para el titular del hero: el rango de size-adjust con el que reparte sus renglones
 *      igual que Manrope en los anchos de pantalla más comunes.
 *
 * Correrlo otra vez si cambia una fuente del sitio o el texto del titular del hero, y
 * copiar los valores a global.css. No modifica ningún archivo.
 *
 * Fuentes de respaldo que se miden: Arial (Windows, macOS, iOS; debe estar instalada en
 * este equipo) y Roboto (Android). Roboto se baja de Google Fonts a .work/fuentes/ la
 * primera vez, solo para medir: el sitio no la publica.
 * Sin dependencias: usa el Chrome o Edge instalado.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i === -1 || !args[i + 1] ? def : args[i + 1]; };
const BASE = opt('base', 'http://localhost:8081').replace(/\/$/, '');
const PORT = 9357;
const RUTA_ROBOTO = path.join(ROOT, '.work', 'fuentes', 'roboto-latin.woff2');
// Anchos de pantalla comunes (teléfonos, tabletas y escritorio).
const ANCHOS = [320, 344, 360, 375, 384, 390, 393, 400, 412, 414, 428, 430, 480, 540, 600, 768, 800, 810, 820, 834, 1024, 1112, 1180, 1280, 1366, 1440, 1536, 1600, 1680, 1920];
const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function roboto() {
  if (!fs.existsSync(RUTA_ROBOTO)) {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
    const css = await (await fetch('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700;800&display=swap', { headers: { 'User-Agent': ua } })).text();
    const m = css.match(/\/\* latin \*\/[^}]*?url\((https:[^)]+\.woff2)\)/);
    if (!m) throw new Error('no encontré el archivo de Roboto (latin) en Google Fonts');
    fs.mkdirSync(path.dirname(RUTA_ROBOTO), { recursive: true });
    fs.writeFileSync(RUTA_ROBOTO, Buffer.from(await (await fetch(m[1])).arrayBuffer()));
    console.log('Roboto descargada a ' + path.relative(ROOT, RUTA_ROBOTO) + ' (solo para medir).');
  }
  return fs.readFileSync(RUTA_ROBOTO).toString('base64');
}

(async () => {
  const exe = BROWSERS.find((p) => fs.existsSync(p));
  if (!exe) throw new Error('no encontré Chrome ni Edge instalados');
  const b64 = await roboto();
  const perfil = path.join(os.tmpdir(), 'synaptekai-fuentes-perfil');
  fs.rmSync(perfil, { recursive: true, force: true });
  const navegador = spawn(exe, ['--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + perfil, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    let target;
    for (let i = 0; i < 60; i++) { try { target = (await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json()).find((t) => t.type === 'page'); if (target) break; } catch (e) { /* arrancando */ } await sleep(250); }
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => { ws.onopen = r; });
    let seq = 0; const pendientes = new Map();
    const send = (method, params) => { const id = ++seq; ws.send(JSON.stringify({ id, method, params: params || {} })); return new Promise((res, rej) => pendientes.set(id, { res, rej })); };
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pendientes.has(m.id)) { const p = pendientes.get(m.id); pendientes.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
    const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception && r.exceptionDetails.exception.description); return r.result.value; };
    await send('Page.enable'); await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: BASE + '/' });
    for (let i = 0; i < 80; i++) { await sleep(200); if (await ev('document.readyState === "complete"').catch(() => false)) break; }

    // ---------- 1. Ajustes por peso
    const medidas = await ev(`(async () => {
      const bytes = Uint8Array.from(atob(${JSON.stringify(b64)}), (c) => c.charCodeAt(0));
      window.__roboto = bytes;
      const f = new FontFace('RobotoMedida', bytes.buffer.slice(0), { weight: '100 900' });
      await f.load(); document.fonts.add(f);
      for (const w of [400, 500, 600, 700, 800]) { await document.fonts.load(w + ' 40px Manrope'); await document.fonts.load(w + ' 40px RobotoMedida'); }
      for (const w of [600, 700]) await document.fonts.load(w + ' 40px "Space Grotesk"');
      // Texto de referencia: todo el texto visible de la portada.
      const texto = document.querySelector('main').innerText.replace(/\\s+/g, ' ').trim();
      const ctx = document.createElement('canvas').getContext('2d');
      const ancho = (fuente, peso) => { ctx.font = peso + ' 100px ' + fuente; return ctx.measureText(texto).width; };
      const vertical = (fuente, peso) => {
        ctx.font = peso + ' 1000px ' + fuente;
        const m = ctx.measureText('Hxgp');
        const d = document.createElement('div');
        d.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;line-height:normal;font-size:1000px;font-weight:' + peso + ';font-family:' + fuente;
        d.textContent = 'Hxgp'; document.body.appendChild(d);
        const alto = d.getBoundingClientRect().height / 1000; d.remove();
        const asc = m.fontBoundingBoxAscent / 1000, desc = m.fontBoundingBoxDescent / 1000;
        return { asc, desc, gap: Math.max(0, alto - asc - desc) };
      };
      const out = { caracteres: texto.length, arial: ctx.font && document.fonts.check('40px Arial'), filas: [] };
      for (const [web, pesos] of [['Manrope', [400, 500, 600, 700, 800]], ['"Space Grotesk"', [600, 700]]]) {
        for (const peso of pesos) {
          const v = vertical(web, peso);
          // Arial solo tiene Regular y Bold: de 600 para arriba se usa la Bold.
          for (const [nombre, fb, pesoFb] of [['Arial', 'Arial', peso >= 600 ? 700 : 400], ['Roboto', 'RobotoMedida', peso]]) {
            const a = ancho(web, peso) / ancho(fb, pesoFb);
            out.filas.push({ web: web.replace(/"/g, ''), peso, respaldo: nombre + (nombre === 'Arial' ? (pesoFb === 700 ? ' Bold' : '') : ' ' + pesoFb), sizeAdjust: a * 100, ascent: v.asc / a * 100, descent: v.desc / a * 100, lineGap: v.gap / a * 100 });
          }
        }
      }
      return out;
    })()`);
    const p2 = (n) => (Math.round(n * 100) / 100).toFixed(2) + '%';
    console.log('# Ajustes por peso (texto de referencia: ' + medidas.caracteres + ' caracteres de la portada)\n');
    console.log('| Fuente del sitio | Peso | Respaldo | size-adjust | ascent-override | descent-override | line-gap-override |');
    console.log('|---|---|---|---|---|---|---|');
    for (const f of medidas.filas) console.log('| ' + f.web + ' | ' + f.peso + ' | ' + f.respaldo + ' | ' + p2(f.sizeAdjust) + ' | ' + p2(f.ascent) + ' | ' + p2(f.descent) + ' | ' + p2(f.lineGap) + ' |');

    // ---------- 2. El titular del hero
    await ev(`(async () => {
      window.__cand = [];
      for (let a = 1000; a <= 1180; a += 1) {
        const fa = new FontFace('ca' + a, "local('Arial Bold'), local('Arial-BoldMT')", { weight: '100 900', sizeAdjust: (a / 10) + '%' });
        const fr = new FontFace('cr' + a, window.__roboto.buffer.slice(0), { weight: '100 900', sizeAdjust: (a / 10) + '%' });
        await fa.load(); await fr.load(); document.fonts.add(fa); document.fonts.add(fr);
        window.__cand.push(a);
      }
      window.__h1 = document.querySelector('#inicio h1');
      // Firma del reparto: en qué renglón queda cada palabra.
      window.__firma = () => {
        const tops = [];
        const w = document.createTreeWalker(window.__h1, NodeFilter.SHOW_TEXT); let n;
        while ((n = w.nextNode())) {
          const re = /\\S+/g; let m;
          while ((m = re.exec(n.textContent))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); tops.push(Math.round(r.getBoundingClientRect().top)); }
        }
        let linea = 0; const out = [];
        for (let i = 0; i < tops.length; i++) { if (i && tops[i] !== tops[i - 1]) linea++; out.push(linea); }
        return out.join('');
      };
      return true;
    })()`);
    const validos = { a: {}, r: {} };
    for (const w of ANCHOS) {
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: w < 768 ? 823 : 800, deviceScaleFactor: 1, mobile: w < 1024 });
      await sleep(250);
      const r = await ev(`(() => {
        const h1 = window.__h1; const previo = h1.style.fontFamily;
        h1.style.fontFamily = "Manrope";
        const ref = window.__firma();
        const ok = { a: [], r: [] };
        for (const a of window.__cand) for (const k of ['a', 'r']) { h1.style.fontFamily = "'c" + k + a + "'"; if (window.__firma() === ref) ok[k].push(a); }
        h1.style.fontFamily = previo;
        return ok;
      })()`);
      for (const k of ['a', 'r']) for (const a of r[k]) validos[k][a] = (validos[k][a] || 0) + 1;
    }
    const rangos = (v) => { if (!v.length) return 'ninguno'; const out = []; let i0 = v[0], prev = v[0]; for (const x of v.slice(1).concat([null])) { if (x !== prev + 1) { out.push((i0 / 10).toFixed(1) + (prev !== i0 ? '–' + (prev / 10).toFixed(1) : '') + ' %'); i0 = x; } prev = x; } return out.join(', '); };
    const titular = await ev('window.__h1.innerText.replace(/\\s+/g, " ").trim()');
    console.log('\n# Titular del hero: "' + titular + '"\n');
    console.log('size-adjust con el que reparte los renglones igual que Manrope (' + ANCHOS.length + ' anchos, de ' + ANCHOS[0] + ' a ' + ANCHOS[ANCHOS.length - 1] + ' px):\n');
    for (const [k, nombre, familia] of [['a', 'Arial Bold', 'Manrope respaldo titular'], ['r', 'Roboto', 'Manrope respaldo titular Android']]) {
      const mejor = Math.max(0, ...Object.values(validos[k]));
      const todos = Object.keys(validos[k]).map(Number).filter((a) => validos[k][a] === mejor).sort((x, y) => x - y);
      console.log('- ' + nombre + ' → coincide en ' + mejor + ' de ' + ANCHOS.length + ' anchos con ' + rangos(todos) + '. Va en la cara "' + familia + '" (usar el centro del rango).');
    }
    console.log('\nLas medidas verticales de esa cara: ascent-override = 106,6 % / (size-adjust/100); descent-override = 30 % / (size-adjust/100).');
    ws.close();
  } finally {
    navegador.kill();
  }
})().catch((e) => { console.error('ERROR: ' + (e && e.stack ? e.stack : e)); process.exit(2); });
