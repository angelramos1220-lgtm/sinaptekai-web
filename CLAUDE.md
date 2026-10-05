# SynaptekAI — sitio web (sinaptekai-web)

Sitio de SynaptekAI: https://synaptekai.tech. Solo en español, precios solo en soles.
Este archivo existe para que una sesión nueva no arranque de cero. No contiene
contraseñas, tokens ni URLs de webhooks, y no debe contenerlos.

> **Estado: migración a Astro en curso, en la rama `astro`.** Fases 0 a 3 terminadas
> (inventario, portada con paridad, páginas nuevas, SEO/servidor). Fase 4 en curso: la
> rama `astro` está en origin y se publica como sitio de prueba en
> `nuevo.synaptekai.tech`. Falta la Fase 5 (reemplazar el sitio real), que además espera
> la revisión de las preguntas frecuentes (`docs/textos-nuevos.md`).
> Hasta la Fase 5, `main` sigue siendo el sitio anterior (un bundle de Claude Design) y
> es lo que está publicado.
>
> Reglas de la migración, vigentes hasta que termine:
> - **Nunca commit, merge ni push sobre `main`** hasta la Fase 5, y solo con aprobación explícita.
> - En `astro` se hacen commits locales. **Push de `astro` solo con aprobación** (Fase 4).
> - Después de cada push hay que decir en qué servicio de Easypanel tocar "Deploy"
>   (`sitio-web-nuevo` o `sitio-web`) y **esperar la confirmación** antes de verificar con curl.
> - Ningún texto nuevo sin listarlo en `docs/textos-nuevos.md`.

## Contexto del proyecto

- **Repo:** github.com/angelramos1220-lgtm/sinaptekai-web. El repo es la única fuente de verdad.
- **Despliegue: manual, en Easypanel** (proyecto "synaptekai"). **Un push no publica nada**:
  el sitio cambia solo cuando alguien toca "Deploy" en el servicio. Cada despliegue tarda
  unos segundos en lanzarse; el build corre en un VPS de 2 vCPU compartido con n8n y los
  bots de clientes, así que el build tiene que ser liviano (ver "Build").
  - `sitio-web`: el sitio real, synaptekai.tech (rama `main`).
  - `sitio-web-nuevo`: el sitio de prueba, nuevo.synaptekai.tech (rama `astro`). Se crea en la Fase 4.
- **Tecnología:** Astro 5.18, 100 % estático, sin frameworks de interfaz. nginx sirve el
  resultado. El comportamiento es JavaScript/TypeScript a mano en `src/scripts/`.
- **Estilo:** tema oscuro, acentos índigo/violeta y teal, tipografías Manrope (texto) y
  Space Grotesk (títulos de bloques), autoalojadas en `src/assets/fonts/`.

## Lo que no se puede romper

Verificarlo en cada cambio (`node scripts/verificar.js` revisa casi todo):

- **Checklist:** el formulario (sección Recursos y popup) hace POST JSON a un webhook de
  n8n con los campos `nombre`, `email`, `negocio`, `origen` (`seccion` o `modal`) y
  después lleva a `/gracias.html`. El workflow envía por correo
  `/assets/checklist-automatizacion.pdf`. **No cambiar el webhook, los nombres de los
  campos, la ruta del PDF ni la URL de la página de gracias.**
- **Chat:** envía un resumen de la conversación a otro webhook, una sola vez por carga de
  página. No cambiar el cuerpo ni los 8 valores de `servicioElegido` (`asistentes`, `web`,
  `visibilidad`, `socio`, `automatizacion`, `redes`, `videos`, `inventario`).
- **La página no llama a n8n al cargar.** Solo el formulario al enviarse y el chat al cerrarse.
- **Formularios de Contacto y Comentarios:** no envían nada a un servidor; abren WhatsApp
  con el mensaje prellenado.
- **Popup "Antes de irte, llévate esto":** aparece al 70 % del scroll de la portada, una
  vez por navegador.
- **Claves del navegador** (se conservan las del sitio anterior): `synaptekai-lead-modal-shown`,
  `synaptekai-chat-launcher-pos`, `synaptekai-chat-greeted-session`, `synaptekai-chat-opened-session`.
