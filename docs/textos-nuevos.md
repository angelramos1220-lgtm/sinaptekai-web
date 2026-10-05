# Textos nuevos (para revisión)

Aquí se lista todo texto que **no existe hoy** en synaptekai.tech y que la migración
agrega.

> **Revisado y aprobado el 04/10/2026**, con los 16 cambios de la sección siguiente.
> Todo lo demás de este documento quedó aprobado tal cual. Un texto nuevo que se agregue
> después de esa fecha va en una sección aparte, al final, hasta que se revise.

## Revisión del 04/10/2026 — cambios pedidos y aplicados

Todos están en `src/data`, así que salen igual en las páginas, en las versiones Markdown,
en `llms.txt` y en los datos estructurados.

**Cambian un texto que ya está publicado en la portada actual:**

| # | Dónde | Antes | Ahora |
| --- | --- | --- | --- |
| 1 | Paso 04 de "Cómo funciona" | …La primera semana es de prueba: si no te sirve, no seguimos. | …La primera semana es de prueba, sin costo: si no te sirve, no seguimos. |
| 12 | Visibilidad, viñeta de medición | Google Analytics y Search Console midiendo cada contacto por WhatsApp | Google Analytics mide cada contacto por WhatsApp y Search Console muestra cómo te buscan en Google |
| 13 | Visibilidad, viñeta de Ads | Google Ads con medición de conversiones (opcional; la pauta la pagas directo a Google) | Google Ads con medición de conversiones (opcional, se cotiza aparte; la pauta la pagas directo a Google) |
| 15 | Videos con IA, viñeta | 4 videos al mes en el plan Full, con guion generado por IA | 2 videos al mes en el plan Básico y 4 en el Full, con guion generado por IA |

La frase del punto 1 está escrita una sola vez (`semanaDePrueba`, en `src/data/pasos.ts`)
y la usan el paso 04 y la pregunta frecuente de Asistentes. El "2" del plan Básico es un
dato nuevo: está en `src/data/precios.ts` (`videosAlMesBasico`), junto al "4" del Full.

**Notas nuevas:**

| # | Texto | Dónde aparece |
| --- | --- | --- |
| 14 | `Las tarjetas QR/NFC y la gestión de Google Ads se cotizan aparte.` | Portada: tarjeta de Visibilidad, bajo el precio. `/servicios/visibilidad-google-ia`: bajo el precio. `/precios`: en "Para tener en cuenta" |
| 16 | `El mantenimiento mensual es opcional.` | Portada: bajo los 4 planes de Diseño Web. `/servicios/paginas-web`: bajo los 4 planes y bajo la lista de precios. `/precios`: en "Para tener en cuenta" |

**Preguntas frecuentes (puntos 1 a 11):** cambiaron 11 respuestas; quedaron como se lee
más abajo, en "Preguntas frecuentes".

Cómo leerlo:

- **Nuevo**: lo redacté yo. Es lo que más conviene revisar.
- **Reutilizado**: frase que ya está publicada hoy; solo aparece en un lugar nuevo. Se
  indica de dónde sale. No hace falta aprobarla otra vez, pero sí confirmar que te parece
  bien verla ahí.
- Los montos no están escritos en ningún texto: salen todos de `src/data/precios.ts`.
  Si cambia un precio, cambia solo en todas las páginas, en los datos estructurados y en
  las versiones Markdown.

Dónde se edita cada cosa: los textos de las páginas internas están en
`src/data/textosPaginas.ts`; los de cada página de servicio (incluidas sus preguntas
frecuentes), en `src/data/paginasServicio.ts`.

---

## Fase 1 — Portada

Ninguno. La portada nueva tiene exactamente los mismos textos que la actual.

Lo único nuevo son dos atributos para lectores de pantalla, sin texto propio:
el botón de la comparativa ahora declara `aria-expanded` y `aria-controls`.

## Fase 2 — Menú, portada y footer

