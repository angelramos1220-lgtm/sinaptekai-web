#!/usr/bin/env node
/*
 * scripts/bundle.js — edita el contenido de index.html sin romper el bundle.
 *
 * index.html es un bundle autodescodificable: el sitio real (HTML, CSS, textos y
 * la clase Component) vive en <script type="__bundler/template"> como un string
 * JSON sin comprimir. Este script lo saca a un archivo normal, y lo vuelve a meter.
 *
 *   node scripts/bundle.js extract   index.html  -> .work/template.html
 *   node scripts/bundle.js pack      .work/template.html -> index.html
 *   node scripts/bundle.js verify    comprueba el bundle (y si la copia de trabajo está al día)
 *
 * Opciones: --force (extract: pisa una copia de trabajo con cambios sin empaquetar).
 *
 * Garantías:
 *   - extract se niega a trabajar si recodificar el bloque actual no lo reproduce
 *     byte a byte (el encoder dejaría de ser fiel al archivo).
 *   - pack no toca nada fuera del bloque, y después de escribir vuelve a leer
 *     index.html y comprueba que el contenido decodificado es idéntico al editado.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const WORK_DIR = path.join(ROOT, '.work');
const WORK = path.join(WORK_DIR, 'template.html');

const OPEN_RE = /<script type="__bundler\/template"[^>]*>/g;
const CLOSE = '</script>';
const BS = String.fromCharCode(92);
// El encoder original escapa estos cuatro caracteres además del JSON normal.
// Se construyen con fromCharCode para que ningún shell ni editor colapse la barra.
const ESCAPES = [
  ['<', BS + 'u003c'],
  ['>', BS + 'u003e'],
  ["'", BS + 'u0027'],
  ['&', BS + 'u0026'],
];
// Señales de texto UTF-8 leído como Latin-1 (acentos y ñ rotos).
const MOJIBAKE = /Ã[\u0080-¿¡-¿]|Â[\u0080-¿¡-¿]|â€|�/;

function fail(msg) {
  console.error('ERROR: ' + msg);
  process.exit(1);
}

function encode(html) {
  let out = JSON.stringify(html);
  for (const [ch, esc] of ESCAPES) out = out.split(ch).join(esc);
  return out;
}

function locate(raw) {
  const matches = [...raw.matchAll(OPEN_RE)];
  if (matches.length !== 1) fail('se esperaba exactamente 1 bloque __bundler/template y hay ' + matches.length);
  const start = matches[0].index + matches[0][0].length;
  const end = raw.indexOf(CLOSE, start);
  if (end === -1) fail('el bloque __bundler/template no tiene cierre');
  const inner = raw.slice(start, end);
  const lead = inner.match(/^\s*/)[0];
  const trail = inner.match(/\s*$/)[0];
  const body = inner.slice(lead.length, inner.length - trail.length);
  return { start, end, lead, trail, body };
}

