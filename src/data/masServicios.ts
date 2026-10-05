// "Más servicios": se suman a un paquete o se contratan por separado.

import { precios } from './precios';
import { soles, porMes } from '../lib/formato';

export type MasServicioId = 'visibilidad' | 'socio-tecnologico';

export interface MasServicio {
  id: MasServicioId;
  emoji: string;
  nombre: string;
  insignia: string;
  bajada: string;
  /** Línea grande de precio. */
  precio: string;
  /** Segunda línea, más pequeña. */
  notaPrecio: string;
  vinetas: string[];
  /** Línea de prueba destacada. Vacía no se muestra. */
  prueba: string;
  mensajeWhatsApp: string;
  /** Valor del parámetro "origen" del evento contacto_whatsapp. */
  origen: string;
  colores: { acento: string; tinta: string; suave: string; fondo: string; resplandor: string };
}

const m = precios.masServicios;

export const masServicios: MasServicio[] = [
  {
    id: 'visibilidad',
    emoji: '📍',
    nombre: 'Visibilidad en Google e IA',
    insignia: 'Nuevo',
    bajada: 'Que te encuentren cuando te buscan: en Google Maps, en el buscador y en asistentes de IA.',
    precio: `Desde ${soles(m.visibilidad.instalacion)}`,
    notaPrecio: `Instalación · ${porMes(m.visibilidad.mensual)}`,
    vinetas: [
      'Perfil de Empresa de Google ordenado: horarios, fotos, servicios y novedades',
      'Más reseñas reales con tarjetas QR/NFC en tu mostrador, sin premios (como exige Google)',
      'Respondemos tus reseñas por ti',
      'Google Analytics y Search Console midiendo cada contacto por WhatsApp',
      'Tu web preparada para buscadores y asistentes de IA',
      'Google Ads con medición de conversiones (opcional; la pauta la pagas directo a Google)',
      'Reporte mensual con datos reales',
    ],
    prueba: 'Caso Aquamatic: de 3.9★ a 4.4★ y el doble de reseñas en dos semanas.',
    mensajeWhatsApp: 'Hola, quiero el servicio de Visibilidad en Google e IA',
    origen: 'visibilidad',
    colores: {
      acento: '#2DD4BF',
      tinta: '#042F2E',
      suave: 'rgba(45,212,191,0.14)',
      fondo: 'rgba(9,32,38,0.82)',
      resplandor: 'rgba(45,212,191,0.18)',
    },
  },
  {
    id: 'socio-tecnologico',
    emoji: '🤝',
    nombre: 'Socio Tecnológico',
    insignia: 'Nuevo',
    bajada: 'Tu área de TI sin contratar a nadie: nos encargamos de la parte técnica para que tú no tengas que entenderla.',
    precio: `Desde ${porMes(m.socioTecnologico.mensual)}`,
    notaPrecio: `Rescate y migración de web y dominio: desde ${soles(m.socioTecnologico.rescateMigracion)}, pago único`,
    vinetas: [
      'Dominio, hosting y cuentas a nombre de tu negocio, nunca del proveedor',
      'Hablamos por ti con tu hosting y con tus proveedores anteriores',
      'Rescatamos tu web y tu dominio si están en manos de terceros',
      'Mantenimiento, respaldos y vigilancia de tu web',
      'Revisamos lo que te entregan otros proveedores antes de que lo apruebes',
      'Te asesoramos antes de contratar cualquier sistema o software',
    ],
    prueba: '',
    mensajeWhatsApp: 'Hola, quiero información del servicio Socio Tecnológico',
    origen: 'socio-tecnologico',
    colores: {
      acento: '#A78BFA',
      tinta: '#1E1B4B',
      suave: 'rgba(167,139,250,0.16)',
      fondo: 'rgba(24,20,48,0.82)',
      resplandor: 'rgba(129,140,248,0.18)',
    },
  },
];
