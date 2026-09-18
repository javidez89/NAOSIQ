import type { ReactNode } from 'react';
import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { currentUser } from '@/lib/access';
import { masterSections, type MasterSection } from '@/domain/master';
import { ActionForm } from '@/components/action-form';
import { assignTenantSlug, checkTenantSlug, inviteIdentity, setMembership } from '../actions';
export const dynamic = 'force-dynamic';

const actionLabels: Record<MasterSection, string[]> = {
  plans: ['SU06.A1 Crear plan', 'SU06.A2 Editar Básico', 'SU06.A3 Archivar plan'],
  subscriptions: ['SU07.A1 Abrir suscripción', 'SU07.A2 Filtrar vencidas', 'SU07.A3 Exportar cartera SaaS'],
  billing: ['SU08.A1 Abrir cargo SaaS', 'SU08.A2 Conciliar pago', 'SU08.A3 Registrar cortesía'],
  domains: ['SU09.A1 Comprobar disponibilidad', 'SU09.A2 Guardar URL', 'SU09.A3 Verificar dominio'],
  users: ['SU10.A1 Invitar usuario', 'SU10.A2 Guardar roles', 'SU10.A3 Revocar sesiones'],
  integrations: ['SU11.A1 Probar conexión', 'SU11.A2 Actualizar secreto', 'SU11.A3 Desactivar integración'],
  whatsapp: ['SU12.A1 Previsualizar', 'SU12.A2 Publicar plantilla', 'SU12.A3 Abrir prueba en WhatsApp'],
  audit: ['SU13.A1 Ver evento', 'SU13.A2 Filtrar por comercio', 'SU13.A3 Exportar evidencia'],
  support: ['SU14.A1 Abrir caso', 'SU14.A2 Enviar respuesta', 'SU14.A3 Cerrar caso'],
  settings: ['SU15.A1 Guardar política', 'SU15.A2 Ver impacto', 'SU15.A3 Restaurar versión'],
  analytics: ['SU20.A1 Aplicar período', 'SU20.A2 Solicitar exportación', 'SU20.A3 Descargar resultado'],
};

