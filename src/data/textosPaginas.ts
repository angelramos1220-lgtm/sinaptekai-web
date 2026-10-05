// Textos de las páginas internas (todo lo que no es la portada).
// Los que no existían en el sitio anterior están listados en docs/textos-nuevos.md.

import { textos } from './textos';

export const textosPaginas = {
  // Menú, migas y footer
  menuPrecios: 'Precios',
  migasInicio: 'Inicio',
  migasEtiqueta: 'Estás en',
  menuPrincipal: 'Menú principal',
  pieServicios: textos.svcLabel,
  pieSitio: textos.footLinks,
  pieEtiqueta: 'Pie de página',

  // Portada
  verMas: 'Ver más →',
  /** Solo para lectores de pantalla: "Ver más sobre {servicio}". */
  verMasSobre: 'sobre',

  // Plantilla de página de servicio
  incluyeTitulo: 'Qué incluye',
  precioTitulo: 'Precio',
  enUsoTitulo: 'En uso en',
  enUsoEnlace: 'Ver el caso completo →',
  faqTitulo: 'Preguntas frecuentes',
  /** Botón de WhatsApp de la cabecera y del cierre de cada página. */
  botonWhatsApp: textos.ctaWa,
  llamadoTitulo: textos.ctaTitle,
  llamadoBajada: textos.ctaSub,
  llamadoCorreo: textos.orEmail,

  // Secciones propias de algunas páginas de servicio
  paquetesTitulo: textos.pkgTitle,
  comparativaTitulo: 'Comparativa de los paquetes',
  planesTitulo: textos.webTitle,
  complementariosTitulo: 'Los tres servicios',

  // /casos
  casos: {
    seoTitulo: 'Casos de éxito | SynaptekAI',
    seoDescripcion: 'Negocios reales que ya trabajan con nosotros: Due Hotel, Aquamatic Lavandería y Oral Dent.',
    etiqueta: textos.casosLabel,
    titulo: textos.casosTitle,
    origen: 'casos',
  },

  // /precios
  precios: {
    seoTitulo: 'Precios | SynaptekAI',
    seoDescripcion: 'Todos los precios de SynaptekAI en soles: paquetes, más servicios, diseño de páginas web y servicios complementarios.',
    etiqueta: 'Precios',
    titulo: 'Todos los precios, en una sola página',
    bajada: textos.pkgSub,
    paquetes: textos.pkgLabel,
    masServicios: textos.addonsLabel,
    masServiciosBajada: textos.addonsTitle,
    web: textos.webLabel,
    webBajada: textos.webSub,
    complementarios: textos.compLabel,
    complementariosBajada: textos.compSub,
    notasTitulo: 'Para tener en cuenta',
    mensajeWhatsApp: 'Hola, quiero una cotización para mi negocio',
    origen: 'precios',
  },

  // Página de gracias (mismos textos que la anterior)
  gracias: {
    seoTitulo: '¡Gracias! Tu checklist está en camino - SynaptekAI',
    seoDescripcion: 'Tu checklist de automatización está en camino. También puedes descargarlo ahora.',
    titulo: '¡Listo! Ya tienes tu checklist en camino',
    descargar: 'Descargar el checklist ahora',
    nombreArchivo: 'Checklist-Automatizacion-SynaptekAI.pdf',
    tambienCorreo: 'También te lo enviamos por correo.',
    revisaCorreo: 'Revisa tu correo en los próximos minutos (y la carpeta de spam, por si acaso). Ahí te dejé el PDF con las 5 señales de que tu negocio necesita automatización.',
    avanzar: 'Si quieres avanzar más rápido, escríbeme directo por WhatsApp y vemos juntos por dónde empezar.',
    botonWhatsApp: textos.ctaWa,
    mensajeWhatsApp: 'Hola, acabo de descargar el checklist de automatización',
    volver: 'Volver al inicio',
    origen: 'gracias-checklist',
  },

  // 404
  noEncontrada: {
    seoTitulo: 'Página no encontrada | SynaptekAI',
    seoDescripcion: 'La página que buscas no existe o cambió de dirección.',
    etiqueta: 'Error 404',
    titulo: 'Página no encontrada',
    texto: 'La dirección que buscas no existe o cambió de lugar. Estos enlaces te pueden servir:',
  },

  // Páginas legales (mismos títulos y descripciones que las páginas anteriores)
  legal: {
    privacidadSeo: 'Política de Privacidad - SynaptekAI',
    privacidadDescripcion: 'Política de privacidad de SynaptekAI: qué datos de Google accedemos, para qué los usamos y cómo cumplimos la Política de Uso Limitado de Google.',
    terminosSeo: 'Términos del Servicio - SynaptekAI',
    terminosDescripcion: 'Términos del Servicio de SynaptekAI: qué ofrecemos, el modelo de instalación más suscripción, responsabilidades del cliente y condiciones de uso.',
  },

  /** Franja que solo aparece en el dominio de prueba (nuevo.synaptekai.tech). */
  franjaPrueba: 'Sitio de prueba',
} as const;
