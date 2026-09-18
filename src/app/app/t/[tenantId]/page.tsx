import Link from 'next/link';
import { randomUUID } from 'node:crypto';
import { notFound } from 'next/navigation';
import { tenantContext } from '@/lib/access';
import { ActionForm } from '@/components/action-form';
import { statuses, statusLabels, type RepairStatus } from '@/domain/repairs';
import { uuid } from '@/domain/validation';
import type { Role } from '@/domain/identity';
import { createCustomer, createRepair } from './actions';
import { brand } from '@/config/brand';
import { endMasterControl } from '@/app/master/actions';

export const dynamic = 'force-dynamic';

const pageSize = 100;
const roleLabels: Record<Role, string> = {
  super_user: 'Super Usuario', admin: 'Administrador', advisor: 'Asesor',
  technician: 'Técnico', customer: 'Cliente',
};
type Search = Record<string, string | string[] | undefined>;
type Customer = { id: string; name: string; phone: string };
type TeamMember = { user_id: string; display_name: string; role: string; active: boolean };
type RepairSummary = {
  id: string; device: string; status: RepairStatus; created_at: string;
  assigned_to: string | null; customer: { name: string } | null;
};
function parameter(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value.trim().slice(0, 120) : '';
}
function contains(value: string): string {
  return `%${value.replace(/[\\%_]/g, '\\$&')}%`;
}
function date(value: string): string {
  return new Date(value).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function Tenant({ params, searchParams }: {
  params: Promise<{ tenantId: string }>; searchParams: Promise<Search>;
}) {
  const [{ tenantId: input }, search] = await Promise.all([params, searchParams]);
  const { db, user, tenantId, role, base } = await tenantContext(input);
  const intake = ['admin', 'advisor', 'super_user'].includes(role);
  const q = parameter(search.q);
  const customerQuery = parameter(search.customerQuery);
  const requestedStatus = parameter(search.status);
  const status = statuses.includes(requestedStatus as RepairStatus) ? requestedStatus : '';
  const pageValue = Number(parameter(search.page));
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 && pageValue <= 100000 ? pageValue : 1;
  const start = (page - 1) * pageSize;
  let selectedCustomerId = '';
  try { if (parameter(search.customer)) selectedCustomerId = uuid(parameter(search.customer)); } catch { /* Invalid filters cannot select a customer. */ }

  let repairsQuery = db.from('repairs')
    .select('id,device,status,created_at,assigned_to,customer:customers(name)', { count: 'exact' })
    .eq('tenant_id', tenantId).order('created_at', { ascending: false }).order('id')
    .range(start, start + pageSize - 1);
  if (q) repairsQuery = repairsQuery.ilike('device', contains(q));
  if (status) repairsQuery = repairsQuery.eq('status', status);
  let customersQuery = db.from('customers').select('id,name,phone', { count: 'exact' })
    .eq('tenant_id', tenantId).order('name').order('id').limit(100);
  if (customerQuery) customersQuery = customersQuery.ilike('name', contains(customerQuery));

  const [tenantResult, repairsResult, customersResult, selectedResult, teamResult, operationalResult, totalResult, activeResult, waitingResult] = await Promise.all([
    db.from('tenants').select('name,status').eq('id', tenantId).maybeSingle(),
    repairsQuery.returns<RepairSummary[]>(),
    intake ? customersQuery.returns<Customer[]>() : Promise.resolve({ data: [] as Customer[], error: null, count: 0 }),
    intake && selectedCustomerId
      ? db.from('customers').select('id,name,phone').eq('tenant_id', tenantId).eq('id', selectedCustomerId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    db.rpc('list_team_members', { p_tenant: tenantId }).returns<TeamMember[]>(),
    db.rpc('tenant_operational', { p_tenant: tenantId }),
    db.from('repairs').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    db.from('repairs').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).neq('status', 'completed'),
    db.from('repairs').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'waiting_parts'),
  ]);
  if (tenantResult.error || repairsResult.error) throw new Error('No se pudo cargar el comercio. Intenta actualizar la página.');
  if (!tenantResult.data) notFound();
  const tenant = tenantResult.data;
  const repairs = repairsResult.data ?? [];
  const customers = [...(customersResult.data ?? [])];
  const selectedCustomer = selectedResult.data as Customer | null;
  if (selectedCustomer && !customers.some(customer => customer.id === selectedCustomer.id)) customers.unshift(selectedCustomer);
  const selectedId = selectedCustomer?.id ?? '';
  const team = new Map((teamResult.data ?? []).map(member => [member.user_id, member.display_name]));
  const operational = !operationalResult.error && operationalResult.data === true;
  const metricsUnavailable = totalResult.error || activeResult.error || waitingResult.error;
  const total = totalResult.count ?? 0;
  const active = activeResult.count ?? 0;
  const resultCount = repairsResult.count ?? 0;
  const lastPage = Math.max(1, Math.ceil(resultCount / pageSize));
  const title = role === 'technician' ? 'Mis asignaciones' : role === 'customer' ? 'Mis equipos' : 'Reparaciones';
  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (q) query.set('q', q);
    if (status) query.set('status', status);
    if (customerQuery) query.set('customerQuery', customerQuery);
    if (selectedId) query.set('customer', selectedId);
    if (nextPage > 1) query.set('page', String(nextPage));
    return `${base}/t/${tenantId}${query.size ? `?${query}` : ''}#reparaciones`;
  };

  return <>
    {role === 'super_user' ? <section className="control-banner"><div><strong>CONTROL TOTAL · {tenant.name}</strong><span>Actor real: {user.email} · Contexto explícito y auditado</span></div><form action={endMasterControl.bind(null, tenantId)}><button className="secondary">Salir del comercio</button></form></section> : <Link href={base}>{role === 'customer' ? '← Mis servicios' : '← Mis comercios'}</Link>}
    <div className="page-heading">
      <div><p className="eyebrow">{roleLabels[role]} · Tu comercio</p><h1>{tenant.name}</h1>
        {role === 'customer' && <p className="endorsement">{brand.endorsement}</p>}
        <p className="lead">{role === 'technician' ? 'Tu trabajo asignado y el avance de cada reparación.' : role === 'customer' ? 'Sigue el progreso de tus equipos y consulta tus comprobantes.' : 'Organiza la recepción, el seguimiento y la atención de tus equipos.'}</p></div>
      {role === 'customer' ? <Link className="button" href={`${base}/t/${tenantId}/requests/new`}>Nueva solicitud</Link> : intake && <div className="actions"><Link className="button secondary" href={`${base}/t/${tenantId}/operations`}>Centro operativo</Link>{role === 'admin' || role === 'super_user' ? <Link className="button secondary" href={`${base}/t/${tenantId}/settings`}>Configuración</Link> : null}{operational && <a className="button" href="#recepcion">+ Crear orden</a>}</div>}
    </div>
    {operationalResult.error
      ? <p role="alert" className="notice error">No se pudo comprobar la disponibilidad del comercio. Actualiza la página antes de registrar cambios.</p>
      : !operational && <p className="notice warning" role="status"><strong>Comercio en modo consulta.</strong> Las nuevas operaciones están bloqueadas. El administrador debe revisar el estado y la vigencia de la suscripción.</p>}
    <div className="metrics grid">
      <article className="panel"><p className="eyebrow">Órdenes visibles</p><p className="kpi">{metricsUnavailable ? '—' : total}</p></article>
      <article className="panel"><p className="eyebrow">En proceso</p><p className="kpi">{metricsUnavailable ? '—' : active}</p></article>
      <article className="panel"><p className="eyebrow">Pendientes de repuesto</p><p className="kpi">{metricsUnavailable ? '—' : waitingResult.count ?? 0}</p></article>
      <article className="panel"><p className="eyebrow">Completadas</p><p className="kpi">{metricsUnavailable ? '—' : total - active}</p></article>
    </div>
    {role === 'customer' && <nav className="actions spaced" aria-label="Cuenta del cliente"><Link className="button secondary" href={`/cliente/t/${tenantId}/account/messages`}>Mensajes y avisos</Link><Link className="button secondary" href={`/cliente/t/${tenantId}/account/profile`}>Mi perfil</Link></nav>}
    {role !== 'customer' && <nav className="actions spaced" aria-label="Áreas del comercio">
      {['admin','advisor','super_user'].includes(role) && <Link className="button secondary" href={`/comercio/t/${tenantId}/quotes`}>Cotizaciones</Link>}
      {['admin','advisor','super_user'].includes(role) && <Link className="button secondary" href={`/comercio/t/${tenantId}/workspace/customers`}>Clientes y equipos</Link>}
      <Link className="button secondary" href={`/comercio/t/${tenantId}/workspace/inventory`}>Inventario</Link>
      {['admin','advisor','super_user'].includes(role) && <Link className="button secondary" href={`/comercio/t/${tenantId}/workspace/sales`}>Ventas</Link>}
      <Link className="button secondary" href={`/comercio/t/${tenantId}/workspace/messages`}>Mensajes</Link>
      {['admin','super_user'].includes(role) && <Link className="button secondary" href={`/comercio/t/${tenantId}/workspace/analytics`}>Indicadores</Link>}
      {['admin','super_user'].includes(role) && <Link className="button secondary" href={`/comercio/t/${tenantId}/workspace/subscription`}>Suscripción</Link>}
      {role === 'advisor' && <Link className="button secondary" href={`/comercio/t/${tenantId}/workspace/profile`}>Mi perfil</Link>}
    </nav>}
    {metricsUnavailable && <p className="notice error" role="alert">No se pudo cargar el resumen de reparaciones. El listado sigue disponible.</p>}
    {teamResult.error && <p className="notice error" role="alert">No se pudieron cargar los nombres del equipo técnico. Las asignaciones se conservan; actualiza la página para consultar sus nombres.</p>}

    <section className="panel spaced" id="reparaciones">
      <div className="panel-heading"><div><p className="eyebrow">Seguimiento</p><h2>{title}</h2></div><span className="pill">{resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}</span></div>
      <form action={`${base}/t/${tenantId}#reparaciones`} method="get" className="filter-form">
        <label>Buscar equipo<input name="q" type="search" defaultValue={q} maxLength={120} placeholder="Marca, modelo o descripción"/></label>
        <label>Estado<select name="status" defaultValue={status}><option value="">Todos los estados</option>{statuses.map(item => <option key={item} value={item}>{statusLabels[item]}</option>)}</select></label>
        <div className="actions"><button type="submit">Buscar</button>{(q || status) && <Link className="button secondary" href={`${base}/t/${tenantId}#reparaciones`}>Limpiar</Link>}</div>
      </form>
      {repairs.length > 0 ? <div className="table-wrap"><table>
        <caption>{start + 1}–{Math.min(start + repairs.length, resultCount)} de {resultCount} órdenes · Más recientes primero</caption>
        <thead><tr><th scope="col">Equipo</th>{role !== 'technician' && <th scope="col">Cliente</th>}<th scope="col">Estado</th><th scope="col">Técnico</th><th scope="col">Recepción</th><th scope="col">Detalle</th></tr></thead>
        <tbody>{repairs.map(repair => <tr key={repair.id}>
          <td><strong>{repair.device}</strong><br/><small className="muted">Orden {repair.id.slice(0, 8).toUpperCase()}</small></td>
          {role !== 'technician' && <td>{repair.customer?.name ?? '—'}</td>}
          <td><span className={`status status-${repair.status}`}>{statusLabels[repair.status]}</span></td>
          <td>{repair.assigned_to ? team.get(repair.assigned_to) ?? 'Técnico asignado' : 'Sin asignar'}</td>
          <td><time dateTime={repair.created_at}>{date(repair.created_at)}</time></td>
          <td><Link href={`${base}/t/${tenantId}/repairs/${repair.id}`} aria-label={`Ver reparación de ${repair.device}`}>Ver orden <span aria-hidden="true">→</span></Link></td>
        </tr>)}</tbody>
      </table></div> : <div className="empty">
        <h3>{q || status ? 'No encontramos equipos con esos filtros' : page > 1 ? 'No hay órdenes en esta página' : role === 'technician' ? 'No tienes equipos asignados' : role === 'customer' ? 'Aún no tienes equipos registrados' : 'Aquí comienza el seguimiento de tus equipos'}</h3>
        <p>{q || status ? 'Prueba otra descripción o consulta todos los estados.' : role === 'technician' ? 'Las órdenes aparecerán cuando el administrador te las asigne.' : role === 'customer' ? 'El comercio vinculará tus órdenes a tu cuenta.' : 'Recibe el primer equipo para crear su orden y comprobante.'}</p>
        {page > 1 && <Link href={pageHref(1)}>Ir a la primera página</Link>}
      </div>}
      {(lastPage > 1 || page > 1) && <nav className="actions" aria-label="Páginas de reparaciones">
        {page > 1 && <Link className="button secondary" href={pageHref(page - 1)}>Anterior</Link>}
        <span className="pagination-label">Página {page} de {lastPage}</span>
        {page < lastPage && <Link className="button secondary" href={pageHref(page + 1)}>Siguiente</Link>}
      </nav>}
    </section>

    {intake && <section className="spaced" id="recepcion">
      <p className="eyebrow">Recepción</p><h2>Una nueva orden, paso a paso</h2>
      <div className="grid">
        <section className="panel" id="nuevo-cliente"><p className="eyebrow">01 · Cliente</p><h3>Registrar cliente</h3><p className="muted">Si ya está registrado, búscalo en el siguiente paso.</p>
          {operational ? <ActionForm action={createCustomer.bind(null, tenantId)} submit="Crear cliente y continuar">
            <label>Nombre completo<input name="name" required minLength={2} maxLength={120} autoComplete="name" defaultValue={customerQuery}/></label>
            <label>Teléfono de contacto<input name="phone" type="tel" maxLength={30} autoComplete="tel"/></label>
          </ActionForm> : <p className="notice warning">El registro de clientes estará disponible cuando el comercio vuelva a estar operativo.</p>}
        </section>
        <section className="panel"><p className="eyebrow">02 · Equipo</p><h3>Registrar solicitud</h3>
          <form action={`${base}/t/${tenantId}#recepcion`} method="get" className="filter-form">
            <label>Buscar cliente por nombre<input type="search" name="customerQuery" defaultValue={customerQuery} maxLength={120} placeholder="Nombre del cliente"/></label>
            <div className="actions"><button className="secondary" type="submit">Buscar cliente</button>{customerQuery && <Link href={`${base}/t/${tenantId}#recepcion`}>Limpiar búsqueda</Link>}</div>
          </form>
          {customersResult.error || selectedResult.error ? <p className="notice error" role="alert">No se pudieron cargar los clientes. Actualiza la página antes de recibir un equipo.</p>
            : !customers.length ? <p className="empty">{customerQuery ? 'No encontramos clientes con ese nombre. Revisa la búsqueda o registra uno nuevo.' : 'Registra primero un cliente para recibir su equipo.'}</p>
            : operational ? <>
              {selectedCustomer && <p className="notice" role="status">Cliente seleccionado: <strong>{selectedCustomer.name}</strong>.</p>}
              {(customersResult.count ?? 0) > 100 && <p className="muted">Mostramos los primeros 100 clientes. Busca por nombre para encontrar el que necesitas.</p>}
              <ActionForm key={selectedId || customerQuery || 'intake'} action={createRepair.bind(null, tenantId, randomUUID())} submit="Crear orden">
                <label>Cliente<select name="customerId" required defaultValue={selectedId}><option value="" disabled>Selecciona un cliente</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}{customer.phone ? ` · ${customer.phone}` : ''}</option>)}</select></label>
                <label>Equipo u objeto<input name="device" required minLength={2} maxLength={160} placeholder="Ej. Portátil Lenovo IdeaPad 3"/></label>
                <p className="muted">Crear la orden no confirma la recepción física. Podrás confirmarla desde su detalle cuando llegue el equipo.</p>
                <label>Falla reportada<textarea name="issue" required minLength={5} maxLength={2000} placeholder="Describe la falla y las condiciones en que llega el equipo."/></label>
              </ActionForm>
            </> : <p className="notice warning">La recepción estará disponible cuando el comercio vuelva a estar operativo.</p>}
        </section>
      </div>
    </section>}
  </>;
}
