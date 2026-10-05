// /servicios/<slug>.md: versión Markdown de cada página de servicio, generada desde src/data.
import type { APIContext } from 'astro';
import { paginasServicio, type PaginaServicio } from '../../data/paginasServicio';
import { markdownServicio, respuestaTexto } from '../../lib/markdown';

export function getStaticPaths() {
  return paginasServicio.map((pagina) => ({ params: { slug: pagina.slug }, props: { pagina } }));
}

export const GET = ({ props }: APIContext<{ pagina: PaginaServicio }>) => respuestaTexto(markdownServicio(props.pagina), 'text/markdown');
