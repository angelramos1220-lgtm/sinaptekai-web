// Formulario de Comentarios: no envía nada a ningún servidor. Abre WhatsApp con el
// mensaje prellenado, igual que en el sitio anterior:
//   "Comentario de {nombre o 'un visitante de la web'}: {comentario}"
// El número sale del atributo data-whatsapp del formulario (src/data/negocio.ts).
// No se mide (tampoco se medía en el sitio anterior).
//
// Sin imports a propósito: así Astro incrusta este script en la página.

export function iniciarFormularioComentarios(): void {
  const form = document.getElementById('form-comentarios') as HTMLFormElement | null;
  if (!form) return;
  const valor = (nombre: string): string => (form.elements.namedItem(nombre) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? '';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const mensaje = `Comentario de ${valor('fbNombre') || form.dataset.anonimo || ''}: ${valor('fbComentario')}`;
    window.open(`https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(mensaje)}`, '_blank');
  });
}
