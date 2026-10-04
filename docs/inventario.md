# Inventario del sitio actual (antes de migrar a Astro)

Punto de partida: rama `main`, commit `e019b73` (04/10/2026), igual a `origin/main` y a lo que
sirve https://synaptekai.tech. Todo lo que sigue se leyó del código y se comprobó contra
producción con peticiones de solo lectura. No se envió ningún formulario.

Cada casilla es algo que el sitio hace hoy y que la versión en Astro debe seguir haciendo.
Se marca cuando esté portado y verificado.

Las URLs completas de los webhooks de n8n no se escriben aquí a propósito: se nombran por
su ruta y por la constante del código donde viven.

## 1. Cómo está hecho hoy

- `index.html` (600 kB; 315 kB con gzip) es un bundle exportado de Claude Design. Lleva dentro:
  - la plantilla del sitio (208 kB de HTML, CSS y JavaScript) como un string JSON;
  - React 18.3.1 y ReactDOM en versión UMD (142 kB sin comprimir) y el motor de plantillas
    de la herramienta (69 kB);
  - 9 archivos de fuentes woff2 (122 kB) y el logo en PNG (61 kB), todo en base64.
- Sin JavaScript no se dibuja nada de la plantilla; solo se ve el `<noscript>` de texto.
- El `<head>` existe en dos copias (la cruda y la de la plantilla).
- No hay paso de build, ni `package.json`, ni `node_modules`.
- Las demás páginas (`privacidad.html`, `terminos.html`, `gracias.html`, `bot.html`) son HTML
  escrito a mano, cada una con sus propios estilos.

## 2. Secciones de la portada, en orden

- [ ] Cabecera: logo + "SynaptekAI", menú de 8 enlaces, botón de WhatsApp.
- [ ] `#inicio` — Hero: insignia, H1 en dos tonos, bajada, 2 botones, línea de confianza,
      diagrama animado.
- [ ] `#servicios` — 6 tarjetas (3×2) con línea "En uso en" y la línea hacia
      `#complementarios`. La tarjeta "Páginas Web a Medida" es un enlace a `#diseno-web`.
- [ ] `#como-funciona` — 4 pasos con su duración.
- [ ] `#casos` — 3 tarjetas (Due Hotel, Aquamatic Lavandería, Oral Dent) con chips, problema,
      solución y resultado opcional; bloque de testimonio (hoy `null`: no se dibuja);
      llamado "¿Quieres ser el próximo caso de éxito?".
