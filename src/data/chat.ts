// Base de conocimiento del chat del sitio.
//
// NO cambiar los "id": viajan al webhook del chat en el campo servicioElegido.
// Primero van los servicios principales; los que llevan bajoPedido son los
// complementarios (chip punteado y aviso en la respuesta).

import { precios } from './precios';
import { servicioPorId } from './servicios';
import { soles, porMes } from '../lib/formato';

export interface ServicioChat {
  id: 'asistentes' | 'web' | 'visibilidad' | 'socio' | 'automatizacion' | 'redes' | 'videos' | 'inventario';
  nombre: string;
  desc: string;
  precio: string;
  /** Palabras clave para el texto libre. Gana la más larga que coincida. */
  kws: string[];
  bajoPedido?: boolean;
}

const desde = (pr: { instalacion: number; mensual: number }) =>
  `Desde ${soles(pr.instalacion)} instalación + ${porMes(pr.mensual)}`;

export const serviciosChat: ServicioChat[] = [
  {
    id: 'asistentes',
    nombre: 'Asistentes Virtuales',
    desc: 'Chatbots y agentes de IA que responden y agendan por WhatsApp, las 24 horas.',
    precio: desde(precios.paquetes.asistenteVirtual),
    kws: ['asistente', 'chatbot', 'bot', 'agente virtual', 'ia'],
  },
  {
    id: 'web',
    nombre: servicioPorId('web').titulo,
    desc: servicioPorId('web').descripcion,
    precio: `Landing page desde ${soles(precios.web.landing.min)}, pago único`,
    kws: ['pagina web', 'página web', 'paginas web', 'páginas web', 'sitio', 'landing', 'tienda online', 'web'],
  },
  {
    id: 'visibilidad',
    nombre: servicioPorId('visibilidad').titulo,
    desc: servicioPorId('visibilidad').descripcion,
    precio: desde(precios.masServicios.visibilidad),
    kws: ['visibilidad', 'google', 'maps', 'reseña', 'resena', 'buscador', 'seo', 'chatgpt', 'gemini'],
  },
  {
    id: 'socio',
    nombre: servicioPorId('socio').titulo,
    desc: servicioPorId('socio').descripcion,
    precio: `Desde ${porMes(precios.masServicios.socioTecnologico.mensual)}. Rescate y migración de web y dominio: desde ${soles(precios.masServicios.socioTecnologico.rescateMigracion)}, pago único`,
    kws: ['socio', 'dominio', 'hosting', 'migra', 'rescat', 'proveedor', 'soporte', 'mantenimiento'],
  },
  {
    id: 'automatizacion',
    nombre: servicioPorId('automatizacion').titulo,
    desc: 'Conectamos tus herramientas para que las tareas repetitivas —reportes, seguimientos, alertas— corran solas.',
    precio: 'Depende del proceso — cuéntame cuál y lo cotizamos',
    kws: ['automatiz', 'proceso', 'flujo', 'n8n', 'integra'],
  },
  {
    id: 'redes',
    nombre: 'Redes Sociales con IA',
    bajoPedido: true,
    desc: 'Publicación automática en Facebook e Instagram, con el texto de cada publicación redactado con IA. Tú apruebas antes de publicar, desde Telegram.',
    precio: desde(precios.complementarios.redes),
    kws: ['redes', 'instagram', 'facebook', 'contenido', 'publicacion', 'publicaciones'],
  },
  {
    id: 'videos',
    nombre: 'Videos con IA',
    bajoPedido: true,
    desc: 'Videos generados con IA para tus redes o demos de producto, sin cámara ni edición manual.',
    precio: desde(precios.complementarios.videos.basico),
    kws: ['video', 'videos'],
  },
  {
    id: 'inventario',
    nombre: 'Inventario + Boletas',
    bajoPedido: true,
    desc: 'Control de stock y emisión de boletas electrónicas por WhatsApp, todo en un solo flujo.',
    precio: desde(precios.complementarios.inventario.tienda),
    kws: ['inventario', 'boleta', 'boletas', 'stock', 'venta'],
  },
];

// Textos fijos del chat.
export const textosChat = {
  titulo: 'SynaptekAI',
  subtitulo: 'Automatización e IA',
  burbujaSaludo: '¿Tienes una duda? Pregúntame.',
  saludo: '¡Hola! Soy el asistente de SynaptekAI.<br>¿Qué te gustaría automatizar?',
  sinCoincidencia: 'Entiendo. Déjame conectarte con una persona. ¿Te escribimos por WhatsApp?',
  bajoPedido: 'Servicio complementario · bajo pedido',
  botonWhatsApp: 'Hablar por WhatsApp',
  botonCalendly: 'Agendar demo gratis',
  placeholder: 'Escribe tu consulta...',
  etiquetaCampo: 'Escribe tu mensaje',
  abrir: 'Abrir chat de SynaptekAI',
  cerrar: 'Cerrar chat',
  enviar: 'Enviar mensaje',
  escribirWhatsApp: 'Escribir por WhatsApp',
  conversacion: 'Conversación',
  /** Mensaje del botón de WhatsApp de la cabecera del chat. */
  mensajeCabecera: 'Hola, quiero saber más sobre los servicios de SynaptekAI',
  /** Prefijo del mensaje al pedir un servicio: "Hola, me interesa el servicio de {nombre}". */
  mensajeServicio: 'Hola, me interesa el servicio de ',
  mensajeSinCoincidencia: 'Hola, tengo una consulta para SynaptekAI',
  /** Vacío: sin cuenta de Calendly todavía. Con un enlace real, el botón aparece solo. */
  calendlyUrl: '',
} as const;
