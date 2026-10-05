// Menú hamburguesa (menos de 1024 px). Mismo comportamiento que el sitio anterior:
// al abrir, el foco va al primer enlace; Escape lo cierra y devuelve el foco al botón;
// un clic fuera lo cierra; elegir un enlace lo cierra.

export function iniciarMenu(): void {
  const boton = document.getElementById('mobile-nav-toggle');
  const panel = document.getElementById('mobile-nav-panel');
  if (!boton || !panel) return;

  const barras = boton.querySelectorAll<HTMLElement>('.hamburger-bar');
  const etiquetaAbrir = boton.dataset.abrir || '';
  const etiquetaCerrar = boton.dataset.cerrar || '';
  let abierto = false;

  const pintar = (): void => {
    panel.hidden = !abierto;
    boton.setAttribute('aria-expanded', String(abierto));
    boton.setAttribute('aria-label', abierto ? etiquetaCerrar : etiquetaAbrir);
    // Las tres barras forman una X cuando el menú está abierto.
    if (barras.length === 3) {
      barras[0].style.transform = abierto ? 'rotate(45deg) translateY(7px)' : 'none';
      barras[1].style.opacity = abierto ? '0' : '1';
      barras[2].style.transform = abierto ? 'rotate(-45deg) translateY(-7px)' : 'none';
    }
  };

  const cerrar = (): void => {
    if (!abierto) return;
    abierto = false;
    pintar();
  };

  boton.addEventListener('click', () => {
    abierto = !abierto;
    pintar();
    if (abierto) {
      const primero = panel.querySelector<HTMLElement>('a');
      if (primero) primero.focus();
    }
  });

  panel.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest('a')) cerrar();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !abierto) return;
    cerrar();
    boton.focus();
  });

  document.addEventListener('click', (e) => {
    if (!abierto || !(e.target instanceof Node)) return;
    if (!panel.contains(e.target) && !boton.contains(e.target)) cerrar();
  });
}
