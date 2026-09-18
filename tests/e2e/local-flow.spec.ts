import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test, expect, type Page, type Locator } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { authenticatedClient, localFixture, login, temporaryTotp, totp } from '../helpers/local-auth';

// Run explicitly with playwright.local.config.ts, never against production.
test.beforeEach(async ({}, testInfo) => {
  test.skip(!testInfo.config.configFile?.endsWith('playwright.local.config.ts'), 'Requiere configuración local explícita.');
  localFixture();
});

function order(tenant: string, repair: string, portal = 'comercio') { return `/${portal}/t/${tenant}/repairs/${repair}`; }

async function enterTenant(page: Page, tenant: string) {
  await page.locator(`a[href="/${new URL(page.url()).pathname.split('/')[1]}/t/${tenant}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/(comercio|cliente|master)/t/${tenant}$`));
}

async function submit(page: Page, label: string) {
  const response = page.waitForResponse(result => result.request().method() === 'POST' && new URL(result.url()).origin === 'http://127.0.0.1:3000');
  await page.getByRole('button', { name: label, exact: true }).click();
  const result = await response;
  expect(result.ok(), `${label}: HTTP ${result.status()} en ${new URL(result.url()).pathname}`).toBe(true);
}

async function downloadPdf(page: Page, article: Locator, title: string) {
  const repairUrl = page.url();
  const href = await article.getByRole('link', { name: 'Ver e imprimir PDF' }).getAttribute('href');
  expect(href).toMatch(/^\/(comercio|cliente|master)\/t\/[0-9a-f-]+\/vouchers\/[0-9a-f-]+$/);
  const response = await page.request.get(href!);
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('application/pdf');
  const cacheDirectives = (response.headers()['cache-control'] ?? '').split(',').map(value => value.trim());
  expect(cacheDirectives).toEqual(expect.arrayContaining(['private', 'no-store']));
  expect(cacheDirectives).not.toContain('public');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    article.getByRole('link', { name: 'Descargar PDF' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^comprobante-[0-9a-f-]+\.pdf$/);
  expect(await download.failure()).toBeNull();
  await expect(page).toHaveURL(repairUrl);
  const path = await download.path();
  expect(path).not.toBeNull();
  const bytes = readFileSync(path!);
  expect(bytes.subarray(0, 5).toString('ascii')).toBe('%PDF-');
  const pdf = await PDFDocument.load(bytes);
  expect(pdf.getTitle()).toBe(title);
  expect(pdf.getPageCount()).toBeGreaterThan(0);
}

test('TOTP coincide con vectores públicos RFC 6238', () => {
  const publicRfcSecret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
  expect(totp(publicRfcSecret, 59_000)).toBe('287082');
  expect(totp(publicRfcSecret, 1_111_111_109_000)).toBe('081804');
});

test('administrador recibe, técnico avanza y MFA confirma el pago con comprobantes PDF', async ({ page, browser }) => {
  const { seed, accounts } = localFixture();
  const tag = randomUUID().slice(0, 8);
  const customer = `Cliente E2E ${tag}`;
  const device = `Equipo E2E ${tag}`;
  await login(page, 'adminA');
  await enterTenant(page, seed.tenants.a);
  await page.getByLabel('Nombre completo').fill(customer);
  await page.getByLabel('Teléfono de contacto').fill('3000000000');
  await submit(page, 'Crear cliente y continuar');
  await expect(page.getByRole('status')).toContainText(`Cliente seleccionado: ${customer}`);
  await expect(page.getByRole('combobox', { name: /^Cliente/ })).not.toHaveValue('');
  await page.getByLabel('Equipo u objeto').fill(device);
  await page.getByLabel('Falla reportada', { exact: true }).fill('Equipo sintético de prueba; falla de encendido para comprobar el flujo local.');
  await submit(page, 'Crear orden');
  await expect(page.getByRole('heading', { name: device, exact: true })).toBeVisible();
  const repairPath = new URL(page.url()).pathname;
  const repairId = repairPath.split('/').at(-1)!;
  await expect(page.locator('#vouchers article')).toHaveCount(0);
  await page.getByLabel('Estado físico', { exact: true }).fill('Rayón superficial en la tapa; pantalla intacta.');
  await page.getByLabel('Accesorios recibidos').fill('Sin accesorios');
  await page.getByLabel('Confirmo que recibí físicamente').check();
  await submit(page, 'Confirmar recepción física');
  await expect(page.locator('#custodia')).toContainText('Recepción confirmada');
  await expect(page.locator('#vouchers article')).toHaveCount(1);
  await downloadPdf(page, page.locator('#vouchers article'), 'Comprobante de recepción');

  await page.getByLabel('Técnico del comercio').selectOption(accounts.technicianA.id);
  await submit(page, 'Guardar asignación');
  await expect(page.getByText('Técnico: Técnico del comercio A', { exact: true })).toBeVisible();

  const technicianContext = await browser.newContext({ baseURL: 'http://127.0.0.1:3000' });
  try {
    const technician = await technicianContext.newPage();
    await login(technician, 'technicianA');
    await enterTenant(technician, seed.tenants.a);
    await expect(technician.getByRole('heading', { name: 'Mis asignaciones', exact: true })).toBeVisible();
    await technician.getByRole('link', { name: `Ver reparación de ${device}`, exact: true }).click();
    await expect(technician.getByRole('heading', { name: device, exact: true })).toBeVisible();
    await expect(technician.getByRole('heading', { name: 'Pagos y abonos' })).toHaveCount(0);
    await technician.getByLabel('Nuevo estado').selectOption('in_repair');
    await submit(technician, 'Guardar estado');
    await expect(technician.locator('.page-heading .status')).toHaveText('En reparación');
    await expect(technician.locator('#history li').first()).toContainText('En reparación');
    await technician.goto(order(seed.tenants.a, seed.repairs.aLaptop));
    await expect(technician.getByRole('heading', { name: 'Recurso no disponible' })).toBeVisible();
  } finally { await technicianContext.close(); }

  await page.reload();
  await expect(page.locator('.page-heading .status')).toHaveText('En reparación');
  await page.getByLabel(/Importe en COP/).fill('75000.50');
  await page.getByLabel('Medio de pago').selectOption('nequi');
  await submit(page, 'Registrar pago pendiente');
  await expect(page.locator('#payments article .status')).toHaveText('Pendiente de confirmar');
  await expect(page.locator('#payments article')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Confirmar ingreso' })).toHaveCount(0);
  await expect(page.locator('#vouchers article')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /verifica tu cuenta con el segundo factor/ })).toBeVisible();

  const aal1 = await authenticatedClient('adminA');
  try {
    const pending = await aal1.from('payments').select('id,status,amount_minor').eq('repair_id', repairId).single();
    expect(pending.error).toBeNull();
    expect(pending.data?.status).toBe('pending');
    expect(pending.data?.amount_minor).toBe(7_500_050);
    const rejected = await aal1.rpc('confirm_payment', { p_tenant: seed.tenants.a, p_payment: pending.data!.id });
    expect(rejected.error?.code).toBe('42501');
    const vouchers = await aal1.from('vouchers').select('id').eq('repair_id', repairId).eq('kind', 'payment');
    expect(vouchers.error).toBeNull();
    expect(vouchers.data).toEqual([]);
  } finally { await aal1.auth.signOut({ scope: 'local' }); }

  const mfa = await temporaryTotp('adminA');
  try {
    await mfa.verifyInBrowser(page);
    await page.goto(repairPath);
    await submit(page, 'Confirmar ingreso');
    await expect(page.locator('#payments article .status')).toHaveText('Confirmado');
    await expect(page.getByRole('button', { name: 'Confirmar ingreso' })).toHaveCount(0);
    await expect(page.locator('#vouchers article')).toHaveCount(2);
    const paymentVoucher = page.locator('#vouchers article').filter({ hasText: 'Comprobante de pago' });
    await downloadPdf(page, paymentVoucher, 'Comprobante de pago');
    await page.reload();
    await expect(page.locator('#payments article .status')).toHaveText('Confirmado');
    await expect(page.locator('#vouchers article')).toHaveCount(2);
  } finally { await mfa.cleanup(); }
});

