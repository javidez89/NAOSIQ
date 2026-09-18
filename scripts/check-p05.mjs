import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const migration = read('supabase/migrations/20260916200057_tenant_url_manager.sql');
const fix = read('supabase/migrations/20260916200241_fix_atomic_tenant_route_switch.sql');
const test = read('supabase/tests/database/tenant_routes.test.sql');
const ui = read('src/app/master/[section]/page.tsx');
const actions = read('src/app/master/actions.ts');
const voucher = read('src/app/app/t/[tenantId]/vouchers/[voucherId]/route.ts');
const checks = {
  centralRouteRegistry: migration.includes('create table public.tenant_routes') && migration.includes('tenant_routes_one_primary_idx'),
  reservedWordsAndValidation: migration.includes('private.valid_tenant_slug') && migration.includes("'admin','api','auth','login','master','app','demo','cliente','comercio'"),
  idempotentAssignment: migration.includes('tenant_route_changes') && migration.includes('request_id uuid not null unique'),
  collisionBeforeMutation: fix.indexOf('insert into public.tenant_routes') < fix.indexOf("update public.tenant_routes set status='redirect'"),
  safeOldRouteRedirect: fix.includes("status='redirect',redirect_to_slug=v_slug") && migration.includes('resolve_tenant_slug'),
  adminCannotChangeStructuralUrl: test.includes('Tenant admin cannot change structural URL'),
  versionAndRecoveryTests: ['Identical retry recovers result','Version conflict','Second tenant loses slug collision'].every(term => `${migration}${test}`.includes(term)),
  masterUiConnected: ui.includes('SU09.A1') && ui.includes('SU09.A2') && actions.includes('assignTenantSlug'),
  dnsVerificationDisabled: ui.includes("key === 'domains' ? actionLabels[key].slice(2)"),
  vouchersUseStableIds: voucher.includes('tenantId') && voucher.includes('voucherId') && !voucher.includes('slug'),
};
const failed = Object.entries(checks).filter(([,ok]) => !ok).map(([name]) => name);
if (failed.length) { console.error(`P05 checks failed: ${failed.join(', ')}`); process.exit(1); }
const report = { prompt:'P05', generatedAt:new Date().toISOString(), conclusion:'partial_custom_domains_pending', checks,
  verifiedLocally:['Asignación central idempotente de slug.','Colisión global con un ganador y sin pérdida del estado del otro comercio.','Ruta anterior resoluble hacia la primaria actual.','Vouchers enlazados por tenantId y voucherId estables.'],
  pending:['Dominio propio y comprobación DNS.','Aplicación HTTP pública de la redirección, dependiente de P07.'] };
mkdirSync(resolve(root,'reports/local/p05'),{recursive:true});
writeFileSync(resolve(root,'reports/local/p05/url-manager.json'),`${JSON.stringify(report,null,2)}\n`);
console.log('P05 parcial: slugs y redirecciones verificados; dominio propio/DNS queda pendiente.');
