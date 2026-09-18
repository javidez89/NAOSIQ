import Link from 'next/link';
import { notFound } from 'next/navigation';
import { currentUser } from '@/lib/access';

const details = {
  plans: { id: 'SU16', title: 'Editor de plan', note: 'No hay tarifas, cuotas ni límites aprobados; publicar y archivar permanecen deshabilitados.' },
  billing: { id: 'SU17', title: 'Detalle de cargo SaaS', note: 'La conciliación SaaS requiere P19 y nunca modifica el libro de una reparación.' },
  subscriptions: { id: 'SU18', title: 'Detalle de suscripción', note: 'Suspensión, gracia y cortesía requieren P19–P20 y fechas explícitas.' },
} as const;

export default async function MasterDetail({ params }: { params: Promise<{ section: string; id: string }> }) {
  const { section, id } = await params;
  const info = details[section as keyof typeof details];
  if (!info) notFound();
  const { db } = await currentUser();
  const { data: master } = await db.rpc('is_platform_admin');
  if (master !== true) notFound();
  return <><Link href={`/master/${section}`}>← Volver</Link><section className="panel narrow spaced"><p className="eyebrow">{info.id}</p><h1>{info.title}</h1><p className="muted">Referencia: {id}</p><p className="notice warning">{info.note}</p><button disabled>Guardar cambios</button></section></>;
}
