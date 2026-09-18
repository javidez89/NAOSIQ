import Link from 'next/link';
import { currentUser } from '@/lib/access';
import { masterSections } from '@/domain/master';
export const dynamic = 'force-dynamic';

export default async function Master() {
  const { db, user } = await currentUser();
  const { data: allowed } = await db.rpc('is_platform_admin');
  if (allowed !== true) return <section className="panel narrow"><p className="eyebrow">SU01 · Administración de plataforma</p><h1>CRM maestro protegido</h1><p>Este espacio requiere una cuenta Super Usuario activa y verificación en tu autenticador.</p><Link className="button" href="/master/security">Verificar mi identidad</Link></section>;
  const [tenants, subscriptions, audit] = await Promise.all([
    db.from('tenants').select('id,name,slug,status').order('created_at', { ascending: false }).limit(100),
    db.from('subscriptions').select('tenant_id,status,current_period_end'),
    db.from('audit_events').select('id').limit(1000),
  ]);
  if (tenants.error || subscriptions.error || audit.error) throw new Error('No se pudo cargar el CRM Maestro.');
  const rows = tenants.data ?? [];
  const pending = (subscriptions.data ?? []).filter(item => ['past_due', 'suspended'].includes(item.status)).length;
  return <>
    <div className="page-heading"><div><p className="eyebrow">SU01 · Actor real: {user.email}</p><h1>CRM maestro</h1><p className="lead">Comercios, relación SaaS y control auditado de la plataforma.</p></div><Link className="button" href="/master/businesses/new">Crear comercio</Link></div>
    <div className="metrics"><section className="panel"><p className="muted">Comercios</p><strong className="kpi">{rows.length}</strong></section><section className="panel"><p className="muted">Activos</p><strong className="kpi">{rows.filter(t => t.status === 'active').length}</strong></section><section className="panel"><p className="muted">Renovaciones a revisar</p><strong className="kpi">{pending}</strong></section><section className="panel"><p className="muted">Eventos visibles</p><strong className="kpi">{audit.data?.length ?? 0}</strong></section></div>
    <section className="panel"><div className="panel-heading"><div><p className="eyebrow">SU02</p><h2>Comercios recientes</h2></div><Link href="/master/businesses">Ver todos</Link></div><div className="grid spaced">{rows.slice(0, 4).map(t => <Link className="panel card-link" key={t.id} href={`/master/businesses/${t.id}`}><span className={`status status-${t.status}`}>{t.status}</span><h3>{t.name}</h3><p className="muted">/{t.slug}</p><span className="card-action">Abrir ficha →</span></Link>)}</div></section>
    <section className="spaced"><p className="eyebrow">SU06–SU20</p><h2>Gobierno de plataforma</h2><div className="grid">{Object.entries(masterSections).map(([path, section]) => <Link className="panel card-link" href={`/master/${path}`} key={path}><p className="eyebrow">{section.id}</p><h3>{section.title}</h3><p className="muted">{section.description}</p><span className="card-action">Abrir módulo →</span></Link>)}</div></section>
  </>;
}
