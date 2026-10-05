// /sitemap.xml, generado desde src/data/sitio.ts (rutasSitemap).
// No incluye la página de gracias ni la 404, ni las variantes .html.
import { negocio } from '../data/negocio';
import { rutasSitemap } from '../data/sitio';
import { respuestaTexto } from '../lib/markdown';

export const GET = () => {
  // Las páginas que salen de src/data se dan por actualizadas el día de la publicación.
  const hoy = new Date().toISOString().slice(0, 10);
  const urls = rutasSitemap.map(
    (r) => `  <url>
    <loc>${new URL(r.ruta, negocio.url).href}</loc>
    <lastmod>${r.actualizado ?? hoy}</lastmod>
    <changefreq>${r.frecuencia}</changefreq>
    <priority>${r.prioridad}</priority>
  </url>`,
  );
  return respuestaTexto(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`, 'application/xml');
};
