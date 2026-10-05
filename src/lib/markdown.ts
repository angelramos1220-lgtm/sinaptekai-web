// Versiones Markdown de las páginas y /llms.txt, para asistentes y agentes de IA.
//
// Todo sale de src/data: las mismas frases y los mismos montos que muestra el sitio.
// Aquí solo se les da forma de Markdown. Las pocas palabras propias de estos
// documentos (encabezados de tablas, la nota final) están en
// src/data/textosPaginas.ts, bajo "markdown".
//
// Quién las publica: src/pages/index.md.ts, casos.md.ts, precios.md.ts,
// servicios/[slug].md.ts y llms.txt.ts. nginx sirve la versión Markdown de una página
// cuando la petición llega con "Accept: text/markdown".

import { negocio } from '../data/negocio';
import { textos as t } from '../data/textos';
import { textosPaginas as tp } from '../data/textosPaginas';
import { servicios } from '../data/servicios';
import { pasos } from '../data/pasos';
import { casos, type Caso } from '../data/casos';
import { rubros } from '../data/rubros';
import { paquetes, comparativa } from '../data/paquetes';
import { masServicios } from '../data/masServicios';
import { complementarios } from '../data/complementarios';
import { planesWeb, renuevaWeb } from '../data/planesWeb';
import { paginasServicio, paginaDeServicio, type PaginaServicio } from '../data/paginasServicio';
import { gruposPrecios, notasPrecios } from '../data/paginaPrecios';
import { enlacesLegales } from '../data/sitio';
import { waLink } from './whatsapp';
import { rutaMarkdown } from './rutas';

const m = tp.markdown;

/** URL absoluta de una ruta del sitio. */
const abs = (ruta: string): string => new URL(ruta, negocio.url).href;

const sinDosPuntos = (s: string): string => s.replace(/:$/, '');
const celda = (s: string): string => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
const tabla = (cabeceras: string[], filas: string[][]): string =>
  [`| ${cabeceras.map(celda).join(' | ')} |`, `|${cabeceras.map(() => '---').join('|')}|`, ...filas.map((f) => `| ${f.map(celda).join(' | ')} |`)].join('\n');
const lista = (items: readonly string[]): string => items.map((i) => `- ${i}`).join('\n');
/** Une bloques con una línea en blanco y deja un salto final. */
const documento = (bloques: (string | false | null | undefined)[]): string => bloques.filter(Boolean).join('\n\n') + '\n';

// ---------------------------------------------------------------- piezas comunes

/** Un caso con su texto exacto: problema, solución y, si lo tiene, resultado. */
function casoCompleto(caso: Caso, nivel: '##' | '###'): string {
  const lineas = [`- **${t.casoProblema}** ${caso.problema}`, `- **${t.casoSolucion}** ${caso.solucion}`];
  if (caso.resultado) lineas.push(`- **${t.casoResultado}** ${caso.resultado}`);
  return `${nivel} ${caso.nombre} — ${caso.chips.join(' · ')}\n\n${lineas.join('\n')}`;
}

const tablaPaquetes = (): string =>
  tabla(
    [m.colPaquete, t.pkgInstallWord, m.colMensualidad, m.colIncluye],
    paquetes.map((p) => [p.nombre + (p.insignia ? ` (${p.insignia.toLowerCase()})` : ''), `${t.pkgDesde} ${p.instalacion}`, p.mensual, p.vinetas.join('; ')]),
  );

const tablaComparativa = (): string =>
  tabla([t.compareFeature, ...paquetes.map((p) => p.nombre)], comparativa.map((f) => [f.caracteristica, ...f.incluye.map((si) => (si ? m.si : m.no))]));

const bloquesMasServicios = (nivel: '###'): string[] =>
  masServicios.flatMap((s) => [`${nivel} ${s.nombre} — ${s.precio}`, s.notaPrecio, s.bajada, lista(s.vinetas), s.prueba]).filter(Boolean);

const tablaComplementarios = (): string =>
  tabla([m.colServicio, tp.precioTitulo, m.colIncluye], complementarios.map((c) => [c.nombre, c.precios.join(' — '), c.vinetas.join('; ')]));

const tablaPlanesWeb = (): string =>
  tabla([m.colPlan, `${tp.precioTitulo} (${planesWeb[0].notaPago.toLowerCase()})`, m.colMantenimiento, m.colIncluye],
    planesWeb.map((p) => [p.nombre, p.precio, p.mantenimiento.replace(/^Mantenimiento:\s*/, ''), p.incluye.join('; ')]));

const parrafoRenueva = (): string =>
  `**${renuevaWeb.nombre}** — ${renuevaWeb.precio}, ${renuevaWeb.notaPago.toLowerCase()}. ${renuevaWeb.descripcion} ${renuevaWeb.notaHosting}`;

