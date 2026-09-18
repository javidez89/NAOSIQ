import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const coverage = JSON.parse(readFileSync('docs/naosiq-v6-coverage.json', 'utf8').replace(/^\uFEFF/, ''));
const kitMachines = JSON.parse(readFileSync(`${coverage.sourceRoot}/contracts/state-machines.json`, 'utf8'));
const identity = readFileSync('src/domain/identity.ts', 'utf8');
const repairs = readFileSync('src/domain/repairs.ts', 'utf8');
const e2e = readFileSync('tests/e2e/local-flow.spec.ts', 'utf8');
const release = readFileSync('docs/12-release.md', 'utf8');
const br02 = JSON.parse(readFileSync('reports/local/br02/coverage-matrix.json', 'utf8'));

const requiredRoles = ['super_user', 'admin', 'advisor', 'technician', 'customer'];
for (const role of requiredRoles) if (!identity.includes(`'${role}'`)) throw new Error(`Falta el rol ${role}.`);
for (const marker of [
  'carga, error, vacío y cierre de sesión',
  'form[aria-busy="true"]',
  'No encontramos equipos con esos filtros',
  'abrir y descargar un comprobante no duplica custodia ni dinero',
]) if (!e2e.includes(marker)) throw new Error(`Falta la regresión E2E: ${marker}`);
if (!release.includes('BLOQUEADA para datos reales')) throw new Error('La puerta de producción debe permanecer bloqueada.');
if (br02.contract?.screens !== 118 || br02.contract?.actions !== 363) throw new Error('La matriz de marca perdió el contrato de vistas o acciones.');

const statusesBlock = repairs.match(/statuses = \[([^\]]+)\]/)?.[1] ?? '';
const localStates = [...statusesBlock.matchAll(/'([^']+)'/g)].map(match => match[1]);
const kitRepairStates = [
  ...kitMachines.machines.repair.states,
  ...kitMachines.machines.repair.substates,
].map(value => value.toLowerCase());
const missingKitStates = kitRepairStates.filter(state => !localStates.includes(state));
const releasePending = [...release.matchAll(/^- \[ \]/gm)].length;
const checks = [
  { area: 'loading', status: 'verified', evidence: 'E2E demora la acción real y observa aria-busy, anuncio y botón deshabilitado.' },
  { area: 'empty', status: 'verified', evidence: 'E2E aplica un filtro sin coincidencias y observa el estado vacío.' },
  { area: 'success', status: 'verified', evidence: 'E2E completa login, recepción, cambio técnico y pago confirmado.' },
  { area: 'error', status: 'verified', evidence: 'E2E usa una credencial sintética inválida y observa role=alert sin filtrar datos.' },
  { area: 'timeout', status: 'pending', evidence: 'No existe todavía un contrato de timeout y recuperación específico en la UI.' },
  { area: 'session', status: 'verified', evidence: 'E2E valida tres sesiones independientes y cierre local del portal.' },
  { area: 'permissions', status: 'verified', evidence: 'E2E y pgTAP validan cinco roles, MFA y aislamiento A/B en UI, RPC y Data API.' },
  { area: 'offline', status: 'pending', evidence: 'No hay service worker, cola offline ni reconciliación implementados.' },
  { area: 'closure', status: 'partial', evidence: 'Cierre de sesión verificado; cierre de OT, custodia y entrega del contrato aún no existen.' },
  { area: 'retry_custody', status: 'verified', evidence: 'pgTAP y E2E concurrente conservan un evento y un voucher.' },
  { area: 'retry_money', status: 'verified', evidence: 'Dominio y pgTAP aceptan confirmación idéntica sin crear otro movimiento.' },
  { area: 'reprint', status: 'verified', evidence: 'E2E abre y descarga el mismo PDF cuatro veces y conserva conteos de custodia, pagos y vouchers.' },
  { area: 'controls', status: 'verified', evidence: 'Contrato BR01 y comprobación de foco, alturas, estados y tipografía.' },
  { area: 'co_branding', status: 'partial', evidence: `Aplicado en ${br02.summary.partialScreens} superficies; ${br02.summary.notImplementedScreens} pantallas no existen todavía.` },
];
const report = {
  prompt: 'BR03',
  generatedAt: new Date().toISOString(),
  conclusion: 'partial',
  story: 'Portal y acción autorizada -> Server Action o ruta PDF -> Supabase local con RLS/RPC -> respuesta visible sin duplicar hechos.',
  checks,
  graphs: {
    roles: { status: 'verified', expected: requiredRoles, actual: requiredRoles },
    repair: { status: 'partial', localStates: [...new Set(localStates)], missingKitStates },
    note: 'El grafo V6 es una propuesta técnica más amplia. No se declara conforme mientras falten estados, guardas y decisiones abiertas.',
  },
  release: {
    status: 'blocked',
    pendingChecklistItems: releasePending,
    domainsMigrated: false,
    deploymentPerformed: false,
    note: 'No se publicó, desplegó ni migró un dominio.',
  },
  totals: {
    verified: checks.filter(item => item.status === 'verified').length,
    partial: checks.filter(item => item.status === 'partial').length,
    pending: checks.filter(item => item.status === 'pending').length,
  },
};
mkdirSync('reports/local/br03', { recursive: true });
writeFileSync('reports/local/br03/regression-matrix.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(`BR03 parcial: ${report.totals.verified} áreas verificadas, ${report.totals.partial} parciales y ${report.totals.pending} pendientes.`);
console.log(`Publicación bloqueada: ${releasePending} controles del checklist sin aceptación.`);
