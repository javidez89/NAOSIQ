import Link from 'next/link';
import { randomUUID } from 'node:crypto';
import { notFound } from 'next/navigation';
import { tenantContext } from '@/lib/access';
import { uuid } from '@/domain/validation';
import { formatMoney } from '@/domain/money';
import { manualMethods, type ManualMethod } from '@/domain/payments';
import { statusLabels, transitions, type RepairStatus } from '@/domain/repairs';
import { ActionForm } from '@/components/action-form';
import { changeStatus, recordPayment, confirmPayment, assignTechnician, confirmIntake } from '../../actions';
import { brand } from '@/config/brand';

export const dynamic = 'force-dynamic';

const pageSize = 25;
const summaryLimit = 1000;
const methodLabels: Record<ManualMethod, string> = {
  cash: 'Efectivo', breb: 'Bre-B', nequi: 'Nequi', bank_transfer: 'Transferencia bancaria',
};
const paymentLabels = { pending: 'Pendiente de confirmar', confirmed: 'Confirmado', reversed: 'Revertido' };
type Search = Record<string, string | string[] | undefined>;
type Repair = {
  id: string; device: string; issue: string; status: RepairStatus; version: number;
  assigned_to: string | null; created_at: string; customer: { name: string; phone: string } | null;
};
type TeamMember = { user_id: string; display_name: string; role: string; active: boolean };
type Payment = {
  id: string; amount_minor: number; currency: string; method: ManualMethod;
  status: keyof typeof paymentLabels; created_at: string;
};
type Voucher = { id: string; kind: 'intake' | 'payment'; created_at: string };
type RepairEvent = { id: string; status: RepairStatus; created_at: string };
type PaymentAmount = Pick<Payment, 'amount_minor' | 'status'>;

function pageNumber(value: string | string[] | undefined): number {
  const page = typeof value === 'string' ? Number(value) : 1;
  return Number.isSafeInteger(page) && page > 0 && page <= 100000 ? page : 1;
}
function date(value: string): string {
  return new Date(value).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' });
}
// Aggregate totals may exceed the maximum allowed for one payment; sum exact cents.
function totalLabel(payments: PaymentAmount[], status: PaymentAmount['status']): string {
  const total = payments.reduce((sum, payment) => payment.status === status ? sum + BigInt(payment.amount_minor) : sum, 0n);
  const cents = (total % 100n).toString().padStart(2, '0');
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 })
    .formatToParts(total / 100n).map(part => part.type === 'fraction' ? cents : part.value).join('');
}
function Pagination({ page, count, label, href }: { page: number; count: number; label: string; href: (page: number) => string }) {
  const last = Math.max(1, Math.ceil(count / pageSize));
  if (last === 1 && page === 1) return null;
  return <nav className="actions" aria-label={`Páginas de ${label}`}>
    {page > 1 && <Link className="button secondary" href={href(page - 1)}>Anterior</Link>}
    <span className="pagination-label">Página {page} de {last}</span>
    {page < last && <Link className="button secondary" href={href(page + 1)}>Siguiente</Link>}
    {page > last && <Link href={href(1)}>Ir a la primera página</Link>}
  </nav>;
}

