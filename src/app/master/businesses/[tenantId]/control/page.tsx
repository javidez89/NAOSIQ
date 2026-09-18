import Link from 'next/link';
import { randomUUID } from 'node:crypto';
import { notFound } from 'next/navigation';
import { currentUser } from '@/lib/access';
import { uuid } from '@/domain/validation';
import { ActionForm } from '@/components/action-form';
import { beginMasterControl } from '../../../actions';
export const dynamic = 'force-dynamic';

export default async function ControlBusiness({ params, searchParams }: { params: Promise<{ tenantId: string }>; searchParams: Promise<{ notice?: string }> }) {
  const tenantId = uuid((await params).tenantId);
  const { notice } = await searchParams;
  const { db, user } = await currentUser();
  const { data: master } = await db.rpc('is_platform_admin');
  if (master !== true) return <section className="panel"><h1>Control protegido</h1><Link className="button" href="/master/security">Verificar identidad</Link></section>;
  const { data: tenant, error } = await db.from('tenants').select('name,slug,status').eq('id', tenantId).maybeSingle();
  if (error) throw new Error('No se pudo cargar el comercio objetivo.');
  if (!tenant) notFound();
  return <>
    <Link href={`/master/businesses/${tenantId}`}>← Ficha del comercio</Link>
    <div className="page-heading"><div><p className="eyebrow">SU05 · Control explícito</p><h1>Entrar a {tenant.name}</h1><p className="lead">Tu identidad permanece como Super Usuario. Cada acción conserva actor y comercio.</p></div></div>
    {notice === 'context' && <p className="notice warning" role="status">Abre primero un contexto auditable para consultar este comercio.</p>}
    <section className="panel narrow"><dl><dt>Actor real</dt><dd>{user.email}</dd><dt>Comercio objetivo</dt><dd>{tenant.name} · /{tenant.slug}</dd><dt>Permiso</dt><dd>Super Usuario con MFA; sin suplantación ni membresía temporal</dd></dl><ActionForm action={beginMasterControl} submit="Entrar con control total"><input type="hidden" name="tenant" value={tenantId}/><input type="hidden" name="requestId" value={randomUUID()}/><label>Motivo obligatorio<textarea name="reason" required minLength={10} maxLength={500} placeholder="Describe la solicitud o tarea que requiere abrir este contexto."/></label></ActionForm><p className="muted">El contexto se guarda en una cookie de sesión opaca y sólo funciona para este actor y comercio. D04 sigue pendiente, por eso no se presenta una duración numérica inventada.</p></section>
  </>;
}