| Texto | Dónde | Tipo |
| --- | --- | --- |
| `Precios` | Menú, footer, migas y rótulo de `/precios` | **Nuevo** |
| `Ver más →` | Enlace en cada una de las 6 tarjetas de Servicios de la portada y en cada fila de `/precios` | **Nuevo** |
| `sobre` | Solo para lectores de pantalla: el enlace anterior se lee "Ver más sobre Páginas Web a Medida". No se ve | **Nuevo** |
| `Menú principal`, `Estás en`, `Pie de página` | Solo para lectores de pantalla (nombre del menú, de las migas y del footer). No se ven | **Nuevo** |
| `Asistentes Virtuales`, `Páginas Web a Medida`, `Visibilidad en Google e IA`, `Socio Tecnológico`, `Automatización de Procesos`, `Servicios complementarios` | Submenú "Servicios" y columna "Servicios" del footer | Reutilizado: nombres que ya usa el sitio (chat, tarjetas y secciones) |

Cambios de menú que pediste (no son textos nuevos, pero cambian lo que se ve):

- El menú pasa a ser: **Servicios ▾ · Casos de éxito · Precios · Cómo funciona · Recursos · Contacto**.
  Salen del menú "Inicio", "Diseño Web" y "Paquetes" (el logo sigue llevando al inicio; las
  dos secciones siguen en la portada y se llega a ellas desde las tarjetas y desde las
  páginas de servicio).
- El footer suma la columna "Servicios" con las 6 páginas y el enlace "Precios". "Inicio"
  se queda en el footer.
- La tarjeta "Páginas Web a Medida" de la portada ya no es un enlace entero a la sección
  "Diseño Web": ahora lleva, como las otras cinco, su enlace "Ver más →" a su página.

## Fase 2 — Plantilla de las páginas de servicio

| Texto | Dónde | Tipo |
| --- | --- | --- |
| `Qué incluye` | Título de sección | **Nuevo** |
| `Precio` | Título de sección | **Nuevo** |
| `En uso en` | Título de sección | Reutilizado: es el "En uso en:" de las tarjetas de la portada, sin los dos puntos |
| `Ver el caso completo →` | Enlace de cada caso hacia `/casos#…` | **Nuevo** |
| `Preguntas frecuentes` | Título de sección | **Nuevo** |
| `Comparativa de los paquetes` | Subtítulo sobre la tabla comparativa, en `/servicios/asistentes-whatsapp` | **Nuevo** |
| `Escríbenos por WhatsApp` | Botón del encabezado y del cierre | Reutilizado: botón de la sección Contacto |
| `¿Listo para automatizar tu negocio?` + su bajada + `o escríbenos a` | Cierre de cada página | Reutilizado: sección Contacto de la portada |
| `Inicio / Servicios / …` | Migas | Reutilizado: textos del menú |

En "En uso en" el extracto de cada caso es su **Resultado**, copiado exacto. Oral Dent no
tiene Resultado publicado, así que se muestra su **Solución**, también exacta. No se
resume ni se recorta nada.

## Fase 2 — Cada página de servicio

Título, bajada y viñetas de cada página son los que ya están publicados. Lo nuevo es el
título y la descripción para Google (se arman con la frase ya publicada + el precio) y
las notas que se indican.

### `/servicios/asistentes-whatsapp`

- Título y bajada: los de la tarjeta "Asistentes Virtuales por WhatsApp y Telegram" de la portada.
- Qué incluye: las dos tarjetas de paquete (Asistente Virtual y Crecimiento 360°) y la comparativa, tal cual.
- Nota de precio: "El monto de instalación varía según la complejidad del proyecto…" (la nota de la sección Paquetes).
- En uso en: Due Hotel y Oral Dent.
- Título para Google — **Nuevo**: `Asistentes Virtuales por WhatsApp y Telegram | SynaptekAI`
- Descripción para Google — **Nuevo** (frase publicada + precio): `Atención al cliente, agendamiento de citas y respuestas automáticas, 24 horas al día, sin perder el toque humano. Instalación desde S/800 · S/100/mes.`
- Mensaje de WhatsApp del botón: `Hola, me interesa el servicio de Asistentes Virtuales` (el mismo que arma hoy el chat).

### `/servicios/paginas-web`

