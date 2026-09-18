import Link from 'next/link';
import { notFound } from 'next/navigation';
import { currentUser } from '@/lib/access';
import { uuid } from '@/domain/validation';
import { ActionForm } from '@/components/action-form';
import { setStatus } from '../../actions';
export const dynamic = 'force-dynamic';

export default async function BusinessDetail({ params, searchParams }: { params: Promise<{ tenantId: string }>; searchParams: Promise<{ notice?: string }> }) {
  const tenantId = uuid((await params).tenantId);
  const { notice } = await searchParams;
  const { db, user } = await currentUser();
  const { data: master } = await db.rpc('is_platform_admin');
  if (master !== true) return <section className="panel"><h1>Ficha protegida</h1><Link className="button" href="/master/security">Verificar identidad</Link></section>;
  const [tenant, subscription, team] = await Promise.all([
    db.from('tenants').select('id,name,slug,status,created_at').eq('id', tenantId).maybeSingle(),
    db.from('subscriptions').select('plan_code,status,current_period_end,updated_at').eq('tenant_id', tenantId).maybeSingle(),
    db.rpc('list_team_members', { p_tenant: tenantId }),
  ]);
  if (tenant.error || subscription.error || team.error) throw new Error('No se pudo cargar la ficha del comercio.');
  if (!tenant.data) notFound();
  const admins = (team.data ?? []).filter(member => member.role === 'admin' && member.active);
  return <>
    <Link href="/master/businesses">← Comercios</Link>
    {notice === 'closed' && <p className="notice success" role="status">Volviste al CRM Maestro. El contexto del comercio fue cerrado y auditado.</p>}
    <div className="page-heading"><div><p className="eyebrow">SU04 · Actor real: {user.email}</p><h1>{tenant.data.name}</h1><p className="lead">/{tenant.data.slug} · Organización {tenantId.slice(0, 8).toUpperCase()}</p></div><Link className="button" href={`/master/businesses/${tenantId}/control`}>Entrar al CRM</Link></div>
    <div className="metrics"><section className="panel"><p className="muted">Comercio</p><strong>{tenant.data.status}</strong></section><section className="panel"><p className="muted">Plan</p><strong>{subscription.data?.plan_code ?? '—'}</strong></section><section className="panel"><p className="muted">Suscripción SaaS</p><strong>{subscription.data?.status ?? '—'}</strong></section><section className="panel"><p className="muted">Administradores activos</p><strong>{admins.length}</strong></section></div>
    <div className="grid"><section className="panel"><h2>Disponibilidad del comercio</h2><ActionForm action={setStatus.bind(null, tenantId)} submit="Guardar disponibilidad"><label>Estado<select name="status" defaultValue={tenant.data.status}><option value="active">Activo</option><option value="suspended">Suspendido</option><option value="closed">Cerrado</option></select></label><label>Justificación<textarea name="reason" required minLength={10} maxLength={500}/></label></ActionForm><p className="muted">Una cortesía SaaS no se registra como pago bancario.</p></section><section className="panel"><h2>Acciones relacionadas</h2><p><Link href={`/master/businesses/${tenantId}/edit`}>Editar comercio (SU19)</Link></p><p><Link href="/master/subscriptions">Consultar suscripciones (SU18)</Link></p><p className="muted">Los cambios estructurales de URL corresponden a P05.</p></section></div>
  </>;
}
