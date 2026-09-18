import { existsSync, copyFileSync } from 'node:fs';
import { npm, run } from './process.mjs';
try {
  const major = Number(process.versions.node.split('.')[0]);
  if (![22, 24].includes(major)) throw new Error('Use Node 24 LTS, as pinned in .nvmrc (Node 22 also supported for bootstrap).');
  if (!existsSync('package-lock.json')) {
    console.log('Resolving REAL lockfile from npm. Review the resulting dependency tree before committing.');
    npm(['install', '--package-lock-only', '--ignore-scripts']);
  }
  // Installs trusted, pinned packages; the Supabase CLI has an installation lifecycle.
  npm(['ci']);
  if (!existsSync('.env.local')) copyFileSync('.env.example', '.env.local');
  run(process.execPath, ['scripts/pin-actions.mjs']);
  console.log('Bootstrap complete. Next: npm run db:init. Commit package-lock.json and generated workflow pins after review.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
