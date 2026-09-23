import { z } from "zod";

/** Treats "" (empty form fields) as null. */
export const vacioANulo = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), schema.nullable());

export const fecha = z.iso.date({ error: "Fecha inválida." });
export const colorHex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido (usa #RRGGBB).");

/** First validation message, for showing a single error in the UI. */
export function primerError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Datos inválidos.";
}
