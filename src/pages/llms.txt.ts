// /llms.txt: resumen del sitio para asistentes de IA, generado desde src/data.
import { llmsTxt, respuestaTexto } from '../lib/markdown';

export const GET = () => respuestaTexto(llmsTxt(), 'text/plain');
