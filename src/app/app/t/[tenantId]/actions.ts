'use server';

import { portalBase } from '@/lib/portal';
import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import { tenantContext, assertActionOrigin, publicError } from '@/lib/access';
import { uuid, text } from '@/domain/validation';
import { parseMoney } from '@/domain/money';
import { parseRepairInput, statuses } from '@/domain/repairs';
import { manualMethods as methods } from '@/domain/payments';
import type { FormState } from '@/components/action-form';
import type { Database } from '@/types/database.generated';

type CommandState = FormState & { recordId?: string };
type TenantRpc = 'create_customer' | 'create_repair' | 'confirm_intake' | 'transition_repair' | 'record_payment' | 'confirm_payment' | 'assign_technician';

function failure(error: unknown): FormState {
  unstable_rethrow(error);
  return { ok: false, message: publicError(error) };
}

async function run<Name extends TenantRpc>(rpc: Name, args: Database['public']['Functions'][Name]['Args']): Promise<CommandState> {
  try {
    await assertActionOrigin();
    const tenantId = args.p_tenant;
    const { db } = await tenantContext(tenantId);
    const { data, error } = await db.rpc(rpc, args);
    if (error) {
      if (error.code === '40001') return { ok: false, message: 'La orden cambió mientras trabajabas. Actualiza la página antes de guardar de nuevo.' };
      if (error.code === '23505') return { ok: false, message: 'Este intento ya está registrado con otros datos. Actualiza la página y comprueba el registro antes de reintentar.' };
      return { ok: false, message: 'No tenemos una confirmación de esta operación. Actualiza y consulta el registro antes de repetirla. Comprueba tus permisos y la disponibilidad del comercio.' };
    }
    revalidatePath(`${await portalBase()}/t/${tenantId}`, 'layout');
    return { ok: true, message: 'Operación registrada correctamente.', ...(typeof data === 'string' ? { recordId: data } : {}) };
  } catch (error) { return failure(error); }
}

export async function createCustomer(tenant: string, _state: FormState, form: FormData): Promise<FormState> {
  let result: CommandState;
  let tenantId: string;
  try {
    tenantId = uuid(tenant);
    result = await run('create_customer', {
      p_tenant: tenantId,
      p_name: text(form.get('name'), 'Nombre', 2, 120),
      p_phone: text(form.get('phone') || '', 'Teléfono', 0, 30),
    });
  } catch (error) { return failure(error); }
  if (result.ok && result.recordId) redirect(`${await portalBase()}/t/${tenantId}?customer=${encodeURIComponent(result.recordId)}#recepcion`);
  return result;
}

export async function createRepair(tenant: string, requestId: string, _state: FormState, form: FormData): Promise<FormState> {
  let result: CommandState;
  let tenantId: string;
  try {
    tenantId = uuid(tenant);
    const input = parseRepairInput({ customerId: form.get('customerId'), device: form.get('device'), issue: form.get('issue') });
    result = await run('create_repair', {
      p_tenant: tenantId,
      p_customer: input.customerId, p_device: input.device, p_issue: input.issue, p_request_id: uuid(requestId),
    });
  } catch (error) { return failure(error); }
  if (result.ok && result.recordId) redirect(`${await portalBase()}/t/${tenantId}/repairs/${encodeURIComponent(result.recordId)}`);
  return result;
}

export async function changeStatus(tenant: string, repair: string, version: number, _state: FormState, form: FormData): Promise<FormState> {
  try {
    const next = String(form.get('status'));
    if (!statuses.includes(next as typeof statuses[number])) return { ok: false, message: 'Selecciona un estado válido.' };
    return await run('transition_repair', { p_tenant: uuid(tenant), p_repair: uuid(repair), p_expected_version: version, p_status: next });
  } catch (error) { return failure(error); }
}

export async function confirmIntake(tenant: string, repair: string, version: number, operation: string, _state: FormState, form: FormData): Promise<FormState> {
  try {
    if (form.get('physicallyReceived') !== 'yes') return { ok: false, message: 'Confirma que recibiste físicamente el equipo antes de emitir el voucher.' };
    const result = await run('confirm_intake', {
      p_tenant: uuid(tenant), p_repair: uuid(repair), p_expected_version: version,
      p_operation_id: uuid(operation), p_condition: text(form.get('condition'), 'Estado físico', 2, 1000),
      p_accessories: text(form.get('accessories'), 'Accesorios', 2, 1000),
    });
    return result.ok ? { ok: true, message: 'Recepción física confirmada. El voucher está disponible.' } : result;
  } catch (error) { return failure(error); }
}

export async function recordPayment(tenant: string, repair: string, idempotencyKey: string, _state: FormState, form: FormData): Promise<FormState> {
  try {
    const method = String(form.get('method'));
    if (!methods.includes(method as typeof methods[number])) return { ok: false, message: 'Selecciona un medio de pago válido.' };
    const amount = parseMoney(String(form.get('amount')));
    if (amount === 0) return { ok: false, message: 'El importe debe ser mayor que cero.' };
    return await run('record_payment', {
      p_tenant: uuid(tenant),
      p_repair: uuid(repair), p_amount: amount, p_method: method, p_idempotency_key: uuid(idempotencyKey),
    });
  } catch (error) { return failure(error); }
}

export async function confirmPayment(tenant: string, payment: string, _state: FormState, _form: FormData): Promise<FormState> {
  try { return await run('confirm_payment', { p_tenant: uuid(tenant), p_payment: uuid(payment) }); }
  catch (error) { return failure(error); }
}

export async function assignTechnician(tenant: string, repair: string, _state: FormState, form: FormData): Promise<FormState> {
  try { return await run('assign_technician', { p_tenant: uuid(tenant), p_repair: uuid(repair), p_user: uuid(form.get('technician'), 'Técnico') }); }
  catch (error) { return failure(error); }
}
