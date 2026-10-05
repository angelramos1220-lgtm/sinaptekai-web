// Paquetes y su comparativa.

import { precios } from './precios';
import { soles, porMes } from '../lib/formato';

export type PaqueteId = 'asistente-virtual' | 'crecimiento-360';

export interface Paquete {
  id: PaqueteId;
  nombre: string;
  /** "S/800": monto de instalación. En pantalla va precedido de "Desde". */
  instalacion: string;
  /** "S/100/mes" */
  mensual: string;
  vinetas: string[];
  icono: 'chat' | 'estrella';
  destacado: boolean;
  /** Insignia del paquete destacado. */
  insignia?: string;
  /** Color del resplandor al pasar el cursor. */
  resplandor: string;
  /** Valor del parámetro "origen" del evento contacto_whatsapp. */
  origen: string;
}

const p = precios.paquetes;

export const paquetes: Paquete[] = [
  {
    id: 'asistente-virtual',
    nombre: 'Asistente Virtual',
    instalacion: soles(p.asistenteVirtual.instalacion),
    mensual: porMes(p.asistenteVirtual.mensual),
    vinetas: [
      'Atención 24/7 por WhatsApp; entiende texto y mensajes de voz',
      'Agenda citas en tu Google Calendar, o toma reservas y pedidos que quedan registrados en tu Google Sheet',
      'Comparte catálogo y precios en la conversación para orientar al cliente',
      'Tu equipo toma el control cuando quiera: si respondes a mano, el asistente se pausa',
      'Aviso inmediato de cada solicitud nueva por WhatsApp o Telegram',
    ],
    icono: 'chat',
    destacado: false,
    resplandor: 'rgba(34,211,238,0.18)',
    origen: 'paquete-asistente',
  },
  {
    id: 'crecimiento-360',
    nombre: 'Crecimiento 360°',
    instalacion: soles(p.crecimiento360.instalacion),
    mensual: porMes(p.crecimiento360.mensual),
    vinetas: [
      'Todo lo del Asistente Virtual',
      'Recordatorios automáticos (citas, entregas, renovaciones, seguimiento)',
      'Reactivación de clientes inactivos',
      'Publicación automática en Facebook e Instagram',
      'Reporte mensual de resultados',
    ],
    icono: 'estrella',
    destacado: true,
    insignia: 'Recomendado',
    resplandor: 'rgba(251,191,36,0.18)',
    origen: 'paquete-360',
  },
];

/** Mensaje de WhatsApp del botón de cada paquete. */
export function mensajePaquete(paquete: Paquete): string {
  return `Hola, quiero el paquete "${paquete.nombre}"`;
}

// Comparativa: incluye = [Asistente Virtual, Crecimiento 360°].
// Debe coincidir con las viñetas de los paquetes de arriba.
export interface FilaComparativa {
  caracteristica: string;
  incluye: [boolean, boolean];
}

export const comparativa: FilaComparativa[] = [
  { caracteristica: 'Atención 24/7 por WhatsApp (texto y voz)', incluye: [true, true] },
  { caracteristica: 'Citas en Google Calendar, o reservas y pedidos en Google Sheet', incluye: [true, true] },
  { caracteristica: 'Catálogo y precios en la conversación', incluye: [true, true] },
  { caracteristica: 'Tu equipo toma el control: el asistente se pausa', incluye: [true, true] },
  { caracteristica: 'Aviso inmediato de cada solicitud nueva', incluye: [true, true] },
  { caracteristica: 'Recordatorios automáticos', incluye: [false, true] },
  { caracteristica: 'Reactivación de clientes inactivos', incluye: [false, true] },
  { caracteristica: 'Publicación automática en Facebook e Instagram', incluye: [false, true] },
  { caracteristica: 'Reporte mensual de resultados', incluye: [false, true] },
];
