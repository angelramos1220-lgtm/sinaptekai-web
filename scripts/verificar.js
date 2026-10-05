#!/usr/bin/env node
/*
 * scripts/verificar.js — verificación completa del sitio servido por Docker (o por un dominio).
 *
 *   node scripts/verificar.js                       todo, contra http://localhost:8081
 *   node scripts/verificar.js --base URL            contra otra dirección (p. ej. https://nuevo.synaptekai.tech)
 *   node scripts/verificar.js --http                solo la parte de servidor (URLs, cabeceras, metas)
 *   node scripts/verificar.js --navegador           solo la parte de navegador
 *   node scripts/verificar.js --capturas [carpeta]  además guarda capturas de página completa a 375 y 1280 px
 *   node scripts/verificar.js --solo /casos         en el navegador, solo esa página
 *
 * Qué revisa:
 *   Servidor   cada URL responde lo que debe (200 sin redirección, tipo de contenido), las
 *              variantes .html, la versión Markdown de cada página y su negociación con
 *              "Accept: text/markdown", robots.txt, sitemap.xml, llms.txt, la página 404, la
 *              redirección de www, el modo de prueba (todo lo que no sea el dominio real:
 *              noindex, robots con Disallow y franja) y las cabeceras de seguridad
 *              y de caché. De cada página: título, descripción, canonical, datos estructurados.
 *   Navegador  cada página a 375, 768, 1280 y 1440 px: sin errores de consola, sin peticiones
 *              fallidas, sin desborde horizontal, cabecera en una sola fila, y todos los
 *              enlaces a WhatsApp con su evento contacto_whatsapp (origen y pagina).
 *              Además: menú (teclado y hamburguesa), entrada con ancla, formulario del
 *              checklist, chat y videos diferidos.
 *
 * No toca producción: las llamadas a n8n y a Google Analytics se responden aquí mismo con
 * datos simulados; el formulario del checklist nunca llega a n8n.
 * Sin dependencias: usa el Chrome o Edge instalado, por el puerto de depuración.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const https = require('https');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i === -1 || !args[i + 1] || args[i + 1].startsWith('--') ? def : args[i + 1]; };
const BASE = opt('base', 'http://localhost:8081').replace(/\/$/, '');
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)/.test(BASE);
// El dominio real. Cualquier otra dirección (localhost, el sitio de prueba, un dominio de
// Easypanel) se sirve en modo de prueba: noindex, robots con Disallow y franja de aviso.
const BASE_ES_PRODUCCION = /^https:\/\/(www\.)?synaptekai\.tech$/.test(BASE);
const OUT = path.resolve(ROOT, '.work/verificacion');
const CAPTURAS = args.includes('--capturas');
const DIR_CAPTURAS = path.resolve(ROOT, opt('capturas', '.work/verificacion/capturas'));
const SOLO = opt('solo', null);
const HACER_HTTP = args.includes('--http') || !args.includes('--navegador');
const HACER_NAVEGADOR = args.includes('--navegador') || !args.includes('--http');
const PORT = 9342;
const DOMINIO = 'https://synaptekai.tech';
const DOMINIO_PRUEBA = 'nuevo.synaptekai.tech';
const WIDTHS = [375, 768, 1280, 1440];
const WIDTHS_CAPTURA = [375, 1280];
// Anchos extra para la cabecera: alrededor de los cortes de 1024 y 1240 px.
const WIDTHS_CABECERA = [320, 375, 768, 1023, 1024, 1100, 1239, 1240, 1280, 1440];

// Páginas del sitio. "servicio": lleva Service + FAQPage. "interna": lleva BreadcrumbList.
const SERVICIOS = ['asistentes-whatsapp', 'paginas-web', 'visibilidad-google-ia', 'socio-tecnologico', 'automatizacion', 'complementarios'];
const PAGINAS = [
  { ruta: '/', nombre: 'portada', md: '/index.md' },
  // "automatizacion" no tiene un monto publicado: su dato Service va sin ofertas.
  ...SERVICIOS.map((s) => ({ ruta: '/servicios/' + s, nombre: 'servicio-' + s, servicio: true, interna: true, md: '/servicios/' + s + '.md', sinOfertas: s === 'automatizacion' })),
  { ruta: '/casos', nombre: 'casos', interna: true, md: '/casos.md' },
  { ruta: '/precios', nombre: 'precios', interna: true, md: '/precios.md' },
  { ruta: '/privacidad', nombre: 'privacidad', interna: true },
  { ruta: '/terminos', nombre: 'terminos', interna: true },
  { ruta: '/gracias', nombre: 'gracias', noindex: true },
];
// Orígenes admitidos del evento contacto_whatsapp.
const ORIGENES = ['header', 'hero', 'caso', 'contacto', 'diseno-web', 'flotante', 'footer', 'privacidad', 'terminos',
  'paquete-asistente', 'paquete-360', 'renueva-web', 'visibilidad', 'socio-tecnologico', 'redes', 'videos', 'inventario',
  'servicio-asistentes', 'servicio-web', 'servicio-visibilidad', 'servicio-socio', 'servicio-automatizacion',
  'servicio-complementarios', 'casos', 'precios', 'gracias-checklist'];
// Lo que no puede aparecer en ningún texto del sitio.
const PROHIBIDO = [/hostal/i, /[óo]ptica caballero/i, /visual lents/i, /US\$|USD|d[óo]lares/];

// Las direcciones de n8n salen de src/data/negocio.ts. Todo lo que vaya hacia ellas se
// responde aquí mismo. Si no se pueden leer, no se ejecuta nada: mejor no probar que
// arriesgarse a enviar un formulario de prueba a n8n de verdad.
const NEGOCIO_TS = fs.readFileSync(path.join(ROOT, 'src/data/negocio.ts'), 'utf8');
const WEBHOOK_CHECKLIST = (NEGOCIO_TS.match(/webhookChecklist:\s*'([^']+)'/) || [])[1];
const WEBHOOK_CHAT = (NEGOCIO_TS.match(/webhookChat:\s*'([^']+)'/) || [])[1];
if (!WEBHOOK_CHECKLIST || !WEBHOOK_CHAT) { console.error('ERROR: no pude leer los webhooks de src/data/negocio.ts. No se ejecuta nada, para no llamar a n8n de verdad.'); process.exit(2); }
const GA4 = (NEGOCIO_TS.match(/ga4:\s*'([^']+)'/) || [])[1];
const ORIGENES_N8N = Array.from(new Set([WEBHOOK_CHECKLIST, WEBHOOK_CHAT].map((u) => new URL(u).origin)));
const ES_N8N = (url) => ORIGENES_N8N.some((o) => url.startsWith(o + '/')) || /\/webhook(-test)?\//.test(url);

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- informe
const informe = [];
let fallos = 0;
let avisos = 0;
const log = (s) => { console.log(s); informe.push(s); };
const titulo = (s) => log('\n## ' + s);
const ok = (cond, texto, detalle) => {
  if (cond) log('- ✓ ' + texto);
  else { fallos++; log('- ✗ **' + texto + '**' + (detalle ? ' — ' + detalle : '')); }
  return !!cond;
};
const aviso = (texto) => { avisos++; log('- ⚠ ' + texto); };
const dato = (texto) => log('- ' + texto);

// ---------------------------------------------------------------- servidor
function pedir(ruta, o = {}) {
  return new Promise((res, rej) => {
    const u = new URL((o.base || BASE) + ruta);
    const cab = { 'Accept-Encoding': o.gzip ? 'gzip' : 'identity' };
    if (o.host) cab.Host = o.host;
    if (o.accept) cab.Accept = o.accept;
    const req = (u.protocol === 'https:' ? https : http).request({ hostname: u.hostname, port: u.port || (u.protocol === 'https:' ? 443 : 80), path: u.pathname + u.search, method: o.method || 'GET', headers: cab }, (r) => {
      const partes = [];
      r.on('data', (c) => partes.push(c));
      r.on('end', () => { const cuerpo = Buffer.concat(partes); res({ estado: r.statusCode, cab: r.headers, cuerpo, texto: cuerpo.toString('utf8') }); });
    });
    req.on('error', rej);
    req.end();
  });
}
const meta = (html, re) => { const m = html.match(re); return m ? m[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"') : null; };
const tiposJsonLd = (html) => {
  const tipos = [];
  let invalidos = 0;
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const j = JSON.parse(m[1]); (Array.isArray(j) ? j : [j]).forEach((x) => tipos.push([].concat(x['@type']).join('+'))); } catch (e) { invalidos++; }
  }
  return { tipos, invalidos };
};

async function verificarServidor() {
  titulo('Servidor: páginas');
  const titulos = new Map();
  const descripciones = new Map();
  for (const p of PAGINAS) {
    const variantes = p.ruta === '/' ? ['/'] : [p.ruta, p.ruta + '.html'];
    for (const ruta of variantes) {
      const r = await pedir(ruta);
      const html = r.texto;
      const canonicalEsperado = DOMINIO + p.ruta;
      const problemas = [];
      if (r.estado !== 200) problemas.push('estado ' + r.estado + (r.cab.location ? ' → ' + r.cab.location : ''));
      if (!/^text\/html; ?charset=utf-8$/i.test(r.cab['content-type'] || '')) problemas.push('tipo ' + r.cab['content-type']);
      const t = meta(html, /<title>([^<]*)<\/title>/);
      const d = meta(html, /<meta name="description" content="([^"]*)"/);
      const c = meta(html, /<link rel="canonical" href="([^"]*)"/);
      const og = meta(html, /<meta property="og:url" content="([^"]*)"/);
      if (!t) problemas.push('sin <title>');
      if (!d) problemas.push('sin descripción');
      if (c !== canonicalEsperado) problemas.push('canonical ' + c + ' (esperado ' + canonicalEsperado + ')');
      if (og !== canonicalEsperado) problemas.push('og:url ' + og);
      if (!/<html lang="es"/.test(html)) problemas.push('falta lang="es"');
      const h1 = (html.match(/<h1[\s>]/g) || []).length;
      if (h1 !== 1) problemas.push(h1 + ' <h1>');
      const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
      if (noindex !== !!p.noindex) problemas.push(noindex ? 'lleva noindex y no debería' : 'falta noindex');
      if (!/og:image" content="https:\/\/synaptekai\.tech\/assets\/og-image\.jpg"/.test(html)) problemas.push('og:image');
      const ld = tiposJsonLd(html);
      if (ld.invalidos) problemas.push(ld.invalidos + ' JSON-LD inválido');
      if (!ld.tipos.some((x) => /ProfessionalService|Organization/.test(x))) problemas.push('falta JSON-LD del negocio');
      if (p.servicio && !ld.tipos.includes('Service')) problemas.push('falta JSON-LD Service');
      if (p.servicio && !ld.tipos.includes('FAQPage')) problemas.push('falta JSON-LD FAQPage');
      if (p.interna && !ld.tipos.includes('BreadcrumbList')) problemas.push('falta JSON-LD BreadcrumbList');
      if (p.servicio && !p.sinOfertas && !/"priceCurrency":"PEN"/.test(html)) problemas.push('Service sin ofertas en PEN');
      if (/"priceCurrency":"(?!PEN)/.test(html)) problemas.push('hay una oferta en otra moneda');
      for (const re of PROHIBIDO) if (re.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) problemas.push('texto prohibido ' + re);
      if (ruta === p.ruta && !p.noindex) {
        if (titulos.has(t)) problemas.push('título repetido con ' + titulos.get(t)); else titulos.set(t, ruta);
        if (descripciones.has(d)) problemas.push('descripción repetida con ' + descripciones.get(d)); else descripciones.set(d, ruta);
      }
      ok(!problemas.length, ruta + ' → 200 · ' + (t || '') + ' · JSON-LD: ' + ld.tipos.join(', '), problemas.join('; '));
    }
  }
  for (const ruta of ['/bot', '/bot.html']) {
    const r = await pedir(ruta);
    ok(r.estado === 200 && /text\/html/.test(r.cab['content-type'] || '') && meta(r.texto, /<link rel="canonical" href="([^"]*)"/) === DOMINIO + '/bot' && /SynaptekAI-Bot/.test(r.texto),
      ruta + ' → 200, canonical /bot, describe al bot', 'estado ' + r.estado + ', canonical ' + meta(r.texto, /<link rel="canonical" href="([^"]*)"/));
  }

  titulo('Servidor: archivos y rutas fijas');
  const archivos = [
    ['/assets/checklist-automatizacion.pdf', /^application\/pdf/],
    ['/assets/og-image.jpg', /^image\/jpeg/],
    ['/assets/favicon.ico', /icon/],
    ['/assets/favicon-512x512.png', /^image\/png/],
    ['/assets/apple-touch-icon.png', /^image\/png/],
    ['/llms.txt', /^text\/plain; ?charset=utf-8/i],
    ['/robots.txt', /^text\/plain/],
    ['/sitemap.xml', /xml/],
    ['/index.md', /^text\/markdown; ?charset=utf-8/i],
  ];
  for (const [ruta, tipo] of archivos) {
    const r = await pedir(ruta);
    ok(r.estado === 200 && tipo.test(r.cab['content-type'] || ''), ruta + ' → 200 ' + (r.cab['content-type'] || '') + ' (' + r.cuerpo.length + ' bytes)', 'estado ' + r.estado + ', tipo ' + r.cab['content-type']);
  }
  const videos = fs.existsSync(path.join(ROOT, 'public/assets/videos')) ? fs.readdirSync(path.join(ROOT, 'public/assets/videos')) : [];
  for (const v of videos) {
    const r = await pedir('/assets/videos/' + v, { method: 'HEAD' });
    ok(r.estado === 200, '/assets/videos/' + v + ' → 200', 'estado ' + r.estado);
  }

  titulo('Servidor: robots, sitemap y llms.txt');
  const sinCr = (s) => s.replace(/\r\n/g, '\n');
  const robotsRepo = fs.readFileSync(path.join(ROOT, 'public/robots.txt'), 'utf8');
  if (LOCAL || BASE_ES_PRODUCCION) {
    // En local se pide con el nombre del dominio real: con cualquier otro, nginx entrega el de prueba.
    const robots = (await pedir('/robots.txt', LOCAL ? { host: 'synaptekai.tech' } : {})).texto;
    ok(/Content-Signal:/i.test(robots) && /Sitemap: https:\/\/synaptekai\.tech\/sitemap\.xml/.test(robots) && /^User-agent: \*\r?\nAllow: \/\s*$/m.test(robots), 'robots.txt del dominio real: permite el rastreo, con Content-Signal y Sitemap');
    ok(sinCr(robots) === sinCr(robotsRepo), 'robots.txt del dominio real se sirve tal cual está en public/robots.txt (' + robots.length + ' bytes)');
  }
  if (!BASE_ES_PRODUCCION) {
    const robotsAqui = (await pedir('/robots.txt')).texto;
    ok(/^User-agent: \*\s+Disallow: \/\s*$/.test(robotsAqui.trim()), new URL(BASE).host + ' no es el dominio real: su robots.txt responde "Disallow: /"', robotsAqui.slice(0, 80));
  }
  const sitemap = (await pedir('/sitemap.xml')).texto;
  const enSitemap = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
  const esperadas = PAGINAS.filter((p) => !p.noindex).map((p) => DOMINIO + p.ruta).concat([DOMINIO + '/bot']);
  ok(esperadas.every((u) => enSitemap.includes(u)), 'sitemap.xml lista las ' + esperadas.length + ' páginas indexables', 'faltan: ' + esperadas.filter((u) => !enSitemap.includes(u)).join(', '));
  ok(!enSitemap.some((u) => /gracias|404|\.html/.test(u)), 'sitemap.xml sin la página de gracias, sin la 404 y sin variantes .html', enSitemap.filter((u) => /gracias|404|\.html/.test(u)).join(', '));
  const llms = (await pedir('/llms.txt')).texto;
  ok(PAGINAS.filter((p) => p.md).every((p) => llms.includes(DOMINIO + p.md) || llms.includes(DOMINIO + p.ruta)), 'llms.txt enlaza todas las páginas con versión Markdown', PAGINAS.filter((p) => p.md && !llms.includes(DOMINIO + p.md) && !llms.includes(DOMINIO + p.ruta)).map((p) => p.ruta).join(', '));
  for (const re of PROHIBIDO) ok(!re.test(llms), 'llms.txt sin ' + re);

  titulo('Servidor: versiones Markdown');
  for (const p of PAGINAS.filter((x) => x.md)) {
    const directo = await pedir(p.md);
    const negociado = await pedir(p.ruta, { accept: 'text/markdown' });
    const normal = await pedir(p.ruta, { accept: 'text/html,application/xhtml+xml' });
    const problemas = [];
    if (directo.estado !== 200 || !/^text\/markdown; ?charset=utf-8/i.test(directo.cab['content-type'] || '')) problemas.push(p.md + ': estado ' + directo.estado + ', tipo ' + directo.cab['content-type']);
    if (negociado.estado !== 200 || !/^text\/markdown/i.test(negociado.cab['content-type'] || '')) problemas.push('con Accept: text/markdown responde ' + negociado.estado + ' ' + negociado.cab['content-type']);
    else if (negociado.texto !== directo.texto) problemas.push('la versión negociada no coincide con ' + p.md);
    if (!/accept/i.test(negociado.cab.vary || '')) problemas.push('falta Vary: Accept en la respuesta Markdown');
    if (!/^text\/html/i.test(normal.cab['content-type'] || '')) problemas.push('sin Accept de Markdown no responde HTML');
    if (!/accept/i.test(normal.cab.vary || '')) problemas.push('falta Vary: Accept en la respuesta HTML');
    if (!new RegExp('<' + p.md.replace(/[.]/g, '\\.') + '>; rel="alternate"; type="text/markdown"').test(normal.cab.link || '')) problemas.push('falta la cabecera Link al Markdown (' + (normal.cab.link || 'sin Link') + ')');
    for (const re of PROHIBIDO) if (re.test(directo.texto)) problemas.push('texto prohibido ' + re);
    if (/<[a-z][^>]*>/i.test(directo.texto.replace(/<https?:[^>]+>/g, ''))) problemas.push('contiene HTML');
    ok(!problemas.length, p.md + ' → text/markdown (' + directo.cuerpo.length + ' bytes); ' + p.ruta + ' lo negocia con Accept y lleva Vary + Link', problemas.join('; '));
  }
  const sinMd = await pedir('/privacidad', { accept: 'text/markdown' });
  ok(sinMd.estado === 200 && /^text\/html/i.test(sinMd.cab['content-type'] || ''), '/privacidad (sin versión Markdown) responde HTML aunque se pida Markdown', 'estado ' + sinMd.estado + ' ' + sinMd.cab['content-type']);

  titulo('Servidor: 404, www, modo de prueba y cabeceras');
  const nf = await pedir('/no-existe/para-nada');
  ok(nf.estado === 404 && /<h1/.test(nf.texto) && /site-header/.test(nf.texto), 'una ruta que no existe responde 404 con la página 404 del sitio', 'estado ' + nf.estado + ', ' + nf.cuerpo.length + ' bytes');
  const portada = await pedir('/', { gzip: true });
  ok(portada.cab['content-encoding'] === 'gzip', 'la portada viaja comprimida con gzip (' + portada.cuerpo.length + ' bytes)', 'content-encoding: ' + portada.cab['content-encoding']);
  ok(portada.cab['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options: nosniff', String(portada.cab['x-content-type-options']));
  ok(!!portada.cab['referrer-policy'], 'Referrer-Policy: ' + portada.cab['referrer-policy']);
  ok(/no-cache/.test(portada.cab['cache-control'] || ''), 'HTML sin caché (Cache-Control: ' + portada.cab['cache-control'] + ')');
  const recurso = (portada.texto.length ? (await pedir('/')).texto : '').match(/\/_astro\/[^"')\s]+/);
  if (recurso) {
    const r = await pedir(recurso[0]);
    ok(r.estado === 200 && /immutable/.test(r.cab['cache-control'] || '') && /max-age=31536000/.test(r.cab['cache-control'] || ''), recurso[0] + ' con caché larga e inmutable (' + r.cab['cache-control'] + ')');
  } else aviso('la portada no enlaza ningún recurso de /_astro/ para revisar su caché');
  // Modo de prueba: todo lo que no sea el dominio real sale con noindex y robots cerrado.
  const cabecerasPrueba = async (host, etiqueta) => {
    const o = host ? { host } : {};
    const problemas = [];
    for (const ruta of ['/', '/casos.md', '/no-existe', '/assets/og-image.jpg']) {
      const r = await pedir(ruta, Object.assign({ method: ruta.startsWith('/assets/') ? 'HEAD' : 'GET' }, o));
      if (!/noindex, nofollow/.test(r.cab['x-robots-tag'] || '')) problemas.push(ruta + ' sin X-Robots-Tag (' + r.cab['x-robots-tag'] + ')');
    }
    const rob = await pedir('/robots.txt', o);
    if (rob.estado !== 200 || !/^User-agent: \*\s+Disallow: \/\s*$/.test(rob.texto.trim())) problemas.push('robots.txt: ' + rob.texto.slice(0, 60));
    // X-Host-Recibido fue una cabecera de diagnóstico de la migración: no debe volver.
    if ((await pedir('/', o)).cab['x-host-recibido'] !== undefined) problemas.push('queda la cabecera temporal X-Host-Recibido');
    ok(!problemas.length, etiqueta + ' → modo de prueba: "X-Robots-Tag: noindex, nofollow" en páginas, .md, 404 y archivos; robots.txt con "Disallow: /"', problemas.join('; '));
  };
  const cabecerasReal = async (host, etiqueta) => {
    const o = host ? { host } : {};
    const problemas = [];
    for (const ruta of ['/', '/casos.md', '/no-existe', '/robots.txt']) {
      const r = await pedir(ruta, o);
      if (r.cab['x-robots-tag']) problemas.push(ruta + ' lleva X-Robots-Tag: ' + r.cab['x-robots-tag']);
      if (r.cab['x-host-recibido'] !== undefined) problemas.push(ruta + ' lleva la cabecera temporal X-Host-Recibido: ' + r.cab['x-host-recibido']);
    }
    ok(!problemas.length, etiqueta + ' → dominio real: sin X-Robots-Tag (ni cabeceras de prueba) en ninguna respuesta', problemas.join('; '));
  };
  if (LOCAL) {
    const www = await pedir('/casos?x=1', { host: 'www.synaptekai.tech' });
    ok(www.estado === 301 && www.cab.location === DOMINIO + '/casos?x=1', 'www.synaptekai.tech redirige con 301 a ' + DOMINIO, 'estado ' + www.estado + ' → ' + www.cab.location);
    await cabecerasReal('synaptekai.tech', 'Host synaptekai.tech');
    // Todo lo demás: el sitio de prueba, un dominio de Easypanel, una IP, otro subdominio,
    // un nombre que solo empieza igual, y la propia dirección local.
    for (const host of [DOMINIO_PRUEBA, 'sitio-web-nuevo.ejemplo.easypanel.host', '203.0.113.10', 'otro.synaptekai.tech', 'synaptekai.tech.ejemplo.com']) await cabecerasPrueba(host, 'Host ' + host);
    await cabecerasPrueba(null, new URL(BASE).host);
    const robotsOtro = await pedir('/robots-prueba.txt', { host: 'synaptekai.tech' });
    ok(robotsOtro.estado === 404, 'el robots de prueba no se puede pedir directo (/robots-prueba.txt → 404)', 'estado ' + robotsOtro.estado);
  } else if (BASE_ES_PRODUCCION) {
    await cabecerasReal(null, new URL(BASE).host);
    const www = await pedir('/casos?x=1', { base: 'https://www.synaptekai.tech' });
    ok(www.estado === 301 && www.cab.location === DOMINIO + '/casos?x=1', 'www.synaptekai.tech redirige con 301 a ' + DOMINIO, 'estado ' + www.estado + ' → ' + www.cab.location);
  } else {
    await cabecerasPrueba(null, new URL(BASE).host);
  }
}

// ---------------------------------------------------------------- navegador
async function conectar() {
  let target;
  for (let i = 0; i < 60; i++) {
    try {
      const lista = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json();
      target = lista.find((t) => t.type === 'page');
      if (target) break;
    } catch (e) { /* arrancando */ }
    await sleep(250);
  }
  if (!target) throw new Error('el navegador no abrió el puerto de depuración');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('no se pudo conectar al navegador')); });
  let seq = 0;
  const pendientes = new Map();
  const oyentes = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pendientes.has(msg.id)) {
      const { res, rej } = pendientes.get(msg.id);
      pendientes.delete(msg.id);
      if (msg.error) rej(new Error(msg.error.message)); else res(msg.result);
    } else if (msg.method) oyentes.forEach((h) => h(msg.method, msg.params));
  };
  return {
    send(method, params) { const id = ++seq; ws.send(JSON.stringify({ id, method, params: params || {} })); return new Promise((res, rej) => pendientes.set(id, { res, rej })); },
    on(fn) { oyentes.push(fn); },
    close() { ws.close(); },
  };
}