- **URLs que deben responder 200, sin redirección:** `/privacidad` y `/terminos`
  (registradas en la pantalla de consentimiento OAuth de Google), sus variantes `.html`,
  `/gracias` y `/gracias.html`, `/bot` y `/bot.html` (el bot de prospección se identifica
  con `/bot`), `/index.md`, `/llms.txt`, `/robots.txt`, `/sitemap.xml` y todo `/assets/`.
- **Videos diferidos:** al cargar no se pide ningún video ni su portada; la portada baja al
  abrir "Ver ejemplo" y el video al pulsar reproducir.
- **Google Analytics 4** (`G-Q01K6J04NG`) y el evento `contacto_whatsapp` en todos los
  enlaces a WhatsApp (ver "Medición").
- **Anclas de la portada:** `/#servicios`, `/#como-funciona`, `/#casos`, `/#diseno-web`,
  `/#paquetes`, `/#recursos`, `/#contacto`, `/#comentarios`.
- **Testimonio:** `src/data/testimonio.ts` está en `null` y no se dibuja nada. Nunca inventar uno.

## Reglas de trabajo

- **No hacer commit ni push sin aprobación.** Al terminar un cambio: levantarlo en
  localhost y esperar la revisión.
- **No inventar datos, cifras, clientes, funciones ni promesas.** Todo texto que no exista
  ya en el sitio se lista en `docs/textos-nuevos.md` para revisión.
- **Los textos de los casos (Due Hotel, Aquamatic, Oral Dent) se copian exactos.** Están
  aprobados por el cliente solo para este sitio web: no se resumen, no se reescriben y no
  se usan en piezas para redes sociales.
- Nunca usar la palabra "hostal": Due Hotel es un hotel corporativo.
- Como clientes solo se nombran los tres casos vigentes. Ningún cliente anterior se
  menciona en el sitio ni en sus archivos.
- Solo español. Precios solo en soles, y **solo en `src/data/precios.ts`**.
- Verificar cada cambio en **375, 768, 1280 y 1440 px**.
- No tocar, borrar ni subir las copias locales `.gstack/`, `Pagina WEB/`,
  `SynaptekAI landing page/` y `SynaptekAI landing page.zip` (están en `.gitignore`).
- **Nunca usar `docker container prune`** (ni `docker system prune`): borra todos los
  contenedores detenidos de la máquina. Para reiniciar un contenedor: `docker rm -f <nombre>`.
- Las páginas internas usan los componentes y los tokens de `src/styles/componentes.css`,
  no estilos en línea. La portada conserva estilos en línea porque se portó con paridad
  exacta del sitio anterior.
- El margen lateral de todas las secciones, de la cabecera y del footer es el token
  `--margen-lateral` (`src/styles/global.css`): 48 px, y 20 px por debajo de 768 px.
  No escribir ese margen a mano en una sección nueva.

## Dónde vive cada cosa

```
src/
  data/          TODO el contenido. Aquí se cambia un texto, un precio o un servicio.
  pages/         Una página por archivo. Los .md.ts, llms.txt.ts y sitemap.xml.ts generan texto.
  layouts/       Base.astro (<head>, medición, modo de prueba) y Pagina.astro (cabecera + pie + chat).
  components/    Secciones de la portada, tarjetas compartidas (tarjetas/) y piezas de página interna (pagina/).
  scripts/       Comportamiento: menú, chat, checklist y popup, hero, medición, anclas…
  styles/        global.css (portada y base), componentes.css (tokens y páginas internas), chat.css, legal.css.
  lib/           formato.ts (soles), whatsapp.ts (enlaces), markdown.ts, datosEstructurados.ts, rutas.ts.
  legal/         Texto de Privacidad y Términos, tal cual (HTML). No reescribir.
  assets/        Fuentes y logo (Astro les pone un hash en el nombre).
public/          Se publica tal cual: assets/ (PDF, favicons, og-image, videos), bot.html, robots.txt, robots-prueba.txt.
nginx.conf       Servidor: URLs sin extensión, Markdown por negociación, caché, 404, modo de prueba, www.
Dockerfile       Build con Node y sitio final con nginx.
docs/            inventario.md (sitio anterior), fase-1-diferencias.md, textos-nuevos.md.
scripts/         verificar.js, lighthouse.js y herramientas de la migración (ver "Verificación").
legacy/          El bundle anterior, solo como referencia. Se borra en la Fase 5.
```

