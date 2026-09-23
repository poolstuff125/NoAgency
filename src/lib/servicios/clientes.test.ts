// @vitest-environment node
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Db } from "@/db/client";
import type { Perfil } from "@/db/schema";
import { crearDbPrueba, vaciarDb } from "@/test/db";
import { crearPerfil } from "@/test/fixtures";

import { actualizarCliente, crearCliente, listarClientes } from "./clientes";

let db: Db;
let admin: Perfil;
let equipo: Perfil;

beforeAll(async () => {
  db = await crearDbPrueba();
});

beforeEach(async () => {
  await vaciarDb(db);
  admin = await crearPerfil(db, { rol: "admin" });
  equipo = await crearPerfil(db);
});

describe("clientes", () => {
  it("el admin crea con color por defecto", async () => {
    const c = await crearCliente(db, admin, { nombre: "Café Puyo" });
    expect(c.color).toBe("#6366f1");
    expect(c.activo).toBe(true);
  });

  it("el equipo no crea ni edita clientes", async () => {
    await expect(crearCliente(db, equipo, { nombre: "X" })).rejects.toThrow("Solo el admin");
    const c = await crearCliente(db, admin, { nombre: "X" });
    await expect(actualizarCliente(db, equipo, c.id, { nombre: "Y" })).rejects.toThrow();
  });

  it("actualizar parcialmente no pisa otros campos", async () => {
    const c = await crearCliente(db, admin, { nombre: "X", color: "#112233" });
    const act = await actualizarCliente(db, admin, c.id, { nombre: "Y" });
    expect(act).toMatchObject({ nombre: "Y", color: "#112233", activo: true });
  });

  it("valida color y logo", async () => {
    await expect(crearCliente(db, admin, { nombre: "X", color: "rojo" })).rejects.toThrow(
      "Color inválido",
    );
    await expect(crearCliente(db, admin, { nombre: "X", logoUrl: "no-url" })).rejects.toThrow(
      "URL válida",
    );
  });

  it("lista solo activos por defecto", async () => {
    const c = await crearCliente(db, admin, { nombre: "A" });
    await crearCliente(db, admin, { nombre: "B" });
    await actualizarCliente(db, admin, c.id, { activo: false });
    expect((await listarClientes(db)).map((x) => x.nombre)).toEqual(["B"]);
    expect(await listarClientes(db, { soloActivos: false })).toHaveLength(2);
  });
});
