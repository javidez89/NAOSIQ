'use server';
import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import type { FormState } from '@/components/action-form';
import { assertActionOrigin, publicError, tenantContext } from '@/lib/access';
import { text, uuid } from '@/domain/validation';
export async function saveSite(tenant:string,version:number,_state:FormState,form:FormData):Promise<FormState>{try{await assertActionOrigin();const tenantId=uuid(tenant);const{db,base}=await tenantContext(tenantId);const{error}=await db.rpc('set_public_profile',{p_tenant:tenantId,p_brand:text(form.get('brand'),'Marca',2,120),p_headline:text(form.get('headline'),'Título',0,160),p_description:text(form.get('description'),'Descripción',0,2000),p_contact:text(form.get('contact'),'Contacto',0,300),p_published:form.get('published')==='yes',p_expected_version:version});if(error)return{ok:false,message:error.code==='40001'?'El sitio cambió. Actualiza antes de guardar de nuevo.':'No se pudo guardar el sitio.'};revalidatePath(`${base}/t/${tenantId}/site`);return{ok:true,message:'Sitio público actualizado.'}}catch(error){unstable_rethrow(error);return{ok:false,message:publicError(error)}}}