- Título y bajada: los de la tarjeta "Páginas Web a Medida". Rótulo: "Diseño de Páginas Web".
- Qué incluye: los 4 planes y el banner "Renueva tu Página Web", tal cual.
- Bajo los 4 planes (aquí y en la portada): "El mantenimiento mensual es opcional."
- Notas de precio: "El mantenimiento mensual es opcional." y "El hosting y el dominio se pagan directo al proveedor, a nombre de tu negocio." (del banner Renueva).
- En uso en: Aquamatic Lavandería.
- Título para Google — **Nuevo**: `Páginas Web a Medida | SynaptekAI`
- Descripción para Google — **Nuevo**: `Webs rápidas y a medida, preparadas para Google y para asistentes de IA, con WhatsApp directo y medición de cada contacto. Desde S/450, pago único.`
- Mensaje de WhatsApp del botón: `Hola, quiero cotizar el diseño de una página web para mi negocio` (el de la sección Diseño Web).

### `/servicios/visibilidad-google-ia`

- Título, bajada y las 7 viñetas: los de la tarjeta "Visibilidad en Google e IA" de Más servicios. Rótulo: "Más servicios".
- Bajo el precio va la línea ya publicada "Caso Aquamatic: de 3.9★ a 4.4★ y el doble de reseñas en dos semanas."
- Notas de precio: `Las tarjetas QR/NFC y la gestión de Google Ads se cotizan aparte.` (también en la tarjeta de la portada) y `Súmalo a tu paquete o contrátalo por separado.` (hoy está en plural, como título de Más servicios: "Súmalos a tu paquete o contrátalos por separado").
- En uso en: Aquamatic Lavandería.
- Título para Google — **Nuevo**: `Visibilidad en Google e IA | SynaptekAI`
- Descripción para Google — **Nuevo**: `Que te encuentren en Google Maps, en el buscador y en asistentes como ChatGPT o Gemini, con reseñas reales y la medición de cada contacto. Instalación desde S/500 · S/80/mes.` (la primera frase es la de la tarjeta de Servicios de la portada).

### `/servicios/socio-tecnologico`

- Título, bajada y viñetas: los de la tarjeta "Socio Tecnológico" de Más servicios. Rótulo: "Más servicios".
- Precio: "Desde S/120/mes" y, en fila aparte, `Rescate y migración de web y dominio` · `Desde S/350` · `Pago único` (hoy va en una sola línea: "Rescate y migración de web y dominio: desde S/350, pago único").
- Nota de precio — **Nuevo**: `Súmalo a tu paquete o contrátalo por separado.`
- En uso en: Aquamatic Lavandería.
- Título para Google — **Nuevo**: `Socio Tecnológico | SynaptekAI`
- Descripción para Google — **Nuevo**: `Dominio, hosting, web y proveedores en orden y a nombre de tu negocio. Nosotros hablamos el idioma técnico por ti. Desde S/120/mes.` (la frase es la de la tarjeta de Servicios de la portada).

### `/servicios/automatizacion` (Automatización de Procesos + Soluciones a Medida)

Estos dos servicios no tienen hoy viñetas ni precio publicados. No inventé ninguno:

- Título y bajada: los de la tarjeta "Automatización de Procesos".
- Qué incluye, bloque "Automatización de Procesos": la descripción que hoy da el chat de ese servicio y la frase del paso 3 de "Cómo funciona" ("Google Calendar, Sheets, correo y Telegram: todo conectado y funcionando.").
- Qué incluye, bloque "Soluciones a Medida": la descripción de su tarjeta y las frases de los pasos 1 y 2 de "Cómo funciona".
- Precio — **Nuevo**: `A cotizar` · `Depende del proceso: cuéntanos cuál y lo cotizamos.`
  **Revísalo con cuidado**: es el único precio del sitio que no es un monto. Si prefieres otro texto, o no mostrar la sección Precio en esta página, dímelo.
