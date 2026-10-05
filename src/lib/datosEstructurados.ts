// Datos estructurados (JSON-LD) de las páginas internas. El del negocio
// (ProfessionalService) lo pone Base.astro en todas las páginas.

import { negocio } from '../data/negocio';
import type { PaginaServicio, PreguntaFrecuente } from '../data/paginasServicio';

const url = (ruta: string) => new URL(ruta, negocio.url).href;

export interface MigaRuta {
  texto: string;
  /** Ruta limpia. La última miga (la página actual) también la lleva. */
  ruta: string;
}

/** BreadcrumbList: Inicio › … › página actual. */
export function migasJsonLd(migas: MigaRuta[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: migas.map((miga, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: miga.texto,
      item: url(miga.ruta),
    })),
  };
}

/** FAQPage con las preguntas visibles en la página. */
export function faqJsonLd(preguntas: PreguntaFrecuente[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: preguntas.map((p) => ({
      '@type': 'Question',
      name: p.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: p.respuesta },
    })),
  };
}

/** Service con sus ofertas en soles (PEN). */
export function servicioJsonLd(pagina: PaginaServicio): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: pagina.titulo,
    description: pagina.bajada,
    url: url(pagina.ruta),
    provider: { '@id': `${negocio.url}/#organizacion` },
    areaServed: { '@type': 'Country', name: negocio.ubicacion.paisNombre },
    ...(pagina.ofertas.length
      ? {
          offers: pagina.ofertas.map((o) => ({
            '@type': 'Offer',
            name: o.nombre,
            description: o.descripcion,
            priceCurrency: 'PEN',
            price: o.precio,
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              priceCurrency: 'PEN',
              // "desde" = precio mínimo; el resto son montos exactos.
              ...(o.unidad.includes('desde') ? { minPrice: o.precio } : { price: o.precio }),
              unitText: o.unidad,
            },
          })),
        }
      : {}),
  };
}
