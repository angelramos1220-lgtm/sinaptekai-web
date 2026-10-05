// /precios: los grupos de precios y sus notas. Lo usan la página (src/pages/precios.astro)
// y su versión Markdown (src/lib/markdown.ts), para que digan siempre lo mismo.
// Los montos no se escriben aquí: llegan de src/data/precios.ts a través de los datos
// de paquetes, más servicios, planes web y complementarios.

import { paquetes } from './paquetes';
import { masServicios } from './masServicios';
import { planesWeb, renuevaWeb, notaMantenimiento } from './planesWeb';
import { complementarios } from './complementarios';
import { textos as t } from './textos';
import { textosPaginas as tp } from './textosPaginas';

export interface FilaPrecio {
  concepto: string;
  /** Insignia junto al nombre: "Recomendado", "Oferta", "Bajo pedido". */
  detalle?: string;
  monto: string;
  nota?: string;
  /** Página con el detalle: la fila lleva un enlace "Ver más →" hacia ella. */
  enlace?: { href: string };
}

export interface GrupoPrecios {
  /** Ancla de la sección en /precios. */
  id: string;
  titulo: string;
  bajada?: string;
  filas: FilaPrecio[];
}

const x = tp.precios;

export const gruposPrecios: GrupoPrecios[] = [
  {
    id: 'paquetes',
    titulo: x.paquetes,
    filas: paquetes.map((p) => ({
      concepto: p.nombre,
      detalle: p.insignia,
      monto: `${t.pkgDesde} ${p.instalacion}`,
      nota: `${t.pkgInstallWord} · ${p.mensual}`,
      enlace: { href: '/servicios/asistentes-whatsapp' },
    })),
  },
  {
    id: 'mas-servicios',
    titulo: x.masServicios,
    bajada: x.masServiciosBajada,
    filas: masServicios.map((m) => ({
      concepto: m.nombre,
      monto: m.precio,
      nota: m.notaPrecio,
      enlace: { href: m.id === 'visibilidad' ? '/servicios/visibilidad-google-ia' : '/servicios/socio-tecnologico' },
    })),
  },
  {
    id: 'diseno-web',
    titulo: x.web,
    bajada: x.webBajada,
    filas: [
      ...planesWeb.map((plan) => ({
        concepto: plan.nombre,
        monto: plan.precio,
        nota: `${plan.notaPago} · ${plan.mantenimiento}`,
        enlace: { href: '/servicios/paginas-web' },
      })),
      { concepto: renuevaWeb.nombre, detalle: renuevaWeb.insignia, monto: renuevaWeb.precio, nota: renuevaWeb.notaPago, enlace: { href: '/servicios/paginas-web' } },
    ],
  },
  {
    id: 'complementarios',
    titulo: x.complementarios,
    bajada: x.complementariosBajada,
    filas: complementarios.map((c) => ({
      concepto: c.nombre,
      detalle: t.compBadge,
      monto: c.precios[0],
      nota: c.precios[1],
      enlace: { href: `/servicios/complementarios#${c.id}` },
    })),
  },
];

// Notas: frases que ya están en la portada, junto a cada precio.
const [, videos, inventario] = complementarios;
const aparte = masServicios.map((m) => m.notaAparte).filter(Boolean);
// En el orden de las listas de la página: paquetes, más servicios, diseño web, complementarios.
export const notasPrecios: string[] = [t.pkgPriceNote, ...aparte, notaMantenimiento, renuevaWeb.notaHosting, videos.vinetas[2], inventario.vinetas[2], inventario.nota];
