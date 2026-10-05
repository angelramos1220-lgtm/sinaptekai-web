// "Servicios complementarios": bajo pedido, tarjetas compactas (máximo 3 viñetas).

import { precios } from './precios';
import { soles, porMes, rangoCorto } from '../lib/formato';

export type ComplementarioId = 'redes' | 'videos' | 'inventario';

export interface VideoEjemplo {
  src: string;
  poster: string;
  /** Texto del botón de reproducir, para lectores de pantalla. */
  etiqueta: string;
  /** Video vertical (9:16): va en una caja de alto limitado. */
  vertical: boolean;
}

export interface Complementario {
  id: ComplementarioId;
  nombre: string;
  /** Una o dos líneas de precio. */
  precios: string[];
  vinetas: string[];
  /** Nota pequeña debajo de las viñetas. Vacía no se muestra. */
  nota: string;
  /** Video detrás de "Ver ejemplo". null = sin video. */
  video: VideoEjemplo | null;
  /** Mensaje del botón "Consultar". Videos e Inventario conservan el que ya tenían. */
  mensajeWhatsApp: string;
  /** Valor del parámetro "origen" del evento contacto_whatsapp. */
  origen: string;
}

const c = precios.complementarios;
const plan = (nombre: string, pr: { instalacion: number; mensual: number }) =>
  `${nombre}: ${soles(pr.instalacion)} · ${porMes(pr.mensual)}`;

export const complementarios: Complementario[] = [
  {
    id: 'redes',
    nombre: 'Redes Sociales con IA',
    precios: [`Desde ${soles(c.redes.instalacion)} · ${porMes(c.redes.mensual)}`],
    vinetas: [
      'Publicación automática en Facebook e Instagram',
      'Texto de cada publicación redactado con IA',
      'Tú apruebas antes de publicar, desde Telegram',
    ],
    nota: '',
    video: null,
    mensajeWhatsApp: 'Hola, quiero información del servicio de Redes Sociales con IA',
    origen: 'redes',
  },
  {
    id: 'videos',
    nombre: 'Videos con IA',
    precios: [plan('Básico', c.videos.basico), plan('Full', c.videos.full)],
    vinetas: [
      'Tu avatar propio con IA (o el de tu negocio)',
      `${c.videos.videosAlMesBasico} videos al mes en el plan Básico y ${c.videos.videosAlMesFull} en el Full, con guion generado por IA`,
      `Video adicional: ${rangoCorto(c.videos.videoAdicional.min, c.videos.videoAdicional.max)} c/u`,
    ],
    nota: '',
    video: {
      src: '/assets/videos/oral-dent-demo.mp4',
      poster: '/assets/videos/oral-dent-poster.jpg',
      etiqueta: 'Reproducir video con audio: demo de Oral Dent',
      vertical: true,
    },
    mensajeWhatsApp: 'Hola, quiero el paquete "Videos con IA"',
    origen: 'videos',
  },
  {
    id: 'inventario',
    nombre: 'Inventario + Boletas',
    precios: [plan('Tienda', c.inventario.tienda), plan('Supermercado', c.inventario.supermercado)],
    vinetas: [
      'Registra ventas hablándole a tu WhatsApp (texto o voz)',
      'Descuenta inventario y emite boletas electrónicas válidas ante SUNAT',
      `Incluye ${c.inventario.boletasIncluidasAlMes} boletas/mes; adicional ${soles(c.inventario.boletaAdicional)} c/u`,
    ],
    nota: 'La emisión válida ante SUNAT requiere el certificado digital del negocio — te ayudamos con el trámite.',
    video: {
      src: '/assets/videos/inventario-boletas-demo.mp4',
      poster: '/assets/videos/inventario-boletas-poster.jpg',
      etiqueta: 'Reproducir video con audio: demo de inventario y boletas por WhatsApp',
      vertical: true,
    },
    mensajeWhatsApp: 'Hola, quiero el paquete "Gestión de Inventario + Boletas"',
    origen: 'inventario',
  },
];
