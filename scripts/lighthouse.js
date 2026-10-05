#!/usr/bin/env node
/*
 * scripts/lighthouse.js — corre Lighthouse (móvil) sobre las páginas clave y resume los puntajes.
 *
 *   node scripts/lighthouse.js                          contra http://localhost:8081
 *   node scripts/lighthouse.js --base URL --out carpeta
 *
 * Metas: Rendimiento >= 95; Accesibilidad, Buenas prácticas y SEO = 100.
 * Deja un informe .html y .json por página en la carpeta de salida y un resumen.md.
 *
 * Lighthouse no es dependencia del proyecto: se baja con npx la primera vez. Usa el
 * Chrome instalado. Se fuerza el modo "con movimiento" para medir la página con sus
 * animaciones aunque el sistema las tenga apagadas.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i === -1 || !args[i + 1] ? def : args[i + 1]; };
const BASE = opt('base', 'http://localhost:8081').replace(/\/$/, '');
const OUT = path.resolve(ROOT, opt('out', '.work/lighthouse'));
const PAGINAS = [
  { ruta: '/', nombre: 'portada' },
  { ruta: '/servicios/asistentes-whatsapp', nombre: 'servicio-asistentes-whatsapp' },
  { ruta: '/casos', nombre: 'casos' },
];
const CATEGORIAS = [['performance', 'Rendimiento', 95], ['accessibility', 'Accesibilidad', 100], ['best-practices', 'Buenas prácticas', 100], ['seo', 'SEO', 100]];
const METRICAS = [['first-contentful-paint', 'FCP'], ['largest-contentful-paint', 'LCP'], ['total-blocking-time', 'TBT'], ['cumulative-layout-shift', 'CLS'], ['speed-index', 'Speed Index']];

fs.mkdirSync(OUT, { recursive: true });
const lineas = ['# Lighthouse (móvil) — ' + BASE, ''];
let fallos = 0;
const filas = [];
for (const p of PAGINAS) {
  const salida = path.join(OUT, p.nombre);
  const r = spawnSync('npx', ['--yes', 'lighthouse@latest', BASE + p.ruta,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--chrome-flags="--headless=new --force-prefers-no-reduced-motion"',
    '--output=json', '--output=html', '--output-path=' + salida, '--quiet'], { shell: true, encoding: 'utf8' });
  if (r.status !== 0) { console.error(r.stderr || r.stdout); process.exit(2); }
  const j = JSON.parse(fs.readFileSync(salida + '.report.json', 'utf8'));
  const puntajes = CATEGORIAS.map(([id, , meta]) => { const n = Math.round(j.categories[id].score * 100); if (n < meta) fallos++; return n; });
  const metricas = METRICAS.map(([id]) => j.audits[id].displayValue.replace(/ /g, ' '));
  filas.push({ p, puntajes, metricas, version: j.lighthouseVersion });
  console.log(p.ruta + ' → ' + CATEGORIAS.map(([, n], i) => n + ' ' + puntajes[i]).join(' · ') + ' | ' + METRICAS.map(([, n], i) => n + ' ' + metricas[i]).join(' · '));
  // Auditorías con puntaje que no llegan a 1 (las "insight" informativas no puntúan).
  for (const [id, nombre] of CATEGORIAS) {
    for (const ref of j.categories[id].auditRefs) {
      const a = j.audits[ref.id];
      if (ref.weight > 0 && a.score !== null && a.score < 0.9) console.log('   ✗ ' + nombre + ': ' + a.title + (a.displayValue ? ' (' + a.displayValue + ')' : ''));
    }
  }
}
lineas.push('Lighthouse ' + filas[0].version + ', emulación móvil con red y procesador lentos simulados.', '');
lineas.push('| Página | ' + CATEGORIAS.map(([, n]) => n).join(' | ') + ' | ' + METRICAS.map(([, n]) => n).join(' | ') + ' |');
lineas.push('|---|' + CATEGORIAS.map(() => '---').join('|') + '|' + METRICAS.map(() => '---').join('|') + '|');
for (const f of filas) lineas.push('| `' + f.p.ruta + '` | ' + f.puntajes.join(' | ') + ' | ' + f.metricas.join(' | ') + ' |');
lineas.push('', 'Informes completos: ' + filas.map((f) => '`' + f.p.nombre + '.report.html`').join(', ') + '.');
fs.writeFileSync(path.join(OUT, 'resumen.md'), lineas.join('\n') + '\n');
console.log(fallos ? '\n' + fallos + ' puntaje(s) por debajo de la meta.' : '\nTodas las metas cumplidas.');
process.exit(fallos ? 1 : 0);