// Corre dentro de la página: estado general a un ancho dado.
const MEDIR_PAGINA = `(() => {
  const doc = document.documentElement;
  const cab = document.querySelector('header.site-header');
  const visibles = (sel) => Array.from(document.querySelectorAll(sel)).filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
  const out = { ancho: window.innerWidth, anchoPagina: Math.max(doc.scrollWidth, document.body.scrollWidth), alto: doc.scrollHeight };
  // Elementos que se salen por la derecha (fuera de contenedores con su propio scroll).
  out.salidos = Array.from(document.querySelectorAll('body *')).filter((e) => {
    const r = e.getBoundingClientRect();
    if (!r.width || r.right <= window.innerWidth + 1) return false;
    for (let p = e.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return false; }
    return getComputedStyle(e).position !== 'fixed';
  }).slice(0, 5).map((e) => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''));
  if (cab) {
    const r = cab.getBoundingClientRect();
    const hijos = Array.from(cab.children).filter((e) => e.getClientRects().length);
    const centros = hijos.map((e) => { const q = e.getBoundingClientRect(); return q.top + q.height / 2; });
    const enlaces = visibles('.desktop-nav .menu-enlace');
    const nav = cab.querySelector('.desktop-nav');
    const acciones = hijos[hijos.length - 1];
    const logo = hijos[0];
    out.cabecera = {
      alto: Math.round(r.height),
      unaFila: Math.max.apply(null, centros) - Math.min.apply(null, centros) <= 2,
      menu: enlaces.length,
      enlacesPartidos: enlaces.filter((e) => e.getBoundingClientRect().height > 44 || e.scrollWidth > e.clientWidth + 1).length,
      // Aire entre el menú y lo que tiene a cada lado (0 o menos = se tocan o se pisan).
      holgura: nav && nav.getClientRects().length ? Math.round(Math.min(nav.getBoundingClientRect().left - logo.getBoundingClientRect().right, acciones.getBoundingClientRect().left - nav.getBoundingClientRect().right)) : null,
      hamburguesa: visibles('#mobile-nav-toggle').length === 1,
      botonTexto: visibles('.desktop-actions a').length === 1,
      botonIcono: visibles('.mobile-wa-btn').length === 1,
      dentro: hijos.every((e) => e.getBoundingClientRect().right <= window.innerWidth + 0.5 && e.getBoundingClientRect().left >= -0.5),
    };
  }
  out.h1 = visibles('h1').map((e) => e.textContent.replace(/\\s+/g, ' ').trim());
  out.chat = !!document.getElementById('sk-launcher');
  out.franja = visibles('.franja-prueba').length;
  out.pequenos = visibles('a[href], button').filter((e) => { const r = e.getBoundingClientRect(); return r.width < 24 || r.height < 24; }).filter((e) => getComputedStyle(e).display !== 'inline').slice(0, 5).map((e) => (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
  return out;
})()`;

