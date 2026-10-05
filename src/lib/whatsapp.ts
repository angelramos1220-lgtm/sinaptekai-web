import { negocio } from '../data/negocio';

/** Enlace a WhatsApp con el mensaje prellenado. Mismo formato que usa todo el sitio. */
export function waLink(mensaje: string): string {
  return `https://wa.me/${negocio.whatsapp.numero}?text=${encodeURIComponent(mensaje)}`;
}