| Qué | Archivo en `src/data/` |
|---|---|
| **Todos los montos** | `precios.ts` (única fuente; `src/lib/formato.ts` los escribe como "S/800") |
| Nombre, correo, WhatsApp, redes, GA4, dominios, webhooks, claves del navegador | `negocio.ts` |
| Textos de la portada (hero, títulos de sección, botones, formularios, footer) | `textos.ts` |
| Textos de las páginas internas, de la 404, de gracias y de las versiones Markdown | `textosPaginas.ts` |
| Las 6 tarjetas de Servicios de la portada (y su línea "En uso en:") | `servicios.ts` |
| Páginas de servicio: título, bajada, SEO, qué incluye, precio, casos, preguntas frecuentes | `paginasServicio.ts` |
| Casos de éxito | `casos.ts` |
| Testimonio | `testimonio.ts` |
| Paquetes y su comparativa | `paquetes.ts` |
| Más servicios (Visibilidad, Socio Tecnológico) | `masServicios.ts` |
| Servicios complementarios y sus videos | `complementarios.ts` |
| Planes de Diseño Web y "Renueva tu Página Web" | `planesWeb.ts` |
| Filas de `/precios` | `paginaPrecios.ts` |
| Pasos de "Cómo funciona" | `pasos.ts` |
| Rubros sobre los paquetes | `rubros.ts` |
| Diagrama animado del hero | `flow.ts` |
| Chat: servicios, palabras clave y textos | `chat.ts` |
| Menú, footer y sitemap | `sitio.ts` |

Un cambio en `src/data` llega solo a todo lo que lo usa: la portada, las páginas internas,
los datos estructurados, las versiones Markdown, `llms.txt` y el sitemap. No hay copias
que mantener a mano.

## Páginas

| URL | Archivo | Notas |
|---|---|---|
| `/` | `pages/index.astro` | Portada. Secciones en `components/`. |
| `/servicios/<slug>` | `pages/servicios/[slug].astro` | Plantilla única; una entrada por página en `paginasServicio.ts`. |
| `/casos` | `pages/casos.astro` | Anclas `#due-hotel`, `#aquamatic`, `#oral-dent`. |
| `/precios` | `pages/precios.astro` | |
| `/privacidad`, `/terminos` | `pages/privacidad.astro`, `terminos.astro` | Contenido en `src/legal/`. Sin chat. |
| `/gracias.html` | `pages/gracias.astro` | `noindex`. Sin chat. |
| 404 | `pages/404.astro` | nginx la entrega con código 404. |
| `/bot.html` | `public/bot.html` | Página fija del bot de prospección. |

Todas responden con y sin `.html`; la `canonical` apunta siempre a la URL limpia.
Las URLs van **sin barra final** (`/casos/` redirige a `/casos`).

### Agregar un servicio

1. `src/data/precios.ts`: sus montos.
2. `src/data/paginasServicio.ts`: una entrada nueva (y su `slug` en el tipo
   `PaginaServicioSlug`). Con eso ya existen la página, su `.md`, su lugar en el menú, en el
   footer, en el sitemap y en `llms.txt`.
3. Si "Qué incluye" lleva tarjetas propias (como paquetes o planes), agregar su caso en
   `pages/servicios/[slug].astro` y en `incluyeServicio()` de `src/lib/markdown.ts`.
   Si son solo viñetas, basta el campo `incluye`.
4. Si también va como tarjeta en la portada: `servicios.ts` y `paginaDeServicio`.
5. El `origen` nuevo se agrega a la lista `ORIGENES` de `scripts/verificar.js`, y el slug a `SERVICIOS`.
6. El menú tiene que seguir cabiendo en una fila: lo revisa `verificar.js`.

Las preguntas frecuentes solo repiten hechos que el sitio ya afirma: sin plazos, garantías
ni resultados que no estén escritos en otra parte.

### Agregar un caso

1. `src/data/casos.ts`: una entrada nueva (y su `id` en el tipo `CasoId`), con el texto
   aprobado por el cliente. Aparece solo en la portada, en `/casos` (con su ancla), en los
   `.md` y en `llms.txt`.
