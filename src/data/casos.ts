// Casos de éxito. El orden es el orden en pantalla.
//
// IMPORTANTE: los textos de Due Hotel, Aquamatic y Oral Dent están aprobados por
// el cliente, solo para este sitio web. Se copian EXACTOS: no se resumen, no se
// reescriben y no se usan en piezas para redes sociales.

export type CasoId = 'due-hotel' | 'aquamatic' | 'oral-dent';

export interface Caso {
  /** También es el ancla de la tarjeta (#due-hotel, #aquamatic, #oral-dent). */
  id: CasoId;
  nombre: string;
  /** Chips de arriba de la tarjeta: servicio · rubro · ciudad. */
  chips: [string, string, string];
  problema: string;
  solucion: string;
  /** Opcional: vacío no se muestra. */
  resultado: string;
  /** Opcional: ruta a una captura real (nunca base64). Vacío no se muestra. */
  imagen: string;
}

export const casos: Caso[] = [
  {
    id: 'due-hotel',
    nombre: 'Due Hotel',
    chips: ['Asistente de WhatsApp', 'Hotel corporativo', 'Trujillo'],
    problema: 'Toda la atención del hotel pasaba por un solo WhatsApp. Recepción respondía las mismas preguntas una y otra vez, y en horas punta algunas consultas tardaban en ser atendidas.',
    solucion: 'Sofía, una asistente virtual en el mismo WhatsApp del hotel. Informa tarifas y políticas, cotiza según las fechas, toma los datos de la reserva y los deja registrados en el Google Sheet del hotel, con aviso inmediato a recepción. Si el equipo escribe a mano, Sofía se pausa sola; y si escribe un cliente frecuente, avisa a recepción para que lo atienda personalmente.',
    resultado: 'En producción desde agosto de 2026, atendiendo varias conversaciones a la vez. Construida, probada y lanzada en 4 días, 100% a distancia, de Arequipa a Trujillo.',
    imagen: '',
  },
  {
    id: 'aquamatic',
    nombre: 'Aquamatic Lavandería',
    chips: ['Web a medida + Google', 'Lavandería', 'Trujillo'],
    problema: 'Su web estaba en el servidor de un proveedor anterior, sin acceso propio al dominio y con información desactualizada. Su Perfil de Google tenía 3.9★ con solo 7 reseñas.',
    solucion: 'Pasamos el dominio a nombre del negocio, migramos el hosting y construimos una web nueva a medida, preparada para Google y para asistentes de IA. Incluye precios, calculadora por kilos, preguntas frecuentes y WhatsApp directo por servicio. Además ordenamos su Perfil de Google, pusimos en marcha la estrategia de reseñas con tarjetas QR/NFC en el mostrador y medimos cada contacto con Google Analytics.',
    resultado: 'Web con puntaje de 99–100 en Lighthouse, la prueba de calidad de Google. Su Perfil de Google pasó de 3.9★ (7 reseñas) a 4.4★ (14 reseñas) en dos semanas.',
    imagen: '',
  },
  {
    id: 'oral-dent',
    nombre: 'Oral Dent',
    chips: ['Asistente de WhatsApp', 'Clínica dental', 'Arequipa'],
    problema: 'Necesitaba responder consultas y agendar citas fuera del horario de atención, sin contratar más personal.',
    solucion: 'Asistente virtual por WhatsApp que agenda y confirma citas directamente en Google Calendar, envía recordatorios automáticos al paciente 24 h y 1 h antes, avisa a la doctora de cada cita nueva y responde preguntas frecuentes las 24 horas.',
    resultado: '',
    imagen: '',
  },
];
