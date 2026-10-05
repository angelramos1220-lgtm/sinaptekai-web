// /precios.md: versión Markdown de /precios, generada desde src/data.
import { markdownPrecios, respuestaTexto } from '../lib/markdown';

export const GET = () => respuestaTexto(markdownPrecios(), 'text/markdown');
