import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { run } from './process.mjs';
try {
  const compiler = 'node_modules/typescript/bin/tsc';
  if (existsSync(compiler)) run(process.execPath, [compiler, '-p', 'tsconfig.domain.json']);
  else { console.log('Offline verification uses the globally available TypeScript compiler.'); run('tsc', ['--version']); run('tsc', ['-p', 'tsconfig.domain.json']); }
  mkdirSync('.build-domain', { recursive: true });
  writeFileSync('.build-domain/package.json', '{"type":"commonjs"}\n');
  const tests = readdirSync('tests/unit').filter(n=>n.endsWith('.test.mjs')).map(n=>`tests/unit/${n}`);
  run(process.execPath, ['--test', ...tests]);
} catch (error) { console.error(error.message); process.exitCode=1; }
