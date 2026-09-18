import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const coverage = JSON.parse(readFileSync('docs/naosiq-v6-coverage.json', 'utf8').replace(/^\uFEFF/, ''));
const actionCount = coverage.screens.reduce((total, screen) => total + screen.actions.length, 0);
if (coverage.screens.length !== 118 || actionCount !== 363 || coverage.journeys.length !== 32) {
  throw new Error(`Contrato alterado: ${coverage.screens.length} pantallas, ${actionCount} acciones, ${coverage.journeys.length} recorridos.`);
}

const sourceChecks = [
  ['src/app/app/t/[tenantId]/page.tsx', 'brand.endorsement'],
  ['src/app/app/t/[tenantId]/repairs/[repairId]/page.tsx', 'Los medios de pago y su confirmación pertenecen a'],
  ['src/lib/voucher-pdf.ts', 'Emisor:'],
  ['src/lib/voucher-pdf.ts', 'No acredita entrega del equipo'],
  ['src/lib/voucher-pdf.ts', 'brand.endorsement'],
];
for (const [file, marker] of sourceChecks) {
  if (!readFileSync(file, 'utf8').includes(marker)) throw new Error(`Falta evidencia BR02 en ${file}: ${marker}`);
}

const screenEvidence = {
  AU01: ['/master/login', '/comercio/login'], AU02: ['/master', '/comercio'], AU04: ['proxy.ts', '/security'],
  SU01: ['/master'], SU02: ['/master'], SU03: ['/master'], SU04: ['/master/t/:tenantId'], SU05: ['/master/t/:tenantId'],
  AD01: ['/comercio/t/:tenantId'], AD02: ['/comercio/t/:tenantId#reparaciones'], AD03: ['/comercio/t/:tenantId#recepcion'],
  AD04: ['/comercio/t/:tenantId/repairs/:repairId'], AD05: ['/comercio/t/:tenantId/repairs/:repairId#custodia'],
  AD11: ['/comercio/t/:tenantId/repairs/:repairId#payments'], AD12: ['/comercio/t/:tenantId#nuevo-cliente'],
  AD14: ['/comercio/t/:tenantId/repairs/:repairId'], AD32: ['/comercio/t/:tenantId/repairs/:repairId#vouchers'],
  AS01: ['/comercio/t/:tenantId'], AS02: ['/comercio/t/:tenantId#nuevo-cliente'], AS03: ['/comercio/t/:tenantId/repairs/:repairId#custodia'],
  TE01: ['/comercio/t/:tenantId'], TE02: ['/comercio/t/:tenantId#reparaciones'], TE04: ['/comercio/t/:tenantId/repairs/:repairId'],
  TE07: ['/comercio/t/:tenantId/repairs/:repairId'], TE14: ['/comercio/t/:tenantId/repairs/:repairId#history'],
  CL02: ['/cliente/login'], CL07: ['/cliente/t/:tenantId#reparaciones'], CL08: ['/cliente/t/:tenantId/repairs/:repairId'],
  CL12: ['/cliente/t/:tenantId/repairs/:repairId#vouchers'], CL16: ['/cliente'], CL17: ['/cliente/t/:tenantId'],
  CL18: ['/cliente/t/:tenantId/repairs/:repairId#payments'], CL19: ['/cliente/t/:tenantId/vouchers/:voucherId'],
  CL26: ['/cliente/t/:tenantId/repairs/:repairId'], VR01: ['src/lib/voucher-pdf.ts'],
  VR02: ['/cliente/t/:tenantId/repairs/:repairId#vouchers'], VR03: ['src/lib/voucher-pdf.ts'], VR04: ['/cliente/t/:tenantId/vouchers/:voucherId'],
};
const journeyEvidence = {
  F01: ['/master/login', '/comercio/login'], F02: ['/cliente/login', '/cliente/t/:tenantId'],
  F03: ['/master'], F04: ['/master/t/:tenantId'], F05: ['/master'], F09: ['/comercio/t/:tenantId#recepcion'],
  F10: ['/comercio/t/:tenantId/repairs/:repairId#custodia'], F13: ['/comercio/t/:tenantId/repairs/:repairId'],
  F15: ['/comercio/t/:tenantId/repairs/:repairId#payments'], F16: ['/comercio/t/:tenantId/repairs/:repairId#payments'],
  F17: ['src/lib/voucher-pdf.ts'], F18: ['src/lib/voucher-pdf.ts'], F23: ['/comercio/t/:tenantId'],
  F25: ['/master/t/:tenantId'], F28: ['/master/login', '/comercio/login', '/cliente/login'], F31: ['src/lib/voucher-pdf.ts'],
};

const screens = coverage.screens.map(screen => ({
  id: screen.id,
  name: screen.name,
  review: screenEvidence[screen.id] ? 'superficie_parcial' : 'no_implementada',
  evidence: screenEvidence[screen.id] ?? [],
  actions: screen.actions.map(action => ({ id: action.id, contractStatus: action.status })),
}));
const journeys = coverage.journeys.map(journey => ({
  id: journey.id,
  name: journey.name,
  review: journeyEvidence[journey.id] ? 'flujo_parcial' : 'no_implementado',
  evidence: journeyEvidence[journey.id] ?? [],
}));
const report = {
  prompt: 'BR02',
  generatedAt: new Date().toISOString(),
  conclusion: 'partial',
  contract: { screens: screens.length, actions: actionCount, journeys: journeys.length },
  summary: {
    partialScreens: screens.filter(item => item.review === 'superficie_parcial').length,
    notImplementedScreens: screens.filter(item => item.review === 'no_implementada').length,
    partialJourneys: journeys.filter(item => item.review === 'flujo_parcial').length,
    notImplementedJourneys: journeys.filter(item => item.review === 'no_implementado').length,
  },
  note: 'Una ruta compartida demuestra una superficie existente, pero no acepta automáticamente las acciones del ID. El estado contractual original se conserva.',
  screens,
  journeys,
};
mkdirSync(resolve('reports/local/br02'), { recursive: true });
writeFileSync('reports/local/br02/coverage-matrix.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(`BR02 parcial: ${report.summary.partialScreens} pantallas con superficie parcial y ${report.summary.notImplementedScreens} no implementadas.`);
console.log(`Contrato preservado: ${screens.length} pantallas, ${actionCount} acciones y ${journeys.length} recorridos.`);
