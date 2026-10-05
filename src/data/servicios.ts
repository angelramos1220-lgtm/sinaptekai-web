// Los 6 servicios principales (los que hoy tienen clientes reales), en el orden
// en que se muestran en la portada.

export type ServicioId = 'asistentes' | 'web' | 'visibilidad' | 'socio' | 'automatizacion' | 'medida';

export interface Servicio {
  id: ServicioId;
  titulo: string;
  descripcion: string;
  /** Línea "En uso en:" de la tarjeta. null = la tarjeta no la lleva. */
  enUso: string | null;
  /** Si la tarjeta de la portada es un enlace, a dónde lleva. */
  enlacePortada: string | null;
  /** Ícono de la tarjeta (ver Servicios.astro). */
  icono: 'circulo' | 'ventana' | 'pin' | 'escudo' | 'rombo' | 'cuadrado';
}

export const servicios: Servicio[] = [
  {
    id: 'asistentes',
    titulo: 'Asistentes Virtuales por WhatsApp y Telegram',
    descripcion: 'Atención al cliente, agendamiento de citas y respuestas automáticas, 24 horas al día, sin perder el toque humano.',
    enUso: 'Due Hotel · Oral Dent',
    enlacePortada: null,
    icono: 'circulo',
  },
  {
    id: 'web',
    titulo: 'Páginas Web a Medida',
    descripcion: 'Webs rápidas y a medida, preparadas para Google y para asistentes de IA, con WhatsApp directo y medición de cada contacto.',
    enUso: 'Aquamatic',
    enlacePortada: '#diseno-web',
    icono: 'ventana',
  },
  {
    id: 'visibilidad',
    titulo: 'Visibilidad en Google e IA',
    descripcion: 'Que te encuentren en Google Maps, en el buscador y en asistentes como ChatGPT o Gemini, con reseñas reales y la medición de cada contacto.',
    enUso: 'Aquamatic',
    enlacePortada: null,
    icono: 'pin',
  },
  {
    id: 'socio',
    titulo: 'Socio Tecnológico',
    descripcion: 'Dominio, hosting, web y proveedores en orden y a nombre de tu negocio. Nosotros hablamos el idioma técnico por ti.',
    enUso: 'Aquamatic',
    enlacePortada: null,
    icono: 'escudo',
  },
  {
    id: 'automatizacion',
    titulo: 'Automatización de Procesos',
    descripcion: 'Conecta Google Calendar, Sheets y tu correo para que tus tareas repetitivas se hagan solas.',
    enUso: 'Due Hotel · Oral Dent',
    enlacePortada: null,
    icono: 'rombo',
  },
  {
    id: 'medida',
    titulo: 'Soluciones a Medida',
    descripcion: 'Cada negocio es distinto: diseñamos el flujo de automatización que tu operación realmente necesita.',
    enUso: null,
    enlacePortada: null,
    icono: 'cuadrado',
  },
];

export function servicioPorId(id: ServicioId): Servicio {
  const s = servicios.find((x) => x.id === id);
  if (!s) throw new Error(`No existe el servicio "${id}" en src/data/servicios.ts`);
  return s;
}
