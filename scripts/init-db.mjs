import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { supabase } from './process.mjs';
try {
  supabase(['--help']);
  supabase(['init', '--help']);
  supabase(['migration', 'new', '--help']);
  if (!existsSync('supabase/config.toml')) supabase(['init']);
  const dir = 'supabase/migrations';
  const before = existsSync(dir) ? readdirSync(dir) : [];
  if (before.some(name => name.endsWith('_foundation.sql'))) {
    console.log('Foundation migration already exists. Never rewrite it after applying. Use supabase migration new for changes.');
  } else {
    supabase(['migration', 'new', 'foundation']);
    const added = readdirSync(dir).filter(name => !before.includes(name) && name.endsWith('_foundation.sql'));
    if (added.length !== 1) throw new Error('Unable to identify CLI-created migration. No filename was invented.');
    const sources = readdirSync('supabase/schema').filter(n => n.endsWith('.sql')).sort();
    const sql = sources.map(name => `-- Source: ${name}\n` + readFileSync(`supabase/schema/${name}`, 'utf8').replace(/^begin;\s*$/gmi, '').replace(/^commit;\s*$/gmi, '')).join('\n\n');
    writeFileSync(`${dir}/${added[0]}`, `-- CLI-created migration; source snapshots preserved in supabase/schema.\nbegin;\n${sql}\ncommit;\n`);
    console.log(`Created ${dir}/${added[0]}. Review it and config.toml before starting the local stack.`);
  }
  console.log('Do not link a remote project during bootstrap. Next: npm run db:start; npm run db:reset:local; npm run test:db.');
} catch(error) { console.error(error.message); process.exitCode = 1; }
