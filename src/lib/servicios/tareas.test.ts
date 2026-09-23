// @vitest-environment node
import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Db } from "@/db/client";
import { historial, tareas, type Cliente, type Perfil } from "@/db/schema";
import { crearDbPrueba, vaciarDb } from "@/test/db";
import { crearClienteDirecto, crearPerfil } from "@/test/fixtures";

import {
  actualizarTarea,
  contarPendientes,
  crearTarea,
  eliminarTarea,
  listarTareasTablero,
} from "./tareas";

let db: Db;
let admin: Perfil;
let ricardo: Perfil;
let dominga: Perfil;
let cliente: Cliente;

beforeAll(async () => {
  db = await crearDbPrueba();
});

beforeEach(async () => {
  await vaciarDb(db);
  admin = await crearPerfil(db, { nombre: "Paul Bayas", rol: "admin" });
  ricardo = await crearPerfil(db, { nombre: "Ricardo Silva", area: "audiovisual" });
  dominga = await crearPerfil(db, { nombre: "Dominga Coloma", area: "diseno" });
  cliente = await crearClienteDirecto(db, "Café Puyo");
});

const nueva = (extra: Record<string, unknown> = {}) => ({
  clienteId: cliente.id,
  titulo: "Reel lanzamiento",
  area: "audiovisual",
  ...extra,
});

describe("crearTarea", () => {
  it("asigna automáticamente al único perfil activo del área", async () => {
    const tarea = await crearTarea(db, admin, nueva());
    expect(tarea.responsableId).toBe(ricardo.id);
    expect(tarea.estado).toBe("no_iniciado");
    expect(tarea.prioridad).toBe(2);
    expect(tarea.creadoPor).toBe(admin.id);
  });

  it("deja sin responsable si hay varios perfiles en el área", async () => {
    await crearPerfil(db, { area: "audiovisual" });
    const tarea = await crearTarea(db, admin, nueva());
    expect(tarea.responsableId).toBeNull();
  });

  it("deja sin responsable si nadie tiene esa área", async () => {
    const tarea = await crearTarea(db, admin, nueva({ area: "pauta" }));
    expect(tarea.responsableId).toBeNull();
  });

  it("ignora perfiles inactivos en la asignación", async () => {
    await crearPerfil(db, { area: "diseno", activo: false });
    const tarea = await crearTarea(db, admin, nueva({ area: "diseno" }));
    expect(tarea.responsableId).toBe(dominga.id);
  });

  it("respeta el responsable indicado", async () => {
    const tarea = await crearTarea(db, admin, nueva({ responsableId: dominga.id }));
    expect(tarea.responsableId).toBe(dominga.id);
  });

  it("incrementa el orden dentro del cliente", async () => {
    const a = await crearTarea(db, admin, nueva());
    const b = await crearTarea(db, admin, nueva());
    expect(b.orden).toBe(a.orden + 1);
  });

  it("rechaza a miembros del equipo", async () => {
    await expect(crearTarea(db, ricardo, nueva())).rejects.toThrow("Solo el admin");
  });

  it("valida título y cliente", async () => {
    await expect(crearTarea(db, admin, nueva({ titulo: "  " }))).rejects.toThrow(
      "El título es obligatorio.",
    );
    const inactivo = await crearClienteDirecto(db, "Viejo", false);
    await expect(crearTarea(db, admin, nueva({ clienteId: inactivo.id }))).rejects.toThrow(
      "inactivo",
    );
  });
});

