'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import type { FormState } from '@/components/action-form';
import { assertActionOrigin, publicError, tenantContext } from '@/lib/access';
import { text, uuid } from '@/domain/validation';
type WorkflowRpc = 'save_diagnostic'|'create_quote'|'publish_quote'|'complete_qa'|'confirm_delivery';
type WorkflowArgs=Record<string,unknown>&{p_tenant:string};

function fail(error:unknown):FormState{unstable_rethrow(error);return{ok:false,message:publicError(error)}}
async function run(name:WorkflowRpc,args:WorkflowArgs):Promise<FormState>{
  try{await assertActionOrigin();const{db}=await tenantContext(args.p_tenant);const rpc=db.rpc as unknown as (name:WorkflowRpc,args:WorkflowArgs)=>Promise<{error:{code?:string}|null}>;const{error}=await rpc(name,args);if(error)return{ok:false,message:error.code==='40001'?'El registro cambió. Actualiza antes de volver a guardar.':'No se confirmó la operación. Revisa permisos, estado y requisitos del recorrido.'};revalidatePath(`/comercio/t/${args.p_tenant}`,'layout');return{ok:true,message:'Operación registrada correctamente.'}}catch(error){return fail(error)}
}

export async function saveDiagnostic(tenant:string,repair:string,_state:FormState,form:FormData){return run('save_diagnostic',{p_tenant:uuid(tenant),p_repair:uuid(repair),p_summary:text(form.get('summary'),'Diagnóstico',5,4000)})}
export async function createQuote(tenant:string,repair:string,_state:FormState,form:FormData){
  try{const quantity=Number(form.get('quantity'));const unit=Number(form.get('unit'));if(!Number.isSafeInteger(quantity)||quantity<1||!Number.isSafeInteger(unit)||unit<0)return{ok:false,message:'Cantidad y valor deben ser números enteros válidos.'};const validUntil=new Date(String(form.get('validUntil')));if(Number.isNaN(validUntil.valueOf()))return{ok:false,message:'Indica una vigencia válida.'};return run('create_quote',{p_tenant:uuid(tenant),p_repair:uuid(repair),p_items:[{label:text(form.get('label'),'Concepto',2,160),quantity,unit_minor:unit}],p_valid_until:validUntil.toISOString(),p_request_id:randomUUID()})}catch(error){return fail(error)}
}
export async function publishQuote(tenant:string,quote:string,version:number,_state:FormState,_form:FormData){return run('publish_quote',{p_tenant:uuid(tenant),p_quote:uuid(quote),p_expected_version:version})}
export async function completeQa(tenant:string,repair:string,_state:FormState,form:FormData){const result=String(form.get('result'));if(!['pass','fail','na'].includes(result))return{ok:false,message:'Selecciona un resultado válido.'};return run('complete_qa',{p_tenant:uuid(tenant),p_repair:uuid(repair),p_checks:[{label:text(form.get('label'),'Comprobación',2,160),result,na_reason:result==='na'?text(form.get('reason'),'Motivo',2,500):null}],p_notes:text(form.get('notes')||'','Notas',0,2000)})}
export async function confirmDelivery(tenant:string,repair:string,_state:FormState,form:FormData){if(form.get('confirmed')!=='yes')return{ok:false,message:'Debes confirmar identidad y entrega física.'};return run('confirm_delivery',{p_tenant:uuid(tenant),p_repair:uuid(repair),p_recipient:text(form.get('recipient'),'Persona que recibe',2,160),p_notes:text(form.get('notes')||'','Notas',0,2000),p_operation_id:randomUUID()})}