2. Para que salga en "En uso en" de una página de servicio: su `id` en `enUso`, en
   `paginasServicio.ts`. Para la línea "En uso en:" de la tarjeta de la portada: `servicios.ts`.

## Cabecera y menú

Menú: Servicios (submenú con las 6 páginas) · Casos de éxito · Precios · Cómo funciona ·
Recursos · Contacto · botón de WhatsApp. Siempre en una sola fila:

- desde 1240 px: menú completo y botón "Hablar por WhatsApp" con texto;
- de 1024 a 1239 px: menú completo y botón de WhatsApp solo ícono;
- menos de 1024 px: menú hamburguesa, con "Servicios" expandible.

El submenú se abre con clic, Enter, flecha abajo o al pasar el ratón, y se cierra con
Escape. Los cortes están en `src/styles/global.css`; el comportamiento, en `src/scripts/menu.ts`.

## Medición

- **GA4 solo se carga en `synaptekai.tech` y `www.synaptekai.tech`** (lo decide el script
  en línea de `Base.astro`). En cualquier otro dominio —localhost, el sitio de prueba— los
  eventos se escriben en la consola como `[GA4 · modo prueba] …`, sin ensuciar los datos reales.
- Un único listener delegado (`src/scripts/medicion.ts`) dispara `contacto_whatsapp` en
  cada clic a un enlace `wa.me`, con dos parámetros: `origen` (el `data-origen` del enlace
  o de su contenedor) y `pagina` (la ruta, sin `.html`).
- Orígenes en uso: `header`, `hero`, `caso`, `renueva-web`, `diseno-web`, `paquete-asistente`,
  `paquete-360`, `visibilidad`, `socio-tecnologico`, `redes`, `videos`, `inventario`,
  `contacto`, `footer`, `flotante` (chat), `privacidad`, `terminos`, y los de las páginas
  nuevas: `servicio-asistentes`, `servicio-web`, `servicio-visibilidad`, `servicio-socio`,
  `servicio-automatizacion`, `servicio-complementarios`, `casos`, `precios`, `gracias-checklist`.
- Un enlace nuevo a WhatsApp necesita su `data-origen`; sin él se registra como `sin-origen`
  (`verificar.js` lo marca como fallo). Usar `BotonWhatsApp.astro` y `waLink()`.

## Modo de prueba por dominio

La misma imagen sirve el sitio real y el de prueba; no hay variables de build. Cuando el
dominio es `nuevo.synaptekai.tech`:

- nginx agrega `X-Robots-Tag: noindex, nofollow` a todas las respuestas;
- `/robots.txt` responde `Disallow: /` (el archivo `public/robots-prueba.txt`);
- la página muestra arriba una franja delgada "Sitio de prueba".

En `synaptekai.tech` no ocurre nada de eso. El dominio de prueba está escrito en dos
lugares: `nginx.conf` (mapa `$sitio_prueba`) y `src/data/negocio.ts` (`dominioPrueba`).

## Para asistentes de IA y buscadores

- **Versión Markdown** de la portada, las 6 páginas de servicio, `/casos` y `/precios`
  (`/index.md`, `/casos.md`, `/servicios/paginas-web.md`…), y **`/llms.txt`**. Todo se
  genera desde `src/data` en `src/lib/markdown.ts`.
- nginx entrega el `.md` de una página cuando la petición trae `Accept: text/markdown`, y
  responde con `Vary: Accept` y una cabecera `Link` hacia el `.md`.
- **Datos estructurados** (JSON-LD): el negocio en todas las páginas (`Base.astro`);
  `Service` con ofertas en PEN, `FAQPage` y `BreadcrumbList` en las páginas de servicio;
  `BreadcrumbList` en el resto de las internas (`src/lib/datosEstructurados.ts`).
- `sitemap.xml` se genera desde `src/data/sitio.ts` (sin gracias, sin 404).
- `public/robots.txt` conserva la directiva `Content-Signal` (ai-train=no). No quitarla.

## nginx

`nginx.conf` decide las cabeceras con `map` y las agrega una sola vez en el bloque
`server`. **No poner `add_header` dentro de un `location`**: en nginx eso anula todas las
cabeceras heredadas para ese `location`.

