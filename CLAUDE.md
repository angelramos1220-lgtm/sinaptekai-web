# SynaptekAI — sitio web (sinaptekai-web)

> **Rama `astro`: migración en curso (Fase 1 terminada).** En esta rama el sitio es un
> proyecto Astro 5 y su código vive en `src/` (datos en `src/data/`, con
> `src/data/precios.ts` como fuente única de los montos). El resto de este archivo
> todavía describe el sitio anterior (el bundle, que quedó en `legacy/index.html`) y se
> reescribe en la Fase 3. Mientras tanto:
>
> - Estado de la migración: `docs/inventario.md`, `docs/fase-1-diferencias.md` y
>   `docs/textos-nuevos.md`.
> - Reglas de la migración: nunca commit, merge ni push sobre `main` hasta la Fase 5 y
>   con aprobación explícita; commits locales en `astro`; push de `astro` solo con
>   aprobación; ningún texto nuevo sin listarlo en `docs/textos-nuevos.md`.
> - Sitio nuevo en localhost: `docker build -t sinaptekai-web:astro .`,
>   `docker rm -f synaptekai-web-astro`,
>   `docker run -d --name synaptekai-web-astro -p 8081:80 sinaptekai-web:astro`.
> - Comparación con el sitio actual (que debe estar en `localhost:8080`):
>   `node scripts/comparar.js --comportamiento`.

Landing de SynaptekAI: https://synaptekai.tech. Solo en español, precios solo en soles.
Este archivo existe para que una sesión nueva no arranque de cero. No contiene
contraseñas, tokens ni URLs de webhooks, y no debe contenerlos.

## Contexto del proyecto

- **Repo:** github.com/angelramos1220-lgtm/sinaptekai-web, rama `main`. El sitio se hizo con
  Claude Design y desde entonces se edita con Claude Code; el repo es la única fuente de verdad.
- **Despliegue:** Easypanel (proyecto "synaptekai", servicio "sitio-web") publica
  automáticamente cada push a `main`. **Un push = producción.**
- **Integraciones con n8n que no se pueden romper:**
  - El formulario del checklist (sección Recursos y modal) hace POST a un webhook de n8n que
    guarda el lead y envía por correo `assets/checklist-automatizacion.pdf`. No cambiar el
    nombre ni la ruta de ese PDF.
  - El chat del sitio envía un resumen de la conversación a otro webhook (campo
    `servicioElegido` = `id` del servicio en `SERVICIOS`).
  - No cambiar URLs de webhooks ni nombres de campos de formularios.
  - **La página no llama a n8n al cargar.** Solo lo hacen el formulario del checklist al
    enviarse y el chat al terminar una conversación. El bloque de métricas de la sección
    Casos (contador de citas alimentado por un webhook GET) se retiró el 03/10/2026: con
    cifras bajas restaba credibilidad. No volver a agregarlo sin pedirlo.
- **Formulario de comentarios:** no publica nada; abre WhatsApp con el mensaje prellenado.
- **Videos:** carga diferida. En una carga normal el navegador solo pide la página y el
  favicon; el póster y el video se piden recién al abrir "Ver ejemplo" y pulsar reproducir.
  No romperlo.
- **`/privacidad` y `/terminos`** deben seguir respondiendo 200: sus URLs están registradas
  en la pantalla de consentimiento OAuth de Google.
- **Google Analytics 4:** `G-Q01K6J04NG`, cargado una sola vez en la cabecera cruda de
  `index.html`. No duplicar `gtag('config', …)`.
- **Estilo:** tema oscuro, acentos índigo/violeta y teal, tipografía Space Grotesk + Manrope.

## Reglas de trabajo

- **No hacer commit ni push sin aprobación.** Al terminar un cambio: levantarlo en localhost
  y esperar la revisión.
- **No inventar datos, cifras ni citas.** Usar los textos que se entregan; si algo no encaja
  en el diseño, acortarlo sin cambiar el sentido y avisar.
- Enlaces de WhatsApp: `https://wa.me/51939584377?text=<mensaje con encodeURIComponent>`.
- Verificar cada cambio en **375 px, 768 px y 1280 px** de ancho.
- Los casos de **Due Hotel y Aquamatic** están autorizados por el cliente solo para este
  sitio web. No crear piezas para redes sociales con ellos.
- Nunca usar la palabra "hostal". Due Hotel es un hotel corporativo.
- Como clientes solo se nombran los tres casos vigentes: Due Hotel, Aquamatic y Oral Dent.
  Ningún cliente anterior se menciona en el sitio ni en sus archivos de texto.
