// Comparativa de paquetes: el botón la abre y la cierra, y la flecha gira.
// La tabla está en el HTML desde el inicio (oculta), así que se lee sin JavaScript
// en la versión Markdown y la ven los buscadores.

export function iniciarComparativa(): void {
  const boton = document.getElementById('comparativa-boton');
  const tabla = document.getElementById('comparativa-tabla');
  if (!boton || !tabla) return;

  const etiqueta = boton.querySelector<HTMLElement>('[data-etiqueta]');
  const flecha = boton.querySelector<HTMLElement>('[data-flecha]');

  boton.addEventListener('click', () => {
    const abrir = tabla.hidden;
    tabla.hidden = !abrir;
    boton.setAttribute('aria-expanded', String(abrir));
    if (etiqueta) etiqueta.textContent = (abrir ? boton.dataset.ocultar : boton.dataset.mostrar) || '';
    if (flecha) flecha.style.transform = abrir ? 'rotate(180deg)' : 'rotate(0deg)';
  });
}