- En uso en: Due Hotel y Oral Dent, los mismos que nombra hoy la tarjeta "Automatización de Procesos" de la portada. ("Soluciones a Medida" no tiene esa línea y no suma ninguno.)
- Título para Google — **Nuevo**: `Automatización de Procesos y Soluciones a Medida | SynaptekAI`
- Descripción para Google: las dos descripciones de las tarjetas, una tras otra.
- Mensaje de WhatsApp del botón: `Hola, me interesa el servicio de Automatización de Procesos`.

### `/servicios/complementarios`

- Título "Servicios complementarios", rótulo "Bajo pedido" y bajada: los de la sección de la portada.
- Qué incluye: las 3 tarjetas (Redes Sociales con IA, Videos con IA, Inventario + Boletas) con sus videos de ejemplo detrás de "Ver ejemplo", tal cual.
- Nota de precio: "La emisión válida ante SUNAT requiere el certificado digital del negocio — te ayudamos con el trámite."
- Sin sección "En uso en" (ninguno de estos servicios la tiene hoy).
- Título para Google — **Nuevo**: `Servicios complementarios bajo pedido | SynaptekAI`
- Descripción para Google — **Nuevo**: `Redes Sociales con IA, Videos con IA e Inventario + Boletas: herramientas que ya tenemos listas y activamos cuando tu negocio las necesita.`
- Mensaje de WhatsApp del botón del encabezado y del cierre — **Nuevo**: `Hola, quiero información de los servicios complementarios`

## Fase 2 — Preguntas frecuentes

Las 27 preguntas, **tal como quedaron publicadas** después de tu revisión del 04/10/2026,
con los montos ya puestos (salen de `src/data/precios.ts`). La respuesta sobre negocios
fuera de Arequipa es la misma en las 5 páginas que la llevan.

Estas respuestas incluyen datos que diste tú en la revisión y que no estaban en el sitio:
la semana de prueba es sin costo; las tarjetas QR/NFC y la gestión de Google Ads no
están incluidas; el mantenimiento web es opcional y qué incluye; el plan Básico de Videos
trae 2 videos al mes; y el traspaso de un dominio depende de quien figure como titular.

### `/servicios/asistentes-whatsapp`

1. **¿Puedo probarlo antes de decidir?**
   Sí. La primera semana es de prueba, sin costo: si no te sirve, no seguimos.
2. **¿Qué pasa si quiero responderle yo a un cliente?**
   Tu equipo toma el control cuando quiera: si respondes a mano, el asistente se pausa.
3. **¿Dónde quedan las citas, las reservas y los pedidos?**
   Las citas se agendan en tu Google Calendar. Las reservas y los pedidos quedan registrados en tu Google Sheet, y recibes un aviso inmediato de cada solicitud nueva por WhatsApp o Telegram.
4. **¿El precio es fijo?**
   La cuota mensual es fija: S/100/mes en Asistente Virtual y S/120/mes en Crecimiento 360°. La instalación varía según la complejidad del proyecto: desde S/800 en Asistente Virtual y desde S/900 en Crecimiento 360°.
5. **¿Trabajan con negocios fuera de Arequipa?**
   Sí. La implementación es 100% remota, para negocios en todo el Perú. Due Hotel y Aquamatic, por ejemplo, están en Trujillo.

### `/servicios/paginas-web`

1. **¿A nombre de quién quedan el dominio y el hosting?**
   A nombre de tu negocio. Nosotros los configuramos y gestionamos, y se pagan directo al proveedor: son tuyos de verdad, aunque mañana cambies de proveedor.
2. **¿Es un pago único o mensual?**
   El diseño es un pago único. El mantenimiento mensual es opcional, aunque lo recomendamos: incluye respaldos, vigilancia y actualizaciones técnicas de tu web. Va de S/50–80/mes en una landing page hasta S/150–250/mes en una tienda online.
3. **Ya tengo una página web. ¿Pueden renovarla?**
   Sí. La rediseñamos completa con estética moderna y migramos todo tu contenido actual (textos, fotos, contacto). Es un pago único de S/700 – S/1,100. El hosting y el dominio se pagan aparte, directo al proveedor.
4. **¿La web queda preparada para Google?**
   Sí. Son webs rápidas y a medida, preparadas para Google y para asistentes de IA, con WhatsApp directo y medición de cada contacto.
