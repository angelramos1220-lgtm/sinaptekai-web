# Fase 1 — Comparación de la portada: sitio actual vs. Astro

Fecha: 04/10/2026. Sitio actual: rama `main` (`e019b73`) en `localhost:8080`.
Sitio nuevo: rama `astro` en `localhost:8081`. Herramienta: `scripts/comparar.js`
(Chrome sin ventana; las llamadas a n8n y a GA4 se simulan, no llegan a producción).

Capturas de los dos sitios en `.work/comparacion/actual` y `.work/comparacion/nuevo`
(portada y las 11 secciones, en 375, 768, 1280 y 1440 px). Informe completo en
`.work/comparacion/informe.md`.

## Resultado

| Qué se comparó | Resultado |
|---|---|
| Alto total de la página | Idéntico en los 4 anchos (21 319 / 13 969 / 10 467 / 10 359 px) |
| Texto visible, sección por sección | 0 diferencias (entre 261 y 270 bloques de texto, según el ancho) |
| Posición y tamaño de cada texto, tarjeta, enlace, botón y campo | 0 diferencias de más de 1 px |
| Tipografía, peso, tamaño, color e interlineado | 0 diferencias |
| Reglas `:hover` y `:focus` de cada elemento | 0 diferencias (20 reglas, hasta 50 elementos) |
| `<title>`, descripción, canonical, Open Graph y Twitter | 14 de 14 iguales |
| JSON-LD | Idéntico |
| Desborde horizontal | Ninguno, en ningún ancho |
| Consola | Sin errores propios (ver nota sobre `gracias.mp4`) |

Comportamiento, probado en los dos sitios con el mismo guion:

| Qué | Resultado |
|---|---|
| Formulario del checklist: validación, webhook, tipo y cuerpo de la petición | Igual: `POST …/webhook/leads-checklist`, `application/json`, `{ nombre, email, negocio, origen }` |
| Después de enviar | Igual: redirige a `/gracias.html` y guarda `synaptekai-lead-modal-shown` |
| Chat: 8 chips, respuestas, mensajes de WhatsApp | Igual |
| Chat: envío al webhook | Igual: mismas 7 claves, `servicioElegido` con su `id`, una vez por carga |
| Popup del checklist | Igual: oculto al 45 %, visible al 72 %, foco en cerrar, Escape lo cierra |
| Saludo del chat a los 3 s | Igual |
| Hero: constelación y diagrama | Igual: 464 puntos en escritorio (interactivo), 225 en móvil (estático, apilado) |
| Tarjetas 3D al pasar el cursor | Igual: misma inclinación, foco de luz, ángulo del borde y sombra |
| Comparativa, "Ver ejemplo", menú hamburguesa | Igual |
| Videos y pósters diferidos | Igual: nada se pide hasta abrir "Ver ejemplo" |
| Eventos `contacto_whatsapp` | Mismos orígenes y mensajes |

## Diferencias que quedan

### Visibles

1. **Ya no hay pantalla de carga.** El sitio actual muestra un ícono y "Unpacking…"
   mientras se desempaqueta; el nuevo muestra el contenido de inmediato.
2. **Con movimiento reducido, el anillo del botón del chat ya no gira.** En el sitio
   actual sigue girando aunque el visitante pida menos animación; es un defecto del
   actual, y el encargo pide respetar `prefers-reduced-motion`.
3. **Al entrar con un ancla** (`/#paquetes`) el navegador salta directo a la sección. El
   sitio actual llegaba con un desplazamiento suave porque tenía que esperar a que
   JavaScript dibujara la página.

### No visibles

4. El panel del menú hamburguesa y la tabla de la comparativa están siempre en el HTML,
   ocultos. Antes JavaScript los creaba al abrirlos. Por eso el nuevo tiene un enlace a
   WhatsApp más en el HTML (el del panel), con su mismo origen `header`.
5. GA4 solo se carga en `synaptekai.tech` y `www.synaptekai.tech`. En `localhost` los
   eventos se escriben en la consola (`[GA4 · modo prueba] contacto_whatsapp …`).
6. Logo: WebP de 135×100 px (6.7 kB) en vez del PNG de 324×240 (61 kB). Mismo tamaño
   en pantalla.
7. Fuentes: solo el subconjunto latino de Manrope y Space Grotesk (47 kB entre las dos).
   Se dejaron fuera cirílico, griego, vietnamita y latín extendido, que el sitio no usa.
8. Ya no hace falta el `<noscript>` de texto: el contenido completo está en el HTML.
9. Los textos ya no van envueltos en `<span class="sc-interp">` (lo hacía el motor viejo).

### Lo que no se portó, a propósito

- El botón flotante de WhatsApp: existe en el código actual pero está apagado y no se ve.
- Las claves del diccionario `T` que ninguna parte de la página usa (`case…`, `chat…`).
- El desplazamiento suave al entrar con ancla (ver punto 3).

## Peso de la carga inicial de la portada

| | Actual | Nuevo |
|---|---|---|
| HTML (gzip) | 315 kB | 25 kB |
| Fuentes | dentro del HTML | 47 kB (2 archivos) |
| JavaScript (gzip) | dentro del HTML | 10 kB |
| Logo | dentro del HTML | 6.7 kB |
| **Total transferido** | **320 kB** en 2 peticiones | **93 kB** en 12 peticiones |

Sin JavaScript, el sitio nuevo muestra las 9 secciones completas (10 761 caracteres de
texto); el actual solo muestra el resumen del `<noscript>` (2 161).

Pendiente para la Fase 3: el JavaScript sale repartido en 8 archivos pequeños; conviene
juntarlos para bajar el número de peticiones.

## Nota: `gracias.mp4`

Al enviar el checklist, la página de gracias pide `/assets/videos/gracias.mp4`, que no
existe (404). Pasa igual en los dos sitios: la página de gracias todavía es la misma. Se
resuelve en la Fase 2, cuando esa página pase al layout nuevo.

## Dato del equipo de pruebas

Este equipo tiene las animaciones del sistema desactivadas, así que Chrome informa
`prefers-reduced-motion: reduce` y el sitio se ve en modo estático (hero sin animar,
tarjetas sin entrada escalonada). Para probar las animaciones, la herramienta fuerza el
modo con movimiento. Si al revisar en tu navegador el hero no se mueve, es por esto, y
pasa igual en el sitio actual.

## Cambio posterior aprobado: márgenes laterales en móvil (Fase 4, 04/10/2026)

El sitio anterior dejaba 48 px de margen a cada lado en las secciones de la portada
también en móvil (solo el hero bajaba a 20 px). A pedido, como excepción a la paridad,
**por debajo de 768 px todo el sitio usa 20 px de margen lateral**: las 8 secciones de la
portada, el footer, la cabecera y el panel del menú (estos dos tenían 16 px). El
contenido gana 56 px de ancho en un teléfono de 375 px y la portada queda unos 1 800 px
más corta.

A 768 px o más no cambia nada: la portada sigue idéntica al sitio anterior. El valor
vive en un solo lugar, el token `--margen-lateral` de `src/styles/global.css`.