// Corre dentro de la página: pulsa todos los enlaces a WhatsApp (sin navegar) y recoge los eventos.
const PROBAR_WHATSAPP = `(() => {
  window.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); }, true);
  const eventos = [];
  const original = console.info;
  console.info = function (m, p) { if (typeof m === 'string' && m.indexOf('[GA4') === 0) eventos.push({ nombre: m.replace(/^\\[GA4[^\\]]*\\] /, ''), p }); else original.apply(console, arguments); };
  const gtagOriginal = window.gtag;
  window.gtag = function () { if (arguments[0] === 'event') eventos.push({ nombre: arguments[1], p: arguments[2] }); if (gtagOriginal) gtagOriginal.apply(this, arguments); };
  const enlaces = Array.from(document.querySelectorAll('a[href*="wa.me"]'));
  return enlaces.map((a) => {
    eventos.length = 0;
    a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    const u = new URL(a.href);
    return { numero: u.pathname.slice(1), mensaje: u.searchParams.get('text') || '', blank: a.target === '_blank', eventos: eventos.map((e) => e.nombre + ' ' + JSON.stringify(e.p)), origen: eventos[0] && eventos[0].p ? eventos[0].p.origen : null, pagina: eventos[0] && eventos[0].p ? eventos[0].p.pagina : null };
  });
})()`;

