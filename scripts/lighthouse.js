#!/usr/bin/env node
/*
 * scripts/lighthouse.js — corre Lighthouse (móvil) sobre las páginas clave y resume los puntajes.
 *
 *   node scripts/lighthouse.js                          contra http://localhost:8081
 *   node scripts/lighthouse.js --base URL --out carpeta
 *   node scripts/lighthouse.js --veces 3                cada página 3 veces; informa la mediana
 *   node scripts/lighthouse.js --como-real              el contenedor local, servido como synaptekai.tech
 *
 * Metas: Rendimiento >= 95; Accesibilidad, Buenas prácticas y SEO = 100.
 * Deja un informe .html y .json por página en la carpeta de salida y un resumen.md.
 *
 * Fuera de synaptekai.tech el sitio va en modo de prueba: lleva noindex y NO carga Google
 * Analytics. Por eso:
 *   - ahí se omite la auditoría de SEO que exige que la página sea indexable;
 *   - el peso de Analytics no se puede medir en localhost ni en el sitio de prueba.
 *
 * --como-real mide justo eso sin tocar producción: abre el contenedor local con el
 * nombre synaptekai.tech (Chrome lo resuelve hacia 127.0.0.1), así que la página carga
 * Google Analytics de verdad, pero se bloquean los envíos de datos: no queda ninguna
 * visita registrada. Solo mide Rendimiento (va por http, sin certificado).
 *
 * Lighthouse no es dependencia del proyecto: se baja con npx la primera vez. Usa el
 * Chrome instalado. Se fuerza el modo "con movimiento" para medir la página con sus
 * animaciones aunque el sistema las tenga apagadas.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i === -1 || !args[i + 1] || args[i + 1].startsWith('--') ? def : args[i + 1]; };
const BASE = opt('base', 'http://localhost:8081').replace(/\/$/, '');
const OUT = path.resolve(ROOT, opt('out', '.work/lighthouse'));
const VECES = Math.max(1, parseInt(opt('veces', '1'), 10) || 1);
const COMO_REAL = args.includes('--como-real');
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)/.test(BASE);
const ES_PRODUCCION = /^https:\/\/(www\.)?synaptekai\.tech$/.test(BASE);
const PUERTO_CHROME = 9351;
if (COMO_REAL && !LOCAL) { console.error('--como-real solo funciona contra el contenedor local (http://localhost:PUERTO).'); process.exit(2); }

const PAGINAS = [
  { ruta: '/', nombre: 'portada' },
  { ruta: '/servicios/asistentes-whatsapp', nombre: 'servicio-asistentes-whatsapp' },
  { ruta: '/casos', nombre: 'casos' },
];
const TODAS = [['performance', 'Rendimiento', 95], ['accessibility', 'Accesibilidad', 100], ['best-practices', 'Buenas prácticas', 100], ['seo', 'SEO', 100]];
const CATEGORIAS = COMO_REAL ? TODAS.slice(0, 1) : TODAS;
const METRICAS = [['first-contentful-paint', 'FCP'], ['largest-contentful-paint', 'LCP'], ['total-blocking-time', 'TBT'], ['cumulative-layout-shift', 'CLS'], ['speed-index', 'Speed Index']];
const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mediana = (v) => { const o = v.slice().sort((a, b) => a - b); return o[Math.floor((o.length - 1) / 2)]; };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let navegador = null;
  // Dirección que se mide y opciones de Lighthouse según el modo.
  let origen = BASE;
  const opciones = ['--only-categories=' + CATEGORIAS.map(([id]) => id).join(',')];
  if (COMO_REAL) {
    const exe = BROWSERS.find((p) => fs.existsSync(p));
    if (!exe) { console.error('no encontré Chrome ni Edge instalados'); process.exit(2); }
    const perfil = path.join(os.tmpdir(), 'synaptekai-lighthouse-perfil');
    fs.rmSync(perfil, { recursive: true, force: true });
    navegador = spawn(exe, ['--headless=new', '--remote-debugging-port=' + PUERTO_CHROME, '--user-data-dir=' + perfil, '--no-first-run',
      '--no-default-browser-check', '--mute-audio', '--force-prefers-no-reduced-motion',
      '--host-resolver-rules=MAP synaptekai.tech 127.0.0.1', 'about:blank'], { stdio: 'ignore' });
    for (let i = 0; i < 60; i++) { try { await (await fetch('http://127.0.0.1:' + PUERTO_CHROME + '/json/version')).json(); break; } catch (e) { await sleep(250); } }
    origen = 'http://synaptekai.tech:' + (new URL(BASE).port || 80);
    // gtag.js se descarga y se ejecuta (es lo que se quiere medir); lo que se bloquea es
    // el envío de datos, para no dejar visitas falsas en Analytics.
    opciones.push('--port=' + PUERTO_CHROME, '--blocked-url-patterns=*google-analytics.com*', '--blocked-url-patterns=*analytics.google.com*', '--blocked-url-patterns=*doubleclick.net*');
  } else {
    opciones.push('--chrome-flags="--headless=new --force-prefers-no-reduced-motion"');
    // Con noindex a propósito, la auditoría de indexabilidad fallaría siempre y no dice nada del sitio.
    if (!ES_PRODUCCION) opciones.push('--skip-audits=is-crawlable');
  }

  const lineas = ['# Lighthouse (móvil) — ' + origen + (COMO_REAL ? ' (contenedor local servido como el dominio real)' : ''), ''];
  let fallos = 0;
  const filas = [];
  try {
    for (const p of PAGINAS) {
      const corridas = [];
      for (let n = 1; n <= VECES; n++) {
        const salida = path.join(OUT, p.nombre + (VECES > 1 ? '-' + n : ''));
        const r = spawnSync('npx', ['--yes', 'lighthouse@latest', origen + p.ruta, ...opciones, '--output=json', '--output=html', '--output-path=' + salida, '--quiet'], { shell: true, encoding: 'utf8' });
        if (r.status !== 0) { console.error(r.stderr || r.stdout); process.exitCode = 2; return; }
        const j = JSON.parse(fs.readFileSync(salida + '.report.json', 'utf8'));
        const peticiones = (j.audits['network-requests'] && j.audits['network-requests'].details && j.audits['network-requests'].details.items) || [];
        corridas.push({
          j,
          puntajes: CATEGORIAS.map(([id]) => Math.round(j.categories[id].score * 100)),
          metricas: METRICAS.map(([id]) => j.audits[id].displayValue.replace(/\u00a0/g, ' ')),
          kb: Math.round(peticiones.reduce((a, i) => a + (i.transferSize || 0), 0) / 1024),
          analytics: peticiones.some((i) => /googletagmanager\.com\/gtag\/js/.test(i.url)),
        });
      }
      // Con varias corridas se informa la de rendimiento mediano.
      const rendimientos = corridas.map((c) => c.puntajes[0]);
      const elegida = corridas.find((c) => c.puntajes[0] === mediana(rendimientos));
      const puntajes = CATEGORIAS.map((cat, i) => mediana(corridas.map((c) => c.puntajes[i])));
      CATEGORIAS.forEach(([, , meta], i) => { if (puntajes[i] < meta) fallos++; });
      filas.push({ p, puntajes, elegida, rendimientos, version: elegida.j.lighthouseVersion });
      console.log(p.ruta + ' → ' + CATEGORIAS.map(([, n], i) => n + ' ' + puntajes[i]).join(' · ') + (VECES > 1 ? ' (corridas: ' + rendimientos.join(', ') + ')' : '') +
        ' | ' + METRICAS.map(([, n], i) => n + ' ' + elegida.metricas[i]).join(' · ') + ' | ' + elegida.kb + ' kB' + (elegida.analytics ? ', con gtag.js dentro de la medición' : ', sin gtag.js en la medición'));
      // Auditorías con puntaje que no llegan a 0.9 (las "insight" informativas no puntúan).
      for (const [id, nombre] of CATEGORIAS) {
        for (const ref of elegida.j.categories[id].auditRefs) {
          const a = elegida.j.audits[ref.id];
          if (ref.weight > 0 && a.score !== null && a.score < 0.9) console.log('   ✗ ' + nombre + ': ' + a.title + (a.displayValue ? ' (' + a.displayValue + ')' : ''));
        }
      }
    }
  } finally {
    if (navegador) navegador.kill();
  }
  lineas.push('Lighthouse ' + filas[0].version + ', emulación móvil con red y procesador lentos simulados.' + (VECES > 1 ? ' Cada página se midió ' + VECES + ' veces; se informa la mediana.' : ''), '');
  if (COMO_REAL) lineas.push('El contenedor local se abrió con el nombre synaptekai.tech: la página carga Google Analytics de verdad, pero el envío de datos está bloqueado (no queda ninguna visita registrada). Solo se mide Rendimiento.', '');
  else if (!ES_PRODUCCION) lineas.push('Esta dirección no es el dominio real: el sitio va en modo de prueba (con noindex y sin Google Analytics), así que en SEO se omite la auditoría "la página se puede indexar" y el rendimiento no incluye el peso de Analytics. En synaptekai.tech se mide completo.', '');
  lineas.push('| Página | ' + CATEGORIAS.map(([, n]) => n).join(' | ') + ' | ' + METRICAS.map(([, n]) => n).join(' | ') + ' | Peso | gtag.js medido |');
  lineas.push('|---|' + CATEGORIAS.map(() => '---').join('|') + '|' + METRICAS.map(() => '---').join('|') + '|---|---|');
  for (const f of filas) lineas.push('| `' + f.p.ruta + '` | ' + f.puntajes.join(' | ') + ' | ' + f.elegida.metricas.join(' | ') + ' | ' + f.elegida.kb + ' kB | ' + (f.elegida.analytics ? 'sí' : 'no') + ' |');
  lineas.push('', 'Informes completos: los archivos `.report.html` de esta carpeta.');
  fs.writeFileSync(path.join(OUT, 'resumen.md'), lineas.join('\n') + '\n');
  console.log(fallos ? '\n' + fallos + ' puntaje(s) por debajo de la meta.' : '\nTodas las metas cumplidas.');
  process.exitCode = fallos ? 1 : 0;
})().catch((e) => { console.error('ERROR: ' + (e && e.stack ? e.stack : e)); process.exit(2); });
