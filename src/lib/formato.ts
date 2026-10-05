// Formato de montos en soles. Todos los precios del sitio pasan por aquí:
// los números viven en src/data/precios.ts y nunca se escriben a mano en otro lado.

/** 800 → "S/800" · 1100 → "S/1,100" · 0.4 → "S/0.40" */
export function soles(monto: number): string {
  const texto = Number.isInteger(monto) ? monto.toLocaleString('en-US') : monto.toFixed(2);
  return `S/${texto}`;
}

/** Rango con los dos extremos completos: "S/450 – S/700" */
export function rangoSoles(min: number, max: number): string {
  return `${soles(min)} – ${soles(max)}`;
}

/** Rango compacto, con el símbolo una sola vez: "S/50–80" */
export function rangoCorto(min: number, max: number): string {
  return `${soles(min)}–${max.toLocaleString('en-US')}`;
}

/** "S/100/mes" */
export function porMes(monto: number): string {
  return `${soles(monto)}/mes`;
}
