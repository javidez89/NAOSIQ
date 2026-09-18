import Link from 'next/link';
import { currentUser } from '@/lib/access';
import { uuid } from '@/domain/validation';
export const dynamic = 'force-dynamic';

export default async function EditBusiness({ params }: { params: Promise<{ tenantId: string }> }) {
  const tenantId = uuid((await params).tenantId);
  const { db } = await currentUser();
  const { data } = await db.from('tenants').select('name,slug').eq('id', tenantId).maybeSingle();
  return <><Link href={`/master/businesses/${tenantId}`}>← Ficha del comercio</Link><section className="panel narrow spaced"><p className="eyebrow">SU19</p><h1>Editar comercio</h1><p>{data?.name ?? 'Comercio'} · /{data?.slug ?? '—'}</p><p className="notice warning">La edición de identidad comercial y URL estructural permanece deshabilitada hasta P05. El estado operativo sí se gestiona desde la ficha auditada.</p><button disabled>Guardar comercio</button></section></>;
}