function firstDiff(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

function readBundle() {
  const raw = fs.readFileSync(INDEX, 'utf8');
  const loc = locate(raw);
  let html;
  try {
    html = JSON.parse(loc.body);
  } catch (e) {
    fail('el bloque template no es JSON válido: ' + e.message);
  }
  if (typeof html !== 'string') fail('el bloque template no es un string JSON');
  const reencoded = encode(html);
  const exact = reencoded === loc.body;
  return { raw, loc, html, reencoded, exact };
}

function assertExact(b) {
  if (b.exact) return;
  const i = firstDiff(b.reencoded, b.loc.body);
  fail(
    'recodificar el bloque actual NO lo reproduce byte a byte (primera diferencia en el carácter ' + i + ').\n' +
    '  archivo:    ' + JSON.stringify(b.loc.body.slice(Math.max(0, i - 30), i + 40)) + '\n' +
    '  recodificado: ' + JSON.stringify(b.reencoded.slice(Math.max(0, i - 30), i + 40)) + '\n' +
    'No edites nada hasta entender la diferencia: el encoder ya no es fiel al archivo.'
  );
}

function cmdExtract(force) {
  const b = readBundle();
  assertExact(b);
  if (fs.existsSync(WORK) && !force) {
    const current = fs.readFileSync(WORK, 'utf8').split('\r\n').join('\n');
    if (current !== b.html) {
      fail('.work/template.html tiene cambios que no están en index.html.\n' +
        'Empaquétalos con "pack", o repite con --force para descartarlos.');
    }
  }
  fs.mkdirSync(WORK_DIR, { recursive: true });
  fs.writeFileSync(WORK, b.html, 'utf8');
  console.log('OK extract: ' + b.html.length + ' caracteres, ' + b.html.split('\n').length + ' líneas -> .work/template.html');
  console.log('   recodificación byte a byte: sí');
}

function cmdPack() {
  if (!fs.existsSync(WORK)) fail('no existe .work/template.html — corre primero "extract".');
  const b = readBundle();
  assertExact(b);

  let html = fs.readFileSync(WORK, 'utf8');
  if (html.charCodeAt(0) === 0xFEFF) html = html.slice(1); // BOM que agregue algún editor
  // La plantilla original usa LF; si un editor guardó la copia con CRLF se normaliza.
  if (!b.html.includes('\r')) html = html.split('\r\n').join('\n');

  const bad = html.match(MOJIBAKE);
  if (bad) {
    const i = bad.index;
    fail('posible texto con codificación rota cerca de: ' + JSON.stringify(html.slice(Math.max(0, i - 40), i + 40)));
  }
  if (!html.trim()) fail('.work/template.html está vacío.');

  const enc = encode(html);
  if (enc.includes('<') || enc.includes('>')) fail('quedó un < o > literal en el bloque recodificado.');
  if (JSON.parse(enc) !== html) fail('el bloque recodificado no decodifica al contenido editado.');

  if (html === b.html) {
    console.log('OK pack: sin cambios, index.html no se tocó.');
    return;
  }

  const { raw, loc } = b;
  const next = raw.slice(0, loc.start) + loc.lead + enc + loc.trail + raw.slice(loc.end);
  fs.writeFileSync(INDEX, next, 'utf8');

  // Verificación sobre el archivo ya escrito, con la misma lectura que hace el sitio.
  const after = readBundle();
  if (after.html !== html) fail('tras escribir, index.html no decodifica al contenido editado.');
  if (!after.exact) fail('tras escribir, la recodificación no reproduce el bloque byte a byte.');
  if (after.raw.slice(0, after.loc.start) !== raw.slice(0, loc.start)) fail('cambió algo ANTES del bloque template.');
  if (after.raw.slice(after.loc.end) !== raw.slice(loc.end)) fail('cambió algo DESPUÉS del bloque template.');

  console.log('OK pack: ' + b.html.length + ' -> ' + html.length + ' caracteres decodificados');
  console.log('   bloque: ' + loc.body.length + ' -> ' + enc.length + ' | resto del archivo intacto | recodificación byte a byte: sí');
}

function cmdVerify() {
  const b = readBundle();
  assertExact(b);
  const bad = b.html.match(MOJIBAKE);
  if (bad) fail('posible texto con codificación rota en el bundle cerca de: ' + JSON.stringify(b.html.slice(Math.max(0, bad.index - 40), bad.index + 40)));
  console.log('OK verify: bloque de ' + b.loc.body.length + ' caracteres, ' + b.html.length + ' decodificados; recodificación byte a byte: sí');
  if (fs.existsSync(WORK)) {
    const work = fs.readFileSync(WORK, 'utf8').split('\r\n').join('\n');
    console.log('   .work/template.html ' + (work === b.html ? 'está al día con index.html' : 'tiene cambios SIN empaquetar'));
  }
}

const args = process.argv.slice(2);
const cmd = args[0];
const force = args.includes('--force');
if (cmd === 'extract') cmdExtract(force);
else if (cmd === 'pack') cmdPack();
else if (cmd === 'verify') cmdVerify();
else {
  console.log('Uso: node scripts/bundle.js <extract|pack|verify> [--force]');
  process.exit(cmd ? 1 : 0);
}
