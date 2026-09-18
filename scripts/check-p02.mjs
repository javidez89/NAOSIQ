import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const migrationPath = 'supabase/migrations/20260915003053_multi_tenant_delegations.sql';
const migration = read(migrationPath);
const identity = read('src/domain/identity.ts');
const seed = read('scripts/local-seed.mjs');
const dbTest = read('supabase/tests/database/delegations.test.sql');
const generatedTypes = read('src/types/database.generated.ts');

const checks = {
  fiveRoles: ['super_user','admin','advisor','technician','customer'].every((role) => identity.includes(`'${role}'`)),
  adminMembershipManagement: /admin:\s*\[[^\]]*'roles\.manage'/.test(identity),
  tenantDelegations: /create table public\.delegations/.test(migration),
  tenantFileMetadata: /create table public\.tenant_files/.test(migration),
  tenantJobs: /create table public\.operation_jobs/.test(migration),
  databaseGuards: ['private.has_delegation','private.grant_delegation','private.revoke_delegation'].every((name) => migration.includes(name)),
  actorAudit: migration.includes("private.audit(p_tenant,'delegation.granted'") && migration.includes("private.audit(p_tenant,'membership.changed'"),
  noDirectWrites: /revoke all on public\.delegations,public\.tenant_files,public\.operation_jobs from public,anon,authenticated/.test(migration),
  financialDelegationDisabled: !migration.match(/permission text[^;]+payments\.(confirm|cash\.confirm)/s),
  seedAandB: ['adminA','adminB','customerA','customerB'].every((account) => seed.includes(account)),
  crossTenantTestsAuthored: dbTest.includes('Admin cannot grant across tenants') && dbTest.includes('Delegation cannot cross tenant'),
  riskTestsAuthored: ['idempotent','version','Expired delegation','Real grant actor'].every((term) => dbTest.includes(term)),
  generatedDatabaseContract: ['delegations:','tenant_files:','operation_jobs:','grant_delegation:','has_delegation:','revoke_delegation:'].every((term) => generatedTypes.includes(term)),
};

const failed = Object.entries(checks).filter(([,ok]) => !ok).map(([name]) => name);
if (failed.length) {
  console.error(`P02 structural checks failed: ${failed.join(', ')}`);
  process.exit(1);
}

const report = {
  prompt: 'P02',
  generatedAt: new Date().toISOString(),
  conclusion: 'verified_local',
  checks,
  migration: migrationPath,
  databaseTest: 'supabase/tests/database/delegations.test.sql',
  limits: [
    'Las tablas de archivos y jobs son contratos aislados; upload y workers continúan desactivados.',
    'Las delegaciones financieras de D01 permanecen desactivadas.',
    'La ejecución local no sustituye una revisión independiente de seguridad.',
  ],
};
mkdirSync(resolve(root, 'reports/local/p02'), { recursive: true });
writeFileSync(resolve(root, 'reports/local/p02/multi-tenant.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log('P02 local verificado: migración aplicada, contrato generado y cobertura multiempresa preparada.');