5. **¿Trabajan con negocios fuera de Arequipa?**
   Sí. La implementación es 100% remota, para negocios en todo el Perú. Due Hotel y Aquamatic, por ejemplo, están en Trujillo.

### `/servicios/visibilidad-google-ia`

1. **¿Cómo consiguen más reseñas?**
   Con tarjetas QR/NFC en tu mostrador. Son reseñas reales y sin premios, como exige Google, y respondemos tus reseñas por ti. Las tarjetas físicas no están incluidas: puedes comprarlas por tu cuenta o te las preparamos nosotros con un costo adicional.
2. **¿La publicidad en Google está incluida?**
   La gestión de Google Ads con medición de conversiones es opcional y se cotiza aparte. La pauta, lo que se invierte en los anuncios, la pagas directo a Google.
3. **¿Cómo sé si está funcionando?**
   Google Analytics mide cada contacto por WhatsApp y Search Console muestra cómo te buscan en Google. Cada mes recibes un reporte con datos reales.
4. **¿Tengo que contratar un paquete para tener este servicio?**
   No. Puedes sumarlo a tu paquete o contratarlo por separado. La instalación va desde S/500 y la cuota es de S/80/mes.
5. **¿Trabajan con negocios fuera de Arequipa?**
   Sí. La implementación es 100% remota, para negocios en todo el Perú. Due Hotel y Aquamatic, por ejemplo, están en Trujillo.

### `/servicios/socio-tecnologico`

1. **¿A nombre de quién quedan mis cuentas?**
   Dominio, hosting y cuentas quedan a nombre de tu negocio, nunca del proveedor.
2. **Mi web o mi dominio están en manos de otro proveedor. ¿Pueden recuperarlos?**
   Sí. Rescatamos tu web y tu dominio si están en manos de terceros, y hablamos por ti con tu hosting y con tus proveedores anteriores. El rescate y la migración de web y dominio van desde S/350, pago único. Si el dominio está registrado a nombre de otra persona, el traspaso depende de que esa persona lo autorice.
3. **¿Tengo que saber de tecnología?**
   No. Nos encargamos de la parte técnica para que tú no tengas que entenderla, y te asesoramos antes de contratar cualquier sistema o software.
4. **¿Trabajan con negocios fuera de Arequipa?**
   Sí. La implementación es 100% remota, para negocios en todo el Perú. Due Hotel y Aquamatic, por ejemplo, están en Trujillo.

### `/servicios/automatizacion`

1. **¿Qué herramientas conectan?**
   Conectamos Google Calendar, Google Sheets, correo, WhatsApp y Telegram, para que tus tareas repetitivas se hagan solas.
2. **¿Cuánto cuesta?**
   Depende del proceso: cuéntanos cuál y lo cotizamos.
3. **¿Y si mi negocio necesita algo distinto?**
   Cada negocio es distinto: diseñamos el flujo de automatización que tu operación realmente necesita.
4. **¿Trabajan con negocios fuera de Arequipa?**
   Sí. La implementación es 100% remota, para negocios en todo el Perú. Due Hotel y Aquamatic, por ejemplo, están en Trujillo.

### `/servicios/complementarios`

1. **¿Qué significa "bajo pedido"?**
   Son herramientas que ya tenemos listas y activamos cuando tu negocio las necesita.
2. **¿Las publicaciones salen sin que yo las vea?**
   No. Tú apruebas antes de publicar, desde Telegram.
3. **¿Cuántos videos incluye el plan?**
   El plan Básico incluye 2 videos al mes y el plan Full, 4, con guion generado por IA. Cada video adicional cuesta S/60–80.
4. **¿Qué necesito para emitir boletas electrónicas?**
   La emisión válida ante SUNAT requiere el certificado digital del negocio; te ayudamos con el trámite. El servicio incluye 300 boletas al mes y cada boleta adicional cuesta S/0.40.

## Fase 2 — `/casos`

