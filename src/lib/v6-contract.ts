import 'server-only';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { notFound } from 'next/navigation';

export type V6Action={id:string;label:string;kind:string;permission:string;success:string;error:string};
export type V6Screen={id:string;name:string;route:string;role:string;goal:string;rule:string;actions:V6Action[];documentation_v6?:{svg?:string}};
const kitRoot=resolve(process.cwd(),'..','NAOSIQ_KIT_V6');
async function json<T>(path:string):Promise<T>{return JSON.parse(await readFile(resolve(kitRoot,path),'utf8')) as T}
export async function v6Screens(){if(process.env.APP_ENV!=='local')notFound();const data=await json<{screens:V6Screen[]}>('contracts/screens-actions.json');return data.screens}
export async function v6Screen(id:string){if(!/^(?:AD|AS|AU|CL|SU|TE|VR)\d{2}$/.test(id))notFound();const screen=(await v6Screens()).find(item=>item.id===id);if(!screen)notFound();return screen}
export async function v6Trace(){return json<{screens:Array<{id:string;status:string;evidence:string[];actions:Array<{id:string;status:string;evidence:string[]}>}>}>('../crm-techi-foundation/reports/local/p29/traceability-current.json')}
export function v6Asset(path:string){return resolve(kitRoot,path)}
