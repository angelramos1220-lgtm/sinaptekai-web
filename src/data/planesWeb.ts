// Diseño de páginas web: los 4 planes y la oferta "Renueva tu Página Web".

import { precios } from './precios';
import { rangoSoles, rangoCorto } from '../lib/formato';

export type PlanWebId = 'landing' | 'corporativo' | 'funcionalidades' | 'tienda';

export interface PlanWeb {
  id: PlanWebId;
  nombre: string;
  /** "S/450 – S/700" */
  precio: string;
  notaPago: string;
  /** "Mantenimiento: S/50–80/mes" */
  mantenimiento: string;
  incluye: string[];
  resplandor: string;
}

const w = precios.web;
const mant = (r: { min: number; max: number }) => `Mantenimiento: ${rangoCorto(r.min, r.max)}/mes`;

export const planesWeb: PlanWeb[] = [
  {
    id: 'landing',
    nombre: 'Landing Page',
    precio: rangoSoles(w.landing.min, w.landing.max),
    notaPago: 'Pago único',
    mantenimiento: mant(w.landing.mantenimiento),
    incluye: ['Una sola página', 'Diseño a medida', 'Formulario de contacto'],
    resplandor: 'rgba(45,212,191,0.18)',
  },
  {
    id: 'corporativo',
    nombre: 'Sitio Corporativo',
    precio: rangoSoles(w.corporativo.min, w.corporativo.max),
    notaPago: 'Pago único',
    mantenimiento: mant(w.corporativo.mantenimiento),
    incluye: ['Varias páginas (inicio, servicios, nosotros, contacto)', 'Casos de uso', 'Diseño completo'],
    resplandor: 'rgba(34,211,238,0.18)',
  },
  {
    id: 'funcionalidades',
    nombre: 'Sitio con Funcionalidades',
    precio: rangoSoles(w.funcionalidades.min, w.funcionalidades.max),
    notaPago: 'Pago único',
    mantenimiento: mant(w.funcionalidades.mantenimiento),
    incluye: ['Todo lo anterior', 'Catálogo', 'Formularios avanzados o sistema de reservas/citas'],
    resplandor: 'rgba(129,140,248,0.18)',
  },
  {
    id: 'tienda',
    nombre: 'Tienda Online',
    precio: rangoSoles(w.tienda.min, w.tienda.max),
    notaPago: 'Pago único',
    mantenimiento: mant(w.tienda.mantenimiento),
    incluye: ['Todo lo anterior', 'Carrito de compras', 'Pasarela de pago', 'Gestión de inventario'],
    resplandor: 'rgba(251,191,36,0.18)',
  },
];

// Banner "Renueva tu Página Web".
export const renuevaWeb = {
  insignia: 'Oferta',
  nombre: 'Renueva tu Página Web',
  descripcion: '¿Ya tienes una web pero se ve anticuada o lenta? La rediseñamos completa con estética moderna y la dejamos en un hosting y un dominio a nombre de tu negocio: tuyos de verdad, aunque mañana cambies de proveedor.',
  precio: rangoSoles(w.renueva.min, w.renueva.max),
  notaPago: 'Pago único',
  notaHosting: 'El hosting y el dominio se pagan directo al proveedor, a nombre de tu negocio.',
  vinetas: [
    'Rediseño completo con estética moderna y profesional',
    'Migración de todo tu contenido actual (textos, fotos, contacto)',
    'Dominio y hosting a nombre de tu negocio (los configuramos y gestionamos nosotros)',
    'Puesta en marcha y despliegue',
  ],
  boton: 'Quiero renovar mi web',
  mensajeWhatsApp: 'Hola, quiero renovar mi página web actual',
  origen: 'renueva-web',
} as const;
