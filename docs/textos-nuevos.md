# Textos nuevos (para revisión)

Aquí se lista todo texto que **no existe hoy** en synaptekai.tech y que la migración
agrega. Nada de esta lista se da por aprobado hasta que lo revises.

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
- Nota de precio: "El hosting y el dominio se pagan directo al proveedor, a nombre de tu negocio." (del banner Renueva).
- En uso en: Aquamatic Lavandería.
- Título para Google — **Nuevo**: `Páginas Web a Medida | SynaptekAI`
- Descripción para Google — **Nuevo**: `Webs rápidas y a medida, preparadas para Google y para asistentes de IA, con WhatsApp directo y medición de cada contacto. Desde S/450, pago único.`
- Mensaje de WhatsApp del botón: `Hola, quiero cotizar el diseño de una página web para mi negocio` (el de la sección Diseño Web).

### `/servicios/visibilidad-google-ia`

- Título, bajada y las 7 viñetas: los de la tarjeta "Visibilidad en Google e IA" de Más servicios. Rótulo: "Más servicios".
- Bajo el precio va la línea ya publicada "Caso Aquamatic: de 3.9★ a 4.4★ y el doble de reseñas en dos semanas."
- Nota de precio — **Nuevo**: `Súmalo a tu paquete o contrátalo por separado.` (hoy está en plural, como título de Más servicios: "Súmalos a tu paquete o contrátalos por separado").
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

## Fase 2 — Preguntas frecuentes (todas nuevas)

Las 27 preguntas son nuevas. Cada respuesta repite hechos que el sitio ya afirma hoy
(se indica de dónde sale cada uno); no hay plazos, garantías ni resultados que no estén
ya escritos. Así quedan publicadas, con los montos ya puestos:

### `/servicios/asistentes-whatsapp`

1. **¿Puedo probarlo antes de decidir?**
   Sí. La primera semana es de prueba: si no te sirve, no seguimos.
   _Fuente: paso 4 de "Cómo funciona"._
2. **¿Qué pasa si quiero responderle yo a un cliente?**
   Tu equipo toma el control cuando quiera: si respondes a mano, el asistente se pausa.
   _Fuente: viñeta del paquete Asistente Virtual._
3. **¿Dónde quedan las citas, las reservas y los pedidos?**
   Las citas se agendan en tu Google Calendar. Las reservas y los pedidos quedan registrados en tu Google Sheet, y recibes un aviso inmediato de cada solicitud nueva por WhatsApp o Telegram.
   _Fuente: viñetas del paquete Asistente Virtual._
4. **¿El precio es fijo?**
   La cuota mensual es fija: S/100/mes en Asistente Virtual y S/120/mes en Crecimiento 360°. El monto de instalación varía según la complejidad del proyecto: va desde S/800 y desde S/900.
   _Fuente: bajada y nota de la sección Paquetes._
5. **¿Trabajan con negocios fuera de Arequipa?**
   Sí. La implementación es 100% remota, para negocios en todo el Perú.
   _Fuente: la descripción del sitio que hoy ve Google ("…para negocios en todo el Perú. Desde Arequipa, con implementación 100% remota."). **Ojo**: hoy esa frase no está en el texto visible de la portada, solo en la descripción para buscadores. Se repite en 5 páginas._

### `/servicios/paginas-web`

1. **¿A nombre de quién quedan el dominio y el hosting?**
   A nombre de tu negocio. Nosotros los configuramos y gestionamos, y se pagan directo al proveedor: son tuyos de verdad, aunque mañana cambies de proveedor.
   _Fuente: banner "Renueva tu Página Web"._
2. **¿Es un pago único o mensual?**
   El diseño es un pago único. El mantenimiento es mensual y depende del plan: desde S/50–80/mes en una landing page hasta S/150–250/mes en una tienda online.
   _Fuente: los 4 planes._
3. **Ya tengo una página web. ¿Pueden renovarla?**
   Sí. La rediseñamos completa con estética moderna y migramos todo tu contenido actual (textos, fotos, contacto). Es un pago único de S/700 – S/1,100.
   _Fuente: banner "Renueva tu Página Web"._
4. **¿La web queda preparada para Google?**
   Sí. Son webs rápidas y a medida, preparadas para Google y para asistentes de IA, con WhatsApp directo y medición de cada contacto.
   _Fuente: tarjeta "Páginas Web a Medida"._
5. **¿Trabajan con negocios fuera de Arequipa?**
   Sí. La implementación es 100% remota, para negocios en todo el Perú.

