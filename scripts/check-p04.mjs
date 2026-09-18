import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const contextMigration = read('supabase/migrations/20260916194108_master_control_contexts.sql');
const provisioningMigration = read('supabase/migrations/20260916194325_idempotent_tenant_provisioning.sql');
const master = read('src/app/master/page.tsx');
const businesses = read('src/app/master/businesses/page.tsx');
const newBusiness = read('src/app/master/businesses/new/page.tsx');
const control = read('src/app/master/businesses/[tenantId]/control/page.tsx');
const modules = read('src/app/master/[section]/page.tsx');
const access = read('src/lib/access.ts');
const workspace = read('src/app/app/t/[tenantId]/page.tsx');
const e2e = read('tests/e2e/local-flow.spec.ts');

const checks = {
  actorAndContextAudited: ['master.context.started','master.context.ended','actor_id'].every(term => contextMigration.includes(term)),
  noImpersonationMembership: !contextMigration.includes('insert into public.memberships'),
  contextBoundToActorTenant: ['actor_id=auth.uid()','tenant_id=p_tenant','ended_at is null'].every(term => contextMigration.includes(term)),
  contextVersionAndIdempotency: contextMigration.includes('p_expected_version') && contextMigration.includes('request_id'),
  idempotentProvisioning: provisioningMigration.includes('provision_request_id') && provisioningMigration.includes('Idempotency key reused'),
  legacyProvisioningRevoked: provisioningMigration.includes('revoke all on function public.provision_tenant('),
  dashboardAndBusinesses: master.includes('SU01') && businesses.includes('SU02'),
  explicitControlScreen: control.includes('SU05') && control.includes('Actor real'),
  protectedWorkspace: access.includes('has_master_control_context') && workspace.includes('CONTROL TOTAL'),
  allScreenIdsPreserved: Array.from({ length: 20 }, (_, index) => `SU${String(index + 1).padStart(2, '0')}`).every(id => [master,businesses,newBusiness,control,modules,read('src/app/master/[section]/[id]/page.tsx'),read('src/app/master/businesses/[tenantId]/page.tsx'),read('src/app/master/businesses/[tenantId]/edit/page.tsx')].some(source => source.includes(id))),
  unavailableActionsDisabled: modules.includes('button key={label} disabled') && modules.includes('no afirman una operación inexistente'),
  browserBoundaryAuthored: e2e.includes('contexto maestro') && e2e.includes('notice=context') && e2e.includes('cerrado y auditado'),
  noPrivilegedKeyInUi: ![master,businesses,control,modules,access,workspace].some(source => /service[_-]?role|SUPABASE_SERVICE/i.test(source)),
};
const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
if (failed.length) {
  console.error(`P04 checks failed: ${failed.join(', ')}`);
  process.exit(1);
}

const screens = [
  ['SU01','verified'],['SU02','verified'],['SU03','partial'],['SU04','verified'],['SU05','verified'],
  ['SU06','partial'],['SU07','partial'],['SU08','pending'],['SU09','partial'],['SU10','partial'],
  ['SU11','pending'],['SU12','pending'],['SU13','partial'],['SU14','pending'],['SU15','pending'],
  ['SU16','partial'],['SU17','pending'],['SU18','partial'],['SU19','pending'],['SU20','partial'],
].map(([id,status]) => ({ id,status }));
const report = {
  prompt: 'P04', generatedAt: new Date().toISOString(), conclusion: 'partial_dependency_scoped', checks, screens,
  verifiedLocally: ['Dashboard y directorio basados en datos reales.','Alta idempotente de comercio.','Contexto de control con actor real, MFA, motivo, tenant, cookie opaca y auditoría.'],
  pending: ['Mutaciones comerciales de planes, cartera SaaS y políticas.','Proveedores, WhatsApp, soporte, exportaciones y dominios de P05/P11/P12/P14/P15/P17/P19/P21.','Revocación global de sesiones sin una clave privilegiada expuesta al cliente.'],
};
mkdirSync(resolve(root, 'reports/local/p04'), { recursive: true });
writeFileSync(resolve(root, 'reports/local/p04/master-control.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log('P04 parcial: control Maestro verificado; módulos dependientes permanecen deshabilitados.');