- [ ] `#diseno-web` — 4 planes + banner "Renueva tu Página Web" + franja de contacto.
- [ ] `#paquetes` — título, chips de 11 rubros, 2 paquetes, `#comparativa` (desplegable),
      `#mas-servicios` (2 tarjetas), `#complementarios` (3 tarjetas compactas con "Ver
      ejemplo"), nota de precios.
- [ ] `#recursos` — texto del checklist + formulario.
- [ ] `#contacto` — título, botón grande de WhatsApp, correo, formulario que abre WhatsApp.
- [ ] `#comentarios` — formulario de comentarios que abre WhatsApp.
- [ ] Footer: marca y lema, enlaces (7), contacto (correo, WhatsApp, dominio), redes
      (Facebook, Instagram), derechos, Política de Privacidad y Términos del Servicio.
- [ ] Modal del checklist ("Antes de irte, llévate esto").
- [ ] Chat flotante.
- [ ] Botón flotante de WhatsApp: existe en el código pero está apagado
      (`showFloatingWa` = false). No se ve.

## 3. Cabecera y menú responsive

- [ ] Siempre en una sola fila. Hoy mide 72–81 px de alto.
- [ ] Desde 1240 px: menú completo (14.5 px, separación 16 px) + botón "Hablar por WhatsApp"
      con texto.
- [ ] De 1024 a 1239 px: menú completo más compacto (14 px; 13.5 px por debajo de 1120) +
      botón de WhatsApp solo ícono.
- [ ] Menos de 1024 px: botón de WhatsApp ícono + menú hamburguesa.
- [ ] Hamburguesa: las barras se transforman en X; `aria-expanded` y `aria-controls`; al
      abrir, el foco va al primer enlace; Escape lo cierra y devuelve el foco al botón; un
      clic fuera lo cierra; elegir un enlace lo cierra.
- [ ] El panel del menú móvil va fuera del `<header>` y no se muestra desde 1024 px.
- [ ] Holgura medida hoy: 31 px en 1024 y en 1240 px. Cualquier enlace nuevo obliga a
      volver a medir.
- [ ] La cabecera no es fija: se va con el scroll.

## 4. Animaciones e interacciones

- [ ] **Constelación del hero** (`<canvas id="hero-constellation">`): malla de puntos con
      brillo tipo estrella y líneas entre vecinos.
  - Modo interactivo (puntero fino, sin `prefers-reduced-motion`): los puntos se apartan del
    cursor y vuelven con un resorte; bucle con `requestAnimationFrame`.
  - Modo estático (táctil o movimiento reducido): un solo dibujo, sin bucle.
- [ ] **Diagrama de flujo sobre el canvas** (`FLOW_NODES`): "Mensaje del cliente" →
      "Agente IA" → "Agenda la cita" / "Registra la reserva" / "Avisa a tu equipo".
      Ciclo de 7.5 s con partículas, anillo en el nodo central y ramas que se encienden;
      los nodos reaccionan al cursor. La constelación se atenúa en la zona del diagrama.
  - Desde 1056 px va a la derecha del texto; por debajo se dibuja en `#hero-flow-spacer`,
    debajo de la línea de confianza (nunca encima del texto), con etiquetas de 12 px.
  - Se recalcula al cambiar el tamaño de la ventana o el alto del hero.
- [ ] **Tarjetas 3D** (`data-tilt-card` dentro de `data-tilt-grid`):
  - entrada escalonada, una vez por grilla (80 ms entre tarjetas, al 15 % visible);
  - con puntero fino: inclinación hasta 6° (1.5° en el banner de Diseño Web), foco de luz
    que sigue al cursor, borde con degradado cónico que gira según el cursor, sombra;
  - variantes: clara (Servicios, Casos), rosa (banner), destacada (paquete recomendado),
    y color propio por tarjeta (`--hover-glow`, `--card-fill`).
- [ ] **Aparición al hacer scroll** (`data-fade`): opacidad + 24 px, 0.7 s, al 12 % visible.
- [ ] **"Cómo funciona"**: una línea que se dibuja en 2 s (horizontal en escritorio, vertical
      por debajo de 768 px) y cada paso aparece cuando la línea llega a él; el número late.
- [ ] **Comparativa**: botón que la abre y cierra, con la flecha girando.
- [ ] **"Ver ejemplo"** (`<details>`): al abrir se carga el póster; al cerrar se pausa el video.
- [ ] **Videos**: sin autoplay; el archivo se pide recién al pulsar reproducir; solo un video
      suena a la vez.
- [ ] **Chat**: anillo de colores girando alrededor del botón, borde animado del panel,
      saludo con salto, pulso y "respiración" (ver sección 7).
- [ ] **Estados hover y foco**: 39 `style-hover` y 29 `style-focus` del motor de la
      herramienta (cambios de color, brillo, contorno de foco). En Astro pasan a ser CSS.
- [ ] `prefers-reduced-motion`: apaga animaciones y transiciones en todo el sitio; el hero
      queda estático, las tarjetas y los pasos aparecen sin animar.
- [ ] Sin JavaScript de animación, el contenido queda visible (los estados ocultos los pone
      el propio script, no el CSS).
- [ ] **Logo animado: no existe.** El logo de la cabecera es un PNG fijo de 324×240 px. Lo
      único animado con forma de ícono es el botón del chat.

## 5. Formularios

### Checklist (2 formularios: sección `#recursos` y modal)

- [ ] Envío: `POST` con `Content-Type: application/json` al webhook de n8n
      `…/webhook/leads-checklist` (constante `LEAD_WEBHOOK_URL`).
- [ ] Cuerpo: `{ nombre, email, negocio, origen }`. `origen` vale `seccion` o `modal`
      (atributo `data-lead-source`; por defecto `landing`).
- [ ] Campos del formulario: `nombre` (text), `email` (email), `negocio` (text), con
      `autocomplete` name / email / organization.
- [ ] Validación propia (`novalidate`): los tres son obligatorios; el correo se revisa con
      una expresión regular; el error aparece al salir del campo y al enviar, con
      `aria-invalid`, borde rojo y foco en el primer campo con error.
  - "Escribe tu nombre para saber cómo dirigirnos a ti."
  - "Escribe tu correo para poder enviarte el PDF."
  - "Ese correo no parece válido. Revisa que tenga el formato nombre@dominio.com."
  - "Cuéntanos el nombre de tu negocio para personalizar el envío."
- [ ] Mientras envía: botón deshabilitado con el texto "Enviando…".
- [ ] Si responde bien: guarda `synaptekai-lead-modal-shown` en `localStorage` y redirige a
      `/gracias.html`.
- [ ] Si falla: rehabilita el botón y muestra "No pudimos enviar tu solicitud. Intenta de
      nuevo o escríbenos por WhatsApp."
- [ ] El workflow de n8n descarga `https://synaptekai.tech/assets/checklist-automatizacion.pdf`
      para adjuntarlo al correo: esa ruta no puede cambiar.

### Contacto (`#contacto`)

- [ ] Campos `nombre` (obligatorio), `negocio`, `mensaje`. No envía a ningún servidor.
- [ ] Abre `https://wa.me/51939584377?text=…` con: `Hola, soy {nombre}[ de {negocio}].
      {mensaje}` (si no hay mensaje: "Quiero saber más sobre los servicios de SynaptekAI.").
- [ ] Dispara `contacto_whatsapp` con origen `contacto`.

### Comentarios (`#comentarios`)

- [ ] Campos `fbNombre` (opcional), `fbComentario` (obligatorio). No publica nada.
- [ ] Abre WhatsApp con: `Comentario de {nombre o "un visitante de la web"}: {comentario}`.
- [ ] No dispara ningún evento de GA4.

## 6. Popup del checklist ("Antes de irte, llévate esto")

- [ ] **No es de salida**: se abre cuando el visitante llega al 70 % del alto de la página
      (`(scrollY + alto de ventana) / alto total ≥ 0.7`).
- [ ] Una sola vez por navegador: clave `synaptekai-lead-modal-shown` en `localStorage`.
      También se marca al enviar con éxito cualquiera de los dos formularios.
- [ ] Al abrir, el foco va al botón de cerrar. Se cierra con la X, con Escape o con un clic
      en el fondo. El tabulador queda atrapado dentro.
- [ ] `role="dialog"`, `aria-modal`, título enlazado. Capa por encima del chat (z-index 200
      contra 150).

## 7. Chat flotante (`#sk-chat-root`)

- [ ] Botón redondo de 68 px abajo a la derecha (16 px del borde en móvil), ícono de robot.
- [ ] Se puede arrastrar; la posición se guarda en `localStorage`
      (`synaptekai-chat-launcher-pos`) y se reajusta al cambiar el tamaño de la ventana.
      Un arrastre no cuenta como clic (umbral de 6 px).
- [ ] Saludo: a los 3 s de cargar, una vez por sesión (`sessionStorage`:
      `synaptekai-chat-greeted-session`; no saluda si ya se abrió el chat en la sesión,
      `synaptekai-chat-opened-session`). El botón salta y pulsa, y aparece la burbuja
      "¿Tienes una duda? Pregúntame." durante 6 s. La burbuja no se muestra si taparía un
      botón del hero; en móvil va encima del botón. Un clic en ella abre el chat.
- [ ] Panel: en escritorio, junto al botón (si se movió) o en la esquina; por debajo de
      768 px ocupa toda la pantalla, respetando las zonas seguras de iOS.
- [ ] Cabecera del panel: "SynaptekAI / Automatización e IA", botón de WhatsApp y cerrar.
- [ ] Primer mensaje: "¡Hola! Soy el asistente de SynaptekAI. ¿Qué te gustaría automatizar?"
- [ ] Lista `SERVICIOS` (8, en este orden y con estos `id`): `asistentes`, `web`,
      `visibilidad`, `socio`, `automatizacion`, `redes`, `videos`, `inventario`. Los tres
      últimos llevan `bajoPedido`: chip punteado y aviso "Servicio complementario · bajo
      pedido" en la respuesta.
- [ ] Respuesta a un chip o a un texto que coincide: descripción, precio y botón "Hablar por
      WhatsApp" con el mensaje "Hola, me interesa el servicio de {nombre}".
- [ ] Texto libre: gana la palabra clave más larga; si nada coincide, "Entiendo. Déjame
      conectarte con una persona. ¿Te escribimos por WhatsApp?".
- [ ] Botón de Calendly: en el código, oculto porque `CALENDLY_URL` está vacío.
- [ ] Accesibilidad: `role="dialog"`, foco atrapado, Escape cierra, el foco vuelve a donde
      estaba, registro con `aria-live`.
- [ ] Envío del resumen: `POST` JSON al webhook `…/webhook/chat-widget` (constante
      `WEBHOOK_URL`), una sola vez por carga de página y solo si hubo algo más que el saludo.
      Se dispara al cerrar el panel, a los 60 s sin actividad, o al ocultarse o salir de la
      página con el panel abierto (`sendBeacon`).
- [ ] Cuerpo: `{ timestamp, sessionId, servicioElegido, mensajes: [{ from, text, ts }],
      userAgent, referrer, paginaOrigen }`. `servicioElegido` es el `id` del último servicio
      mostrado, o `null`.
- [ ] Todo el contenedor lleva `data-origen="flotante"` para la medición.

## 8. Página de gracias

- [ ] URL a la que redirige el formulario: **`/gracias.html`**. `/gracias` también responde 200.
- [ ] `noindex`, canonical a `https://synaptekai.tech/gracias.html`. No está en el sitemap.
- [ ] Contenido: título, botón "Descargar el checklist ahora" (descarga el PDF con el nombre
      `Checklist-Automatizacion-SynaptekAI.pdf`), aviso de revisar el correo, botón de
      WhatsApp ("Hola, acabo de descargar el checklist de automatización"), "Volver al inicio".
- [ ] Bloque de video que solo aparece si existe `/assets/videos/gracias.mp4`. Hoy ese
      archivo no existe (404), así que no se ve.
- [ ] Carga GA4. Su botón de WhatsApp hoy **no** dispara `contacto_whatsapp`.
- [ ] Declara la fuente Space Grotesk pero no la carga: se ve con la fuente del sistema.

## 9. Google Analytics 4

- [ ] Propiedad `G-Q01K6J04NG`, cargada una vez en la portada, en `/privacidad`, en
      `/terminos` y en la página de gracias. `/bot.html` no la carga.
- [ ] Único evento propio: `contacto_whatsapp` con el parámetro `origen`, desde un listener
      delegado sobre `document` que solo existe en la portada.
- [ ] Orígenes en uso (17 enlaces en la página, más el del panel hamburguesa cuando está
      abierto y el formulario de contacto): `header` (botón de escritorio, botón ícono y
      panel hamburguesa), `hero`, `caso`, `renueva-web`, `diseno-web`, `paquete-asistente`,
      `paquete-360`, `visibilidad`, `socio-tecnologico`, `redes`, `videos`, `inventario`,
      `contacto` (botón y formulario), `footer`, `flotante` (chat). Sin marca: `sin-origen`.
- [ ] Los enlaces a WhatsApp de `/privacidad`, `/terminos` y gracias no se miden hoy.

## 10. URLs que responden hoy

Comprobadas en producción el 04/10/2026.

| URL | Respuesta |
|---|---|
| `/` y `/index.html` | 200 HTML |
| `/index.md` | 200 `text/markdown; charset=utf-8` |
| `/llms.txt` | 200 `text/plain; charset=utf-8` |
| `/robots.txt` | 200 |
| `/sitemap.xml` | 200 `text/xml` |
| `/privacidad` y `/privacidad.html` | 200, sin redirección |
| `/terminos` y `/terminos.html` | 200, sin redirección |
| `/bot` y `/bot.html` | 200 |
| `/gracias` y `/gracias.html` | 200 |
| `/assets/checklist-automatizacion.pdf` | 200 `application/pdf`, 889 165 bytes |
| `/assets/og-image.jpg` | 200 |
| `/assets/favicon.ico`, `favicon-48x48.png`, `-96x96`, `-144x144`, `-192x192`, `-512x512`, `apple-touch-icon.png` | 200 |
| `/assets/videos/oral-dent-demo.mp4` (8.5 MB), `inventario-boletas-demo.mp4` (5.7 MB) | 200, con `Accept-Ranges` |
| `/assets/videos/oral-dent-poster.jpg`, `inventario-boletas-poster.jpg` | 200 |
| cualquier otra ruta | 404 con la página por defecto de nginx |

- [ ] `http://` → `https://` (301). No está en `nginx.conf`: lo hace el proxy que va delante
      del contenedor.
- [ ] `www.synaptekai.tech` → `synaptekai.tech` (301, conserva ruta y parámetros).
- [ ] Anclas de la portada usadas desde otras páginas: `/#inicio`, `/#servicios`,
      `/#como-funciona`, `/#casos`, `/#diseno-web`, `/#paquetes`, `/#recursos`, `/#contacto`.
      Dentro de la portada además `#complementarios`.
- [ ] `sitemap.xml` lista `/`, `/privacidad`, `/terminos` y `/bot.html`.

## 11. Reglas de `nginx.conf`

- [ ] `map` de `Accept`: si pide `text/markdown`, `/` devuelve `index.md`. Solo vale para la
      portada.
- [ ] `/` añade `Link: </index.md>; rel="alternate"; type="text/markdown"`.
- [ ] `/index.md` se sirve como `text/markdown`.
- [ ] gzip: `gzip on`, nivel 6, mínimo 1024 bytes, `gzip_proxied any`, `gzip_vary on`, para
      HTML, CSS, JavaScript, JSON, SVG, texto plano y Markdown.
- [ ] `charset utf-8` en HTML, texto plano y Markdown.
- [ ] `try_files $uri $uri.html $uri/ =404`: por eso `/privacidad`, `/terminos`, `/bot` y
      `/gracias` responden sin extensión.
- [ ] Servidor aparte para `www`: 301 al dominio sin `www`.
- [ ] No hay cabeceras de caché, ni `X-Content-Type-Options`, ni `Referrer-Policy`, ni
      página 404 propia.
- [ ] La respuesta Markdown de `/` no lleva `Vary: Accept`.

## 12. Qué copia el `Dockerfile`

Imagen `nginx:alpine`, puerto 80. Copia uno por uno: `index.html`, `index.md`,
`privacidad.html`, `terminos.html`, `bot.html`, `gracias.html`, `robots.txt`, `llms.txt`,
`sitemap.xml`, la carpeta `assets/` y `nginx.conf`. Nada más llega a producción
(`CLAUDE.md`, `scripts/` y `docs/` responden 404).

## 13. Qué es `/bot.html`

- [ ] Página pública que explica **SynaptekAI-Bot**, el user-agent con el que se auditan
      sitios de negocios peruanos para la prospección comercial: qué hace, cómo se
      identifica, qué reglas respeta y cómo pedir que no visite un sitio.
- [ ] El bot se identifica como `SynaptekAI-Bot/1.0 (+https://synaptekai.tech/bot)`: esa
      dirección, **sin `.html`**, viaja en cada petición del bot. `/bot` y `/bot.html`
      tienen que seguir respondiendo.
- [ ] Correo de contacto propio (`info@synaptekai.tech`) y dirección postal completa.
- [ ] Estilo aparte (fondo blanco, Arial), sin cabecera, sin GA4, sin enlaces al resto del sitio.

## 14. Fuentes

- [ ] Dos familias, no una: **Manrope** (texto y la mayoría de títulos; pesos 400, 500, 600,
      700 y 800) y **Space Grotesk** (títulos de Casos, Diseño Web, Paquetes y tarjetas;
      pesos 600 y 700).
- [ ] En la portada van embebidas en el bundle en base64: 6 archivos de Manrope y 3 de Space
      Grotesk, uno por rango de caracteres (latín, latín extendido, cirílico, griego,
      vietnamita). Son fuentes variables: un mismo archivo sirve todos los pesos.
- [ ] `/privacidad` y `/terminos` las cargan de Google Fonts (`fonts.googleapis.com` y
      `fonts.gstatic.com`): es la única llamada a un tercero aparte de GA4.
- [ ] La página de gracias y `/bot.html` no cargan ninguna fuente web.
- [ ] El diagrama del hero escribe sus etiquetas con la fuente del sistema, no con Manrope.

## 15. Datos que guarda el navegador

- [ ] `localStorage` `synaptekai-lead-modal-shown`: el popup ya se mostró o el checklist ya se pidió.
- [ ] `localStorage` `synaptekai-chat-launcher-pos`: posición del botón del chat.
- [ ] `sessionStorage` `synaptekai-chat-greeted-session`: el chat ya saludó.
- [ ] `sessionStorage` `synaptekai-chat-opened-session`: el chat ya se abrió.

Hay que conservar los mismos nombres para que quien ya visitó el sitio no vuelva a ver el
popup ni pierda la posición del chat.

## 16. SEO y lectura por máquinas

- [ ] `<title>`, descripción, canonical, Open Graph (con `og-image.jpg` de 1200×630) y
      Twitter Card en la portada.
- [ ] JSON-LD `ProfessionalService` con catálogo de 6 servicios, en el HTML del servidor.
- [ ] `<noscript>` con la versión en texto del sitio.
- [ ] `index.md` (versión Markdown de la portada) y `llms.txt`.
- [ ] `robots.txt`: permite todo, nombra los bots de búsqueda de IA permitidos, bloquea los
      de entrenamiento, `Content-Signal: ai-train=no, search=yes, ai-input=yes` y el sitemap.
- [ ] `favicon.ico`, PNG de 48, 96, 192 y 512 px enlazados desde el `<head>` (el de 144 px
      existe como archivo pero ninguna página lo enlaza) y `apple-touch-icon`.

## 17. Lo que el encargo menciona y no coincide con el sitio

- **"Logo animado"**: no hay. Ver sección 4.
- **"Popup de salida"**: no detecta la salida; aparece al 70 % de scroll. Ver sección 6.
- **"Fuente Space Grotesk"**: el sitio usa dos familias, y la principal es Manrope. Ver
  sección 14.
- **`/bot.html`**: también hay que conservar `/bot`. Ver sección 13.
