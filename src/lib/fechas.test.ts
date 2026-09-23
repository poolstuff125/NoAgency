import { describe, expect, it } from "vitest";

import { desplazarMes, hoy, mesActual, nombreMes, rangoMes } from "./fechas";

describe("fechas (America/Guayaquil)", () => {
  it("usa la fecha de Ecuador, no la UTC", () => {
    // 03:00 UTC del 1 de octubre = 22:00 del 30 de septiembre en Ecuador.
    const ahora = new Date("2026-10-01T03:00:00Z");
    expect(hoy(ahora)).toBe("2026-09-30");
    expect(mesActual(ahora)).toBe("2026-09");
  });

  it("calcula rangos y desplazamientos de mes", () => {
    expect(rangoMes("2026-12")).toEqual({ desde: "2026-12-01", hasta: "2027-01-01" });
    expect(desplazarMes("2026-01", -1)).toBe("2025-12");
    expect(desplazarMes("2026-09", 1)).toBe("2026-10");
  });

  it("nombra el mes en español", () => {
    expect(nombreMes("2026-09")).toBe("Septiembre de 2026");
  });
});
