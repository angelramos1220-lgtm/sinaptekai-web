// "Cómo funciona": los 4 pasos, con su duración.

export interface Paso {
  numero: string;
  duracion: string;
  titulo: string;
  texto: string;
}

/** La semana de prueba. Se dice igual aquí y en las preguntas frecuentes de Asistentes. */
export const semanaDePrueba = 'La primera semana es de prueba, sin costo: si no te sirve, no seguimos.';

export const pasos: Paso[] = [
  {
    numero: '01',
    duracion: 'Día 1',
    titulo: 'Analizamos tu negocio',
    texto: 'Estudiamos tus procesos actuales y detectamos qué tareas se pueden automatizar.',
  },
  {
    numero: '02',
    duracion: 'Días 2-3',
    titulo: 'Diseñamos tu agente de IA',
    texto: 'Creamos el asistente y las automatizaciones a la medida de tu operación.',
  },
  {
    numero: '03',
    duracion: 'Días 4-5',
    titulo: 'Lo integramos con tus herramientas',
    texto: 'Google Calendar, Sheets, correo y Telegram: todo conectado y funcionando.',
  },
  {
    numero: '04',
    duracion: 'Desde el día 6',
    titulo: 'Tu negocio atiende solo, y lo afinamos contigo',
    texto: `Tu asistente ya atiende. Durante el primer mes revisamos contigo sus conversaciones reales y ajustamos respuestas y reglas cada semana. ${semanaDePrueba}`,
  },
];
