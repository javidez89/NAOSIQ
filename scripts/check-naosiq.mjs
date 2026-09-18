import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const read = path => JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
const coverage = read('docs/naosiq-v6-coverage.json');
const source = read(resolve(coverage.sourceRoot, 'contracts/screens-actions.json'));
const journeys = read(resolve(coverage.sourceRoot, 'contracts/journeys.json'));
function sameIds(actual, expected, label) {
  const a = actual.map(item => item.id).sort();
  const b = expected.map(item => item.id).sort();
  if (new Set(a).size !== a.length || JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`Inventario incompleto o duplicado: ${label}`);
}
sameIds(coverage.screens, source.screens, 'pantallas');
for (const screen of source.screens) sameIds(coverage.screens.find(row => row.id === screen.id).actions, screen.actions, screen.id);
sameIds(coverage.journeys, journeys, 'recorridos');
sameIds(coverage.prompts, [...Array.from({ length: 32 }, (_, i) => ({ id: `P${String(i).padStart(2, '0')}` })),
  ...Array.from({ length: 4 }, (_, i) => ({ id: `BR0${i}` }))], 'prompts');
for (const item of [...coverage.prompts, ...coverage.pdfs]) {
  const hash = createHash('sha256').update(readFileSync(item.source ?? item.path)).digest('hex');
  if (hash !== item.sha256) throw new Error(`Cambió la especificación: ${item.source ?? item.path}`);
}
const actions = coverage.screens.flatMap(screen => screen.actions);
const items = [...coverage.prompts, ...coverage.screens, ...actions, ...coverage.journeys];
const incomplete = items.filter(item => item.status !== 'verified');
console.log(`Inventario conservado: ${coverage.prompts.length} prompts, ${coverage.pdfs.length} PDF, ${coverage.screens.length} pantallas, ${actions.length} acciones, ${coverage.journeys.length} recorridos.`);
console.log('Esta comprobación valida trazabilidad, no ejecuta los flujos de la aplicación.');
if (incomplete.length) console.log(`Cumplimiento integral pendiente: ${incomplete.length} entradas sin aceptación completa.`);
if (process.argv.includes('--complete') && incomplete.length) process.exitCode = 1;