- Los tres casos van **exactos**, con sus etiquetas, Problema, Solución y Resultado, en el
  mismo orden que en la portada. Anclas: `#due-hotel`, `#aquamatic`, `#oral-dent`.
- Rótulo "Casos de éxito" y título "Negocios reales que ya trabajan con nosotros": los de la portada.
- Cierre "¿Quieres ser el próximo caso de éxito?" y su mensaje de WhatsApp: los de la portada.
- El bloque de testimonio usa la misma constante que la portada: hoy está vacía y no se dibuja nada.
- Título para Google — **Nuevo**: `Casos de éxito | SynaptekAI`
- Descripción para Google — **Nuevo**: `Negocios reales que ya trabajan con nosotros: Due Hotel, Aquamatic Lavandería y Oral Dent.`

## Fase 2 — `/precios`

| Texto | Dónde | Tipo |
| --- | --- | --- |
| `Todos los precios, en una sola página` | Título de la página | **Nuevo** |
| `Para tener en cuenta` | Título de la sección de notas | **Nuevo** |
| `Hola, quiero una cotización para mi negocio` | Mensaje de WhatsApp del botón del cierre | **Nuevo** |
| `Precios \| SynaptekAI` | Título para Google | **Nuevo** |
| `Todos los precios de SynaptekAI en soles: paquetes, más servicios, diseño de páginas web y servicios complementarios.` | Descripción para Google | **Nuevo** |
| Bajada "Planes listos para instalar…" | Bajo el título | Reutilizado: bajada de la sección Paquetes |
| "Paquetes", "Más servicios", "Diseño de Páginas Web", "Servicios complementarios" y sus bajadas | Títulos de las 4 listas | Reutilizado: rótulos y bajadas de la portada |
| Nombres, montos, "Instalación", "Pago único", "Mantenimiento", "Recomendado", "Oferta", "Bajo pedido" | Filas | Reutilizado: tarjetas de la portada |

Las notas de "Para tener en cuenta" son siete, en el orden de las listas de la página:

1. El monto de instalación varía según la complejidad del proyecto. Si tu negocio necesita más de un paquete, coordinamos un precio personalizado. _(la nota "desde")_
2. Las tarjetas QR/NFC y la gestión de Google Ads se cotizan aparte. _(nota de Visibilidad, del 04/10/2026)_
3. El mantenimiento mensual es opcional. _(nota de Diseño Web, del 04/10/2026)_
4. El hosting y el dominio se pagan directo al proveedor, a nombre de tu negocio. _(la nota de hosting y dominio)_
5. Video adicional: S/60–80 c/u
6. Incluye 300 boletas/mes; adicional S/0.40 c/u
7. La emisión válida ante SUNAT requiere el certificado digital del negocio — te ayudamos con el trámite.

Automatización de Procesos y Soluciones a Medida no aparecen en `/precios`: no tienen un
monto publicado.

## Fase 2 — Página de gracias, 404 y páginas legales

**Gracias** (`/gracias.html` y `/gracias`): mismos textos que hoy, con el diseño del sitio.

- Se quitó el bloque de video: pedía `/assets/videos/gracias.mp4`, que nunca existió (por eso el 404). No había texto asociado.
- Descripción para Google — **Nuevo** (la página anterior no tenía; no se indexa): `Tu checklist de automatización está en camino. También puedes descargarlo ahora.`
- El botón de WhatsApp ahora se mide con el origen `gracias-checklist`.

**404** — todo **Nuevo**:

- Rótulo: `Error 404`
- Título: `Página no encontrada`
- Texto: `La dirección que buscas no existe o cambió de lugar. Estos enlaces te pueden servir:`
- Debajo, los enlaces del menú (Servicios y Enlaces).
- Título para Google: `Página no encontrada | SynaptekAI` · Descripción: `La página que buscas no existe o cambió de dirección.`

**Privacidad y Términos**: el contenido legal es el mismo, sin tocar una palabra, y
conservan su título y su descripción para Google. Solo cambian el encabezado y el pie de
página, que ahora son los del sitio.

## Fase 2 — Sitio de prueba

