// Formulario de Contacto: no envía nada a ningún servidor. Abre WhatsApp con el
// mensaje prellenado, igual que en el sitio anterior:
//   "Hola, soy {nombre}[ de {negocio}]. {mensaje}"
// El número sale del atributo data-whatsapp del formulario (src/data/negocio.ts).
//
// Sin imports a propósito: así Astro incrusta este script en la página y no hace
// falta otra petición. La medición se pide con un evento (ver src/scripts/medicion.ts).

export function iniciarFormularioContacto(): void {
  const form = document.getElementById('form-contacto') as HTMLFormElement | null;
  if (!form) return;
  const valor = (nombre: string): string => (form.elements.namedItem(nombre) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? '';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = valor('nombre');
    const negocio = valor('negocio');
    const mensaje = `Hola, soy ${nombre}${negocio ? ' de ' + negocio : ''}. ${valor('mensaje') || form.dataset.mensajePorDefecto || ''}`;
    // El formulario abre WhatsApp sin pasar por un enlace: se mide con el mismo evento de GA4.
    document.dispatchEvent(new CustomEvent('contacto-whatsapp', { detail: { origen: 'contacto' } }));
    window.open(`https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(mensaje)}`, '_blank');
  });
}
