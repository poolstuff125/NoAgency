// @vitest-environment node
import { randomUUID } from "node:crypto";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { Db } from "@/db/client";
import type { Perfil } from "@/db/schema";
import { crearDbPrueba, vaciarDb } from "@/test/db";
import { crearPerfil } from "@/test/fixtures";

import { actualizarMiembro, invitarMiembro, type Invitador } from "./equipo";

let db: Db;
let admin: Perfil;
let invitar: ReturnType<typeof vi.fn<Invitador>>;

beforeAll(async () => {
  db = await crearDbPrueba();
});

beforeEach(async () => {
  await vaciarDb(db);
  admin = await crearPerfil(db, { rol: "admin" });
  invitar = vi.fn<Invitador>(async () => ({ id: randomUUID() }));
});

describe("invitarMiembro", () => {
  it("invita y crea el perfil con el id de Auth", async () => {
    const perfil = await invitarMiembro(
      db,
      admin,
      { nombre: "Ricardo Silva", email: " Ricardo@Example.com ", areaPrincipal: "audiovisual" },
      invitar,
    );
    expect(invitar).toHaveBeenCalledWith("ricardo@example.com", "Ricardo Silva");
    expect(perfil).toMatchObject({ rol: "equipo", areaPrincipal: "audiovisual", activo: true });
    expect(perfil.id).toBe((await invitar.mock.results[0].value).id);
  });

  it("rechaza emails repetidos sin llamar a Supabase", async () => {
    await invitarMiembro(db, admin, { nombre: "A", email: "a@example.com" }, invitar);
    await expect(
      invitarMiembro(db, admin, { nombre: "A", email: "A@example.com" }, invitar),
    ).rejects.toThrow("Ya existe");
    expect(invitar).toHaveBeenCalledTimes(1);
  });

  it("solo el admin invita", async () => {
    const equipo = await crearPerfil(db);
    await expect(
      invitarMiembro(db, equipo, { nombre: "X", email: "x@example.com" }, invitar),
    ).rejects.toThrow("Solo el admin");
  });
});

describe("actualizarMiembro", () => {
  it("cambia rol, área y estado", async () => {
    const m = await crearPerfil(db);
    const act = await actualizarMiembro(db, admin, m.id, {
      rol: "admin",
      areaPrincipal: "diseno",
      activo: false,
    });
    expect(act).toMatchObject({ rol: "admin", areaPrincipal: "diseno", activo: false });
  });

  it("el admin no puede degradarse ni desactivarse", async () => {
    await expect(actualizarMiembro(db, admin, admin.id, { activo: false })).rejects.toThrow(
      "propia cuenta",
    );
    await expect(actualizarMiembro(db, admin, admin.id, { rol: "equipo" })).rejects.toThrow();
  });
});
