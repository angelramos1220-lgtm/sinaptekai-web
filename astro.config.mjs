import { defineConfig } from 'astro/config';

// Sitio 100 % estático. Lo sirve nginx (ver nginx.conf y Dockerfile).
export default defineConfig({
  site: 'https://synaptekai.tech',
  output: 'static',
  // URLs sin barra final: /servicios/paginas-web, no /servicios/paginas-web/.
  trailingSlash: 'never',
  build: {
    // Un archivo por página (privacidad.html, no privacidad/index.html): nginx
    // responde /privacidad con try_files $uri.html, sin redirección.
    format: 'file',
    // El CSS va dentro del HTML: una petición menos en la carga inicial.
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  devToolbar: { enabled: false },
});
