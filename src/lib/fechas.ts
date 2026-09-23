export const ZONA_HORARIA = "America/Guayaquil";

/** Today's date (YYYY-MM-DD) in Ecuador, regardless of the server's timezone. */
export function hoy(ahora: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA }).format(ahora);
}

/** Current month (YYYY-MM) in Ecuador. */
export function mesActual(ahora: Date = new Date()): string {
  return hoy(ahora).slice(0, 7);
}

export function esMesValido(mes: string | undefined): mes is string {
  return !!mes && /^\d{4}-(0[1-9]|1[0-2])$/.test(mes);
}

/** First day of `mes` and first day of the following month (exclusive end). */
export function rangoMes(mes: string): { desde: string; hasta: string } {
  const [anio, m] = mes.split("-").map(Number);
  const siguiente = m === 12 ? `${anio + 1}-01` : `${anio}-${String(m + 1).padStart(2, "0")}`;
  return { desde: `${mes}-01`, hasta: `${siguiente}-01` };
}

export function desplazarMes(mes: string, delta: number): string {
  const [anio, m] = mes.split("-").map(Number);
  const total = anio * 12 + (m - 1) + delta;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

const formatoMes = new Intl.DateTimeFormat("es", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const formatoCorto = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** "Septiembre de 2026" */
export function nombreMes(mes: string): string {
  const texto = formatoMes.format(new Date(`${mes}-01T00:00:00Z`));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "23 sept" for a YYYY-MM-DD date column. */
export function fechaCorta(fecha: string): string {
  return formatoCorto.format(new Date(`${fecha}T00:00:00Z`));
}