- No tocar, borrar ni subir las copias locales `.gstack/`, `Pagina WEB/`,
  `SynaptekAI landing page/` y `SynaptekAI landing page.zip` (están en `.gitignore`).
- **Nunca usar `docker container prune`** (ni `docker system prune`): borra todos los
  contenedores detenidos de la máquina, no solo el de este sitio. Para reiniciar el
  contenedor local se usa `docker rm -f synaptekai-web-local`.

## Cómo está hecho: `index.html` es un bundle

`index.html` no es HTML escrito a mano. Al cargar, un script desempaqueta los recursos
embebidos y reemplaza el documento entero por el contenido de
`<script type="__bundler/template">`: un string JSON, sin comprimir, con todo el sitio
(HTML, CSS, textos y la clase `Component`). Consecuencias:

- **Todo lo que se agregue fuera de ese string desaparece** en un navegador real, aunque en
  el archivo se vea dentro de `<body>`. Secciones, estilos y scripts nuevos van dentro de la
  plantilla.
- **El `<head>` existe en dos copias** y hay que cambiar las dos:
  1. la cabecera cruda de `index.html` (lo que entrega el servidor y leen los bots que no
     ejecutan JavaScript: WhatsApp, Facebook, bots de IA). Aquí viven también GA4, el
     JSON-LD estático y los estilos de `<noscript>`;
  2. la cabecera dentro de la plantilla (la que queda en el DOM tras el reemplazo y ve
     Google al renderizar). Lleva el mismo `<title>`, metas y JSON-LD.
- El `<noscript>` con la versión en texto del sitio está en el `<body>` crudo de
  `index.html`, no en la plantilla.

## Cómo editar el contenido: `scripts/bundle.js`

Nunca editar el bloque `__bundler/template` a mano dentro de `index.html`.

```
node scripts/bundle.js extract   # index.html -> .work/template.html
#   …editar .work/template.html como HTML/JS normal…
node scripts/bundle.js pack      # .work/template.html -> index.html
node scripts/bundle.js verify    # comprueba el bundle y si la copia está al día
```

- `extract` se niega a trabajar si recodificar el bloque actual no lo reproduce byte a byte.
- `pack` no toca nada fuera del bloque y, después de escribir, relee `index.html` y comprueba
  que decodifica exactamente a lo editado. También frena si detecta texto con codificación rota.
- `.work/` está en `.gitignore`: la copia de trabajo no se sube. La fuente es `index.html`.
- La cabecera cruda y el `<noscript>` se editan directo en `index.html` (están fuera del bloque).

## Dónde vive cada texto (dentro de `.work/template.html`)

| Qué | Dónde |
|---|---|
| Hero, Servicios (6 tarjetas y su línea "En uso en"), Cómo funciona, Diseño Web, "Renueva tu Página Web", títulos de Paquetes / Más servicios / Complementarios, Recursos, Contacto, footer | diccionario `T` de la clase `Component` |
| Casos de éxito (chips, problema, solución, resultado) | `casosExitoData`. El título de la sección está fijo en el marcado de `#casos` |
| Testimonio bajo los casos | `testimonioData` (`null` = no se renderiza nada) |
| Paquetes (Asistente Virtual, Crecimiento 360°) | `packagesData` |
| Comparativa de paquetes (2 columnas) | `featuresData`; debe coincidir con las viñetas de `packagesData` |
| Chips de rubros sobre los paquetes | `rubroChipsData` |
| "Más servicios" (Visibilidad en Google e IA, Socio Tecnológico) | `masServiciosData` |
| "Servicios complementarios" bajo pedido (Redes Sociales con IA, Videos con IA, Inventario + Boletas) | `complementariosData` |
| Planes de Diseño Web | `webPlansData` |
| Etiquetas del diagrama animado del hero | `FLOW_NODES`, dentro de `initHeroConstellation()` (se dibuja en un `<canvas>`, no es HTML) |
| Base de conocimiento del chat (nombre, descripción, precio y palabras clave por servicio) | `SERVICIOS`, en el script del widget al final de la plantilla |
| `<title>`, metas, Open Graph, Twitter, JSON-LD | las dos cabeceras (ver arriba) |

Los precios aparecen en `packagesData`, `masServiciosData`, `complementariosData`,
`webPlansData`, `T.webPromoPrice` y `SERVICIOS` (chat).

**Todo cambio de contenido se replica fuera de la plantilla** en:

