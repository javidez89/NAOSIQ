import { test, expect } from '@playwright/test';

test('el inicio abre el acceso al espacio de trabajo sin desbordarse', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Elige tu acceso' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});

test('el espacio requiere una sesión', async ({ page }) => {
  await page.goto('/app');
  await expect(page).toHaveURL(/\/login/);
});

test('el acceso requiere credenciales o explica la configuración faltante', async ({ page }) => {
  await page.goto('/comercio/login');
  await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
  const email = page.getByLabel('Correo electrónico');
  if (await email.count()) {
    await expect(email).toHaveAttribute('required', '');
    await expect(page.getByLabel('Contraseña', { exact: true })).toHaveAttribute('type', 'password');
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  } else {
    await expect(page.getByText(/No hay credenciales de demostración/)).toBeVisible();
  }
});

test('salud no revela claves ni infraestructura privada', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: 'ok', service: 'crm-techi', version: '0.1.0' });
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
});