async function verificarNavegador() {
  const exe = BROWSERS.find((p) => fs.existsSync(p));
  if (!exe) throw new Error('no encontré Chrome ni Edge instalados');
  const perfil = path.join(os.tmpdir(), 'synaptekai-verificar-perfil');
  fs.rmSync(perfil, { recursive: true, force: true });
  if (CAPTURAS) fs.mkdirSync(DIR_CAPTURAS, { recursive: true });
  const banderas = ['--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + perfil,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio',
    // Si el sistema tiene las animaciones apagadas, Chrome desactiva el desplazamiento
    // suave: se fuerza para poder probarlo (el modo reducido se emula por página).
    '--force-prefers-no-reduced-motion', '--enable-smooth-scrolling'];
  // Solo contra localhost: los dos dominios apuntan al contenedor local, para probar el
  // modo de prueba y el dominio real sin tocar el DNS ni el sitio publicado. Contra un
  // dominio de verdad no se toca la resolución de nombres.
  if (LOCAL) banderas.push('--host-resolver-rules=MAP ' + DOMINIO_PRUEBA + ' 127.0.0.1, MAP synaptekai.tech 127.0.0.1');
  const navegador = spawn(exe, banderas.concat(['about:blank']), { stdio: 'ignore' });
  let cdp;
  try {
    cdp = await conectar();
    let consola = [];
    let fallidas = [];
    let pedidas = [];
    let capturadas = []; // peticiones a n8n interceptadas (nunca salen de aquí)
    let retrasoFuentes = 0; // ms que se retienen las fuentes, para probar su llegada tardía
    let bytes = 0;
    cdp.on((method, p) => {
      if (method === 'Runtime.exceptionThrown') consola.push('excepción: ' + ((p.exceptionDetails.exception && p.exceptionDetails.exception.description) || p.exceptionDetails.text).split('\n')[0]);
      else if (method === 'Runtime.consoleAPICalled' && (p.type === 'error' || p.type === 'warning')) consola.push('console.' + p.type + ': ' + p.args.map((a) => a.value || a.description || '').join(' ').slice(0, 200));
      else if (method === 'Log.entryAdded' && (p.entry.level === 'error' || p.entry.level === 'warning')) consola.push(p.entry.level + ': ' + p.entry.text.slice(0, 200) + (p.entry.url ? ' (' + p.entry.url + ')' : ''));
      else if (method === 'Network.requestWillBeSent') pedidas.push(p.request.url);
      else if (method === 'Network.responseReceived' && p.response.status >= 400) fallidas.push(p.response.status + ' ' + p.response.url);
      else if (method === 'Network.loadingFailed' && !p.canceled) fallidas.push('falló ' + (p.errorText || '') + ' ' + (p.requestId || ''));
      else if (method === 'Network.loadingFinished') bytes += p.encodedDataLength || 0;
      else if (method === 'Fetch.requestPaused' && /\.woff2(\?|$)/.test(p.request.url)) {
        // Las fuentes pasan de largo, salvo cuando una prueba pide que lleguen tarde.
        setTimeout(() => cdp.send('Fetch.continueRequest', { requestId: p.requestId }).catch(() => {}), retrasoFuentes);
      } else if (method === 'Fetch.requestPaused') {
        const url = p.request.url;
        const esN8n = ES_N8N(url);
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
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    // Se interceptan n8n (por su dirección y por la ruta /webhook/) y Google Analytics. El
    // sitio que se revisa puede estar en un dominio *.easypanel.host: por eso no se intercepta
    // ese dominio entero, solo las direcciones de n8n.
    await cdp.send('Fetch.enable', { patterns: ORIGENES_N8N.map((o) => ({ urlPattern: o + '/*' })).concat([{ urlPattern: '*.woff2*' }, { urlPattern: '*/webhook/*' }, { urlPattern: '*/webhook-test/*' }, { urlPattern: '*googletagmanager.com*' }, { urlPattern: '*google-analytics.com*' }, { urlPattern: '*analytics.google.com*' }]) });

    const evalJs = async (expression) => {
      const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error('evaluate: ' + ((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text));
      return r.result.value;
    };
    const tecla = async (key, code, vk, text) => {
      await cdp.send('Input.dispatchKeyEvent', Object.assign({ type: text ? 'keyDown' : 'rawKeyDown', key, code, windowsVirtualKeyCode: vk }, text ? { text } : {}));
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk });
      await sleep(150);
    };
    let idScript = null;
    // El popup del checklist: por defecto se da por visto, para que no tape nada.
    // true: popup ya visto · false: navegador recién estrenado · null: no tocar nada.
    const prepararAlmacen = async (popupVisto) => {
      if (idScript) await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: idScript });
      idScript = null;
      if (popupVisto === null) return;
      const r = await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: popupVisto ? 'try { localStorage.setItem("synaptekai-lead-modal-shown", "1"); } catch (e) {}' : 'try { localStorage.removeItem("synaptekai-lead-modal-shown"); sessionStorage.clear(); } catch (e) {}' });
      idScript = r.identifier;
    };
    await prepararAlmacen(true);
    const altoVentana = (w) => (w < 768 ? 812 : (w < 1024 ? 1024 : 800));
    const cargar = async (ruta, w, o = {}) => {
      const movil = w < 1024;
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: altoVentana(w), deviceScaleFactor: 1, mobile: movil });
      await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: movil });
      // El equipo puede tener las animaciones del sistema apagadas: por defecto se prueba
      // con movimiento, y el modo reducido se pide aparte.
      await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: o.reducido ? 'reduce' : 'no-preference' }] });
      await cdp.send('Page.navigate', { url: 'about:blank' });
      await sleep(150);
      consola = []; fallidas = []; pedidas = []; bytes = 0;
      // o.host: abre el contenedor local con otro nombre de dominio.
      const origen = o.host ? 'http://' + o.host + ':' + (new URL(BASE).port || 80) : BASE;
      await cdp.send('Page.navigate', { url: origen + ruta });
      for (let i = 0; i < 80; i++) {
        await sleep(200);
        if (await evalJs('document.readyState === "complete" && location.href !== "about:blank"').catch(() => false)) break;
      }
      await evalJs('document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true');
      await sleep(o.espera || 700);
    };
    // Recorre la página para que aparezcan los bloques con animación de entrada.
    const recorrer = async (w) => {
      const alto = await evalJs('document.documentElement.scrollHeight');
      for (let y = 0; y < alto; y += Math.round(altoVentana(w) * 0.6)) { await evalJs('window.scrollTo({ top: ' + y + ', behavior: "instant" })'); await sleep(90); }
      await evalJs('window.scrollTo({ top: 0, behavior: "instant" })');
      await sleep(900);
    };
    const capturar = async (nombre, w) => {
      const alto = await evalJs('document.documentElement.scrollHeight');
      const MAX = 12000; // Chrome no dibuja bien capturas de más de ~16 000 px de alto
      const partes = Math.ceil(alto / MAX);
      for (let i = 0; i < partes; i++) {
        const y = i * MAX;
        const r = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y, width: w, height: Math.min(MAX, alto - y), scale: 1 } });
        fs.writeFileSync(path.join(DIR_CAPTURAS, nombre + '-' + w + (partes > 1 ? '-parte' + (i + 1) : '') + '.png'), Buffer.from(r.data, 'base64'));
      }
      return partes;
    };

    // Google Analytics en el dominio real. La configuración se encola al empezar, pero la
    // librería (gtag.js) se pide después: al primer gesto o a los 3 s de terminar la carga.
    // "o" son las opciones de cargar(): contra localhost, el nombre del dominio real.
    const probarAnalytics = async (o, etiqueta) => {
      const urlGtag = 'https://www.googletagmanager.com/gtag/js?id=' + GA4;
      const estado = () => evalJs('({ host: location.hostname, activo: window.__ga4Activo, scripts: Array.from(document.querySelectorAll(\'script[src*="googletagmanager"]\')).map((s) => s.src), franja: document.querySelector(".franja-prueba").getBoundingClientRect().height, cola: JSON.stringify(Array.from(window.dataLayer || []).map((x) => Array.from(x)).filter((x) => x[0] !== "js")) })');
      const pidio = () => pedidas.filter((u) => u.startsWith(urlGtag)).length;
      const soloConfig = JSON.stringify([['config', GA4]]);
      const conEvento = JSON.stringify([['config', GA4], ['event', 'contacto_whatsapp', { origen: 'hero', pagina: '/' }]]);

      // 1. Recién cargada, sin tocar nada.
      await cargar('/', 1280, Object.assign({ espera: 250 }, o));
      const a = await estado();
      ok(a.activo === true && a.franja === 0 && a.cola === soloConfig && !a.scripts.length && !pidio(), etiqueta + ': sin franja de prueba; Google Analytics ' + GA4 + ' queda configurado en la cola y gtag.js no se pide mientras la página se dibuja', JSON.stringify({ a, pedidos: pidio() }));

      // 2. Un clic en WhatsApp antes de que la librería cargue: el evento espera en la cola.
      await evalJs(`(() => {
        window.addEventListener('click', (e) => { const x = e.target.closest && e.target.closest('a'); if (x) e.preventDefault(); }, true);
        const marca = document.querySelector('#inicio [data-origen="hero"]');
        const enlace = marca.matches('a') ? marca : marca.querySelector('a[href*="wa.me"]');
        enlace.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      })()`);
      const b = await estado();
      ok(b.cola === conEvento && !b.scripts.length && !pidio(), etiqueta + ': un clic en WhatsApp antes de que cargue Analytics queda en la cola, detrás de la configuración (no se pierde)', JSON.stringify(b));

      // 3. Sin gestos: a los 3 s de terminar la carga.
      await sleep(3300);
      const c = await estado();
      ok(c.scripts.length === 1 && c.scripts[0] === urlGtag && pidio() === 1 && c.cola === conEvento, etiqueta + ': sin tocar la página, gtag.js se pide una sola vez a los 3 s de terminar la carga, con el evento todavía en la cola', JSON.stringify({ c, pedidos: pidio() }));

      // 4. Con un gesto, de inmediato: una tecla y el scroll.
      for (const [gesto, hacer] of [['una tecla', () => tecla('Shift', 'ShiftLeft', 16)], ['el scroll', () => evalJs('window.scrollTo({ top: 300, behavior: "instant" })')]]) {
        await cargar('/', 1280, Object.assign({ espera: 250 }, o));
        const antes = pidio();
        await hacer();
        await sleep(300);
        const d = await estado();
        ok(antes === 0 && d.scripts.length === 1 && d.scripts[0] === urlGtag && pidio() === 1, etiqueta + ': con el primer gesto del visitante (' + gesto + ') gtag.js se pide de inmediato', JSON.stringify({ antes, d, pedidos: pidio() }));
      }
    };

    const paginas = PAGINAS.concat([{ ruta: '/no-existe', nombre: '404', noindex: true }]).filter((p) => !SOLO || p.ruta === SOLO);

    // ---------- Cada página a cada ancho
    // En local las páginas se revisan como las verá el público: con el nombre del dominio
    // real (Chrome lo resuelve hacia el contenedor), sin franja y con GA4 interceptado.
    const comoReal = LOCAL ? { host: 'synaptekai.tech' } : {};
    const esperaFranja = !LOCAL && !BASE_ES_PRODUCCION;
    titulo('Navegador: cada página a ' + WIDTHS.join(', ') + ' px' + (LOCAL ? ' (servidas como synaptekai.tech)' : ''));
    for (const p of paginas) {
      const notas = [];
      const problemas = [];
      for (const w of WIDTHS) {
        await cargar(p.ruta, w, comoReal);
        await recorrer(w);
        const m = await evalJs(MEDIR_PAGINA);
        const e = '[' + w + '] ';
        if (m.anchoPagina > m.ancho) problemas.push(e + 'desborde horizontal: ' + m.anchoPagina + ' px de ancho');
        if (m.salidos.length) problemas.push(e + 'elementos que se salen: ' + m.salidos.join(', '));
        if (!m.cabecera) problemas.push(e + 'sin cabecera');
        else {
          if (!m.cabecera.unaFila) problemas.push(e + 'la cabecera no está en una sola fila');
          if (!m.cabecera.dentro) problemas.push(e + 'la cabecera se sale de la pantalla');
          if (m.cabecera.enlacesPartidos) problemas.push(e + m.cabecera.enlacesPartidos + ' enlaces del menú partidos en dos líneas');
        }
        if (m.h1.length !== 1) problemas.push(e + m.h1.length + ' h1 visibles');
        if (esperaFranja && !m.franja) problemas.push(e + 'falta la franja de "sitio de prueba" (esta dirección no es el dominio real)');
        if (!esperaFranja && m.franja) problemas.push(e + 'se ve la franja de "sitio de prueba" en el dominio real');
        // La 404 siempre deja en consola el aviso de su propia respuesta 404: no es un error de la página.
        const errores = consola.filter((x) => !/favicon/.test(x) && !(p.nombre === '404' && x.includes('status of 404') && x.includes(p.ruta)));
        if (errores.length) problemas.push(e + 'consola: ' + Array.from(new Set(errores)).slice(0, 3).join(' | '));
        const malas = fallidas.filter((x) => !(p.nombre === '404' && x.includes(p.ruta)));
        if (malas.length) problemas.push(e + 'peticiones fallidas: ' + Array.from(new Set(malas)).slice(0, 3).join(' | '));
        const videosPedidos = pedidas.filter((u) => /\.(mp4|webm)(\?|$)/.test(u));
        if (videosPedidos.length) problemas.push(e + 'pide videos al cargar: ' + videosPedidos.join(', '));
        if (w === 375) notas.push('alto a 375: ' + m.alto + ' px');
        if (w === 1280) notas.push('a 1280: ' + m.alto + ' px' + (m.chat ? ', con chat' : ', sin chat'));
        if (m.pequenos.length && w === 375) notas.push('controles de menos de 24 px a 375: ' + m.pequenos.join(' / '));
        if (CAPTURAS && WIDTHS_CAPTURA.includes(w)) await capturar(p.nombre, w);
      }
      ok(!problemas.length, p.ruta + ' (' + notas.join('; ') + ')', problemas.join(' · '));
    }

    if (!SOLO) {
      // ---------- Cabecera en los cortes
      titulo('Navegador: cabecera en una fila (portada y una página interna)');
      for (const ruta of ['/', '/servicios/visibilidad-google-ia']) {
        const filas = [];
        const problemas = [];
        for (const w of WIDTHS_CABECERA) {
          await cargar(ruta, w, { espera: 300 });
          const c = (await evalJs(MEDIR_PAGINA)).cabecera;
          const modo = c.hamburguesa ? 'hamburguesa' : (c.botonTexto ? 'menú + botón con texto' : 'menú + botón ícono');
          const esperado = w < 1024 ? 'hamburguesa' : (w < 1240 ? 'menú + botón ícono' : 'menú + botón con texto');
          filas.push(w + ': ' + modo + (c.holgura !== null ? ' (holgura ' + c.holgura + ' px)' : '') + ', alto ' + c.alto);
          if (modo !== esperado) problemas.push(w + ' px: ' + modo + ' y debía ser ' + esperado);
          if (!c.unaFila || !c.dentro || c.enlacesPartidos) problemas.push(w + ' px: no cabe en una fila');
          if (c.holgura !== null && c.holgura < 12) problemas.push(w + ' px: el menú queda a ' + c.holgura + ' px de lo que tiene al lado');
          if (!c.hamburguesa && c.menu !== 6) problemas.push(w + ' px: ' + c.menu + ' entradas de menú visibles (deben ser 6)');
        }
        ok(!problemas.length, ruta + ' → ' + filas.join(' · '), problemas.join(' · '));
      }

      // ---------- Enlaces de WhatsApp y evento
      titulo('Navegador: enlaces a WhatsApp y evento contacto_whatsapp' + (BASE_ES_PRODUCCION ? '' : ' (modo de prueba: eventos en la consola)'));
      let totalEnlaces = 0;
      for (const p of paginas) {
        await cargar(p.ruta, 1280);
        const enlaces = await evalJs(PROBAR_WHATSAPP);
        totalEnlaces += enlaces.length;
        const esperada = p.nombre === '404' ? p.ruta : p.ruta;
        const problemas = [];
        enlaces.forEach((a, i) => {
          const quien = 'enlace ' + (i + 1) + ' "' + a.mensaje.slice(0, 40) + '"';
          if (a.numero !== '51939584377') problemas.push(quien + ': número ' + a.numero);
          // Los enlaces dentro del texto legal van sin mensaje, como en las páginas originales.
          const legal = a.origen === 'privacidad' || a.origen === 'terminos';
          if (!a.mensaje && !legal) problemas.push(quien + ': sin mensaje');
          if (!a.blank && !legal) problemas.push(quien + ': no abre en pestaña nueva');
          if (a.eventos.length !== 1) problemas.push(quien + ': ' + a.eventos.length + ' eventos');
          else if (!/^contacto_whatsapp /.test(a.eventos[0])) problemas.push(quien + ': evento ' + a.eventos[0]);
          else if (!ORIGENES.includes(a.origen)) problemas.push(quien + ': origen "' + a.origen + '"');
          else if (a.pagina !== esperada) problemas.push(quien + ': pagina "' + a.pagina + '"');
        });
        if (!enlaces.length) problemas.push('la página no tiene ningún enlace a WhatsApp');
        const cuenta = {};
        enlaces.forEach((a) => { cuenta[a.origen] = (cuenta[a.origen] || 0) + 1; });
        ok(!problemas.length, p.ruta + ' → ' + enlaces.length + ' enlaces: ' + Object.keys(cuenta).map((k) => k + (cuenta[k] > 1 ? ' ×' + cuenta[k] : '')).join(', '), problemas.join(' · '));
      }
      dato(totalEnlaces + ' enlaces a WhatsApp revisados en total.');
      await cargar('/', 1280);
      if (BASE_ES_PRODUCCION) {
        // La petición a Google se intercepta aquí: la verificación no deja visitas en Analytics.
        await probarAnalytics({}, 'dominio real');
      } else {
        // Ni con un gesto ni esperando: fuera del dominio real Analytics no se pide.
        await evalJs('window.scrollTo({ top: 300, behavior: "instant" })');
        await sleep(3400);
        const ga = await evalJs('({ activo: window.__ga4Activo, script: (document.querySelector(\'script[src*="googletagmanager"]\') || {}).src || "", franja: document.querySelector(".franja-prueba").getBoundingClientRect().height })');
        const pidioGa = pedidas.some((u) => /googletagmanager|google-analytics/.test(u));
        ok(ga.activo === false && !ga.script && !pidioGa && ga.franja > 0, new URL(BASE).host + ' no es el dominio real: franja "Sitio de prueba" visible y Google Analytics sin cargar, ni con scroll ni pasados 3 s (los eventos van a la consola)', JSON.stringify({ ga, pidioGa }));
      }

      // ---------- Modo de prueba y dominio real, simulados sobre el contenedor local
      if (LOCAL) {
        titulo('Navegador: sitio de prueba y dominio real (simulados sobre localhost)');
        const problemasPrueba = [];
        let franja = null;
        for (const w of [375, 1280]) {
          await cargar('/', w, { host: DOMINIO_PRUEBA });
          await recorrer(w);
          franja = await evalJs(`(() => { const f = document.querySelector('.franja-prueba'); const r = f.getBoundingClientRect(); const c = document.querySelector('header.site-header').getBoundingClientRect(); return { host: location.hostname, alto: Math.round(r.height), texto: f.textContent.trim(), arriba: Math.round(r.top + window.scrollY), cabecera: Math.round(c.top + window.scrollY), ga: window.__ga4Activo, desborde: document.documentElement.scrollWidth > window.innerWidth }; })()`);
          if (franja.host !== DOMINIO_PRUEBA) problemasPrueba.push('[' + w + '] no cargó con el dominio de prueba (' + franja.host + ')');
          if (!(franja.alto > 0) || franja.texto !== 'Sitio de prueba' || franja.arriba !== 0) problemasPrueba.push('[' + w + '] franja: ' + JSON.stringify(franja));
          if (franja.cabecera < franja.alto) problemasPrueba.push('[' + w + '] la franja tapa la cabecera');
          if (franja.ga !== false) problemasPrueba.push('[' + w + '] GA4 activo en el sitio de prueba');
          if (franja.desborde) problemasPrueba.push('[' + w + '] desborde horizontal');
          if (pedidas.some((u) => /googletagmanager|google-analytics/.test(u))) problemasPrueba.push('[' + w + '] pidió Google Analytics');
          if (CAPTURAS) await capturar('sitio-de-prueba-portada', w);
        }
        ok(!problemasPrueba.length, DOMINIO_PRUEBA + ': franja "' + franja.texto + '" arriba de la página (' + franja.alto + ' px), sin Google Analytics', problemasPrueba.join(' · '));
        await cargar('/servicios/paginas-web', 1280, { host: DOMINIO_PRUEBA });
        ok(await evalJs('document.querySelector(".franja-prueba").getBoundingClientRect().height > 0'), DOMINIO_PRUEBA + ': la franja también sale en las páginas internas');

        await probarAnalytics({ host: 'synaptekai.tech' }, 'synaptekai.tech (contenedor local)');
      }

      // ---------- Menú
      titulo('Navegador: menú');
      await cargar('/casos', 1280);
      await evalJs('document.querySelector("[data-menu-servicios] button").focus()');
      const m0 = await evalJs('(() => { const b = document.querySelector("[data-menu-servicios] button"); return { exp: b.getAttribute("aria-expanded"), oculto: document.getElementById("submenu-servicios").hidden, actual: Array.from(document.querySelectorAll(".desktop-nav [aria-current=page]")).map((a) => a.getAttribute("href")).join(",") }; })()');
      await tecla('Enter', 'Enter', 13, '\r');
      const m1 = await evalJs('(() => { const b = document.querySelector("[data-menu-servicios] button"); const l = document.getElementById("submenu-servicios"); return { exp: b.getAttribute("aria-expanded"), oculto: l.hidden, enlaces: Array.from(l.querySelectorAll("a")).filter((a) => a.getClientRects().length).map((a) => a.getAttribute("href")) }; })()');
      await tecla('ArrowDown', 'ArrowDown', 40);
      const m2 = await evalJs('document.activeElement.getAttribute("href")');
      await tecla('Escape', 'Escape', 27);
      const m3 = await evalJs('(() => { const b = document.querySelector("[data-menu-servicios] button"); return { exp: b.getAttribute("aria-expanded"), oculto: document.getElementById("submenu-servicios").hidden, foco: document.activeElement === b }; })()');
      await tecla('Enter', 'Enter', 13, '\r');
      await tecla('Tab', 'Tab', 9); await tecla('Tab', 'Tab', 9); await tecla('Tab', 'Tab', 9); await tecla('Tab', 'Tab', 9); await tecla('Tab', 'Tab', 9); await tecla('Tab', 'Tab', 9); await tecla('Tab', 'Tab', 9);
      const m4 = await evalJs('({ oculto: document.getElementById("submenu-servicios").hidden, foco: document.activeElement.getAttribute("href") })');
      ok(m0.exp === 'false' && m0.oculto && m1.exp === 'true' && !m1.oculto && m1.enlaces.length === 6 && m1.enlaces.every((h) => h.startsWith('/servicios/')),
        'submenú Servicios: cerrado al cargar; Enter lo abre y muestra las 6 páginas de servicio', JSON.stringify({ m0, m1 }));
      ok(m2 === '/servicios/asistentes-whatsapp', 'flecha abajo lleva el foco al primer enlace del submenú', 'foco en ' + m2);
      ok(m3.exp === 'false' && m3.oculto && m3.foco, 'Escape lo cierra y devuelve el foco al botón', JSON.stringify(m3));
      ok(m4.oculto && m4.foco === '/casos', 'al salir con Tab se cierra y el foco sigue en el menú (' + m4.foco + ')', JSON.stringify(m4));
      ok(m0.actual === '/casos', 'la página actual va marcada con aria-current en el menú', 'marcado: ' + m0.actual);
      // con ratón
      const pos = await evalJs('(() => { const r = document.querySelector("[data-menu-servicios] button").getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()');
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pos.x - 4, y: pos.y });
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pos.x, y: pos.y });
      await sleep(250);
      const raton1 = await evalJs('!document.getElementById("submenu-servicios").hidden');
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pos.x, y: 500 });
      await sleep(450);
      const raton2 = await evalJs('document.getElementById("submenu-servicios").hidden');
      ok(raton1 && raton2, 'con el ratón: se abre al pasar por encima y se cierra al salir', 'abre=' + raton1 + ' cierra=' + raton2);

      await cargar('/servicios/paginas-web', 375);
      const h0 = await evalJs('document.getElementById("mobile-nav-panel").hidden');
      await evalJs('document.getElementById("mobile-nav-toggle").click()');
      await sleep(250);
      const h1 = await evalJs('(() => { const p = document.getElementById("mobile-nav-panel"); const s = document.getElementById("panel-servicios"); return { oculto: p.hidden, exp: document.getElementById("mobile-nav-toggle").getAttribute("aria-expanded"), servicios: !s.hidden, enlaces: Array.from(p.querySelectorAll("a")).filter((a) => a.getClientRects().length).map((a) => a.getAttribute("href")), actual: Array.from(p.querySelectorAll("[aria-current=page]")).map((a) => a.getAttribute("href")).join(","), cabe: p.getBoundingClientRect().right <= window.innerWidth, desborde: document.documentElement.scrollWidth > window.innerWidth }; })()');
      await evalJs('document.querySelector(".panel-servicios__boton").click()');
      await sleep(200);
      const h2 = await evalJs('({ servicios: !document.getElementById("panel-servicios").hidden, exp: document.querySelector(".panel-servicios__boton").getAttribute("aria-expanded") })');
      await tecla('Escape', 'Escape', 27);
      const h3 = await evalJs('({ oculto: document.getElementById("mobile-nav-panel").hidden, foco: document.activeElement.id })');
      ok(h0 && !h1.oculto && h1.exp === 'true' && h1.cabe && !h1.desborde, 'hamburguesa (375 px): abre el panel sin desbordar', JSON.stringify(h1));
      ok(h1.servicios && h1.actual === '/servicios/paginas-web' && h1.enlaces.filter((h) => h.startsWith('/servicios/')).length === 6, 'en una página de servicio el panel abre con "Servicios" desplegado y la página marcada', JSON.stringify(h1));
      ok(!h2.servicios && h2.exp === 'false', '"Servicios" se contrae y se expande dentro del panel', JSON.stringify(h2));
      ok(h3.oculto && h3.foco === 'mobile-nav-toggle', 'Escape cierra el panel y devuelve el foco al botón', JSON.stringify(h3));
      await cargar('/', 375);
      await evalJs('document.getElementById("mobile-nav-toggle").click()');
      await sleep(200);
      const h4 = await evalJs('({ servicios: !document.getElementById("panel-servicios").hidden })');
      await evalJs('document.querySelector(".panel-servicios__boton").click()');
      await sleep(200);
      const h5 = await evalJs('(() => { const p = document.getElementById("mobile-nav-panel"); return { servicios: !document.getElementById("panel-servicios").hidden, enlaces: Array.from(p.querySelectorAll("a")).filter((a) => a.getClientRects().length).length, altoPanel: Math.round(p.getBoundingClientRect().bottom), ventana: window.innerHeight, scroll: getComputedStyle(p).overflowY, posicion: getComputedStyle(p).position }; })()');
      ok(!h4.servicios && h5.servicios && h5.enlaces === 12, 'en la portada "Servicios" empieza contraído y al expandirlo quedan los 12 enlaces del panel', JSON.stringify({ h4, h5 }));
      // El panel va en el flujo de la página (no es fijo): si es más alto que la pantalla, se desplaza con ella.
      if (h5.altoPanel > h5.ventana && /fixed|absolute/.test(h5.posicion) && !/auto|scroll/.test(h5.scroll)) aviso('el panel del menú móvil mide más que la pantalla (' + h5.altoPanel + ' de ' + h5.ventana + ' px) y no tiene scroll propio');

      // ---------- Anclas y desplazamiento suave
      titulo('Navegador: anclas y desplazamiento suave');
      const posicion = '(() => { const s = document.getElementById("ID"); return { hash: location.hash, ruta: location.pathname, arriba: Math.round(s.getBoundingClientRect().top), suave: getComputedStyle(document.documentElement).scrollBehavior }; })()';
      await cargar('/#paquetes', 1280, { espera: 2600 });
      const a1 = await evalJs(posicion.replace('ID', 'paquetes'));
      ok(a1.hash === '#paquetes' && Math.abs(a1.arriba) <= 2 && a1.suave === 'smooth', 'entrar con /#paquetes: baja hasta la sección y la URL conserva el ancla', JSON.stringify(a1));
      await cargar('/#paquetes', 1280, { espera: 1200, reducido: true });
      const a2 = await evalJs(posicion.replace('ID', 'paquetes'));
      ok(a2.hash === '#paquetes' && Math.abs(a2.arriba) <= 2 && a2.suave === 'auto', 'con movimiento reducido: salto directo, sin animación', JSON.stringify(a2));
      await cargar('/', 1280);
      await evalJs('document.querySelector(\'.desktop-nav a[href="/#contacto"]\').click()');
      await sleep(250);
      const medio = await evalJs('Math.round(window.scrollY)');
      await sleep(2200);
      const a3 = await evalJs(posicion.replace('ID', 'contacto'));
      const fin = await evalJs('Math.round(window.scrollY)');
      const tope = await evalJs('Math.round(document.documentElement.scrollHeight - window.innerHeight)');
      ok(a3.hash === '#contacto' && (Math.abs(a3.arriba) <= 2 || fin >= tope - 2) && medio > 0 && medio < fin, 'clic en un enlace interno de la portada: desplazamiento suave hasta la sección', JSON.stringify({ a3, medio, fin }));
      await cargar('/casos', 1280);
      await evalJs('document.querySelector(\'.desktop-nav a[href="/#como-funciona"]\').click()');
      await sleep(3200);
      const a4 = await evalJs(posicion.replace('ID', 'como-funciona'));
      ok(a4.ruta === '/' && a4.hash === '#como-funciona' && Math.abs(a4.arriba) <= 2, 'desde una página interna, "Cómo funciona" lleva a la portada y a su sección', JSON.stringify(a4));
      await cargar('/casos#aquamatic', 1280, { espera: 2200 });
      const a5 = await evalJs(posicion.replace('ID', 'aquamatic'));
      const topeCasos = await evalJs('Math.round(window.scrollY) >= Math.round(document.documentElement.scrollHeight - window.innerHeight) - 2');
      ok(a5.hash === '#aquamatic' && ((a5.arriba >= -2 && a5.arriba <= 32) || topeCasos), '/casos#aquamatic baja hasta el caso (queda a ' + a5.arriba + ' px del borde)', JSON.stringify(a5));
      for (const id of ['due-hotel', 'aquamatic', 'oral-dent']) {
        const hay = await evalJs('!!document.getElementById("' + id + '")');
        ok(hay, '/casos tiene el ancla #' + id);
      }

      // ---------- Formulario del checklist (interceptado: no llega a n8n)
      titulo('Navegador: checklist, popup, chat y videos');
      const webhookChecklist = WEBHOOK_CHECKLIST;
      const webhookChat = WEBHOOK_CHAT;
      await cargar('/', 1280);
      capturadas = [];
      const vacio = await evalJs(`(() => {
        const f = document.querySelector('form[data-lead-source="seccion"]');
        f.querySelector('button[type="submit"]').click();
        return { errores: Array.from(f.querySelectorAll('[data-error-for]')).filter((e) => e.textContent).length, campos: Array.from(f.elements).filter((e) => e.name).map((e) => e.name).join(',') };
      })()`);
      await sleep(400);
      ok(vacio.errores === 3 && capturadas.length === 0 && vacio.campos === 'nombre,email,negocio', 'formulario vacío: 3 errores y no se envía nada; campos ' + vacio.campos, JSON.stringify(vacio));
      await evalJs(`(() => {
        const f = document.querySelector('form[data-lead-source="seccion"]');
        const set = (n, v) => { const i = f.elements[n]; i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); };
        set('nombre', ' Prueba Local '); set('email', 'prueba@ejemplo.com'); set('negocio', 'Negocio de prueba');
        f.querySelector('button[type="submit"]').click();
      })()`);
      await sleep(1800);
      const envio = capturadas.filter((c) => c.metodo === 'POST');
      let cuerpo = {};
      try { cuerpo = JSON.parse(envio[0].cuerpo); } catch (e) { /* se informa abajo */ }
      ok(envio.length === 1 && envio[0].url === webhookChecklist && /application\/json/.test(envio[0].tipo), 'el formulario prepara UN envío POST JSON al mismo webhook de siempre (interceptado aquí: no llegó a n8n)', envio.map((c) => c.metodo + ' ' + c.url.replace(/^https?:\/\/[^/]+/, '')).join(', ') || 'sin envíos');
      ok(Object.keys(cuerpo).join(',') === 'nombre,email,negocio,origen' && cuerpo.nombre === 'Prueba Local' && cuerpo.origen === 'seccion', 'cuerpo con los mismos campos: ' + JSON.stringify(cuerpo));
      const tras = await evalJs('location.pathname + " | " + localStorage.getItem("synaptekai-lead-modal-shown") + " | " + document.title');
      ok(tras.startsWith('/gracias.html | 1'), 'después lleva a /gracias.html y marca el popup como visto (' + tras + ')');
      const descarga = await evalJs('(() => { const a = document.querySelector(\'a[href="/assets/checklist-automatizacion.pdf"]\'); return a ? (a.getAttribute("download") || "sin download") : null; })()');
      ok(!!descarga, 'la página de gracias ofrece el PDF en /assets/checklist-automatizacion.pdf (' + descarga + ')');

      // ---------- Formularios de Contacto y Comentarios: abren WhatsApp con el mensaje armado
      await cargar('/', 1280);
      const formularios = await evalJs(`(() => {
        const abiertas = [];
        window.open = (u) => { abiertas.push(decodeURIComponent(u)); return null; };
        const eventos = [];
        const original = console.info;
        console.info = function (m, p) { if (typeof m === 'string' && m.indexOf('[GA4') === 0) eventos.push(m.replace(/^\\[GA4[^\\]]*\\] /, '') + ' ' + JSON.stringify(p)); else original.apply(console, arguments); };
        const gtagOriginal = window.gtag;
        window.gtag = function () { if (arguments[0] === 'event') eventos.push(arguments[1] + ' ' + JSON.stringify(arguments[2])); if (gtagOriginal) gtagOriginal.apply(this, arguments); };
        const enviar = (id, datos) => {
          const f = document.getElementById(id);
          for (const k of Object.keys(datos)) f.elements[k].value = datos[k];
          f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        };
        enviar('form-contacto', { nombre: 'Ana', negocio: 'Bodega Ana', mensaje: 'Quiero un asistente' });
        enviar('form-comentarios', { fbNombre: '', fbComentario: 'Muy clara la web' });
        return { abiertas, eventos };
      })()`);
      ok(formularios.abiertas[0] === 'https://wa.me/51939584377?text=Hola, soy Ana de Bodega Ana. Quiero un asistente' && formularios.eventos.length === 1 && formularios.eventos[0] === 'contacto_whatsapp {"origen":"contacto","pagina":"/"}',
        'formulario de Contacto: abre WhatsApp con el mensaje armado y registra contacto_whatsapp (origen contacto)', JSON.stringify(formularios));
      ok(formularios.abiertas[1] === 'https://wa.me/51939584377?text=Comentario de un visitante de la web: Muy clara la web',
        'formulario de Comentarios: abre WhatsApp con el comentario (' + (formularios.abiertas[1] || '').split('text=')[1] + ')', JSON.stringify(formularios.abiertas));

      // ---------- Popup
      await prepararAlmacen(false);
      await cargar('/', 1280);
      const estadoPopup = 'getComputedStyle(document.getElementById("lead-modal-overlay")).display';
      const p0 = await evalJs(estadoPopup);
      await evalJs('window.scrollTo({ top: document.documentElement.scrollHeight * 0.45, behavior: "instant" })'); await sleep(500);
      const p45 = await evalJs(estadoPopup);
      await evalJs('window.scrollTo({ top: document.documentElement.scrollHeight * 0.72, behavior: "instant" })'); await sleep(700);
      const p72 = await evalJs(estadoPopup);
      const pTitulo = await evalJs('document.getElementById("lead-modal-title").textContent.trim()');
      const pClave = await evalJs('localStorage.getItem("synaptekai-lead-modal-shown")');
      await tecla('Escape', 'Escape', 27);
      const pEsc = await evalJs(estadoPopup);
      const origenModal = await evalJs('document.querySelector("#lead-modal form").dataset.leadSource');
      ok(p0 === 'none' && p45 === 'none' && p72 === 'flex' && pClave === '1' && pEsc === 'none' && origenModal === 'modal', 'popup "' + pTitulo + '": aparece al 70 % del scroll, guarda la clave y se cierra con Escape', JSON.stringify({ p0, p45, p72, pClave, pEsc, origenModal }));
      await prepararAlmacen(null);
      await cargar('/', 1280);
      await evalJs('window.scrollTo({ top: document.documentElement.scrollHeight * 0.8, behavior: "instant" })'); await sleep(600);
      ok((await evalJs(estadoPopup)) === 'none', 'popup: no vuelve a salir en la siguiente visita');
      const sinPopup = await (async () => { await cargar('/casos', 1280); return evalJs('!document.getElementById("lead-modal-overlay")'); })();
      dato('El popup solo existe en la portada (en /casos: ' + (sinPopup ? 'no está' : 'SÍ está') + ').');
      await prepararAlmacen(true);

      // ---------- Chat en una página interna
      await cargar('/servicios/paginas-web', 1280);
      capturadas = [];
      const chat = await evalJs(`(() => {
        document.getElementById('sk-launcher').click();
        const chips = Array.from(document.querySelectorAll('#sk-chips .sk-chip')).map((c) => c.getAttribute('data-id'));
        document.querySelector('#sk-chips .sk-chip[data-id="web"]').click();
        const enlaces = Array.from(document.querySelectorAll('#sk-log a[href*="wa.me"]')).length;
        document.getElementById('sk-close').click();
        return { chips: chips.join(','), enlaces };
      })()`);
      await sleep(900);
      const envios = capturadas.filter((c) => c.metodo === 'POST');
      let cuerpoChat = {};
      try { cuerpoChat = JSON.parse(envios[0].cuerpo); } catch (e) { /* se informa abajo */ }
      ok(chat.chips === 'asistentes,web,visibilidad,socio,automatizacion,redes,videos,inventario', 'chat: los 8 servicios con sus ids de siempre (' + chat.chips + ')');
      ok(envios.length === 1 && envios[0].url === webhookChat, 'chat: un solo envío por carga, al mismo webhook (interceptado)', envios.length + ' envíos');
      ok(Object.keys(cuerpoChat).join(',') === 'timestamp,sessionId,servicioElegido,mensajes,userAgent,referrer,paginaOrigen' && cuerpoChat.servicioElegido === 'web' && /\/servicios\/paginas-web$/.test(cuerpoChat.paginaOrigen || ''),
        'chat: mismo cuerpo (servicioElegido=' + cuerpoChat.servicioElegido + ', paginaOrigen=' + (cuerpoChat.paginaOrigen || '').replace(BASE, '') + ')', Object.keys(cuerpoChat).join(','));
      const claves = await evalJs('Object.keys(sessionStorage).concat(Object.keys(localStorage)).filter((k) => k.indexOf("synaptekai") === 0).sort().join(", ")');
      dato('Claves de almacenamiento en uso tras abrir el chat: ' + claves);

      // ---------- Videos diferidos
      await cargar('/servicios/complementarios', 1280);
      const deVideo = () => pedidas.filter((u) => /\/assets\/videos\//.test(u)).map((u) => u.split('/').pop());
      const v0 = deVideo();
      const ejemplos = await evalJs('(() => { const d = Array.from(document.querySelectorAll("details[data-ejemplo]")); if (!d.length) return 0; d[0].scrollIntoView({ block: "center", behavior: "instant" }); d[0].querySelector("summary").click(); return d.length; })()');
      await sleep(900);
      const v1 = deVideo();
      // Con gesto de usuario: sin él, el navegador no deja reproducir un video con sonido.
      await cdp.send('Runtime.evaluate', { expression: 'document.querySelector("details[data-ejemplo] [data-video-playbtn]").click()', userGesture: true });
      await sleep(1500);
      const v2 = deVideo();
      ok(ejemplos === 2 && v0.length === 0 && v1.length === 1 && !/\.mp4/.test(v1[0]) && v2.some((u) => /\.mp4/.test(u)),
        '/servicios/complementarios: nada de video al cargar; "Ver ejemplo" pide solo la portada (' + v1.join(', ') + ') y el video baja al pulsar reproducir', JSON.stringify({ ejemplos, v0, v1, v2 }));

      // ---------- Fuentes que llegan tarde: la página no debe saltar
      // Se retienen las fuentes 1,5 s: la página se dibuja con la fuente de respaldo y
      // después llega la definitiva. Con los respaldos ajustados (global.css) el texto
      // ocupa casi el mismo espacio, así que el desplazamiento acumulado (CLS) es mínimo.
      titulo('Navegador: fuentes que llegan tarde (CLS con las fuentes retenidas 1,5 s)');
      const medirCls = () => evalJs(`new Promise((res) => {
        let total = 0; let mayor = '';
        new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (e.hadRecentInput) continue; total += e.value; const n = e.sources && e.sources[0] && e.sources[0].node; if (n && n.nodeType === 1 && e.value >= 0.01 && !mayor) mayor = n.tagName.toLowerCase() + (n.id ? '#' + n.id : ''); } }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => res({ cls: Math.round(total * 1000) / 1000, mayor, fuentes: Array.from(document.fonts).filter((f) => f.status === 'loaded' && !/respaldo/.test(f.family)).length }), 200);
      })`);
      retrasoFuentes = 1500;
      try {
        for (const [ruta, anchos, tope] of [['/', [344, 360, 375, 390, 393, 412, 430, 768, 1280], 0.05], ['/servicios/asistentes-whatsapp', [375, 412, 1280], 0.05], ['/casos', [375, 412, 1280], 0.05], ['/precios', [375, 768, 1280], 0.05]]) {
          const fila = []; const problemas = [];
          for (const w of anchos) {
            await cargar(ruta, w, { espera: 1200 });
            const r = await medirCls();
            fila.push(w + ': ' + r.cls.toFixed(3));
            if (!r.fuentes) problemas.push(w + ' px: las fuentes del sitio no llegaron a cargar');
            if (r.cls > tope) problemas.push(w + ' px: CLS ' + r.cls.toFixed(3) + (r.mayor ? ' (se mueve ' + r.mayor + ')' : ''));
          }
          ok(!problemas.length, ruta + ' → ' + fila.join(' · ') + ' (tope ' + tope + ')', problemas.join(' · '));
        }
      } finally {
        retrasoFuentes = 0;
      }

      // ---------- Peso de la carga inicial
      titulo('Navegador: peso de la carga inicial (sin caché, 1280 px)');
      for (const ruta of ['/', '/servicios/asistentes-whatsapp', '/casos']) {
        await cargar(ruta, 1280, { espera: 2500 });
        const kb = Math.round(bytes / 102.4) / 10;
        const n = pedidas.filter((u) => u.startsWith(BASE)).length;
        if (ruta === '/') ok(kb < 200, ruta + ': ' + kb + ' kB transferidos en ' + n + ' peticiones (meta: menos de 200 kB)');
        else dato(ruta + ': ' + kb + ' kB transferidos en ' + n + ' peticiones');
      }
      if (CAPTURAS) dato('Capturas en ' + path.relative(ROOT, DIR_CAPTURAS));
    }
    cdp.close();
  } finally {
    navegador.kill();
  }
}

(async () => {
  log('# Verificación de ' + BASE);
  if (HACER_HTTP) await verificarServidor();
  if (HACER_NAVEGADOR) await verificarNavegador();
  log('\n**Resultado: ' + (fallos ? fallos + ' fallo(s)' : 'todo en orden') + (avisos ? ', ' + avisos + ' aviso(s)' : '') + '.**');
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'informe.md'), informe.join('\n') + '\n');
  process.exit(fallos ? 1 : 0);
})().catch((e) => { console.error('ERROR: ' + (e && e.stack ? e.stack : e)); process.exit(2); });
