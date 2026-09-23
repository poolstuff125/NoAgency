import { expect, test } from "@playwright/test";

test("sin sesión, el tablero redirige al login", async ({ page }) => {
  await page.goto("/tablero");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { level: 1, name: "Ingresar" })).toBeVisible();
});

test("la raíz lleva al login sin sesión", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

test("recuperar contraseña es público", async ({ page }) => {
  await page.goto("/recuperar");
  await expect(page.getByRole("heading", { level: 1, name: "Recuperar contraseña" })).toBeVisible();
  await page.getByRole("link", { name: "Volver a ingresar" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("health endpoint is ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  expect(await res.json()).toMatchObject({ status: "ok" });
});
