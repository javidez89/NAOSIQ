'use server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect, unstable_rethrow } from 'next/navigation';
import { currentUser, assertActionOrigin, publicError } from '@/lib/access';
import { uuid, slug, text } from '@/domain/validation';
import type { FormState } from '@/components/action-form';
import type { Database } from '@/types/database.generated';
import { masterContextCookie } from '@/domain/master';
import { appOrigin } from '@/lib/env';
type MasterRpc = 'provision_tenant_v2' | 'set_tenant_status' | 'set_membership' | 'link_customer' | 'create_identity_invitation' | 'assign_tenant_slug';
async function masterCommand<Name extends MasterRpc>(rpc: Name, args: Database['public']['Functions'][Name]['Args']): Promise<FormState> {
  await assertActionOrigin();
  try {
    const { db } = await currentUser();
    const { data: master } = await db.rpc('is_platform_admin');
    if (master !== true) return { ok: false, message: 'Se requiere Super Usuario activo y MFA.' };
    const { error } = await db.rpc(rpc, args);
    if (error) return { ok: false, message: 'Operación rechazada. Revise identificadores, MFA, datos y dependencias.' };
    revalidatePath('/master'); revalidatePath('/master', 'layout'); revalidatePath('/comercio', 'layout');
    return { ok: true, message: 'Cambio registrado y auditado.' };
  } catch(e) { unstable_rethrow(e); return { ok: false, message: publicError(e) }; }
}
export async function provision(_state: FormState, form: FormData) {
  try { return await masterCommand('provision_tenant_v2', { p_name: text(form.get('name'), 'Nombre', 2, 120), p_slug: slug(form.get('slug')), p_admin: uuid(form.get('admin')), p_period_end: new Date(String(form.get('periodEnd')) + 'Z').toISOString(), p_request_id: uuid(form.get('requestId')) }); }
  catch(e) { unstable_rethrow(e); return { ok: false, message: publicError(e) }; }
}
export async function setStatus(tenant: string, _state: FormState, form: FormData) {
  return masterCommand('set_tenant_status', { p_tenant: uuid(tenant), p_status: String(form.get('status')), p_reason: String(form.get('reason')) });
}
export async function setMembership(_state: FormState, form: FormData) {
  try { return await masterCommand('set_membership', { p_tenant: uuid(form.get('tenant')), p_user: uuid(form.get('user')), p_role: String(form.get('role')), p_active: form.get('active') === 'true' }); }
  catch(e) { unstable_rethrow(e); return { ok: false, message: publicError(e) }; }
}
export async function inviteIdentity(_state: FormState, form: FormData) {
  try {
    return await masterCommand('create_identity_invitation', {
      p_tenant: uuid(form.get('tenant')),
      p_email: text(form.get('email'), 'Correo', 6, 254).toLowerCase(),
      p_role: String(form.get('role')),
      p_expires_at: new Date(String(form.get('expiresAt')) + 'Z').toISOString(),
      p_request_id: uuid(form.get('requestId')),
    });
  } catch (error) { unstable_rethrow(error); return { ok: false, message: publicError(error) }; }
}
export async function checkTenantSlug(_state: FormState, form: FormData): Promise<FormState> {
  await assertActionOrigin();
  try {
    const value = slug(form.get('slug'));
    const { db } = await currentUser();
    const { data: master } = await db.rpc('is_platform_admin');
    if (master !== true) return { ok: false, message: 'Se requiere Super Usuario activo y MFA.' };
    const { data, error } = await db.rpc('tenant_slug_available', { p_slug: value });
    if (error) return { ok: false, message: 'No se pudo comprobar la ruta.' };
    return data ? { ok: true, message: `/${value} está disponible en este momento.` } : { ok: false, message: `/${value} está reservada o ya fue asignada.` };
  } catch (error) { unstable_rethrow(error); return { ok: false, message: publicError(error) }; }
}
export async function assignTenantSlug(_state: FormState, form: FormData) {
  try {
    return await masterCommand('assign_tenant_slug', {
      p_tenant: uuid(form.get('tenant')),
      p_slug: slug(form.get('slug')),
      p_expected_version: Number(form.get('version')),
      p_request_id: uuid(form.get('requestId')),
    });
  } catch (error) { unstable_rethrow(error); return { ok: false, message: publicError(error) }; }
}
export async function linkCustomer(_state: FormState, form: FormData) {
  try { return await masterCommand('link_customer', { p_tenant: uuid(form.get('tenant')), p_customer: uuid(form.get('customer')), p_user: uuid(form.get('user')) }); }
  catch(e) { unstable_rethrow(e); return { ok: false, message: publicError(e) }; }
}

