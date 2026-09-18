'use server';
import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import type { FormState } from '@/components/action-form';
import { assertActionOrigin,publicError,tenantContext } from '@/lib/access';
import { uuid } from '@/domain/validation';
export async function respondQuote(tenant:string,quote:string,_state:FormState,form:FormData):Promise<FormState>{try{await assertActionOrigin();const response=String(form.get('response'));if(!['accepted','rejected'].includes(response))return{ok:false,message:'Selecciona aceptar o rechazar.'};const tenantId=uuid(tenant);const{db}=await tenantContext(tenantId);const{error}=await db.rpc('respond_quote',{p_tenant:tenantId,p_quote:uuid(quote),p_response:response,p_request_id:randomUUID()});if(error)return{ok:false,message:'No se confirmó tu decisión. Actualiza y comprueba el estado antes de repetirla.'};revalidatePath(`/cliente/t/${tenantId}`,'layout');return{ok:true,message:response==='accepted'?'Presupuesto aceptado.':'Presupuesto rechazado.'}}catch(error){unstable_rethrow(error);return{ok:false,message:publicError(error)}}}
