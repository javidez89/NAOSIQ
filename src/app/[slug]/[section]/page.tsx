import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { serverClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';

export default async function PublicSection({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const { slug, section } = await params;
  if (!['services','products','contact','request','track'].includes(section)) notFound();
  const db = await serverClient();
  const { data: profiles } = await db.rpc('get_public_profile', { p_slug: slug });
  const profile = profiles?.[0];
  if (!profile) notFound();
  if (profile.requested_status === 'redirect' && profile.current_slug !== slug) redirect(`/${profile.current_slug}/${section}`);
  if (section === 'request' || section === 'track') redirect('/cliente/login');
  const kind = section === 'products' ? 'product' : 'service';
  const { data: items } = section === 'contact' ? { data: [] } : await db.rpc('get_public_catalog', { p_slug: slug, p_kind: kind });
  const screen = section === 'services' ? 'CL20' : section === 'products' ? 'CL21' : 'CL23';
  return <><Link href={`/${profile.current_slug}`}>← {profile.brand_name}</Link><div className="page-heading"><div><p className="eyebrow">{screen}</p><h1>{section === 'services' ? 'Servicios' : section === 'products' ? 'Productos' : 'Contacto'}</h1></div></div>{section === 'contact' ? <section className="panel"><p>{profile.contact_text || 'El comercio aún no publicó datos de contacto.'}</p></section> : <div className="grid">{items?.map(item => <article className="panel" key={item.id}><h2>{item.name}</h2><p>{item.description}</p>{item.price_label && <p className="muted">{item.price_label}</p>}</article>)}</div>}<section className="panel spaced"><p className="eyebrow">CL26</p><h2>Consulta privada</h2><p>Las órdenes, saldos y clientes nunca forman parte de esta proyección pública.</p><Link className="button" href="/cliente/login">Consultar mi orden</Link></section></>;
}
