// Diagrama animado del hero: nodos y rutas. Lo dibuja src/scripts/hero.js en un <canvas>.
//
// Coordenadas en el espacio de diseño del diagrama (460×300). Índices:
// 0 = entrada, 1 = centro, 2/3/4 = salidas (arriba, medio, abajo).
// Las salidas reflejan los servicios con clientes reales.

export interface FlowNode {
  x: number;
  y: number;
  r: number;
  color: [number, number, number];
  label: string;
  labelAlign: 'left' | 'center' | 'right';
  labelDX: number;
  labelDY: number;
}

export const FLOW_NODES: FlowNode[] = [
  { x: 40, y: 40, r: 7, color: [255, 255, 255], label: 'Mensaje del cliente', labelAlign: 'left', labelDX: 14, labelDY: 4 },
  { x: 170, y: 150, r: 11, color: [139, 92, 246], label: 'Agente IA', labelAlign: 'center', labelDX: 0, labelDY: 26 },
  { x: 420, y: 40, r: 7, color: [255, 255, 255], label: 'Agenda la cita', labelAlign: 'right', labelDX: -14, labelDY: 4 },
  { x: 440, y: 150, r: 7, color: [255, 255, 255], label: 'Registra la reserva', labelAlign: 'right', labelDX: -14, labelDY: 4 },
  { x: 420, y: 260, r: 7, color: [255, 255, 255], label: 'Avisa a tu equipo', labelAlign: 'right', labelDX: -14, labelDY: 4 },
];

export const FLOW_ROUTES: { from: number; to: number }[] = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 1, to: 4 },
];
