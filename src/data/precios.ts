// FUENTE ÚNICA de todos los montos del sitio, en soles.
// Ningún precio se escribe a mano fuera de este archivo: paquetes, tarjetas, chat,
// versiones Markdown y llms.txt leen de aquí y dan formato con src/lib/formato.ts.

export const precios = {
  paquetes: {
    asistenteVirtual: { instalacion: 800, mensual: 100 },
    crecimiento360: { instalacion: 900, mensual: 120 },
  },
  masServicios: {
    visibilidad: { instalacion: 500, mensual: 80 },
    socioTecnologico: {
      mensual: 120,
      /** Rescate y migración de web y dominio: pago único. */
      rescateMigracion: 350,
    },
  },
  complementarios: {
    redes: { instalacion: 400, mensual: 80 },
    videos: {
      basico: { instalacion: 500, mensual: 80 },
      full: { instalacion: 650, mensual: 100 },
      /** Videos que incluye al mes cada plan. */
      videosAlMesBasico: 2,
      videosAlMesFull: 4,
      videoAdicional: { min: 60, max: 80 },
    },
    inventario: {
      tienda: { instalacion: 700, mensual: 100 },
      supermercado: { instalacion: 950, mensual: 110 },
      boletasIncluidasAlMes: 300,
      boletaAdicional: 0.4,
    },
  },
  web: {
    landing: { min: 450, max: 700, mantenimiento: { min: 50, max: 80 } },
    corporativo: { min: 900, max: 1500, mantenimiento: { min: 80, max: 120 } },
    funcionalidades: { min: 1500, max: 2500, mantenimiento: { min: 120, max: 180 } },
    tienda: { min: 2800, max: 4500, mantenimiento: { min: 150, max: 250 } },
    /** "Renueva tu Página Web": pago único. */
    renueva: { min: 700, max: 1100 },
  },
} as const;
