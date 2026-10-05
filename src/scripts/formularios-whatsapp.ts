// Formularios de Contacto y de Comentarios: no envían nada a ningún servidor.
// Abren WhatsApp con el mensaje prellenado, igual que en el sitio anterior.
// El número sale del atributo data-whatsapp de cada formulario (src/data/negocio.ts).

import { medirWhatsApp } from './medicion';

function valor(form: HTMLFormElement, nombre: string): string {
  const el = form.elements.namedItem(nombre) as HTMLInputElement | HTMLTextAreaElement | null;
  return el ? el.value : '';
}

function abrirWhatsApp(form: HTMLFormElement, mensaje: string): void {
  window.open(`https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

/** Contacto: "Hola, soy {nombre}[ de {negocio}]. {mensaje}" */
export function iniciarFormularioContacto(): void {
  const form = document.getElementById('form-contacto') as HTMLFormElement | null;
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = valor(form, 'nombre');
    const negocio = valor(form, 'negocio');
    const mensaje = valor(form, 'mensaje');
    // El formulario abre WhatsApp sin pasar por un enlace: se mide aquí con el mismo evento.
    medirWhatsApp('contacto');
    abrirWhatsApp(form, `Hola, soy ${nombre}${negocio ? ' de ' + negocio : ''}. ${mensaje || form.dataset.mensajePorDefecto || ''}`);
  });
}

/** Comentarios: "Comentario de {nombre o 'un visitante de la web'}: {comentario}" */
export function iniciarFormularioComentarios(): void {
  const form = document.getElementById('form-comentarios') as HTMLFormElement | null;
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = valor(form, 'fbNombre');
    const comentario = valor(form, 'fbComentario');
    abrirWhatsApp(form, `Comentario de ${nombre || form.dataset.anonimo || ''}: ${comentario}`);
  });
}
