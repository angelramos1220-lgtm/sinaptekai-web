// Mapa del sitio: de aquí salen el menú, el footer, el sitemap y llms.txt.

import { textos } from './textos';
import { textosPaginas } from './textosPaginas';
import { paginasServicio } from './paginasServicio';

export interface Enlace {
  href: string;
  texto: string;
}

/** Submenú "Servicios": las 6 páginas de servicio, en orden. */
export const enlacesServicios: Enlace[] = paginasServicio.map((p) => ({ href: p.ruta, texto: p.menu }));

/** Resto del menú principal, después de "Servicios". */
export const enlacesMenu: Enlace[] = [
  { href: '/casos', texto: textos.navCase },
  { href: '/precios', texto: textosPaginas.menuPrecios },
  { href: '/#como-funciona', texto: textos.navHow },
  { href: '/#recursos', texto: textos.navResources },
  { href: '/#contacto', texto: textos.navContact },
];

/** Columna "Enlaces" del footer. */
export const enlacesPie: Enlace[] = [{ href: '/#inicio', texto: textos.navHome }, ...enlacesMenu];

export const enlacesLegales: Enlace[] = [
  { href: '/privacidad', texto: textos.footPrivacidad },
  { href: '/terminos', texto: textos.footTerminos },
];

/** Páginas que van al sitemap (rutas limpias, sin .html). La de gracias y la 404 no van. */
export const rutasSitemap: { ruta: string; prioridad: string; frecuencia: string }[] = [
  { ruta: '/', prioridad: '1.0', frecuencia: 'weekly' },
  ...paginasServicio.map((p) => ({ ruta: p.ruta, prioridad: '0.8', frecuencia: 'monthly' })),
  { ruta: '/casos', prioridad: '0.8', frecuencia: 'monthly' },
  { ruta: '/precios', prioridad: '0.8', frecuencia: 'monthly' },
  { ruta: '/privacidad', prioridad: '0.3', frecuencia: 'yearly' },
  { ruta: '/terminos', prioridad: '0.3', frecuencia: 'yearly' },
  { ruta: '/bot', prioridad: '0.3', frecuencia: 'yearly' },
];