### `/servicios/visibilidad-google-ia`

1. **¿Cómo consiguen más reseñas?**
   Con tarjetas QR/NFC en tu mostrador. Son reseñas reales y sin premios, como exige Google. Además, respondemos tus reseñas por ti.
2. **¿La publicidad en Google está incluida?**
   Google Ads con medición de conversiones es opcional. La pauta la pagas directo a Google.
3. **¿Cómo sé si está funcionando?**
   Medimos cada contacto por WhatsApp con Google Analytics y Search Console, y recibes un reporte mensual con datos reales.
4. **¿Tengo que contratar un paquete para tener este servicio?**
   No. Puedes sumarlo a tu paquete o contratarlo por separado. La instalación va desde S/500 y la cuota es de S/80/mes.
5. **¿Trabajan con negocios fuera de Arequipa?**
   Sí. La implementación es 100% remota, para negocios en todo el Perú.

_Fuente de las cuatro primeras: viñetas y precio de la tarjeta "Visibilidad en Google e IA"._

### `/servicios/socio-tecnologico`

1. **¿A nombre de quién quedan mis cuentas?**
   Dominio, hosting y cuentas quedan a nombre de tu negocio, nunca del proveedor.
2. **Mi web o mi dominio están en manos de otro proveedor. ¿Pueden recuperarlos?**
   Sí. Rescatamos tu web y tu dominio si están en manos de terceros, y hablamos por ti con tu hosting y con tus proveedores anteriores. El rescate y la migración de web y dominio van desde S/350, pago único.
3. **¿Tengo que saber de tecnología?**
   No. Nos encargamos de la parte técnica para que tú no tengas que entenderla, y te asesoramos antes de contratar cualquier sistema o software.
4. **¿Trabajan con negocios fuera de Arequipa?**
   Sí. La implementación es 100% remota, para negocios en todo el Perú.

_Fuente de las tres primeras: bajada, viñetas y precio de la tarjeta "Socio Tecnológico"._

### `/servicios/automatizacion`

1. **¿Qué herramientas conectan?**
   Google Calendar, Sheets, correo y Telegram: todo conectado y funcionando.
   _Fuente: paso 3 de "Cómo funciona", copiado._
2. **¿Cuánto cuesta?**
   Depende del proceso: cuéntanos cuál y lo cotizamos.
   _**Nuevo** (el mismo texto de la sección Precio de esta página)._
3. **¿Y si mi negocio necesita algo distinto?**
   Cada negocio es distinto: diseñamos el flujo de automatización que tu operación realmente necesita.
   _Fuente: tarjeta "Soluciones a Medida", copiado._
4. **¿Trabajan con negocios fuera de Arequipa?**
   Sí. La implementación es 100% remota, para negocios en todo el Perú.

### `/servicios/complementarios`

1. **¿Qué significa "bajo pedido"?**
   Son herramientas que ya tenemos listas y activamos cuando tu negocio las necesita.
   _Fuente: bajada de la sección, copiada._
2. **¿Las publicaciones salen sin que yo las vea?**
   No. Tú apruebas antes de publicar, desde Telegram.
   _Fuente: viñeta de Redes Sociales con IA._
3. **¿Cuántos videos incluye el plan?**
   El plan Full incluye 4 videos al mes, con guion generado por IA. Cada video adicional cuesta S/60–80.
   _Fuente: viñetas de Videos con IA._
4. **¿Qué necesito para emitir boletas electrónicas?**
   La emisión válida ante SUNAT requiere el certificado digital del negocio; te ayudamos con el trámite. El servicio incluye 300 boletas al mes y cada boleta adicional cuesta S/0.40.
   _Fuente: viñetas y nota de Inventario + Boletas._

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

Las notas de "Para tener en cuenta" son cinco frases ya publicadas, sin cambios:

1. El monto de instalación varía según la complejidad del proyecto. Si tu negocio necesita más de un paquete, coordinamos un precio personalizado. _(la nota "desde")_
2. El hosting y el dominio se pagan directo al proveedor, a nombre de tu negocio. _(la nota de hosting y dominio)_
3. Video adicional: S/60–80 c/u
4. Incluye 300 boletas/mes; adicional S/0.40 c/u
5. La emisión válida ante SUNAT requiere el certificado digital del negocio — te ayudamos con el trámite.

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
| `Sitio de prueba` | Franja delgada arriba de todas las páginas, **solo** cuando el sitio se abre en `nuevo.synaptekai.tech`. En `synaptekai.tech` no existe | **Nuevo** |

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