function contacto(mensajeWhatsApp: string): string {
  return [
    `## ${t.footContact}`,
    '',
    `- WhatsApp: [${negocio.whatsapp.visible}](${waLink(mensajeWhatsApp)})`,
    `- ${m.correo}: ${negocio.correo}`,
    `- ${m.web}: ${abs('/')}`,
    `- ${m.ubicacion}: ${negocio.ubicacion.ciudad}, ${negocio.ubicacion.paisNombre}`,
    `- ${t.footSocialFb}: ${negocio.redes.facebook}`,
    `- ${t.footSocialIg}: ${negocio.redes.instagram}`,
  ].join('\n');
}

/** Nota final de cada documento: de qué página es versión y dónde están las demás. */
const notaAgentes = (ruta: string): string => `---\n\n${m.nota.replace('{url}', abs(ruta))}`;

/** Índice de páginas con versión Markdown (para la portada y llms.txt). */
function indicePaginas(): string {
  return lista([
    `[${m.portada}](${abs('/index.md')}): ${m.portadaDescripcion}`,
    ...paginasServicio.map((p) => `[${p.titulo}](${abs(rutaMarkdown(p.ruta))}): ${p.bajada}`),
    `[${t.navCase}](${abs('/casos.md')}): ${t.casosTitle}.`,
    `[${tp.menuPrecios}](${abs('/precios.md')}): ${tp.precios.titulo}.`,
  ]);
}

// ---------------------------------------------------------------- portada

export function markdownPortada(): string {
  return documento([
    `# ${m.tituloPortada}`,
    `${negocio.descripcion} ${t.heroSub}`,

    `## ${t.svcLabel}`,
    lista(servicios.map((s) => `**[${s.titulo}](${abs(paginaDeServicio[s.id])})** — ${s.descripcion}${s.enUso ? ` ${t.svcUsedIn} ${s.enUso}.` : ''}`)),
    `${t.svcMore} [${t.compLabel}](${abs('/servicios/complementarios')}).`,

    `## ${t.navHow}`,
    pasos.map((p, i) => `${i + 1}. **${p.duracion}** — ${p.titulo}. ${p.texto}`).join('\n'),

    `## ${t.casosLabel}`,
    `${t.casosTitle}. ${m.masDetalle} ${abs('/casos')}`,
    ...casos.map((c) => casoCompleto(c, '###')),

    `## ${t.pkgLabel}`,
    t.pkgSub,
    rubros.join(' · '),
    tablaPaquetes(),
    t.pkgPriceNote,

    `## ${t.addonsLabel}`,
    `${t.addonsTitle}.`,
    ...bloquesMasServicios('###'),

    `## ${t.compLabel} (${t.compTitle.toLowerCase()})`,
    t.compSub,
    tablaComplementarios(),
    complementarios.map((c) => c.nota).filter(Boolean).join(' '),

    `## ${t.webLabel}`,
    t.webSub,
    tablaPlanesWeb(),
    parrafoRenueva(),

    `## ${m.paginas}`,
    indicePaginas(),

    contacto(t.waMsg),
    notaAgentes('/'),
  ]);
}

// ---------------------------------------------------------------- páginas de servicio

/** "Qué incluye" de cada página, con el mismo contenido que sus tarjetas. */
function incluyeServicio(p: PaginaServicio): string[] {
  if (p.slug === 'asistentes-whatsapp') {
    return [
      ...paquetes.flatMap((pk) => [
        `### ${pk.nombre}${pk.insignia ? ` (${pk.insignia.toLowerCase()})` : ''} — ${t.pkgDesde} ${pk.instalacion} · ${pk.mensual}`,
        lista(pk.vinetas),
      ]),
      `### ${tp.comparativaTitulo}`,
      tablaComparativa(),
    ];
  }
  if (p.slug === 'paginas-web') {
    return [
      ...planesWeb.flatMap((plan) => [`### ${plan.nombre} — ${plan.precio}`, `${plan.notaPago} · ${plan.mantenimiento}`, lista(plan.incluye)]),
      `### ${renuevaWeb.nombre} (${renuevaWeb.insignia.toLowerCase()}) — ${renuevaWeb.precio}`,
      `${renuevaWeb.descripcion}`,
      lista(renuevaWeb.vinetas),
    ];
  }
  if (p.slug === 'complementarios') {
    return complementarios.flatMap((c) => [`### ${c.nombre} — ${c.precios.join(' · ')}`, lista(c.vinetas), c.nota]).filter(Boolean);
  }
  return p.incluye.flatMap((bloque) => [bloque.titulo && `### ${bloque.titulo}`, bloque.texto, lista(bloque.vinetas)]).filter(Boolean) as string[];
}