Incluye: gzip; UTF-8 en `.md` y `.txt`; URLs sin extensión con `try_files`; caché de un año
e inmutable para `/_astro/` (nombres con hash) y `no-cache` para HTML, Markdown y texto;
página 404 propia; `X-Content-Type-Options` y `Referrer-Policy`; redirección 301 de
`www.synaptekai.tech` a `synaptekai.tech`; y el modo de prueba.

Si se agrega una página con versión Markdown fuera de `/`, `/casos`, `/precios` o
`/servicios/…`, hay que sumarla al mapa `$pagina_md`.

## Build

- `npm ci` con `package-lock.json`. Una sola dependencia de producción: `astro`.
  (`@astrojs/check` y `typescript` son solo para `npm run check`, y no se instalan en Docker.)
- `Dockerfile` en dos etapas: Node construye el sitio y nginx lo sirve en el puerto 80.
  La capa de dependencias se reutiliza mientras no cambien `package.json` ni el lock.
- Medido en local (04/10/2026): 18 s sin caché; 6 s cuando solo cambia el código.
- **Pendiente:** actualizar Astro a la versión actual (la migración se quedó a propósito
  en 5.18). Hacerlo aparte, con `verificar.js` y `lighthouse.js` como red de seguridad.

## Localhost

```
npm install            # la primera vez
npm run dev            # desarrollo, con recarga: http://localhost:4321
npm run check          # tipos y plantillas: debe dar 0 errores
```

`npm run dev` sirve para maquetar, pero **no usa nginx**: la negociación de Markdown, la
página 404, las cabeceras y el modo de prueba solo existen en Docker. Para revisar de
verdad, igual que en producción:

```
docker build -t sinaptekai-web:astro .
docker rm -f synaptekai-web-astro
docker run -d --name synaptekai-web-astro -p 8081:80 sinaptekai-web:astro
```

Queda en http://localhost:8081. Para probar el modo de prueba sin tocar DNS:
`curl -sI -H "Host: nuevo.synaptekai.tech" http://localhost:8081/`.

El sitio anterior (rama `main`) se levanta igual en el puerto 8080, con la imagen
`sinaptekai-web:local` y el contenedor `synaptekai-web-local`.

## Verificación

```
node scripts/verificar.js                 # todo, contra http://localhost:8081
node scripts/verificar.js --http          # solo servidor: URLs, cabeceras, metas, Markdown, modo de prueba
node scripts/verificar.js --navegador     # solo navegador
node scripts/verificar.js --capturas dir  # además, capturas de cada página a 375 y 1280 px
node scripts/verificar.js --base https://nuevo.synaptekai.tech
node scripts/lighthouse.js                # Lighthouse móvil en /, un servicio y /casos
```

`verificar.js` usa Chrome o Edge sin ventana y **no toca producción**: las llamadas a n8n
y a Google Analytics se responden ahí mismo con datos simulados, y el formulario del
checklist nunca llega a n8n. Revisa cada página a 375, 768, 1280 y 1440 px (consola,
peticiones fallidas, desborde horizontal, cabecera en una fila), los enlaces a WhatsApp y
su evento, el menú, las anclas, el checklist, el popup, el chat y los videos diferidos.

Metas de Lighthouse (móvil): Rendimiento ≥ 95; Accesibilidad, Buenas prácticas y SEO = 100.
La portada debe pesar menos de 200 kB en la carga inicial.

Nota: si el equipo tiene apagadas las animaciones del sistema, Chrome informa
`prefers-reduced-motion` y desactiva el desplazamiento suave. Las herramientas lo fuerzan
para probar el sitio con movimiento; el modo reducido se prueba aparte.

### Herramientas de la migración (se borran en la Fase 5)

- `scripts/comparar.js`: compara el sitio anterior (puerto 8080) con el nuevo (8081),
  sección por sección. Desde la Fase 2, la cabecera, las tarjetas de Servicios y el
  footer difieren a propósito; y por debajo de 768 px, también los márgenes laterales.
- `scripts/bundle.js` y `scripts/capturas.js`: **obsoletos**. Eran para editar y revisar
  el bundle anterior (`legacy/index.html`).
- `scripts/optimizar-logo.mjs`: generó `src/assets/marca/logo.webp`. Se conserva por si cambia el logo.