| Texto | Dónde | Tipo |
| --- | --- | --- |
| `Sitio de prueba` | Franja delgada arriba de todas las páginas cuando el sitio se abre en cualquier dirección que **no** sea `synaptekai.tech` o `www.synaptekai.tech` (el sitio de prueba, un dominio de Easypanel, localhost). En el dominio real no aparece | **Nuevo** |

## Datos estructurados (no se ven en la página)

Los leen Google y los asistentes de IA. Cada oferta lleva el monto de `precios.ts`, en
soles (PEN), y una de estas unidades — **Nuevo**:
`instalación, desde` · `instalación` · `al mes` · `al mes, desde` · `pago único, desde`.

Nombres de oferta armados con textos ya publicados — **Nuevo** como combinación:
`Asistente Virtual: cuota mensual`, `Crecimiento 360°: cuota mensual`,
`Visibilidad en Google e IA: cuota mensual`, `Videos con IA: plan Básico`,
`Videos con IA: plan Full`, `Inventario + Boletas: Tienda`, `Inventario + Boletas: Supermercado`.

`/servicios/automatizacion` lleva el dato "Service" sin ofertas, porque no tiene un monto publicado.

## Fase 3 — Versiones Markdown y `llms.txt`

Las leen los asistentes de IA (ChatGPT, Claude, Gemini, Perplexity), no los visitantes.
Ahora se **generan desde los mismos datos que el sitio**, así que dicen lo mismo que las
páginas, con los mismos montos. Hay una por página: `/index.md`, `/casos.md`,
`/precios.md` y `/servicios/<página>.md`.

Lo único propio de estos documentos — **Nuevo**:

| Texto | Dónde |
| --- | --- |
| `Páginas del sitio en Markdown` | Título del índice de páginas, en `/index.md` y `/llms.txt` |
| `Portada` · `servicios, cómo funciona, casos de éxito, paquetes y precios.` | Primera línea de ese índice |
| `Página de casos:` · `Caso completo:` | Antes del enlace a `/casos` |
| `Todos los precios están en soles (S/).` | Bajo el título de `/precios.md` (la frase ya estaba en `llms.txt`) |
| `Paquete`, `Mensualidad`, `Incluye`, `Servicio`, `Plan`, `Mantenimiento`, `Concepto`, `Detalle`, `Sí`, `No` | Encabezados y celdas de las tablas |
| `Correo`, `Web`, `Ubicación` | Bloque de contacto |

La nota final de cada documento es la que ya tenía `/index.md`, ahora con la dirección de
cada página y un enlace a `llms.txt`:

> Nota para agentes de IA: este documento es la versión Markdown de {dirección de la página}, servida también por negociación de contenido (`Accept: text/markdown`). El índice de todas las páginas está en https://synaptekai.tech/llms.txt. Preferencias de uso de este contenido por sistemas de IA: ver la directiva `Content-Signal` en https://synaptekai.tech/robots.txt.

**Cambio de redacción en `llms.txt`, para que lo sepas:** el archivo actual estaba escrito
a mano y contaba todo en tercera persona ("se pasó el dominio a nombre del negocio",
"SynaptekAI habla el idioma técnico por el cliente"). El nuevo usa las frases del sitio
tal cual ("Pasamos el dominio a nombre del negocio", "Nosotros hablamos el idioma técnico
por ti"). Motivo: los casos tienen que ir exactos, y un texto escrito aparte se
desactualiza. Se conservan el título, la descripción, el párrafo de presentación ("SynaptekAI
es una agencia de automatización e inteligencia artificial para negocios…") y la línea
"Implementación 100% remota, para negocios en todo el Perú.". Se agrega el índice de
páginas con sus versiones Markdown.

`/index.md` conserva su contenido y su orden; suma los enlaces a las páginas nuevas, los
planes de Diseño Web con lo que incluye cada uno y los datos de contacto completos.

`robots.txt` no cambia (conserva `Content-Signal`). `sitemap.xml` pasa de 4 a 12
direcciones: suma las 6 páginas de servicio, `/casos` y `/precios`, y lista `/bot` en vez
de `/bot.html` (las dos siguen respondiendo).
