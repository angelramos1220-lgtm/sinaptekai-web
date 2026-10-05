// Páginas de servicio (/servicios/…). Una entrada por página.
//
// Regla: aquí no se inventa nada. Los títulos, bajadas y viñetas salen de los datos
// que ya usa la portada; las preguntas frecuentes solo repiten hechos que el sitio
// ya afirma. Todo texto nuevo de este archivo está listado en docs/textos-nuevos.md.
//
// Para agregar un servicio: una entrada nueva aquí (con su slug) y, si lleva
// contenido propio, su caso en src/pages/servicios/[slug].astro.

import { precios } from './precios';
import { servicioPorId } from './servicios';
import { masServicios } from './masServicios';
import { complementarios } from './complementarios';
import { paquetes } from './paquetes';
import { planesWeb, renuevaWeb } from './planesWeb';
import { pasos } from './pasos';
import { textos } from './textos';
import { serviciosChat, textosChat } from './chat';
import type { CasoId } from './casos';
import { soles, porMes, rangoSoles, rangoCorto } from '../lib/formato';

export type PaginaServicioSlug =
  | 'asistentes-whatsapp'
  | 'paginas-web'
  | 'visibilidad-google-ia'
  | 'socio-tecnologico'
  | 'automatizacion'
  | 'complementarios';

export interface BloqueIncluye {
  titulo?: string;
  texto?: string;
  vinetas: readonly string[];
}

export interface LineaPrecio {
  concepto: string;
  monto: string;
  nota?: string;
}

export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

/** Oferta para los datos estructurados (schema.org/Offer), en soles. */
export interface Oferta {
  nombre: string;
  descripcion: string;
  precio: number;
  /** Texto de la unidad: "instalación", "al mes", "pago único". */
  unidad: string;
}

export interface PaginaServicio {
  slug: PaginaServicioSlug;
  ruta: string;
  /** Texto en el menú y en el footer. */
  menu: string;
  /** Rótulo pequeño sobre el título. */
  etiqueta: string;
  titulo: string;
  bajada: string;
  seo: { titulo: string; descripcion: string };
  /** Valor del parámetro "origen" del evento contacto_whatsapp en esta página. */
  origen: string;
  mensajeWhatsApp: string;
  /** "Qué incluye". Las páginas con tarjetas propias (paquetes, planes) lo dejan vacío. */
  incluye: BloqueIncluye[];
  precios: LineaPrecio[];
  notasPrecio: string[];
  /** Casos que se muestran en "En uso en". Vacío = la sección no aparece. */
  enUso: CasoId[];
  faqs: PreguntaFrecuente[];
  ofertas: Oferta[];
}

const p = precios;
const visibilidad = masServicios.find((m) => m.id === 'visibilidad')!;
const socio = masServicios.find((m) => m.id === 'socio-tecnologico')!;
const [asistenteVirtual, crecimiento360] = paquetes;
const [redes, videos, inventario] = complementarios;
const chat = (id: string) => serviciosChat.find((s) => s.id === id)!;
const mensaje = (nombre: string) => textosChat.mensajeServicio + nombre;

// Hechos que se repiten en varias páginas (todos ya están en la portada).
const REMOTO: PreguntaFrecuente = {
  pregunta: '¿Trabajan con negocios fuera de Arequipa?',
  respuesta: 'Sí. La implementación es 100% remota, para negocios en todo el Perú.',
};