- `index.md` — versión Markdown de la portada, que nginx sirve a quien pide `text/markdown`;
- `llms.txt` — resumen en texto plano para bots de IA (no ejecutan JavaScript);
- el `<noscript>` del `<body>` crudo y los dos JSON-LD, si cambia un servicio principal, un
  caso o el contacto.

## Secciones y anclas

`#inicio` (hero) · `#servicios` · `#como-funciona` · `#casos` · `#diseno-web` · `#paquetes`
· `#recursos` · `#contacto` · `#comentarios` · footer · chat flotante (`#sk-chat-root`).

Dentro de `#paquetes`, en este orden: las 2 tarjetas de paquetes, `#comparativa` (justo
debajo, con su mismo ancho), `#mas-servicios`, `#complementarios` y la nota de precios.

Cabecera: siempre en una sola fila. Desde 1240 px, menú completo y botón "Hablar por
WhatsApp" con texto; de 1024 a 1239 px, menú completo más compacto y botón de WhatsApp solo
ícono; por debajo de 1024 px, menú hamburguesa. Un enlace nuevo en el menú obliga a
revisar que siga cabiendo (`scripts/capturas.js` mide la holgura y avisa si se pasa).

Diseño Web: los 4 planes van en una fila (2 columnas por debajo de 1240 px, 1 por debajo
de 640 px) y "Renueva tu Página Web" ocupa todo el ancho debajo; desde 1024 px es un
banner horizontal, por debajo se apila.

Diagrama del hero: desde 1056 px de ancho va a la derecha del texto; por debajo se dibuja en
`#hero-flow-spacer`, debajo de la línea de confianza, para no tapar texto nunca.

## Medición

Cada enlace a `wa.me` dispara el evento GA4 `contacto_whatsapp` con el parámetro `origen`.
Lo hace un único listener delegado (`initWaTracking`), que lee el `data-origen` del enlace o
de su contenedor. Valores en uso: `header`, `hero`, `caso`, `renueva-web`, `diseno-web`,
`paquete-asistente`, `paquete-360`, `visibilidad`, `socio-tecnologico`, `redes`, `videos`,
`inventario`, `contacto`, `footer`, `flotante` (chat). Un enlace nuevo a WhatsApp necesita su
`data-origen`; sin él se registra como `sin-origen`.

## Localhost

No hay paso de build. El sitio se sirve con nginx, igual que en producción:

```
docker build -t sinaptekai-web:local .
docker rm -f synaptekai-web-local
docker run -d --name synaptekai-web-local -p 8080:80 sinaptekai-web:local
```

Queda en http://localhost:8080. Un servidor estático simple no sirve: `/privacidad` y
`/terminos` (sin extensión) y la negociación de Markdown dependen de `nginx.conf`.

Para reiniciar basta repetir los tres comandos: `docker rm -f synaptekai-web-local` quita
solo ese contenedor. Nunca `docker container prune` (ver Reglas de trabajo).

Ojo: al abrirlo en un navegador normal, la página envía datos a GA4 igual que en producción.

## Verificación

```
node scripts/capturas.js             # capturas a 375, 768 y 1280 px en .work/capturas/
node scripts/capturas.js --estados   # además: comparativa abierta, "Ver ejemplo", menú hamburguesa y chat
node scripts/capturas.js --eventos   # lista los enlaces a wa.me y prueba contacto_whatsapp
node scripts/capturas.js --widths 375,768,1024,1280,1440   # otros anchos
```

Usa Chrome o Edge sin ventana contra http://localhost:8080 y **no toca producción**: las
llamadas a n8n y a Google Analytics se responden con datos simulados. Avisa si hay errores
de consola, desborde horizontal, una cabecera que ocupa más de una fila o una llamada a
n8n al cargar la página.

Comprobaciones rápidas del servidor:

```
curl -sI -H "Accept-Encoding: gzip" http://localhost:8080/   # debe traer Content-Encoding: gzip
curl -s http://localhost:8080/ | grep ld+json                # JSON-LD en el HTML del servidor
```

## Qué se publica

El `Dockerfile` copia los archivos uno por uno: `index.html`, `index.md`, `llms.txt`,
`privacidad.html`, `terminos.html`, `bot.html`, `gracias.html`, `robots.txt`, `sitemap.xml`,
`assets/` y `nginx.conf`. **Un archivo nuevo no se publica si no se agrega su `COPY`.**
`scripts/`, `CLAUDE.md` y `.work/` no se publican.

Al cambiar la portada, actualizar el `lastmod` correspondiente en `sitemap.xml`.