test('dos confirmaciones concurrentes conservan un evento y un voucher de recepción', async () => {
  const { seed } = localFixture();
  const db = await authenticatedClient('adminA');
  try {
    const customer = await db.from('customers').select('id').eq('tenant_id', seed.tenants.a).limit(1).single();
    expect(customer.error).toBeNull();
    const created = await db.rpc('create_repair', { p_tenant: seed.tenants.a, p_customer: customer.data!.id,
      p_device: 'Equipo de ensayo de concurrencia', p_issue: 'Prueba sintética de recepción duplicada.', p_request_id: randomUUID() });
    expect(created.error).toBeNull();
    const args = { p_tenant: seed.tenants.a, p_repair: created.data!, p_expected_version: 1,
      p_operation_id: randomUUID(), p_condition: 'Sin daños visibles', p_accessories: 'Sin accesorios' };
    const results = await Promise.all([db.rpc('confirm_intake', args), db.rpc('confirm_intake', args)]);
    for (const result of results) expect(result.error).toBeNull();
    expect(results[0].data).toBe(results[1].data);
    const events = await db.from('intake_events').select('id,voucher_id').eq('repair_id', created.data!);
    expect(events.error).toBeNull();
    expect(events.data).toHaveLength(1);
    const vouchers = await db.from('vouchers').select('id').eq('repair_id', created.data!).eq('kind', 'intake');
    expect(vouchers.error).toBeNull();
    expect(vouchers.data).toHaveLength(1);
    expect(events.data![0]!.voucher_id).toBe(vouchers.data![0]!.id);
  } finally { await db.auth.signOut({ scope: 'local' }); }
});