export const paginasServicio: PaginaServicio[] = [
  // ------------------------------------------------------------------ Asistentes
  {
    slug: 'asistentes-whatsapp',
    ruta: '/servicios/asistentes-whatsapp',
    menu: chat('asistentes').nombre,
    etiqueta: textos.svcLabel,
    titulo: servicioPorId('asistentes').titulo,
    bajada: servicioPorId('asistentes').descripcion,
    seo: {
      titulo: `${servicioPorId('asistentes').titulo} | SynaptekAI`,
      descripcion: `${servicioPorId('asistentes').descripcion} Instalación desde ${soles(p.paquetes.asistenteVirtual.instalacion)} · ${porMes(p.paquetes.asistenteVirtual.mensual)}.`,
    },
    origen: 'servicio-asistentes',
    mensajeWhatsApp: mensaje(chat('asistentes').nombre),
    incluye: [],
    precios: [
      { concepto: asistenteVirtual.nombre, monto: `${textos.pkgDesde} ${asistenteVirtual.instalacion}`, nota: `${textos.pkgInstallWord} · ${asistenteVirtual.mensual}` },
      { concepto: crecimiento360.nombre, monto: `${textos.pkgDesde} ${crecimiento360.instalacion}`, nota: `${textos.pkgInstallWord} · ${crecimiento360.mensual}` },
    ],
    notasPrecio: [textos.pkgPriceNote],
    enUso: ['due-hotel', 'oral-dent'],
    faqs: [
      {
        pregunta: '¿Puedo probarlo antes de decidir?',
        respuesta: 'Sí. La primera semana es de prueba: si no te sirve, no seguimos.',
      },
      {
        pregunta: '¿Qué pasa si quiero responderle yo a un cliente?',
        respuesta: 'Tu equipo toma el control cuando quiera: si respondes a mano, el asistente se pausa.',
      },
      {
        pregunta: '¿Dónde quedan las citas, las reservas y los pedidos?',
        respuesta: 'Las citas se agendan en tu Google Calendar. Las reservas y los pedidos quedan registrados en tu Google Sheet, y recibes un aviso inmediato de cada solicitud nueva por WhatsApp o Telegram.',
      },
      {
        pregunta: '¿El precio es fijo?',
        respuesta: `La cuota mensual es fija: ${asistenteVirtual.mensual} en Asistente Virtual y ${crecimiento360.mensual} en Crecimiento 360°. El monto de instalación varía según la complejidad del proyecto: va desde ${asistenteVirtual.instalacion} y desde ${crecimiento360.instalacion}.`,
      },
      REMOTO,
    ],
    ofertas: [
      { nombre: asistenteVirtual.nombre, descripcion: asistenteVirtual.vinetas[0], precio: p.paquetes.asistenteVirtual.instalacion, unidad: 'instalación, desde' },
      { nombre: `${asistenteVirtual.nombre}: cuota mensual`, descripcion: asistenteVirtual.vinetas[0], precio: p.paquetes.asistenteVirtual.mensual, unidad: 'al mes' },
      { nombre: crecimiento360.nombre, descripcion: crecimiento360.vinetas.slice(1).join('. '), precio: p.paquetes.crecimiento360.instalacion, unidad: 'instalación, desde' },
      { nombre: `${crecimiento360.nombre}: cuota mensual`, descripcion: crecimiento360.vinetas.slice(1).join('. '), precio: p.paquetes.crecimiento360.mensual, unidad: 'al mes' },
    ],
  },

  // ------------------------------------------------------------------ Páginas web
  {
    slug: 'paginas-web',
    ruta: '/servicios/paginas-web',
    menu: servicioPorId('web').titulo,
    etiqueta: textos.webLabel,
    titulo: servicioPorId('web').titulo,
    bajada: servicioPorId('web').descripcion,
    seo: {
      titulo: `${servicioPorId('web').titulo} | SynaptekAI`,
      descripcion: `${servicioPorId('web').descripcion} Desde ${soles(p.web.landing.min)}, pago único.`,
    },
    origen: 'servicio-web',
    mensajeWhatsApp: textos.webWaMsg,
    incluye: [],
    precios: [
      ...planesWeb.map((plan) => ({ concepto: plan.nombre, monto: plan.precio, nota: `${plan.notaPago} · ${plan.mantenimiento}` })),
      { concepto: renuevaWeb.nombre, monto: renuevaWeb.precio, nota: renuevaWeb.notaPago },
    ],
    notasPrecio: [renuevaWeb.notaHosting],
    enUso: ['aquamatic'],
    faqs: [
      {
        pregunta: '¿A nombre de quién quedan el dominio y el hosting?',
        respuesta: 'A nombre de tu negocio. Nosotros los configuramos y gestionamos, y se pagan directo al proveedor: son tuyos de verdad, aunque mañana cambies de proveedor.',
      },
      {
        pregunta: '¿Es un pago único o mensual?',
        respuesta: `El diseño es un pago único. El mantenimiento es mensual y depende del plan: desde ${rangoCorto(p.web.landing.mantenimiento.min, p.web.landing.mantenimiento.max)}/mes en una landing page hasta ${rangoCorto(p.web.tienda.mantenimiento.min, p.web.tienda.mantenimiento.max)}/mes en una tienda online.`,
      },
      {
        pregunta: 'Ya tengo una página web. ¿Pueden renovarla?',
        respuesta: `Sí. La rediseñamos completa con estética moderna y migramos todo tu contenido actual (textos, fotos, contacto). Es un pago único de ${rangoSoles(p.web.renueva.min, p.web.renueva.max)}.`,
      },
      {
        pregunta: '¿La web queda preparada para Google?',
        respuesta: 'Sí. Son webs rápidas y a medida, preparadas para Google y para asistentes de IA, con WhatsApp directo y medición de cada contacto.',
      },
      REMOTO,
    ],
    ofertas: [
      ...planesWeb.map((plan, i) => ({
        nombre: plan.nombre,
        descripcion: plan.incluye.join('. '),
        precio: [p.web.landing.min, p.web.corporativo.min, p.web.funcionalidades.min, p.web.tienda.min][i],
        unidad: 'pago único, desde',
      })),
      { nombre: renuevaWeb.nombre, descripcion: renuevaWeb.vinetas.join('. '), precio: p.web.renueva.min, unidad: 'pago único, desde' },
    ],
  },

  // ------------------------------------------------------------------ Visibilidad
  {
    slug: 'visibilidad-google-ia',
    ruta: '/servicios/visibilidad-google-ia',
    menu: visibilidad.nombre,
    etiqueta: textos.addonsLabel,
    titulo: visibilidad.nombre,
    bajada: visibilidad.bajada,
    seo: {
      titulo: `${visibilidad.nombre} | SynaptekAI`,
      descripcion: `${servicioPorId('visibilidad').descripcion} Instalación desde ${soles(p.masServicios.visibilidad.instalacion)} · ${porMes(p.masServicios.visibilidad.mensual)}.`,
    },
    origen: 'servicio-visibilidad',
    mensajeWhatsApp: visibilidad.mensajeWhatsApp,
    incluye: [{ vinetas: visibilidad.vinetas }],
    precios: [{ concepto: visibilidad.nombre, monto: visibilidad.precio, nota: visibilidad.notaPrecio }],
    notasPrecio: ['Súmalo a tu paquete o contrátalo por separado.'],
    enUso: ['aquamatic'],
    faqs: [
      {
        pregunta: '¿Cómo consiguen más reseñas?',
        respuesta: 'Con tarjetas QR/NFC en tu mostrador. Son reseñas reales y sin premios, como exige Google. Además, respondemos tus reseñas por ti.',
      },
      {
        pregunta: '¿La publicidad en Google está incluida?',
        respuesta: 'Google Ads con medición de conversiones es opcional. La pauta la pagas directo a Google.',
      },
      {
        pregunta: '¿Cómo sé si está funcionando?',
        respuesta: 'Medimos cada contacto por WhatsApp con Google Analytics y Search Console, y recibes un reporte mensual con datos reales.',
      },
      {
        pregunta: '¿Tengo que contratar un paquete para tener este servicio?',
        respuesta: `No. Puedes sumarlo a tu paquete o contratarlo por separado. La instalación va desde ${soles(p.masServicios.visibilidad.instalacion)} y la cuota es de ${porMes(p.masServicios.visibilidad.mensual)}.`,
      },
      REMOTO,
    ],
    ofertas: [
      { nombre: visibilidad.nombre, descripcion: visibilidad.bajada, precio: p.masServicios.visibilidad.instalacion, unidad: 'instalación, desde' },
      { nombre: `${visibilidad.nombre}: cuota mensual`, descripcion: visibilidad.bajada, precio: p.masServicios.visibilidad.mensual, unidad: 'al mes' },
    ],
  },

  // ------------------------------------------------------------------ Socio Tecnológico
  {
    slug: 'socio-tecnologico',
    ruta: '/servicios/socio-tecnologico',
    menu: socio.nombre,
    etiqueta: textos.addonsLabel,
    titulo: socio.nombre,
    bajada: socio.bajada,
    seo: {
      titulo: `${socio.nombre} | SynaptekAI`,
      descripcion: `${servicioPorId('socio').descripcion} Desde ${porMes(p.masServicios.socioTecnologico.mensual)}.`,
    },
    origen: 'servicio-socio',
    mensajeWhatsApp: socio.mensajeWhatsApp,
    incluye: [{ vinetas: socio.vinetas }],
    precios: [
      { concepto: socio.nombre, monto: socio.precio },
      { concepto: 'Rescate y migración de web y dominio', monto: `Desde ${soles(p.masServicios.socioTecnologico.rescateMigracion)}`, nota: 'Pago único' },
    ],
    notasPrecio: ['Súmalo a tu paquete o contrátalo por separado.'],
    enUso: ['aquamatic'],
    faqs: [
      {
        pregunta: '¿A nombre de quién quedan mis cuentas?',
        respuesta: 'Dominio, hosting y cuentas quedan a nombre de tu negocio, nunca del proveedor.',
      },
      {
        pregunta: 'Mi web o mi dominio están en manos de otro proveedor. ¿Pueden recuperarlos?',
        respuesta: `Sí. Rescatamos tu web y tu dominio si están en manos de terceros, y hablamos por ti con tu hosting y con tus proveedores anteriores. El rescate y la migración de web y dominio van desde ${soles(p.masServicios.socioTecnologico.rescateMigracion)}, pago único.`,
      },
      {
        pregunta: '¿Tengo que saber de tecnología?',
        respuesta: 'No. Nos encargamos de la parte técnica para que tú no tengas que entenderla, y te asesoramos antes de contratar cualquier sistema o software.',
      },
      REMOTO,
    ],
    ofertas: [
      { nombre: socio.nombre, descripcion: socio.bajada, precio: p.masServicios.socioTecnologico.mensual, unidad: 'al mes, desde' },
      { nombre: 'Rescate y migración de web y dominio', descripcion: socio.vinetas[2], precio: p.masServicios.socioTecnologico.rescateMigracion, unidad: 'pago único, desde' },
    ],
  },

  // ------------------------------------------------------------------ Automatización
  {
    slug: 'automatizacion',
    ruta: '/servicios/automatizacion',
    menu: servicioPorId('automatizacion').titulo,
    etiqueta: textos.svcLabel,
    titulo: servicioPorId('automatizacion').titulo,
    bajada: servicioPorId('automatizacion').descripcion,
    seo: {
      titulo: `${servicioPorId('automatizacion').titulo} y ${servicioPorId('medida').titulo} | SynaptekAI`,
      descripcion: `${servicioPorId('automatizacion').descripcion} ${servicioPorId('medida').descripcion}`,
    },
    origen: 'servicio-automatizacion',
    mensajeWhatsApp: mensaje(servicioPorId('automatizacion').titulo),
    // Todas las viñetas son frases que ya están en la portada (chat y "Cómo funciona").
    incluye: [
      {
        titulo: servicioPorId('automatizacion').titulo,
        texto: chat('automatizacion').desc,
        vinetas: [pasos[2].texto],
      },
      {
        titulo: servicioPorId('medida').titulo,
        texto: servicioPorId('medida').descripcion,
        vinetas: [pasos[0].texto, pasos[1].texto],
      },
    ],
    precios: [{ concepto: servicioPorId('automatizacion').titulo, monto: 'A cotizar', nota: 'Depende del proceso: cuéntanos cuál y lo cotizamos.' }],
    notasPrecio: [],
    enUso: ['due-hotel', 'oral-dent'],
    faqs: [
      {
        pregunta: '¿Qué herramientas conectan?',
        respuesta: pasos[2].texto,
      },
      {
        pregunta: '¿Cuánto cuesta?',
        respuesta: 'Depende del proceso: cuéntanos cuál y lo cotizamos.',
      },
      {
        pregunta: '¿Y si mi negocio necesita algo distinto?',
        respuesta: servicioPorId('medida').descripcion,
      },
      REMOTO,
    ],
    ofertas: [],
  },

  // ------------------------------------------------------------------ Complementarios
  {
    slug: 'complementarios',
    ruta: '/servicios/complementarios',
    menu: textos.compLabel,
    etiqueta: textos.compTitle,
    titulo: textos.compLabel,
    bajada: textos.compSub,
    seo: {
      titulo: `${textos.compLabel} bajo pedido | SynaptekAI`,
      descripcion: `${redes.nombre}, ${videos.nombre} e ${inventario.nombre}: herramientas que ya tenemos listas y activamos cuando tu negocio las necesita.`,
    },
    origen: 'servicio-complementarios',
    mensajeWhatsApp: 'Hola, quiero información de los servicios complementarios',
    incluye: [],
    precios: complementarios.map((c) => ({ concepto: c.nombre, monto: c.precios[0], nota: c.precios[1] })),
    notasPrecio: [inventario.nota],
    enUso: [],
    faqs: [
      {
        pregunta: '¿Qué significa "bajo pedido"?',
        respuesta: 'Son herramientas que ya tenemos listas y activamos cuando tu negocio las necesita.',
      },
      {
        pregunta: '¿Las publicaciones salen sin que yo las vea?',
        respuesta: 'No. Tú apruebas antes de publicar, desde Telegram.',
      },
      {
        pregunta: '¿Cuántos videos incluye el plan?',
        respuesta: `El plan Full incluye ${p.complementarios.videos.videosAlMesFull} videos al mes, con guion generado por IA. Cada video adicional cuesta ${rangoCorto(p.complementarios.videos.videoAdicional.min, p.complementarios.videos.videoAdicional.max)}.`,
      },
      {
        pregunta: '¿Qué necesito para emitir boletas electrónicas?',
        respuesta: `La emisión válida ante SUNAT requiere el certificado digital del negocio; te ayudamos con el trámite. El servicio incluye ${p.complementarios.inventario.boletasIncluidasAlMes} boletas al mes y cada boleta adicional cuesta ${soles(p.complementarios.inventario.boletaAdicional)}.`,
      },
    ],
    ofertas: [
      { nombre: redes.nombre, descripcion: redes.vinetas.join('. '), precio: p.complementarios.redes.instalacion, unidad: 'instalación, desde' },
      { nombre: `${videos.nombre}: plan Básico`, descripcion: videos.vinetas[0], precio: p.complementarios.videos.basico.instalacion, unidad: 'instalación' },
      { nombre: `${videos.nombre}: plan Full`, descripcion: videos.vinetas[1], precio: p.complementarios.videos.full.instalacion, unidad: 'instalación' },
      { nombre: `${inventario.nombre}: Tienda`, descripcion: inventario.vinetas.slice(0, 2).join('. '), precio: p.complementarios.inventario.tienda.instalacion, unidad: 'instalación' },
      { nombre: `${inventario.nombre}: Supermercado`, descripcion: inventario.vinetas.slice(0, 2).join('. '), precio: p.complementarios.inventario.supermercado.instalacion, unidad: 'instalación' },
    ],
  },
];

export function paginaServicio(slug: PaginaServicioSlug): PaginaServicio {
  const pagina = paginasServicio.find((x) => x.slug === slug);
  if (!pagina) throw new Error(`No existe la página de servicio "${slug}"`);
  return pagina;
}

// A qué página lleva el "Ver más →" de cada tarjeta de servicio de la portada.
export const paginaDeServicio = {
  asistentes: '/servicios/asistentes-whatsapp',
  web: '/servicios/paginas-web',
  visibilidad: '/servicios/visibilidad-google-ia',
  socio: '/servicios/socio-tecnologico',
  automatizacion: '/servicios/automatizacion',
  medida: '/servicios/automatizacion',
} as const;
