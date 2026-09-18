import { portalAllowsRole } from '@/config/portals';
import Link from 'next/link';
import { currentUser } from '@/lib/access';
import type { Role } from '@/domain/identity';

export const dynamic = 'force-dynamic';

const roleLabels: Record<Role, string> = {
  super_user: 'Super Usuario', admin: 'Administrador', advisor: 'Asesor',
  technician: 'Técnico', customer: 'Cliente',
};
const roleDescriptions: Record<Role, string> = {
  super_user: 'Administra comercios, accesos y la operación de la plataforma.',
  admin: 'Organiza el trabajo, asigna técnicos y registra los ingresos.',
  advisor: 'Recibe equipos, registra clientes y consulta su seguimiento.',
  technician: 'Consulta tus asignaciones y actualiza el avance de cada equipo.',
  customer: 'Consulta tus equipos, su progreso y tus comprobantes.',
};
type MembershipSummary = {
  tenant_id: string;
  role: Role;
  tenant: { name: string; status: string; slug: string } | null;
};

export default async function Workspace() {
  const { db, user, portal, base } = await currentUser();
  const membershipResult = await db.from('memberships')
      .select('tenant_id,role,tenant:tenants(name,status,slug)', { count: 'exact' })
      .eq('user_id', user.id).eq('active', true)
      .in('role', portal === 'cliente' ? ['customer'] : ['admin', 'advisor', 'technician'])
      .order('created_at').limit(50).returns<MembershipSummary[]>();
  if (membershipResult.error) throw new Error('No se pudieron cargar tus comercios.');
  const memberships = (membershipResult.data ?? []).filter(m => portalAllowsRole(portal, m.role));

  return <>
    <div className="page-heading">
      <div><p className="eyebrow">Tu espacio de trabajo</p><h1>{portal === 'cliente' ? 'Mis servicios' : 'Mis comercios'}</h1>
        <p className="lead">{portal === 'cliente' ? 'Elige el comercio para consultar tus equipos y comprobantes.' : 'Elige dónde trabajar. Encontrarás las tareas disponibles para tu rol.'}</p></div>
      <div className="actions">
        <Link className="button secondary" href={`${base}/security`}>Seguridad de mi cuenta</Link>
      </div>
    </div>
    <div className="grid spaced">{memberships.map(m => m.tenant && <Link
      className="panel card-link" href={`${base}/t/${m.tenant_id}`} key={m.tenant_id}
    >
      <div className="panel-heading"><p className="eyebrow">{roleLabels[m.role]}</p>
        <span className={`status status-${m.tenant.status}`}>{m.tenant.status === 'active' ? 'Activo' : m.tenant.status === 'suspended' ? 'Suspendido' : 'Cerrado'}</span></div>
      <h2>{m.tenant.name}</h2><p className="muted">{roleDescriptions[m.role]}</p>
      <span className="card-action">Entrar al comercio <span aria-hidden="true">→</span></span>
    </Link>)}</div>
    {!memberships.length && <section className="empty">
      <h2>Aún no tienes un comercio asignado</h2>
      <p>Tu cuenta está activa. El administrador de la plataforma debe asignarte acceso para comenzar.</p>
    </section>}
    {(membershipResult.count ?? 0) > 50 && <p className="notice">Se muestran tus primeros 50 comercios. Contacta al administrador de la plataforma si necesitas acceder a otro.</p>}
  </>;
}