export async function beginMasterControl(_state: FormState, form: FormData): Promise<FormState> {
  await assertActionOrigin();
  try {
    const tenantId = uuid(form.get('tenant'));
    const { db } = await currentUser();
    const { data, error } = await db.rpc('start_master_control_context', {
      p_tenant: tenantId,
      p_reason: text(form.get('reason'), 'Motivo', 10, 500),
      p_request_id: uuid(form.get('requestId')),
    });
    if (error || !data) return { ok: false, message: 'No se pudo abrir el contexto. Confirma MFA, motivo y comercio.' };
    (await cookies()).set(masterContextCookie, data, {
      httpOnly: true, sameSite: 'strict', secure: appOrigin().startsWith('https://'), path: '/master',
    });
    redirect(`/master/t/${tenantId}`);
  } catch (error) {
    unstable_rethrow(error);
    return { ok: false, message: publicError(error) };
  }
}

export async function endMasterControl(tenant: string, _form: FormData) {
  await assertActionOrigin();
  const tenantId = uuid(tenant);
  const store = await cookies();
  const raw = store.get(masterContextCookie)?.value;
  try {
    const contextId = uuid(raw ?? '');
    const { db } = await currentUser();
    const { data: context } = await db.from('master_control_contexts').select('version').eq('id', contextId).eq('tenant_id', tenantId).maybeSingle();
    if (context) await db.rpc('end_master_control_context', { p_tenant: tenantId, p_context: contextId, p_expected_version: context.version });
  } finally {
    store.delete(masterContextCookie);
  }
  redirect(`/master/businesses/${tenantId}?notice=closed`);
}

export async function startOnboarding(_state: FormState, form: FormData): Promise<FormState> {
  await assertActionOrigin();
  try {
    const { db } = await currentUser();
    const { data, error } = await db.rpc('create_onboarding_draft', { p_request_id: uuid(form.get('requestId')) });
    if (error || !data) return { ok: false, message: 'No se pudo crear el borrador de alta.' };
    redirect(`/master/onboarding/${data}`);
  } catch (error) { unstable_rethrow(error); return { ok: false, message: publicError(error) }; }
}

export async function saveOnboarding(draft: string, _state: FormState, form: FormData): Promise<FormState> {
  await assertActionOrigin();
  try {
    const draftId = uuid(draft);
    const patch = {
      name: text(form.get('name'), 'Nombre', 2, 120),
      slug: slug(form.get('slug')),
      plan: 'basic',
      admin_email: text(form.get('adminEmail'), 'Correo', 6, 254).toLowerCase(),
      brand_name: text(form.get('brandName'), 'Marca', 2, 120),
      payment_methods: ['breb','nequi','bank_transfer','cash'],
      whatsapp: true,
      public_page_enabled: false,
      period_end: new Date(String(form.get('periodEnd')) + 'Z').toISOString(),
      invitation_expires_at: new Date(String(form.get('invitationEnd')) + 'Z').toISOString(),
    };
    const { db } = await currentUser();
    const { error } = await db.rpc('update_onboarding_draft', { p_draft: draftId, p_expected_version: Number(form.get('version')), p_step: 'review', p_patch: patch });
    if (error) return { ok: false, message: 'No se guardó el borrador. Recarga la versión vigente antes de repetir.' };
    revalidatePath(`/master/onboarding/${draftId}`);
    return { ok: true, message: 'Borrador guardado en el servidor. Ya puedes revisar y confirmar.' };
  } catch (error) { unstable_rethrow(error); return { ok: false, message: publicError(error) }; }
}

export async function finalizeOnboarding(draft: string, _state: FormState, form: FormData): Promise<FormState> {
  await assertActionOrigin();
  try {
    const { db } = await currentUser();
    const { data, error } = await db.rpc('finalize_onboarding_draft', { p_draft: uuid(draft), p_expected_version: Number(form.get('version')), p_request_id: uuid(form.get('requestId')) });
    if (error || !data) return { ok: false, message: 'No se confirmó el alta. Conservamos el borrador; consulta su versión antes de repetir.' };
    redirect(`/master/businesses/${data}`);
  } catch (error) { unstable_rethrow(error); return { ok: false, message: publicError(error) }; }
}
