// Datos del negocio: contacto, redes e integraciones. Única fuente para todo el sitio.

export const negocio = {
  nombre: 'SynaptekAI',
  dominio: 'synaptekai.tech',
  url: 'https://synaptekai.tech',
  lema: 'Automatizamos negocios. Impulsamos resultados.',
  /** Título y descripción de la portada (Google, redes, datos estructurados, llms.txt). */
  titulo: 'SynaptekAI | Automatización e IA para Negocios en Perú',
  descripcion: 'Agentes de IA por WhatsApp, páginas web a medida y visibilidad en Google para negocios en todo el Perú. Desde Arequipa, con implementación 100% remota.',
  correo: 'synaptekai92@gmail.com',
  whatsapp: {
    /** Formato wa.me: código de país + número, sin signos. */
    numero: '51939584377',
    visible: '+51 939 584 377',
  },
  redes: {
    facebook: 'https://www.facebook.com/profile.php?id=61592474065002',
    instagram: 'https://www.instagram.com/synaptekai92/',
  },
  ubicacion: {
    ciudad: 'Arequipa',
    pais: 'PE',
    paisNombre: 'Perú',
  },
  /** Google Analytics 4. */
  ga4: 'G-Q01K6J04NG',
  /** Dominios donde se carga GA4. En cualquier otro, los eventos se escriben en consola. */
  dominiosProduccion: ['synaptekai.tech', 'www.synaptekai.tech'],
  /** Dominio del sitio de prueba: nginx lo sirve sin indexar y la página muestra una franja de aviso. */
  dominioPrueba: 'nuevo.synaptekai.tech',
} as const;

// Integraciones con n8n. No cambiar las URLs ni los nombres de los campos que
// envían los formularios y el chat: los workflows dependen de ellos.
export const integraciones = {
  /** Formulario del checklist (sección Recursos y popup). POST JSON: nombre, email, negocio, origen. */
  webhookChecklist: 'https://synaptekai-n8n.zexqbk.easypanel.host/webhook/leads-checklist',
  /** Resumen de la conversación del chat. POST JSON, una vez por carga de página. */
  webhookChat: 'https://synaptekai-n8n.zexqbk.easypanel.host/webhook/chat-widget',
  /** Página a la que redirige el formulario del checklist cuando el envío sale bien. */
  paginaGracias: '/gracias.html',
  /** El workflow del checklist descarga el PDF desde esta ruta: no moverlo. */
  pdfChecklist: '/assets/checklist-automatizacion.pdf',
} as const;

// Claves que guarda el navegador. Se conservan las del sitio anterior para que
// quien ya lo visitó no vuelva a ver el popup ni pierda la posición del chat.
export const almacenamiento = {
  popupMostrado: 'synaptekai-lead-modal-shown',
  chatPosicion: 'synaptekai-chat-launcher-pos',
  chatSaludado: 'synaptekai-chat-greeted-session',
  chatAbierto: 'synaptekai-chat-opened-session',
} as const;