describe("actualizarTarea", () => {
  it("el responsable puede cambiar estado y link de entrega", async () => {
    const tarea = await crearTarea(db, admin, nueva());
    const act = await actualizarTarea(db, ricardo, tarea.id, {
      estado: "en_revision",
      linkEntrega: "https://drive.google.com/x",
    });
    expect(act.estado).toBe("en_revision");
    expect(act.linkEntrega).toBe("https://drive.google.com/x");
  });

  it("el equipo no puede marcar como listo", async () => {
    const tarea = await crearTarea(db, admin, nueva());
    await expect(actualizarTarea(db, ricardo, tarea.id, { estado: "listo" })).rejects.toThrow(
      "Solo el admin puede marcar",
    );
    const act = await actualizarTarea(db, admin, tarea.id, { estado: "listo" });
    expect(act.estado).toBe("listo");
  });

  it("el equipo no edita tareas ajenas ni cambia responsables", async () => {
    const tarea = await crearTarea(db, admin, nueva());
    await expect(actualizarTarea(db, dominga, tarea.id, { estado: "en_proceso" })).rejects.toThrow(
      "donde eres responsable",
    );
    await expect(
      actualizarTarea(db, ricardo, tarea.id, { responsableId: dominga.id }),
    ).rejects.toThrow("No tienes permiso");
  });

  it("standby exige motivo y se limpia al salir", async () => {
    const tarea = await crearTarea(db, admin, nueva());
    await expect(actualizarTarea(db, ricardo, tarea.id, { estado: "standby" })).rejects.toThrow(
      "motivo",
    );
    const enStandby = await actualizarTarea(db, ricardo, tarea.id, {
      estado: "standby",
      motivoStandby: "STOP FALTA MATERIAL",
    });
    expect(enStandby.motivoStandby).toBe("STOP FALTA MATERIAL");
    const reanudada = await actualizarTarea(db, ricardo, tarea.id, { estado: "en_proceso" });
    expect(reanudada.motivoStandby).toBeNull();
  });

  it("registra en historial estado, responsable y fechas", async () => {
    const tarea = await crearTarea(db, admin, nueva());
    await actualizarTarea(db, admin, tarea.id, {
      estado: "en_proceso",
      responsableId: dominga.id,
      fechaPublicacion: "2026-09-30",
      titulo: "Nuevo título",
    });
    const filas = await db.select().from(historial).where(eq(historial.tareaId, tarea.id));
    expect(filas.map((f) => f.campo).sort()).toEqual([
      "estado",
      "fecha_publicacion",
      "responsable_id",
    ]);
    const estado = filas.find((f) => f.campo === "estado");
    expect(estado).toMatchObject({
      usuarioId: admin.id,
      valorAnterior: "no_iniciado",
      valorNuevo: "en_proceso",
    });
  });

  it("no registra historial si el valor no cambia", async () => {
    const tarea = await crearTarea(db, admin, nueva());
    await actualizarTarea(db, admin, tarea.id, { estado: "no_iniciado" });
    const filas = await db.select().from(historial).where(eq(historial.tareaId, tarea.id));
    expect(filas).toHaveLength(0);
  });

  it("rechaza responsables inactivos", async () => {
    const tarea = await crearTarea(db, admin, nueva());
    const inactivo = await crearPerfil(db, { activo: false });
    await expect(
      actualizarTarea(db, admin, tarea.id, { responsableId: inactivo.id }),
    ).rejects.toThrow("inactivo");
  });
});

describe("eliminarTarea", () => {
  it("solo el admin borra", async () => {
    const tarea = await crearTarea(db, admin, nueva());
    await expect(eliminarTarea(db, ricardo, tarea.id)).rejects.toThrow("Solo el admin");
    await eliminarTarea(db, admin, tarea.id);
    expect(await db.select().from(tareas)).toHaveLength(0);
  });
});

describe("listarTareasTablero", () => {
  it("filtra por mes usando publicación, luego entrega", async () => {
    await crearTarea(db, admin, nueva({ titulo: "sept", fechaPublicacion: "2026-09-15" }));
    await crearTarea(db, admin, nueva({ titulo: "oct", fechaPublicacion: "2026-10-01" }));
    await crearTarea(db, admin, nueva({ titulo: "entrega sept", fechaEntrega: "2026-09-30" }));
    const sept = await listarTareasTablero(db, { mes: "2026-09" });
    expect(sept.map((t) => t.titulo).sort()).toEqual(["entrega sept", "sept"]);
  });

  it("filtra por área, estado y sin responsable", async () => {
    await crearTarea(db, admin, nueva({ fechaPublicacion: "2026-09-10" }));
    await crearTarea(db, admin, nueva({ area: "pauta", fechaPublicacion: "2026-09-10" }));
    expect(await listarTareasTablero(db, { mes: "2026-09", area: "pauta" })).toHaveLength(1);
    expect(await listarTareasTablero(db, { mes: "2026-09", responsableId: "sin" })).toHaveLength(1);
    expect(await listarTareasTablero(db, { mes: "2026-09", estado: "listo" })).toHaveLength(0);
  });
});

describe("contarPendientes", () => {
  it("admin cuenta en revisión; equipo cuenta sus cambios", async () => {
    const t = await crearTarea(db, admin, nueva());
    await actualizarTarea(db, ricardo, t.id, { estado: "en_revision" });
    expect(await contarPendientes(db, admin)).toBe(1);
    await actualizarTarea(db, admin, t.id, { estado: "cambios" });
    expect(await contarPendientes(db, ricardo)).toBe(1);
    expect(await contarPendientes(db, dominga)).toBe(0);
  });
});
