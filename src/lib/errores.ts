/** Error whose message is safe to show to the user (Spanish UI text). */
export class ErrorDominio extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErrorDominio";
  }
}

export type ResultadoAccion = { ok: true } | { ok: false; error: string };

/** Runs a mutation and turns domain errors into a result the UI can display. */
export async function ejecutarAccion(fn: () => Promise<unknown>): Promise<ResultadoAccion> {
  try {
    await fn();
    return { ok: true };
  } catch (error) {
    if (error instanceof ErrorDominio) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Ocurrió un error inesperado. Intenta de nuevo." };
  }
}