export default async function RepairPage({ params, searchParams }: {
  params: Promise<{ tenantId: string; repairId: string }>; searchParams: Promise<Search>;
}) {
  const [p, search] = await Promise.all([params, searchParams]);
  const { db, tenantId, role, base } = await tenantContext(p.tenantId);
  let id: string;
  try { id = uuid(p.repairId); } catch { notFound(); }
  const financial = ['admin', 'super_user'].includes(role);
  const readPayments = financial || role === 'customer';
  const readVouchers = readPayments || role === 'advisor';
  const transitionAllowed = ['admin', 'technician', 'super_user'].includes(role);
  const pages = { payments: pageNumber(search.payments), vouchers: pageNumber(search.vouchers), history: pageNumber(search.history) };
  const rangeStart = (page: number) => (page - 1) * pageSize;
  const [repairResult, tenantResult, paymentsResult, summaryResult, vouchersResult, eventsResult, teamResult, operationalResult, assuranceResult, intakeResult] = await Promise.all([
    db.from('repairs').select('id,device,issue,status,version,assigned_to,created_at,customer:customers(name,phone)')
      .eq('tenant_id', tenantId).eq('id', id).maybeSingle().returns<Repair>(),
    db.from('tenants').select('name').eq('id', tenantId).maybeSingle(),
    readPayments ? db.from('payments').select('id,amount_minor,currency,method,status,created_at', { count: 'exact' })
      .eq('tenant_id', tenantId).eq('repair_id', id).order('created_at', { ascending: false }).order('id')
      .range(rangeStart(pages.payments), rangeStart(pages.payments) + pageSize - 1).returns<Payment[]>()
      : Promise.resolve({ data: [] as Payment[], error: null, count: 0 }),
    readPayments ? db.from('payments').select('amount_minor,status', { count: 'exact' })
      .eq('tenant_id', tenantId).eq('repair_id', id).order('id').limit(summaryLimit).returns<PaymentAmount[]>()
      : Promise.resolve({ data: [] as PaymentAmount[], error: null, count: 0 }),
    readVouchers ? db.from('vouchers').select('id,kind,created_at', { count: 'exact' })
      .eq('tenant_id', tenantId).eq('repair_id', id).order('created_at', { ascending: false }).order('id')
      .range(rangeStart(pages.vouchers), rangeStart(pages.vouchers) + pageSize - 1).returns<Voucher[]>()
      : Promise.resolve({ data: [] as Voucher[], error: null, count: 0 }),
    db.from('repair_events').select('id,status,created_at', { count: 'exact' })
      .eq('tenant_id', tenantId).eq('repair_id', id).order('created_at', { ascending: false }).order('id')
      .range(rangeStart(pages.history), rangeStart(pages.history) + pageSize - 1).returns<RepairEvent[]>(),
    db.rpc('list_team_members', { p_tenant: tenantId }).returns<TeamMember[]>(),
    db.rpc('tenant_operational', { p_tenant: tenantId }),
    financial ? db.auth.mfa.getAuthenticatorAssuranceLevel() : Promise.resolve({ data: null, error: null }),
    db.from('intake_events').select('id,confirmed_at,physical_condition,accessories,voucher_id').eq('tenant_id', tenantId).eq('repair_id', id).maybeSingle(),
  ]);
  if (repairResult.error) throw new Error('No se pudo cargar la reparación. Actualiza la página para volver a intentarlo.');
  if (!repairResult.data) notFound();
  const repair = repairResult.data;
  const tenantName = tenantResult.data?.name ?? 'Tu comercio';
  const payments = paymentsResult.data ?? [];
  const vouchers = vouchersResult.data ?? [];
  const events = eventsResult.data ?? [];
  const team = teamResult.data ?? [];
  const technicians = team.filter(member => member.role === 'technician' && member.active);
  const assigned = team.find(member => member.user_id === repair.assigned_to);
  const operational = !operationalResult.error && operationalResult.data === true;
  const mfaVerified = !assuranceResult.error && assuranceResult.data?.currentLevel === 'aal2';
  const nextStates = transitions[repair.status] ?? [];
  const summary = summaryResult.data ?? [];
  const summaryComplete = !summaryResult.error && summaryResult.count !== null && summaryResult.count === summary.length;
  const href = (section: keyof typeof pages, page: number) => {
    const query = new URLSearchParams();
    for (const key of Object.keys(pages) as (keyof typeof pages)[]) {
      const value = key === section ? page : pages[key];
      if (value > 1) query.set(key, String(value));
    }
    return `${base}/t/${tenantId}/repairs/${id}${query.size ? `?${query}` : ''}#${section}`;
  };

  return <>
    <Link href={`${base}/t/${tenantId}`}>← Volver al comercio</Link>
    <div className="page-heading">
      <div><p className="eyebrow">{tenantName} · Orden {repair.id.slice(0, 8).toUpperCase()}</p>
        <h1>{repair.device}</h1>{role === 'customer' && <p className="endorsement">{brand.endorsement}</p>}<p className="muted">Orden creada el <time dateTime={repair.created_at}>{date(repair.created_at)}</time></p>{role==='customer'?<p><Link className="button secondary" href={`/cliente/t/${tenantId}/repairs/${id}/quote`}>Revisar presupuesto</Link></p>:<p><Link className="button secondary" href={`${base}/t/${tenantId}/repairs/${id}/workflow`}>Abrir recorrido operativo F09–F19</Link></p>}</div>
      <span className={`status status-${repair.status}`}>{statusLabels[repair.status]}</span>
    </div>
    {role === 'customer' && search.created === '1' && <section className="notice" data-screen-id="CL06"><strong>Solicitud creada</strong><p>La orden quedó registrada. Esto no confirma que el comercio tenga físicamente el equipo; coordina la recepción con el negocio.</p><Link data-action-id="CL06.A1" href={`/cliente/t/${tenantId}/repairs/${id}`}>Ver seguimiento</Link></section>}
    {tenantResult.error && <p className="notice error" role="alert">No se pudo cargar el nombre del comercio. El detalle de la orden sigue disponible.</p>}
    {operationalResult.error ? <p className="notice error" role="alert">No se pudo comprobar la disponibilidad del comercio. Actualiza la página antes de registrar cambios.</p>
      : !operational && <p className="notice warning" role="status"><strong>Comercio en modo consulta.</strong> El administrador debe revisar su estado y la vigencia de la suscripción para habilitar operaciones.</p>}
    {teamResult.error && <p className="notice error" role="alert">No se pudo cargar el equipo técnico. Actualiza la página para consultar o cambiar la asignación.</p>}
    <div className="split spaced"><div className="stack">
      <section className="panel"><p className="eyebrow">Recepción</p><h2>Información del equipo</h2>
        {role !== 'technician' && <p><strong>Cliente:</strong> {repair.customer?.name ?? 'No disponible'}{repair.customer?.phone && <><br/><span className="muted">{repair.customer.phone}</span></>}</p>}
        <h3>Falla reportada</h3><p className="break">{repair.issue}</p>
        <p><strong>Técnico:</strong> {repair.assigned_to ? assigned?.display_name ?? 'Técnico asignado' : 'Sin asignar'}{assigned && !assigned.active ? ' (membresía inactiva)' : ''}</p>
      </section>
      <section className="panel" id="custodia" data-screen-id={role === 'advisor' ? 'AS03' : 'AD05'}><h2>Recepción física</h2>
        {intakeResult.error ? <p className="notice error" role="alert">No se pudo comprobar la recepción. Actualiza antes de confirmar.</p>
          : intakeResult.data ? <div className="notice" role="status"><strong>Recepción confirmada</strong>
            <p>{date(intakeResult.data.confirmed_at)}</p>
            <p><strong>Estado físico:</strong> {intakeResult.data.physical_condition}</p>
            <p><strong>Accesorios:</strong> {intakeResult.data.accessories}</p>
          </div> : <>
            <p className="notice warning">La recepción física aún no tiene confirmación registrada. Crear la orden no acredita custodia.</p>
            {operational && ['admin', 'advisor', 'super_user'].includes(role) && <ActionForm action={confirmIntake.bind(null, tenantId, id, repair.version, randomUUID())} submit="Confirmar recepción física" actionId={role === 'advisor' ? 'AS03.A3' : 'AD05.A3'}>
              <label>Estado físico<textarea name="condition" required minLength={2} maxLength={1000}/></label>
              <label>Accesorios recibidos<textarea name="accessories" required minLength={2} maxLength={1000} placeholder="Escribe sin accesorios cuando corresponda."/></label>
              <label className="checkbox-label"><input type="checkbox" name="physicallyReceived" value="yes" required/> Confirmo que recibí físicamente el equipo y revisé sus accesorios.</label>
            </ActionForm>}
          </>}
      </section>
      {readVouchers && <section className="panel" id="vouchers"><p className="eyebrow">Documentos de la orden</p><h2>Comprobantes</h2>
        <p className="muted">{tenantName} emite estos documentos. {brand.endorsement}.</p>
        {vouchersResult.error ? <p className="notice error" role="alert">No se pudieron cargar los comprobantes. Actualiza la página para volver a intentarlo.</p>
          : <>{vouchers.map(voucher => <article key={voucher.id} className="notice">
            {voucher.kind === 'intake' && !intakeResult.error && voucher.id !== intakeResult.data?.voucher_id && <p className="notice warning">Documento del flujo anterior, emitido al crear la orden. No acredita una recepción física confirmada.</p>}
            <strong>{voucher.kind === 'intake' ? 'Comprobante de recepción' : 'Comprobante de pago'}</strong><br/>
            <small><time dateTime={voucher.created_at}>{date(voucher.created_at)}</time></small>
            <div className="actions"><a href={`${base}/t/${tenantId}/vouchers/${voucher.id}`} target="_blank" rel="noopener noreferrer">Ver e imprimir PDF</a>
              <a href={`${base}/t/${tenantId}/vouchers/${voucher.id}?download=1`} download>Descargar PDF</a>
              <a href={`${base}/t/${tenantId}/vouchers/${voucher.id}?format=80mm`} target="_blank" rel="noopener noreferrer">Ver 80 mm</a></div>
          </article>)}
          {!vouchers.length && <p className="empty">{pages.vouchers > 1 ? 'No hay comprobantes en esta página.' : 'Aún no hay comprobantes disponibles para tu rol.'}</p>}
          <Pagination page={pages.vouchers} count={vouchersResult.count ?? 0} label="comprobantes" href={page => href('vouchers', page)}/></>}
        <p className="muted">El comprobante de pago se emite al confirmar el ingreso. No es una factura electrónica.</p>
      </section>}
      {readPayments && <section className="panel" id="payments" data-screen-id={role === 'customer' ? 'CL10 CL11 CL18' : 'AD11 AD31 AS08'}><p className="eyebrow">Ingresos de esta orden</p><h2>Pagos y abonos</h2>
        <div className="grid">
          <div className="notice"><p className="eyebrow">Total confirmado</p><strong>{summaryComplete ? totalLabel(summary, 'confirmed') : '—'}</strong></div>
          <div className="notice warning"><p className="eyebrow">Pendiente de confirmar</p><strong>{summaryComplete ? totalLabel(summary, 'pending') : '—'}</strong></div>
        </div>
        {!summaryComplete && <p className="notice error" role="alert">{summaryResult.error ? 'No se pudo cargar el resumen de pagos. Actualiza la página.' : 'El resumen supera el límite de consulta; los totales no están disponibles. Consulta los movimientos por página.'}</p>}
        <p className="muted">Los medios de pago y su confirmación pertenecen a {tenantName}. Estos importes corresponden a movimientos registrados; el presupuesto y el saldo por cobrar aún no están definidos.</p>
        {role === 'customer' && <p className="notice warning">Los reportes de pago del cliente permanecen deshabilitados. Durante el piloto el comercio registra y concilia manualmente cada ingreso conforme a D01, D06, D07 y D10.</p>}
        {financial && assuranceResult.error && <p className="notice error" role="alert">No se pudo comprobar la verificación de tu sesión. Actualiza la página antes de confirmar un ingreso.</p>}
        {financial && !assuranceResult.error && !mfaVerified && <p className="notice warning">Para confirmar ingresos, <Link href={`${base}/security`}>verifica tu cuenta con el segundo factor en Seguridad</Link>.</p>}
        {paymentsResult.error ? <p className="notice error" role="alert">No se pudieron cargar los movimientos. Actualiza la página para volver a intentarlo.</p>
          : <>{payments.map(payment => <article className="notice" key={payment.id}>
            <div className="panel-heading"><strong>{formatMoney(Number(payment.amount_minor), payment.currency)}</strong><span className={`status status-${payment.status}`}>{paymentLabels[payment.status]}</span></div>
            <p>{methodLabels[payment.method]} · <time dateTime={payment.created_at}>{date(payment.created_at)}</time></p>
            {financial && operational && mfaVerified && payment.status === 'pending' && <ActionForm action={confirmPayment.bind(null, tenantId, payment.id)} submit="Confirmar ingreso" actionId="AD31.A1">
              <p>Confirma únicamente después de conciliar el movimiento recibido.</p>
            </ActionForm>}
          </article>)}
          {!payments.length && <p className="empty">{pages.payments > 1 ? 'No hay movimientos en esta página.' : 'Aún no hay pagos registrados para esta orden.'}</p>}
          <Pagination page={pages.payments} count={paymentsResult.count ?? 0} label="pagos" href={page => href('payments', page)}/></>}
      </section>}
    </div><aside className="stack">
      {financial && <section className="panel"><p className="eyebrow">Responsable</p><h2>Asignar técnico</h2>
        {teamResult.error ? <p className="muted">El selector estará disponible cuando se cargue el equipo técnico.</p>
          : !operational ? <p className="muted">La asignación estará disponible cuando el comercio vuelva a estar operativo.</p>
          : !technicians.length ? <p className="empty">No hay técnicos activos. El administrador de la plataforma puede asignar sus accesos desde el CRM maestro.</p>
          : <ActionForm key={`assignment-${repair.assigned_to ?? 'none'}`} action={assignTechnician.bind(null, tenantId, id)} submit="Guardar asignación" actionId="AD09.A1">
            <label>Técnico del comercio<select name="technician" required defaultValue={technicians.some(member => member.user_id === repair.assigned_to) ? repair.assigned_to ?? '' : ''}>
              <option value="" disabled>Selecciona un técnico</option>{technicians.map(member => <option key={member.user_id} value={member.user_id}>{member.display_name}</option>)}
            </select></label>
          </ActionForm>}
      </section>}
      {transitionAllowed && <section className="panel"><p className="eyebrow">Avance de la reparación</p><h2>Actualizar estado</h2>
        {nextStates.length === 0 ? <p className="notice">La reparación está completada. Este estado no confirma la entrega ni el pago del equipo.</p>
          : !operational ? <p className="muted">Los cambios de estado estarán disponibles cuando el comercio vuelva a estar operativo.</p>
          : <ActionForm key={`status-${repair.version}`} action={changeStatus.bind(null, tenantId, id, repair.version)} submit="Guardar estado" actionId="AD09.A2">
            <label>Nuevo estado<select name="status" required defaultValue=""><option value="" disabled>Selecciona el siguiente estado</option>{nextStates.map(status => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
          </ActionForm>}
      </section>}
      {financial && <section className="panel"><p className="eyebrow">Registrar un movimiento</p><h2>Nuevo pago pendiente</h2>
        {operational ? <ActionForm action={recordPayment.bind(null, tenantId, id, randomUUID())} submit="Registrar pago pendiente" actionId="AD11.A2">
          <label>Importe en COP <small>(sin separadores de miles)</small><input name="amount" required inputMode="decimal" pattern="[0-9]+([.][0-9]{1,2})?" maxLength={13} placeholder="50000.00"/></label>
          <label>Medio de pago<select name="method" required defaultValue=""><option value="" disabled>Selecciona el medio</option>{manualMethods.map(method => <option key={method} value={method}>{methodLabels[method]}</option>)}</select></label>
        </ActionForm> : <p className="muted">El registro de pagos estará disponible cuando el comercio vuelva a estar operativo.</p>}
        <p className="muted">El movimiento quedará pendiente de conciliación. Registrar un pago no confirma su recepción.</p>
      </section>}
      <section className="panel" id="history"><p className="eyebrow">Más reciente primero</p><h2>Seguimiento</h2>
        {eventsResult.error ? <p className="notice error" role="alert">No se pudo cargar el historial. Actualiza la página para volver a intentarlo.</p>
          : <>{events.length ? <ol className="timeline">{events.map(event => <li key={event.id}><strong>{statusLabels[event.status]}</strong><br/><small><time dateTime={event.created_at}>{date(event.created_at)}</time></small></li>)}</ol>
            : <p className="empty">{pages.history > 1 ? 'No hay eventos en esta página.' : 'Aún no hay eventos de seguimiento.'}</p>}
            <Pagination page={pages.history} count={eventsResult.count ?? 0} label="seguimiento" href={page => href('history', page)}/></>}
      </section>
    </aside></div>
  </>;
}
