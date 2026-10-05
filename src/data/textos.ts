// Textos de interfaz de la portada: títulos de sección, botones, formularios y mensajes.
// Los textos de cada servicio, paquete, plan y caso viven en su propio archivo de src/data.
// Las claves conservan los nombres del diccionario T del sitio anterior.

export const textos = {
  // Menú y cabecera
  navHome: 'Inicio',
  navSvc: 'Servicios',
  navHow: 'Cómo funciona',
  navCase: 'Casos de éxito',
  navWeb: 'Diseño Web',
  navPkg: 'Paquetes',
  navResources: 'Recursos',
  navContact: 'Contacto',
  waHeader: 'Hablar por WhatsApp',
  navMenuOpen: 'Abrir menú',
  navMenuClose: 'Cerrar menú',

  // Hero
  badge: 'Agentes de IA para negocios',
  heroT1: 'Vende más',
  heroT2: 'sin contratar a nadie más',
  heroSub: 'Agentes virtuales que atienden, agendan y venden por WhatsApp y Telegram, las 24 horas — como un empleado que nunca duerme.',
  ctaDemo: 'Solicitar una demo',
  ctaWa: 'Escríbenos por WhatsApp',
  trust1: 'Atención 24/7',
  trust2: 'Implementación a medida',
  trust3: 'Integrado a tus herramientas',

  // Servicios
  svcLabel: 'Servicios',
  svcTitle: 'Tecnología que trabaja mientras tú te enfocas en tu negocio',
  svcUsedIn: 'En uso en:',
  svcMore: 'También tenemos, bajo pedido: redes sociales con IA, videos con avatar de IA e inventario con boletas electrónicas.',
  svcMoreLink: 'Ver servicios complementarios →',

  // Cómo funciona (los pasos están en src/data/pasos.ts)
  howLabel: 'Cómo funciona',
  howTitle: 'De cero a negocio automatizado en cuatro pasos',

  // Casos de éxito
  casosLabel: 'Casos de éxito',
  casosTitle: 'Negocios reales que ya trabajan con nosotros',
  casoProblema: 'Problema:',
  casoSolucion: 'Solución:',
  casoResultado: 'Resultado:',
  casosCta: '¿Quieres ser el próximo caso de éxito?',
  casosWaMsg: 'Hola, quiero ser el próximo caso de éxito de SynaptekAI',

  // Diseño Web
  webLabel: 'Diseño de Páginas Web',
  webTitle: 'Tu página web, lista para vender',
  webSub: 'Sitios a medida para tu negocio, desde una landing page simple hasta una tienda online completa.',
  webCtaText: '¿Qué tipo de página necesita tu negocio? Escríbenos',
  webCtaBtn: 'Escríbenos por WhatsApp',
  webWaMsg: 'Hola, quiero cotizar el diseño de una página web para mi negocio',

  // Paquetes
  pkgLabel: 'Paquetes',
  pkgTitle: 'Paquetes para hacer crecer tu negocio',
  pkgSub: 'Planes listos para instalar, con instalación desde un monto base y cuota mensual fija — funcionan para cualquier tipo de negocio.',
  pkgDesde: 'Desde',
  pkgInstallWord: 'Instalación',
  pkgCtaBtn: 'Quiero este paquete',
  pkgPriceNote: 'El monto de instalación varía según la complejidad del proyecto. Si tu negocio necesita más de un paquete, coordinamos un precio personalizado.',
  compareShow: 'Ver comparativa completa',
  compareHide: 'Ocultar comparativa',
  compareFeature: 'Característica',
  addonsLabel: 'Más servicios',
  addonsTitle: 'Súmalos a tu paquete o contrátalos por separado',
  masCta: 'Quiero este servicio',
  compLabel: 'Servicios complementarios',
  compTitle: 'Bajo pedido',
  compSub: 'Herramientas que ya tenemos listas y activamos cuando tu negocio las necesita.',
  compBadge: 'Bajo pedido',
  compCta: 'Consultar',
  compVerEjemplo: 'Ver ejemplo',

  // Recursos (checklist) y popup
  resourcesLabel: 'Recurso gratuito',
  resourcesTitle: 'Checklist: 5 señales de que tu negocio necesita automatización',
  resourcesDesc: 'Descubre en minutos si tu negocio ya está listo para automatizar. Recibe el PDF gratis en tu correo y una idea de automatización aplicable cada semana.',
  resourcesBullet1: 'Identifica qué tareas repetitivas te están quitando más tiempo',
  resourcesBullet2: 'Reconoce las señales claras de que ya es momento de automatizar',
  resourcesBullet3: 'Aplícalo a tu negocio en menos de 10 minutos',
  resourcesFormNote: 'Sin spam. Cancela cuando quieras.',
  resourcesCta: 'Quiero el checklist gratis',
  modalEyebrow: 'Recurso gratuito',
  modalTitle: 'Antes de irte, llévate esto',
  modalDesc: 'Checklist: 5 señales de que tu negocio necesita automatización. Recibe una idea de automatización aplicable cada semana.',
  modalCta: 'Enviarme el checklist',
  modalClose: 'Cerrar',
  leadNombre: 'Nombre',
  leadEmail: 'Correo',
  leadNegocio: 'Nombre del negocio',
  leadSending: 'Enviando…',
  leadErrorGeneric: 'No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.',
  leadErrorNombre: 'Escribe tu nombre para saber cómo dirigirnos a ti.',
  leadErrorEmailVacio: 'Escribe tu correo para poder enviarte el PDF.',
  leadErrorEmailFormato: 'Ese correo no parece válido. Revisa que tenga el formato nombre@dominio.com.',
  leadErrorNegocio: 'Cuéntanos el nombre de tu negocio para personalizar el envío.',

  // Contacto
  ctaTitle: '¿Listo para automatizar tu negocio?',
  ctaSub: 'Agenda una consulta gratuita y te mostramos cómo un agente de IA puede trabajar para ti desde la primera semana.',
  ctaWaBig: 'Escríbenos por WhatsApp',
  orEmail: 'o escríbenos a',
  formName: 'Nombre',
  formBiz: 'Negocio',
  formMsg: '¿Qué te gustaría automatizar?',
  formSend: 'Enviar por WhatsApp',
  /** Mensaje genérico de los botones de WhatsApp (cabecera, hero, contacto, footer). */
  waMsg: 'Hola, quiero saber más sobre los servicios de SynaptekAI',
  /** Formulario de contacto: lo que se envía si el visitante no escribe mensaje. */
  formMsgPorDefecto: 'Quiero saber más sobre los servicios de SynaptekAI.',

  // Comentarios
  feedbackTitle: '¿Tienes algún comentario o sugerencia?',
  feedbackSub: 'Nos encantaría escucharte. Cuéntanos qué piensas o qué te gustaría ver en SynaptekAI.',
  feedbackName: 'Nombre (opcional)',
  feedbackMsg: 'Tu comentario',
  feedbackSend: 'Enviar comentario',
  feedbackAnonimo: 'un visitante de la web',

  // Footer
  footLinks: 'Enlaces',
  footContact: 'Contacto',
  footSocial: 'Redes sociales',
  footSocialWa: 'WhatsApp:',
  footSocialFb: 'Facebook',
  footSocialIg: 'Instagram',
  rights: '© 2026 SynaptekAI. Todos los derechos reservados.',
  footPrivacidad: 'Política de Privacidad',
  footTerminos: 'Términos del Servicio',
} as const;
