// Rutas derivadas de la ruta limpia de una página.

/** Ruta de la versión Markdown de una página ("/" → "/index.md", "/casos" → "/casos.md"). */
export const rutaMarkdown = (ruta: string): string => (ruta === '/' ? '/index.md' : `${ruta}.md`);
