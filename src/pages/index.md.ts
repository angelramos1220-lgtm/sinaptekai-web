// /index.md: versión Markdown de la portada, generada desde src/data.
import { markdownPortada, respuestaTexto } from '../lib/markdown';

export const GET = () => respuestaTexto(markdownPortada(), 'text/markdown');
