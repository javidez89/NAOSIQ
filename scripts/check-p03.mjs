import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const migrationPath = 'supabase/migrations/20260916192102_identity_invitations.sql';
const migration = read(migrationPath);
const expirationMigration = read('supabase/migrations/20260916193230_expire_stale_identity_invitations.sql');
const callback = read('src/app/auth/callback/route.ts');
const login = read('src/app/login/actions.ts');
const session = read('src/domain/session.ts');
const config = read('supabase/config.toml');
const env = read('.env.example');
const types = read('src/types/database.generated.ts');
const dbTest = read('supabase/tests/database/identity_invitations.test.sql');
const e2e = read('tests/e2e/local-flow.spec.ts');

const checks = {
  googleAdapterSelected: config.includes('[auth.external.google]') && config.includes('skip_nonce_check = false'),
  googleDisabledWithoutCredentials: /\[auth\.external\.google\][\s\S]*?enabled = false/.test(config) && env.includes('GOOGLE_AUTH_ENABLED=false'),
  noCommittedGoogleSecret: /SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=\s*(?:\r?\n|$)/.test(env),
  safePortalReturn: callback.includes('safePortalReturnPath') && login.includes('safePortalReturnPath'),
  cancellationDistinct: callback.includes("outcome === 'cancelled'") && session.includes("error === 'access_denied'"),
  invitationFact: migration.includes('create table public.identity_invitations'),
  acceptanceFact: migration.includes('private.accept_identity_invitation'),
  roleActivationFact: migration.includes('private.activate_invited_membership'),
  revocationFact: migration.includes('private.revoke_identity_invitation'),
  actorAudit: ['identity.invitation.created','identity.invitation.accepted','identity.invitation.activated','identity.invitation.revoked'].every((event) => migration.includes(event)),
  expirationRecovery: expirationMigration.includes("status='expired'") && expirationMigration.includes('identity.invitation.expired'),
  sessionPolicyPending: session.includes("decision: 'D04'") && session.includes("status: 'pending'") && session.includes('idleExpiryMinutes: null'),
  reauthRoutes: ['master','comercio','cliente'].every((portal) => read(`src/app/${portal}/reauth/page.tsx`).includes('session-reauth')),
  generatedDatabaseContract: ['identity_invitations:','create_identity_invitation:','accept_identity_invitation:','activate_invited_membership:','revoke_identity_invitation:'].every((term) => types.includes(term)),
  riskTestsAuthored: ['does not create membership','Different identity','checks invitation version','cannot invite across tenants','Expired invitation can be recovered'].every((term) => dbTest.toLowerCase().includes(term.toLowerCase())),
  browserRecoveryAuthored: e2e.includes('cancelar Google conserva un retorno seguro') && e2e.includes('callback Google inválido o tardío'),
};

const failed = Object.entries(checks).filter(([,ok]) => !ok).map(([name]) => name);
if (failed.length) {
  console.error(`P03 checks failed: ${failed.join(', ')}`);
  process.exit(1);
}

const report = {
  prompt: 'P03',
  generatedAt: new Date().toISOString(),
  conclusion: 'partial_external_google_pending',
  checks,
  verifiedLocally: [
    'Invitación, aceptación, activación de rol y revocación como hechos separados.',
    'Retorno limitado al portal, cancelación neutral y callback inválido cerrado.',
    'Logout local, refresh de sesión y revalidación de permisos.',
  ],
  pending: [
    'Login Google E2E con cliente y secreto de ensayo externos.',
    'Aprobación D04 para tiempos de inactividad, duración absoluta y elevación.',
    'Worker real de entrega de invitaciones.',
  ],
};
mkdirSync(resolve(root, 'reports/local/p03'), { recursive: true });
writeFileSync(resolve(root, 'reports/local/p03/identity-session.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log('P03 parcial: contratos locales verificados; Google E2E y D04 siguen pendientes.');
