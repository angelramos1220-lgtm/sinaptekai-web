// Checklist gratuito: los dos formularios (sección Recursos y popup) y el popup mismo.
//
// NO cambiar el webhook, los nombres de los campos (nombre, email, negocio, origen)
// ni la página de gracias: el workflow de n8n depende de ellos.
// Lógica portada del sitio anterior (wireLeadForm, initLeadModalTrigger, etc.).

interface ConfigLeads {
  webhook: string;
  paginaGracias: string;
  clavePopup: string;
  textos: {
    enviando: string;
    errorGenerico: string;
    errorNombre: string;
    errorEmailVacio: string;
    errorEmailFormato: string;
    errorNegocio: string;
  };
}

type Campo = 'nombre' | 'email' | 'negocio';
const CAMPOS: Campo[] = ['nombre', 'email', 'negocio'];

function validar(campo: Campo, valor: string, tx: ConfigLeads['textos']): string | null {
  const v = (valor || '').trim();
  if (campo === 'nombre') return v ? null : tx.errorNombre;
  if (campo === 'email') {
    if (!v) return tx.errorEmailVacio;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return tx.errorEmailFormato;
    return null;
  }
  return v ? null : tx.errorNegocio;
}

function conectarFormulario(form: HTMLFormElement, config: ConfigLeads): void {
  const campo = (nombre: Campo) => form.elements.namedItem(nombre) as HTMLInputElement | null;

  const mostrarError = (nombre: Campo): boolean => {
    const input = campo(nombre);
    const errorEl = form.querySelector<HTMLElement>(`[data-error-for="${nombre}"]`);
    if (!input || !errorEl) return true;
    const msg = validar(nombre, input.value, config.textos);
    if (msg) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
      input.setAttribute('aria-invalid', 'true');
      input.style.borderColor = '#F87171';
    } else {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
      input.removeAttribute('aria-invalid');
      input.style.borderColor = '#334155';
    }
    return !msg;
  };

  CAMPOS.forEach((nombre) => {
    const input = campo(nombre);
    if (!input) return;
    input.addEventListener('blur', () => mostrarError(nombre));
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') mostrarError(nombre);
    });
  });

  const estado = form.querySelector<HTMLElement>('[data-lead-status]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let primerInvalido: HTMLInputElement | null = null;
    CAMPOS.forEach((nombre) => {
      const ok = mostrarError(nombre);
      if (!ok && !primerInvalido) primerInvalido = campo(nombre);
    });
    if (primerInvalido) { (primerInvalido as HTMLInputElement).focus(); return; }

    const boton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!boton) return;
    const etiquetaOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = config.textos.enviando;
    if (estado) { estado.textContent = ''; estado.style.display = 'none'; }

    // Mismo cuerpo de siempre. "origen" dice de qué formulario salió: seccion o modal.
    const payload = {
      nombre: campo('nombre')!.value.trim(),
      email: campo('email')!.value.trim(),
      negocio: campo('negocio')!.value.trim(),
      origen: form.dataset.leadSource || 'landing',
    };

    fetch(config.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => {
        if (!r.ok) throw new Error('bad status');
        localStorage.setItem(config.clavePopup, '1');
        window.location.href = config.paginaGracias;
      })
      .catch(() => {
        boton.disabled = false;
        boton.textContent = etiquetaOriginal;
        if (estado) {
          estado.textContent = config.textos.errorGenerico;
          estado.style.display = 'block';
        }
      });
  });
}

export function iniciarLeads(): void {
  const overlay = document.getElementById('lead-modal-overlay');
  if (!overlay) return;
  const config = JSON.parse(overlay.dataset.config || '{}') as ConfigLeads;

  document.querySelectorAll<HTMLFormElement>('form[data-lead-form]').forEach((form) => conectarFormulario(form, config));

  // ----- Popup -----
  const modal = document.getElementById('lead-modal');
  const cerrarBtn = document.getElementById('lead-modal-close');
  let abierto = false;

  const abrir = (): void => {
    abierto = true;
    overlay.style.display = 'flex';
    if (cerrarBtn) cerrarBtn.focus();
  };
  const cerrar = (): void => {
    abierto = false;
    overlay.style.display = 'none';
  };

  if (cerrarBtn) cerrarBtn.addEventListener('click', cerrar);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(); });

  document.addEventListener('keydown', (e) => {
    if (!abierto) return;
    if (e.key === 'Escape') { cerrar(); return; }
    if (e.key === 'Tab' && modal) {
      const enfocables = Array.from(modal.querySelectorAll<HTMLElement>('button, input, a[href]'))
        .filter((el) => !(el as HTMLButtonElement).disabled);
      if (!enfocables.length) return;
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    }
  });

  // Se abre al llegar al 70 % del alto de la página, una sola vez por navegador.
  let yaMostrado = false;
  try { yaMostrado = !!localStorage.getItem(config.clavePopup); } catch (err) { yaMostrado = true; }
  if (yaMostrado) return;

  let pendiente = false;
  const alHacerScroll = (): void => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      pendiente = false;
      const doc = document.documentElement;
      const recorrido = window.scrollY + window.innerHeight;
      if (doc.scrollHeight > 0 && recorrido / doc.scrollHeight >= 0.7) {
        localStorage.setItem(config.clavePopup, '1');
        window.removeEventListener('scroll', alHacerScroll);
        abrir();
      }
    });
  };
  window.addEventListener('scroll', alHacerScroll, { passive: true });
}
