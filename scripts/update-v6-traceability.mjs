import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const appRoot=resolve('.');
const kitRoot=resolve('..','NAOSIQ_KIT_V6');
const contract=JSON.parse(readFileSync(join(kitRoot,'contracts','screens-actions.json'),'utf8'));
const journeys=JSON.parse(readFileSync(join(kitRoot,'contracts','journeys.json'),'utf8'));
const decisions=JSON.parse(readFileSync(join(kitRoot,'contracts','decisions.json'),'utf8'));
const prior=JSON.parse(readFileSync(join(appRoot,'reports','local','br02','coverage-matrix.json'),'utf8'));
const coveragePath=join(appRoot,'docs','naosiq-v6-coverage.json');
const coverage=JSON.parse(readFileSync(coveragePath,'utf8'));

function filesUnder(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const p=join(dir,entry.name);return entry.isDirectory()?filesUnder(p):[p]})}
const sourceFiles=filesUnder(join(appRoot,'src')).filter(p=>/\.(?:ts|tsx|css)$/.test(p));
const sources=sourceFiles.map(path=>({path:relative(appRoot,path).replaceAll('\\','/'),text:readFileSync(path,'utf8')}));
const old=new Map(prior.screens.map(screen=>[screen.id,screen]));

const screens=contract.screens.map(screen=>{
  const direct=sources.filter(source=>source.text.includes(screen.id)).map(source=>source.path);
  const inherited=old.get(screen.id)?.evidence??[];
  const evidence=[...new Set([...direct,...inherited])];
  const state=evidence.length?'surface_present_unverified':'not_implemented';
  const actions=screen.actions.map(action=>{
    const actionEvidence=sources.filter(source=>source.text.includes(action.id)).map(source=>source.path);
    return {id:action.id,label:action.label,status:actionEvidence.length?'referenced_unverified':'pending',evidence:actionEvidence};
  });
  return {id:screen.id,name:screen.name,role:screen.role,contractRoute:screen.route,viewport:screen.documentation_v6?.svg??null,status:state,evidence,actions};
});
const byId=new Map(screens.map(screen=>[screen.id,screen]));
const journeyRows=journeys.map(journey=>{
  const ids=[...new Set(journey.steps.map(step=>step.screen))];
  const present=ids.filter(id=>byId.get(id)?.status==='surface_present_unverified');
  return {id:journey.id,name:journey.title,status:present.length===0?'not_implemented':present.length===ids.length?'surface_chain_unverified':'partial',screens:ids,presentScreens:present,decisionRefs:journey.decision_refs};
});
const actionRows=screens.flatMap(screen=>screen.actions);
const result={
  specification:'NAOSIQ V6',generatedAt:new Date().toISOString(),method:'Conservative static evidence scan plus prior BR02 route evidence. Presence is not visual or behavioral acceptance.',
  contract:{screens:contract.screen_count,actions:contract.action_count,journeys:journeys.length,decisions:decisions.length},
  summary:{surfacePresentUnverified:screens.filter(x=>x.status==='surface_present_unverified').length,notImplementedScreens:screens.filter(x=>x.status==='not_implemented').length,referencedUnverifiedActions:actionRows.filter(x=>x.status==='referenced_unverified').length,pendingActions:actionRows.filter(x=>x.status==='pending').length,surfaceChainUnverifiedJourneys:journeyRows.filter(x=>x.status==='surface_chain_unverified').length,partialJourneys:journeyRows.filter(x=>x.status==='partial').length,notImplementedJourneys:journeyRows.filter(x=>x.status==='not_implemented').length},
  decisions:decisions.map(({id,decision,owner,provisional_handling,blocks,status})=>({id,decision,owner,provisionalHandling:provisional_handling,blocks,status})),screens,journeys:journeyRows,
};
mkdirSync(join(appRoot,'reports','local','p29'),{recursive:true});
writeFileSync(join(appRoot,'reports','local','p29','traceability-current.json'),JSON.stringify(result,null,2)+'\n');
coverage.updatedAt=result.generatedAt;
coverage.scope='Local; static evidence refreshed from current source. Presence remains unverified until visual and behavioral acceptance.';
coverage.decisions=result.decisions;
coverage.screens=screens.map(screen=>({id:screen.id,name:screen.name,status:screen.status,evidence:screen.evidence,actions:screen.actions.map(({id,status,evidence})=>({id,status,evidence}))}));
coverage.journeys=journeyRows;
coverage.traceabilityReport='reports/local/p29/traceability-current.json';
writeFileSync(coveragePath,JSON.stringify(coverage,null,2)+'\n');
console.log(JSON.stringify(result.summary));
