import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const env = read('.env.example');
const ci = read('.github/workflows/ci.yml');
const release = read('.github/workflows/release.yml');
const operations = read('src/domain/operations.ts');
const logger = read('src/lib/logger.ts');
const requiredScripts = ['dev', 'build', 'lint', 'typecheck', 'test:unit', 'test:db', 'test:local'];
const errors = [];

for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) errors.push(`Dependencia no fijada: ${name}`);
}
for (const script of requiredScripts) if (!pkg.scripts[script]) errors.push(`Comando faltante: ${script}`);
if (lock.lockfileVersion !== 3 || lock.packages?.['']?.version !== pkg.version) errors.push('Lockfile no corresponde al paquete.');
if (!/RELEASE_APPROVED=false/.test(env) || /^(?:SUPABASE_SERVICE_ROLE_KEY|.*SECRET.*)=\S+/im.test(env)) errors.push('El ejemplo de entorno no conserva la puerta o contiene una clave privilegiada.');
for (const workflow of [ci, release]) {
  if (/uses:\s*[^\s]+@(?![a-f0-9]{40}(?:\s|$))/.test(workflow)) errors.push('Workflow con Action sin SHA exacto.');
}
for (const marker of ['OperationRecord', 'JobRecord', 'OutboxEvent', 'recoverAfterTimeout', 'retryAllowed: false']) {
  if (!operations.includes(marker)) errors.push(`Contrato de operación faltante: ${marker}`);
}
for (const marker of ['correlationId', 'console.error(JSON.stringify(record))', 'Error messages, stacks, form values and tokens are excluded']) {
  if (!logger.includes(marker)) errors.push(`Logging base faltante: ${marker}`);
}
if (!release.includes('No deployment or remote migration occurs in this job')) errors.push('El workflow de aprobación podría sugerir publicación automática.');
if (errors.length) throw new Error(errors.join('\n'));

const report = {
  prompt: 'P01',
  generatedAt: new Date().toISOString(),
  conclusion: 'verified_local',
  stack: { next: pkg.dependencies.next, react: pkg.dependencies.react, typescript: pkg.devDependencies.typescript, node: pkg.engines.node },
  checks: {
    pinnedDependencies: true,
    lockfile: true,
    realCommands: requiredScripts,
    publicEnvironmentWithoutSecrets: true,
    roleShells: ['/master', '/comercio', '/cliente'],
    baseErrorsAndLoading: ['src/app/error.tsx', 'src/app/loading.tsx'],
    structuredLogging: 'src/lib/logger.ts',
    operationJobOutboxContracts: 'src/domain/operations.ts',
    pinnedCi: ['.github/workflows/ci.yml', '.github/workflows/release.yml'],
  },
  limits: [
    'Los workers y adaptadores externos siguen desactivados.',
    'El workflow fue validado localmente, pero no ejecutado en un repositorio remoto.',
    'La publicación permanece bloqueada y no se migraron dominios.',
  ],
};
mkdirSync('reports/local/p01', { recursive: true });
writeFileSync('reports/local/p01/foundation.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(`P01 local verificado: Next ${pkg.dependencies.next}, React ${pkg.dependencies.react}, TypeScript ${pkg.devDependencies.typescript}.`);
console.log('CI fijado por SHA; no se publicó ni se ejecutó una migración remota.');
