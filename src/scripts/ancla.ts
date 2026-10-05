// Desplazamiento suave al entrar con un ancla (por ejemplo /#paquetes).
//
// El script en línea de Base.astro guarda el ancla en window.__anclaInicial y la
// quita de la URL antes de que el navegador salte. Aquí se devuelve a la URL y se
// baja con suavidad hasta la sección, como hacía el sitio anterior.
//
// Con prefers-reduced-motion no se hace nada de esto: el navegador salta directo.
// Los clics en enlaces internos (#seccion) los suaviza el CSS (scroll-behavior).

declare global {
  interface Window {
    __anclaInicial?: string;
  }
}

export function iniciarAncla(): void {
  const ancla = window.__anclaInicial;
  if (!ancla) return;
  // La URL vuelve a mostrar el ancla, sin provocar otro salto.
  history.replaceState(null, '', location.pathname + location.search + ancla);

  let id: string;
  try { id = decodeURIComponent(ancla.slice(1)); } catch { id = ancla.slice(1); }
  const destino = document.getElementById(id);
  if (!destino) return;

  // Si el visitante toma el control, no se le vuelve a mover la página.
  let usuarioMovio = false;
  const marcar = (): void => { usuarioMovio = true; };
  window.addEventListener('wheel', marcar, { once: true, passive: true });
  window.addEventListener('touchmove', marcar, { once: true, passive: true });
  window.addEventListener('keydown', marcar, { once: true });

  const ir = (): void => {
    if (!usuarioMovio) destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  ir();
  // Las fuentes pueden mover el contenido justo después: se corrige la posición.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ir);
  window.setTimeout(ir, 400);
  window.setTimeout(ir, 1200);
}
