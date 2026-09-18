import { mkdirSync, writeFileSync } from 'node:fs';
import { supabase } from './process.mjs';
try {
  supabase(['gen', 'types', '--help']);
  const result = supabase(['gen', 'types', 'typescript', '--local', '--schema', 'public'], { encoding: 'utf8', stdio: ['ignore','pipe','inherit'] });
  if (!result.stdout?.includes('export type Database')) throw new Error('No valid generated database contract returned.');
  mkdirSync('src/types', { recursive: true });
  writeFileSync('src/types/database.generated.ts', result.stdout);
  console.log('Generated real database types. Wire Database into serverClient and review RPC contracts before release.');
} catch(error) { console.error(error.message); process.exitCode = 1; }