export default async function MasterModule({ params }: { params: Promise<{ section: string }> }) {
  const key = (await params).section as MasterSection;
  const section = masterSections[key];
  if (!section) notFound();
  const { db } = await currentUser();
  const { data: master } = await db.rpc('is_platform_admin');
  if (master !== true) return <section className="panel"><h1>Módulo protegido</h1><Link className="button" href="/master/security">Verificar identidad</Link></section>;
  let content: ReactNode = <p className="notice warning">Este módulo aún no tiene una mutación local segura. Sus acciones permanecen deshabilitadas y no simulan resultados.</p>;
  if (key === 'plans') {
    const { data, error } = await db.from('plans').select('code,name,entitlements,price_minor,currency').order('code');
    if (error) throw new Error('No se pudieron cargar los planes.');
    content = <div className="table-wrap"><table><thead><tr><th>Plan</th><th>Capacidades</th><th>Precio aprobado</th><th>Detalle</th></tr></thead><tbody>{data.map(plan => <tr key={plan.code}><td>{plan.name}</td><td>{plan.entitlements && typeof plan.entitlements === 'object' && !Array.isArray(plan.entitlements) ? Object.keys(plan.entitlements).join(', ') : '—'}</td><td>{plan.price_minor == null ? 'Pendiente' : `${plan.price_minor} ${plan.currency}`}</td><td><Link href={`/master/plans/${plan.code}`}>Abrir SU16</Link></td></tr>)}</tbody></table></div>;
  } else if (key === 'subscriptions') {
    const { data, error } = await db.from('subscriptions').select('tenant_id,plan_code,status,current_period_end,tenant:tenants(name)').order('current_period_end');
    if (error) throw new Error('No se pudieron cargar las suscripciones.');
    content = <div className="table-wrap"><table><thead><tr><th>Comercio</th><th>Plan</th><th>Estado</th><th>Fin del período</th><th>Detalle</th></tr></thead><tbody>{data.map(item => <tr key={item.tenant_id}><td>{item.tenant?.name ?? item.tenant_id.slice(0, 8)}</td><td>{item.plan_code}</td><td>{item.status}</td><td>{new Date(item.current_period_end).toLocaleString('es-CO')}</td><td><Link href={`/master/subscriptions/${item.tenant_id}`}>Abrir SU18</Link></td></tr>)}</tbody></table></div>;
  } else if (key === 'domains') {
    const { data, error } = await db.from('tenant_routes').select('slug,tenant_id,status,redirect_to_slug,version,tenant:tenants(name)').order('assigned_at', { ascending: false });
    if (error) throw new Error('No se pudieron cargar las URLs locales.');
    const primary = data.filter(item => item.status === 'primary');
    content = <><div className="grid"><section className="panel"><h2>SU09.A1 · Comprobar disponibilidad</h2><ActionForm action={checkTenantSlug} submit="Comprobar ruta"><label>Slug solicitado<input name="slug" required minLength={3} maxLength={48} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="mi-taller"/></label></ActionForm></section><section className="panel"><h2>SU09.A2 · Asignar URL</h2>{primary.map(route => <ActionForm key={route.slug} action={assignTenantSlug} submit={`Guardar URL de ${route.tenant?.name ?? 'comercio'}`}><input type="hidden" name="tenant" value={route.tenant_id}/><input type="hidden" name="version" value={route.version}/><input type="hidden" name="requestId" value={randomUUID()}/><label>{route.tenant?.name ?? route.tenant_id}<input name="slug" defaultValue={route.slug} required minLength={3} maxLength={48} pattern="[a-z0-9]+(-[a-z0-9]+)*"/></label></ActionForm>)}</section></div><div className="table-wrap"><table><thead><tr><th>Comercio</th><th>Ruta</th><th>Estado</th><th>Destino</th></tr></thead><tbody>{data.map(item => <tr key={item.slug}><td>{item.tenant?.name ?? item.tenant_id.slice(0,8)}</td><td>/{item.slug}</td><td>{item.status}</td><td>{item.redirect_to_slug ? `/${item.redirect_to_slug}` : 'Ruta primaria'}</td></tr>)}</tbody></table></div></>;
  } else if (key === 'users') {
    const [identities, tenants] = await Promise.all([db.rpc('list_verified_users'), db.from('tenants').select('id,name').order('name')]);
    if (identities.error || tenants.error) throw new Error('No se pudieron cargar las identidades.');
    const tenantOptions = tenants.data.map(tenant => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>);
    const userOptions = identities.data.map(user => <option key={user.user_id} value={user.user_id}>{user.display_name} · {user.email}</option>);
    content = <><div className="table-wrap"><table><thead><tr><th>Identidad verificada</th><th>Correo</th></tr></thead><tbody>{identities.data.map(user => <tr key={user.user_id}><td>{user.display_name}</td><td>{user.email}</td></tr>)}</tbody></table></div><div className="grid"><section className="panel"><h2>SU10.A1 · Invitar usuario</h2><ActionForm action={inviteIdentity} submit="Crear invitación"><input type="hidden" name="requestId" value={randomUUID()}/><label>Comercio<select name="tenant" required defaultValue=""><option value="" disabled>Selecciona</option>{tenantOptions}</select></label><label>Correo verificado al aceptar<input name="email" type="email" required maxLength={254}/></label><label>Rol propuesto<select name="role"><option value="customer">Cliente</option><option value="technician">Técnico</option><option value="advisor">Asesor</option><option value="admin">Administrador</option></select></label><label>Vence en UTC<input name="expiresAt" type="datetime-local" required/></label></ActionForm><p className="muted">Crear la invitación no crea una cuenta, membresía ni envío confirmado.</p></section><section className="panel"><h2>SU10.A2 · Guardar membresía</h2><ActionForm action={setMembership} submit="Guardar rol"><label>Comercio<select name="tenant" required defaultValue=""><option value="" disabled>Selecciona</option>{tenantOptions}</select></label><label>Identidad verificada<select name="user" required defaultValue=""><option value="" disabled>Selecciona</option>{userOptions}</select></label><label>Rol<select name="role"><option value="customer">Cliente</option><option value="technician">Técnico</option><option value="advisor">Asesor</option><option value="admin">Administrador</option></select></label><label>Acceso<select name="active"><option value="true">Activo</option><option value="false">Inactivo</option></select></label></ActionForm></section></div></>;
  } else if (key === 'audit') {
    const { data, error } = await db.from('audit_events').select('id,tenant_id,actor_id,action,created_at').order('created_at', { ascending: false }).limit(100);
    if (error) throw new Error('No se pudo cargar la auditoría.');
    content = <div className="table-wrap"><table><thead><tr><th>Instante</th><th>Acción</th><th>Actor</th><th>Comercio</th></tr></thead><tbody>{data.map(event => <tr key={event.id}><td>{new Date(event.created_at).toLocaleString('es-CO')}</td><td>{event.action}</td><td>{event.actor_id.slice(0, 8)}</td><td>{event.tenant_id?.slice(0, 8) ?? 'Plataforma'}</td></tr>)}</tbody></table></div>;
  }
  const disabledActions = key === 'users' ? actionLabels[key].slice(2) : key === 'domains' ? actionLabels[key].slice(2) : actionLabels[key];
  return <><Link href="/master">← CRM maestro</Link><div className="page-heading"><div><p className="eyebrow">{section.id}</p><h1>{section.title}</h1><p className="lead">{section.description}</p></div></div>{content}<section className="panel spaced"><h2>Acciones pendientes</h2><div className="actions">{disabledActions.map(label => <button key={label} disabled title="Pendiente de su prompt dependiente">{label}</button>)}</div><p className="muted">Los controles deshabilitados conservan los IDs del atlas y no afirman una operación inexistente.</p></section></>;
}