export function markdownServicio(p: PaginaServicio): string {
  const prueba = p.slug === 'visibilidad-google-ia' ? masServicios.find((s) => s.id === 'visibilidad')!.prueba : '';
  const enUso = p.enUso.map((id) => casos.find((c) => c.id === id)!);
  return documento([
    `# ${p.titulo}`,
    p.bajada,

    `## ${tp.incluyeTitulo}`,
    ...incluyeServicio(p),

    `## ${tp.precioTitulo}`,
    lista(p.precios.map((l) => `**${l.concepto}:** ${l.monto}${l.nota ? ` (${l.nota})` : ''}`)),
    prueba,
    ...p.notasPrecio,

    enUso.length > 0 && `## ${tp.enUsoTitulo}`,
    ...enUso.map((c) =>
      [
        `### ${c.nombre} — ${c.chips.join(' · ')}`,
        '',
        c.resultado ? `**${t.casoResultado}** ${c.resultado}` : `**${t.casoSolucion}** ${c.solucion}`,
        '',
        `${sinDosPuntos(m.casoCompleto)}: ${abs(`/casos#${c.id}`)}`,
      ].join('\n'),
    ),

    `## ${tp.faqTitulo}`,
    ...p.faqs.map((f) => `### ${f.pregunta}\n\n${f.respuesta}`),

    contacto(p.mensajeWhatsApp),
    notaAgentes(p.ruta),
  ]);
}

// ---------------------------------------------------------------- casos y precios

export function markdownCasos(): string {
  return documento([
    `# ${t.casosTitle}`,
    ...casos.map((c) => casoCompleto(c, '##')),
    contacto(t.casosWaMsg),
    notaAgentes('/casos'),
  ]);
}

export function markdownPrecios(): string {
  const x = tp.precios;
  return documento([
    `# ${x.titulo}`,
    `${x.bajada} ${m.soles}`,
    ...gruposPrecios.flatMap((g) => [
      `## ${g.titulo}`,
      g.bajada,
      tabla(
        [m.colConcepto, tp.precioTitulo, m.colDetalle],
        g.filas.map((f) => [f.concepto + (f.detalle ? ` (${f.detalle.toLowerCase()})` : ''), f.monto, f.nota ?? '']),
      ),
    ]),
    `## ${x.notasTitulo}`,
    lista(notasPrecios),
    contacto(x.mensajeWhatsApp),
    notaAgentes('/precios'),
  ]);
}

// ---------------------------------------------------------------- llms.txt

export function llmsTxt(): string {
  return documento([
    `# ${negocio.nombre}`,
    `> ${negocio.descripcion}`,
    m.llmsIntro,

    `## ${m.paginas}`,
    indicePaginas(),

    `## ${t.svcLabel}`,
    lista(servicios.map((s) => `${s.titulo}: ${s.descripcion}${s.enUso ? ` ${t.svcUsedIn} ${s.enUso}.` : ''}`)),

    `## ${t.pkgLabel}`,
    t.pkgSub,
    rubros.join(' · '),
    paquetes.map((p) => [`- ${p.nombre}${p.insignia ? ` (${p.insignia.toLowerCase()})` : ''}: ${t.pkgDesde.toLowerCase()} ${p.instalacion} (${t.pkgInstallWord.toLowerCase()}) · ${p.mensual}.`, ...p.vinetas.map((v) => `  - ${v}`)].join('\n')).join('\n'),
    t.pkgPriceNote,

    `## ${t.addonsLabel}`,
    `${t.addonsTitle}.`,
    masServicios.map((s) => [`- ${s.nombre}: ${s.precio}. ${s.notaPrecio}. ${s.bajada}`, ...s.vinetas.map((v) => `  - ${v}`)].join('\n')).join('\n'),

    `## ${t.webLabel}`,
    t.webSub,
    lista([
      ...planesWeb.map((p) => `${p.nombre}: ${p.precio}, ${p.notaPago.toLowerCase()}. ${p.mantenimiento}. ${p.incluye.join('; ')}.`),
      `${renuevaWeb.nombre}: ${renuevaWeb.precio}, ${renuevaWeb.notaPago.toLowerCase()}. ${renuevaWeb.descripcion} ${renuevaWeb.notaHosting}`,
    ]),

    `## ${t.compLabel} (${t.compTitle.toLowerCase()})`,
    t.compSub,
    lista(complementarios.map((c) => `${c.nombre}: ${c.precios.join('; ')}. ${c.vinetas.join('; ')}.${c.nota ? ` ${c.nota}` : ''}`)),

    `## ${t.casosLabel}`,
    ...casos.map((c) => casoCompleto(c, '###')),

    `## ${t.navHow}`,
    lista([m.remoto, ...pasos.map((p) => `${p.duracion}: ${p.titulo}. ${p.texto}`)]),

    `## ${t.footContact}`,
    lista([
      `WhatsApp: ${negocio.whatsapp.visible} (https://wa.me/${negocio.whatsapp.numero})`,
      `${m.correo}: ${negocio.correo}`,
      `${m.ubicacion}: ${negocio.ubicacion.ciudad}, ${negocio.ubicacion.paisNombre}`,
      `${t.footSocialFb}: ${negocio.redes.facebook}`,
      `${t.footSocialIg}: ${negocio.redes.instagram}`,
      ...enlacesLegales.map((e) => `${e.texto}: ${abs(e.href)}`),
    ]),
  ]);
}

/** Respuesta de un endpoint de texto (Markdown o texto plano), siempre en UTF-8. */
export const respuestaTexto = (cuerpo: string, tipo: 'text/markdown' | 'text/plain' | 'application/xml'): Response =>
  new Response(cuerpo, { headers: { 'Content-Type': `${tipo}; charset=utf-8` } });