test('tres portales mantienen sesiones independientes en el mismo navegador', async ({ context, page }) => {
  const { seed } = localFixture();
  await login(page, 'adminA');
  const customer = await context.newPage();
  const master = await context.newPage();
  await login(customer, 'customerA');
  await login(master, 'master');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Mis comercios', exact: true })).toBeVisible();
  await enterTenant(customer, seed.tenants.a);
  await expect(customer.getByRole('navigation').getByRole('link', { name: /CRM maestro|Comercio/ })).toHaveCount(0);
  await expect(customer.getByRole('heading', { name: 'Mis equipos', exact: true })).toBeVisible();
  await customer.goto('/cliente');
  await customer.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await expect(customer).toHaveURL(/\/cliente\/login$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Mis comercios', exact: true })).toBeVisible();
  await master.reload();
  await expect(master.getByRole('heading', { name: 'CRM maestro protegido' })).toBeVisible();
  await master.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await expect(master).toHaveURL(/\/master\/login$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Mis comercios', exact: true })).toBeVisible();
});

test('cliente no abre otros portales ni inicia sesión como personal', async ({ page }) => {
  const { accounts } = localFixture();
  await login(page, 'customerA');
  for (const portal of ['comercio', 'master']) {
    await page.goto(`/${portal}`);
    await expect(page).toHaveURL(new RegExp(`/${portal}/login$`));
    try {
      await page.getByLabel('Correo electrónico').fill(accounts.customerA.email);
      await page.getByLabel('Contraseña', { exact: true }).fill(accounts.customerA.password);
      await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
    } catch { throw new Error('No se pudo completar el intento sintético; credenciales omitidas.'); }
    await expect(page.getByText(/Esta cuenta no tiene acceso a este portal/)).toBeVisible();
  }
  await page.goto('/cliente');
  await expect(page.getByRole('heading', { name: 'Mis servicios', exact: true })).toBeVisible();
  // A caller-supplied portal header cannot select another cookie jar.
  const response = await page.request.get('/comercio', { headers: { 'x-naosiq-portal': 'cliente' }, maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toContain('/comercio/login');
});

test('asesor consulta recepción pero UI y RPC impiden registrar o confirmar pagos', async ({ page }) => {
  const { seed } = localFixture();
  await login(page, 'advisorA');
  await enterTenant(page, seed.tenants.a);
  await expect(page.getByRole('button', { name: 'Crear cliente y continuar' })).toBeVisible();
  await page.getByRole('link', { name: 'Ver reparación de Teléfono de prueba A', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Teléfono de prueba A' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pagos y abonos' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Registrar pago pendiente' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Confirmar ingreso' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Guardar asignación' })).toHaveCount(0);
  await expect(page.locator('#vouchers article')).toHaveCount(1);

  const db = await authenticatedClient('advisorA');
  try {
    const record = await db.rpc('record_payment', { p_tenant: seed.tenants.a, p_repair: seed.repairs.aPhone, p_amount: 10000, p_method: 'cash', p_idempotency_key: randomUUID() });
    expect(record.error?.code).toBe('42501');
    const confirmation = await db.rpc('confirm_payment', { p_tenant: seed.tenants.a, p_payment: seed.payments.aPending });
    expect(confirmation.error?.code).toBe('42501');
    const payments = await db.from('payments').select('id').eq('tenant_id', seed.tenants.a);
    expect(payments.error).toBeNull();
    expect(payments.data).toEqual([]);
  } finally { await db.auth.signOut({ scope: 'local' }); }
});

for (const scenario of [
  { role: 'customerA', tenant: 'a', own: 'aPhone', hidden: 'aLaptop', ownTitle: 'Teléfono de prueba A', hiddenTitle: 'Portátil de prueba A' },
  { role: 'customerB', tenant: 'b', own: 'bPhone', hidden: 'bLaptop', ownTitle: 'Teléfono de prueba B', hiddenTitle: 'Portátil de prueba B' },
] as const) {
  test(`${scenario.role} solo consulta sus equipos y comprobantes`, async ({ page }) => {
    const { seed } = localFixture();
    const tenant = seed.tenants[scenario.tenant];
    await login(page, scenario.role);
    await enterTenant(page, tenant);
    await expect(page.getByRole('heading', { name: 'Mis equipos', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: `Ver reparación de ${scenario.hiddenTitle}`, exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Crear cliente y continuar' })).toHaveCount(0);
    await page.getByRole('link', { name: `Ver reparación de ${scenario.ownTitle}`, exact: true }).click();
    await expect(page.getByRole('heading', { name: scenario.ownTitle, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guardar estado' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Registrar pago pendiente' })).toHaveCount(0);
    await downloadPdf(page, page.locator('#vouchers article').filter({ hasText: 'Comprobante de recepción' }), 'Comprobante de recepción');
    await page.goto(order(tenant, seed.repairs[scenario.hidden], 'cliente'));
    await expect(page.getByRole('heading', { name: 'Recurso no disponible' })).toBeVisible();
    const denied = await page.request.get(`/cliente/t/${tenant}/vouchers/${seed.vouchers[scenario.hidden]}`);
    expect(denied.status()).toBe(404);
    expect(denied.headers()['content-type']).not.toContain('application/pdf');
  });
}

for (const scenario of [
  { role: 'adminA', own: 'a', foreign: 'b', repair: 'bPhone', title: 'Teléfono de prueba B' },
  { role: 'adminB', own: 'b', foreign: 'a', repair: 'aPhone', title: 'Teléfono de prueba A' },
] as const) {
  test(`${scenario.role} no cruza la frontera entre comercios por URL ni Data API`, async ({ page }) => {
    const { seed } = localFixture();
    const foreign = seed.tenants[scenario.foreign];
    await login(page, scenario.role);
    await expect(page.locator(`a[href="/comercio/t/${foreign}"]`)).toHaveCount(0);
    await enterTenant(page, seed.tenants[scenario.own]);
    await expect(page.getByRole('link', { name: `Ver reparación de ${scenario.title}`, exact: true })).toHaveCount(0);
    await page.goto(order(foreign, seed.repairs[scenario.repair]));
    await expect(page.getByRole('heading', { name: 'No pudimos completar la solicitud' })).toBeVisible();
    await expect(page.getByRole('heading', { name: scenario.title, exact: true })).toHaveCount(0);
    const db = await authenticatedClient(scenario.role);
    try {
      const [repairs, customers, payments, vouchers] = await Promise.all([
        db.from('repairs').select('id').eq('tenant_id', foreign),
        db.from('customers').select('id').eq('tenant_id', foreign),
        db.from('payments').select('id').eq('tenant_id', foreign),
        db.from('vouchers').select('id').eq('tenant_id', foreign),
      ]);
      for (const result of [repairs, customers, payments, vouchers]) {
        expect(result.error).toBeNull();
        expect(result.data).toEqual([]);
      }
      const rejected = await db.rpc('create_customer', { p_tenant: foreign, p_name: `NO CREAR E2E ${randomUUID().slice(0, 8)}`, p_phone: '' });
      expect(rejected.error?.code).toBe('42501');
    } finally { await db.auth.signOut({ scope: 'local' }); }
  });
}

test('CRM maestro exige TOTP real y permite consultar ambos comercios tras verificar', async ({ page }) => {
  const { seed } = localFixture();
  await login(page, 'master');
  await page.goto('/master');
  await expect(page.getByRole('heading', { name: 'CRM maestro protegido', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Crear comercio y acceso' })).toHaveCount(0);
  const mfa = await temporaryTotp('master');
  try {
    await mfa.verifyInBrowser(page);
    await page.goto('/master');
    await expect(page.getByRole('heading', { name: 'CRM maestro', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Crear comercio' })).toBeVisible();
    await expect(page.locator(`a[href="/master/businesses/${seed.tenants.a}"]`)).toBeVisible();
    await expect(page.locator(`a[href="/master/businesses/${seed.tenants.b}"]`)).toBeVisible();
    await page.locator(`a[href="/master/businesses/${seed.tenants.a}"]`).click();
    await page.getByRole('link', { name: 'Entrar al CRM' }).click();
    await page.getByLabel('Motivo obligatorio').fill('Verificación E2E del contexto maestro');
    await page.getByRole('button', { name: 'Entrar con control total' }).click();
    await page.waitForURL(`**/master/t/${seed.tenants.a}`);
    await expect(page.getByText(/CONTROL TOTAL/)).toBeVisible();
    await page.goto(`/master/t/${seed.tenants.b}`);
    await expect(page).toHaveURL(new RegExp(`/master/businesses/${seed.tenants.b}/control\\?notice=context$`));
    await page.goto(`/master/t/${seed.tenants.a}`);
    await page.getByRole('button', { name: 'Salir del comercio' }).click();
    await expect(page).toHaveURL(new RegExp(`/master/businesses/${seed.tenants.a}\\?notice=closed$`));
    await expect(page.getByText('El contexto del comercio fue cerrado y auditado.')).toBeVisible();
    await page.goto('/master/businesses/new');
    await expect(page.getByRole('combobox', { name: 'Administrador inicial' }).locator('option')).toHaveCount(8);
    for (const [path, heading] of [
      ['plans', 'Planes'], ['subscriptions', 'Suscripciones'], ['billing', 'Facturación y pagos SaaS'],
      ['domains', 'URLs y dominios'], ['users', 'Usuarios globales'], ['integrations', 'Integraciones globales'],
      ['whatsapp', 'WhatsApp global'], ['audit', 'Auditoría global'], ['support', 'Soporte e incidentes'],
      ['settings', 'Configuración global'], ['analytics', 'Analítica y exportaciones SaaS'],
    ] as const) {
      await page.goto(`/master/${path}`);
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      await expect(page.locator('section.panel button:disabled')).toHaveCount(['users', 'domains'].includes(path) ? 1 : 3);
    }
  } finally { await mfa.cleanup(); }
});

test('carga, error, vacío y cierre de sesión se comunican sin ambigüedad', async ({ page }) => {
  const { seed, accounts } = localFixture();
  let delayed = false;
  await page.route('**/comercio/login', async route => {
    if (route.request().method() === 'POST' && !delayed) {
      delayed = true;
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    await route.continue();
  });
  await page.goto('/comercio/login');
  await page.getByLabel('Correo electrónico').fill(accounts.adminA.email);
  await page.getByLabel('Contraseña', { exact: true }).fill(accounts.adminA.password);
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click({ noWaitAfter: true });
  await expect(page.locator('form[aria-busy="true"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Procesando…', exact: true })).toBeDisabled();
  await page.waitForURL('**/comercio');
  await page.goto(`/comercio/t/${seed.tenants.a}?q=sin-coincidencias-${randomUUID()}`);
  await expect(page.getByRole('heading', { name: 'No encontramos equipos con esos filtros' })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/comercio\/login$/);
  await page.getByLabel('Correo electrónico').fill(accounts.adminA.email);
  await page.getByLabel('Contraseña', { exact: true }).fill('credencial-local-incorrecta');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page.locator('p[role="alert"]')).toContainText('No pudimos iniciar sesión');
});

test('abrir y descargar un comprobante no duplica custodia ni dinero', async ({ page }) => {
  const { seed } = localFixture();
  const db = await authenticatedClient('adminA');
  const counts = async () => {
    const [intakes, payments, vouchers] = await Promise.all([
      db.from('intake_events').select('id', { count: 'exact', head: true }).eq('repair_id', seed.repairs.aPhone),
      db.from('payments').select('id', { count: 'exact', head: true }).eq('repair_id', seed.repairs.aPhone),
      db.from('vouchers').select('id', { count: 'exact', head: true }).eq('repair_id', seed.repairs.aPhone),
    ]);
    for (const result of [intakes, payments, vouchers]) expect(result.error).toBeNull();
    return [intakes.count, payments.count, vouchers.count];
  };
  try {
    const before = await counts();
    await login(page, 'adminA');
    const path = `/comercio/t/${seed.tenants.a}/vouchers/${seed.vouchers.aPhone}`;
    for (const suffix of ['', '?download=1', '', '?download=1']) {
      const response = await page.request.get(`${path}${suffix}`);
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('application/pdf');
    }
    expect(await counts()).toEqual(before);
  } finally { await db.auth.signOut({ scope: 'local' }); }
});

test('cancelar Google conserva un retorno seguro y no crea una sesión', async ({ page }) => {
  const { seed, accounts } = localFixture();
  const ownRepair = order(seed.tenants.a, seed.repairs.aPhone, 'cliente');
  await page.goto(`/auth/callback?portal=cliente&error=access_denied&next=${encodeURIComponent('https://evil.example/steal')}`);
  await expect(page).toHaveURL(/\/cliente\/login\?notice=cancelled/);
  await expect(page.locator('p[role="alert"]')).toContainText('No se creó una sesión ni se asignó un rol');
  expect((await page.context().cookies()).filter(cookie => cookie.name.startsWith('naosiq-cliente-auth'))).toHaveLength(0);

  await page.goto(`/cliente/login?returnTo=${encodeURIComponent(ownRepair)}`);
  await page.getByLabel('Correo electrónico').fill(accounts.customerA.email);
  await page.getByLabel('Contraseña', { exact: true }).fill(accounts.customerA.password);
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await page.waitForURL(`**${ownRepair}`);
  await expect(page.getByRole('heading', { name: 'Teléfono de prueba A' })).toBeVisible();

  await page.goto(`/cliente/reauth?returnTo=${encodeURIComponent(ownRepair)}`);
  await expect(page.getByRole('heading', { name: 'Revisa tu sesión' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar sesión' }).click();
  await page.waitForURL(`**${ownRepair}`);
});

test('callback Google inválido o tardío falla cerrado y limita el portal', async ({ page }) => {
  await page.goto(`/auth/callback?portal=comercio&code=expired-synthetic-code&next=${encodeURIComponent('/master')}`);
  await expect(page).toHaveURL(/\/comercio\/login\?notice=oauth/);
  await expect(page.locator('p[role="alert"]')).toContainText('no pudo validarse o ya venció');
  await expect(page.locator('input[name="returnTo"]')).toHaveValue('/comercio');
  expect((await page.context().cookies()).filter(cookie => cookie.name.startsWith('naosiq-comercio-auth'))).toHaveLength(0);
});
