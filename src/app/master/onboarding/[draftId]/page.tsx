import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ActionForm } from '@/components/action-form';
import { currentUser } from '@/lib/access';
import { uuid } from '@/domain/validation';
import { finalizeOnboarding, saveOnboarding } from '../../actions';
export const dynamic = 'force-dynamic';

export default async function Onboarding({ params }: { params: Promise<{ draftId: string }> }) {
  const draftId = uuid((await params).draftId);
  const { db } = await currentUser();
  const { data: draft, error } = await db.from('onboarding_drafts').select('id,step,snapshot,version,status,tenant_id,updated_at').eq('id', draftId).maybeSingle();
  if (error) throw new Error('No se pudo cargar el borrador de alta.');
  if (!draft) notFound();
  const snapshot = draft.snapshot && typeof draft.snapshot === 'object' && !Array.isArray(draft.snapshot) ? draft.snapshot : {};
  const value = (key: string) => typeof snapshot[key] === 'string' ? snapshot[key] : '';
  if (draft.status === 'completed') return <section className="panel"><p className="eyebrow">P06 · Completado</p><h1>Alta confirmada</h1><Link className="button" href={`/master/businesses/${draft.tenant_id}`}>Abrir comercio</Link></section>;
  return <><Link href="/master/businesses/new">← Alta de comercio</Link><div className="page-heading"><div><p className="eyebrow">P06 · Borrador versión {draft.version}</p><h1>Onboarding reanudable</h1><p className="lead">Último guardado: {new Date(draft.updated_at).toLocaleString('es-CO')}</p></div></div><section className="panel"><p className="step-list">01 Negocio · 02 Plan · 03 URL · 04 Administrador · 05 Marca · 06 Pagos · 07 Publicación · 08 Revisar</p><ActionForm action={saveOnboarding.bind(null, draftId)} submit="Guardar borrador y revisar"><input type="hidden" name="version" value={draft.version}/><label>01 · Nombre comercial<input name="name" defaultValue={value('name')} required minLength={2} maxLength={120}/></label><label>02 · Plan<input value="Básico · precio sin aprobar · sin cobro automático" readOnly/></label><label>03 · Slug<input name="slug" defaultValue={value('slug')} required pattern="[a-z0-9]+(-[a-z0-9]+)*" minLength={3} maxLength={48}/></label><label>04 · Correo del administrador<input name="adminEmail" type="email" defaultValue={value('admin_email')} required/></label><label>05 · Marca visible<input name="brandName" defaultValue={value('brand_name')} required minLength={2} maxLength={120}/></label><label>06 · Medios incluidos<input value="Bre-B, Nequi, transferencia y efectivo · WhatsApp disponible" readOnly/></label><label>Fin del período de prueba UTC<input name="periodEnd" type="datetime-local" required/></label><label>Vencimiento de invitación UTC<input name="invitationEnd" type="datetime-local" required/></label><label>07 · Publicación<input value="Desactivada hasta configurar el micrositio" readOnly/></label></ActionForm></section>{draft.step === 'review' && <section className="panel spaced"><h2>08 · Confirmar alta</h2><p>La organización se crea una sola vez. La invitación queda separada y no se presenta como correo entregado.</p><ActionForm action={finalizeOnboarding.bind(null, draftId)} submit="Confirmar alta"><input type="hidden" name="version" value={draft.version}/><input type="hidden" name="requestId" value={randomUUID()}/></ActionForm></section>}</>;
}
