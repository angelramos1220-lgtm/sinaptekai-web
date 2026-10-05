// Medición con Google Analytics 4.
//
// GA4 solo se carga en los dominios de producción (lo decide el script en línea de
// Base.astro, que deja el resultado en window.__ga4Activo). En cualquier otro dominio
// (localhost, sitio de prueba) los eventos se escriben en la consola, para poder
// probarlos sin ensuciar los datos reales.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __ga4Activo?: boolean;
  }
}

export function medir(evento: string, parametros: Record<string, string>): void {
  if (window.__ga4Activo && typeof window.gtag === 'function') {
    window.gtag('event', evento, parametros);
  } else {
    console.info(`[GA4 · modo prueba] ${evento}`, parametros);
  }
}

/**
 * Evento de contacto por WhatsApp.
 * origen: desde qué parte del sitio salió (el data-origen del enlace).
 * pagina: la ruta de la página donde ocurrió ("/", "/casos", "/servicios/paginas-web"…).
 */
export function medirWhatsApp(origen: string): void {
  medir('contacto_whatsapp', { origen, pagina: location.pathname.replace(/\.html$/, '') || '/' });
}

// Un único listener delegado sobre document: cualquier enlace a wa.me (también los
// que el chat crea después) dispara contacto_whatsapp con el data-origen propio o
// el de su contenedor. Un enlace sin marca se registra como "sin-origen".
//
// Lo que abre WhatsApp sin pasar por un enlace (el formulario de Contacto) avisa con
// el evento "contacto-whatsapp" y su origen en detail: se mide igual.
export function iniciarMedicion(): void {
  document.addEventListener('contacto-whatsapp', (e) => {
    medirWhatsApp((e as CustomEvent<{ origen?: string }>).detail?.origen || 'sin-origen');
  });
  document.addEventListener('click', (e) => {
    const objetivo = e.target instanceof Element ? e.target : null;
    const enlace = objetivo ? objetivo.closest('a[href*="wa.me/"]') : null;
    if (!enlace) return;
    const marcado = enlace.closest('[data-origen]');
    medirWhatsApp(marcado ? marcado.getAttribute('data-origen') || 'sin-origen' : 'sin-origen');
  });
}
