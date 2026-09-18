import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const errors = []; const pending = [];
const pkg = JSON.parse(readFileSync('package.json','utf8'));
for(const [name,version] of Object.entries({...pkg.dependencies,...pkg.devDependencies})) if(!/^\d+\.\d+\.\d+$/.test(version)) errors.push(`Unpinned dependency: ${name}`);
for(const path of ['README.md','SECURITY.md','AGENTS.md','docs/12-release.md','supabase/schema/001_core.sql','tests/unit/domain.test.mjs']) if(!existsSync(path)) errors.push(`Missing required file: ${path}`);
function visit(dir) {
  for(const entry of readdirSync(dir,{withFileTypes:true})) {
    if(['node_modules','.git','.next','.build-domain','.npm-cache','.local','test-results','playwright-report'].includes(entry.name)) continue;
    const path=join(dir,entry.name);
    if(entry.isDirectory()) visit(path);
    else if(/\.(ts|tsx|mjs|sql|md|json|yml|in)$/.test(path)) {
      const text=readFileSync(path,'utf8');
      if(text.includes('\0')) errors.push(`NUL byte in source: ${path}`);
      if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text) && !path.endsWith('check-repo.mjs')) errors.push(`Possible private key: ${path}`);
    }
  }
}
visit('.');
const schemas=readdirSync('supabase/schema').filter(n=>n.endsWith('.sql')).map(n=>readFileSync(`supabase/schema/${n}`,'utf8')).join('\n');
for(const match of schemas.matchAll(/create table ((?:public|private)\.[a-z_]+)/gi)) if(!schemas.toLowerCase().includes(`alter table ${match[1]} enable row level security;`.toLowerCase())) errors.push(`Missing RLS: ${match[1]}`);
if(/grant\s+(?:all|insert|update|delete)[^;]*on\s+public\./i.test(schemas)) errors.push('Unexpected direct write grant. Review SQL.');
if(!existsSync('package-lock.json')) pending.push('Real package-lock.json: run npm run bootstrap online.');
if(!existsSync('supabase/config.toml') || !existsSync('supabase/migrations') || !readdirSync('supabase/migrations').some(n=>n.endsWith('_foundation.sql'))) pending.push('CLI-generated configuration/migration: run npm run db:init.');
if(!existsSync('.github/workflows/ci.yml')) pending.push('Pinned CI workflow: run node scripts/pin-actions.mjs online.');
if(!existsSync('src/types/database.generated.ts')) pending.push('Generated DB types: run npm run db:types with the local database running.');
for(const error of errors) console.error(`FAIL: ${error}`);
for(const item of pending) console.log(`PENDING: ${item}`);
if(errors.length || (process.argv.includes('--ready') && pending.length)) process.exitCode=1;
else console.log('Repository structural checks passed. This is NOT a production or security certification.');
