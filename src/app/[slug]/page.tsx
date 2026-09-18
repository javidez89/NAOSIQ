import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { serverClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';

export default async function PublicTenant({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await serverClient();
  const [{ data: profiles, error }, { data: services }] = await Promise.all([
    db.rpc('get_public_profile', { p_slug: slug }), db.rpc('get_public_catalog', { p_slug: slug, p_kind: 'service' }),
  ]);
  if (error) throw new Error('No se pudo cargar el micrositio.');
  const profile = profiles?.[0];
  if (!profile) notFound();
  if (profile.requested_status === 'redirect' && profile.current_slug !== slug) redirect(`/${profile.current_slug}`);
  return <><div className="page-heading"><div><p className="eyebrow">CL01 · {profile.brand_name}</p><h1>{profile.headline}</h1><p className="lead">{profile.description}</p></div><Link className="button" href="/cliente/login">Consultar mi orden</Link></div><section className="panel"><h2>Servicios</h2><div className="grid">{services?.map(item => <article className="panel" key={item.id}><h3>{item.name}</h3><p>{item.description}</p>{item.price_label && <p className="muted">{item.price_label}</p>}</article>)}</div>{!services?.length && <p className="empty">El comercio todavía no publicó servicios.</p>}<div className="actions"><Link href={`/${slug}/services`}>Ver catálogo</Link><Link href={`/${slug}/contact`}>Contacto</Link></div></section><section className="panel spaced"><h2>Solicitar reparación</h2><p>Inicia sesión para registrar una solicitud privada. Enviarla no confirma recepción física.</p><Link className="button" href="/cliente/login">Ingresar al portal Cliente</Link></section></>;
}
