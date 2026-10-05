// /casos.md: versión Markdown de /casos, generada desde src/data.
import { markdownCasos, respuestaTexto } from '../lib/markdown';

export const GET = () => respuestaTexto(markdownCasos(), 'text/markdown');
