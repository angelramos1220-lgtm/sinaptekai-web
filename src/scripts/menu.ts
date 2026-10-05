// Menú del sitio.
//
// Escritorio: "Servicios" abre un submenú. Se abre con clic, con Enter o Espacio,
// con la flecha abajo y al pasar el ratón; se cierra con Escape (y el foco vuelve al
// botón), al salir con el ratón, al tabular fuera y con un clic en otra parte.
//
// Menos de 1024 px: menú hamburguesa. Al abrir, el foco va al primer elemento;
// Escape lo cierra y devuelve el foco al botón; un clic fuera lo cierra; elegir un
// enlace lo cierra. Dentro, "Servicios" se expande y se contrae.

function iniciarSubmenu(): void {
  const cont = document.querySelector<HTMLElement>('[data-menu-servicios]');
  if (!cont) return;
  const boton = cont.querySelector<HTMLButtonElement>('button');
  const lista = cont.querySelector<HTMLElement>('.submenu');
  if (!boton || !lista) return;
  let temporizador: number | undefined;

  const abrir = (): void => { window.clearTimeout(temporizador); lista.hidden = false; boton.setAttribute('aria-expanded', 'true'); };
  const cerrar = (): void => { window.clearTimeout(temporizador); lista.hidden = true; boton.setAttribute('aria-expanded', 'false'); };
  const abierto = (): boolean => !lista.hidden;

  boton.addEventListener('click', () => (abierto() ? cerrar() : abrir()));
  boton.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown') return;
    e.preventDefault();
    abrir();
    lista.querySelector<HTMLElement>('a')?.focus();
  });

  // Ratón: solo donde hay puntero fino (en táctil manda el clic).
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cont.addEventListener('mouseenter', abrir);
    cont.addEventListener('mouseleave', () => { temporizador = window.setTimeout(cerrar, 160); });
  }

  cont.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !abierto()) return;
    cerrar();
    boton.focus();
  });
  cont.addEventListener('focusout', (e) => {
    const destino = e.relatedTarget;
    if (!(destino instanceof Node) || !cont.contains(destino)) cerrar();
  });
  document.addEventListener('click', (e) => {
    if (abierto() && e.target instanceof Node && !cont.contains(e.target)) cerrar();
  });
}

function iniciarHamburguesa(): void {
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
    if (abierto) panel.querySelector<HTMLElement>('button, a')?.focus();
  });

  // "Servicios" dentro del panel: se expande y se contrae.
  const botonServicios = panel.querySelector<HTMLButtonElement>('.panel-servicios__boton');
  const listaServicios = document.getElementById('panel-servicios');
  if (botonServicios && listaServicios) {
    botonServicios.addEventListener('click', () => {
      const abrir = listaServicios.hidden;
      listaServicios.hidden = !abrir;
      botonServicios.setAttribute('aria-expanded', String(abrir));
    });
  }

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

export function iniciarMenu(): void {
  iniciarSubmenu();
  iniciarHamburguesa();
}
