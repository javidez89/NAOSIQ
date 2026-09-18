import Link from 'next/link';
import { currentUser } from '@/lib/access';
export const dynamic = 'force-dynamic';

export default async function Businesses() {
  const { db } = await currentUser();
  const { data: master } = await db.rpc('is_platform_admin');
  if (master !== true) return <section className="panel"><h1>Comercios protegidos</h1><Link className="button" href="/master/security">Verificar identidad</Link></section>;
  const { data, error } = await db.from('tenants').select('id,name,slug,status,subscription:subscriptions(plan_code,status,current_period_end)').order('created_at', { ascending: false }).limit(100);
  if (error) throw new Error('No se pudo cargar el listado de comercios.');
  return <>
    <Link href="/master">← CRM maestro</Link>
    <div className="page-heading"><div><p className="eyebrow">SU02</p><h1>Comercios</h1><p className="lead">Selecciona una ficha antes de abrir un contexto de control.</p></div><Link className="button" href="/master/businesses/new">Crear comercio</Link></div>
    {data?.length ? <div className="table-wrap"><table><caption>{data.length} comercios visibles</caption><thead><tr><th>Comercio</th><th>URL</th><th>Plan</th><th>Servicio</th><th>Acción</th></tr></thead><tbody>{data.map(item => <tr key={item.id}><td><strong>{item.name}</strong></td><td>/{item.slug}</td><td>{item.subscription?.plan_code ?? '—'}</td><td><span className={`status status-${item.status}`}>{item.status}</span></td><td><Link href={`/master/businesses/${item.id}`}>Abrir ficha →</Link></td></tr>)}</tbody></table></div> : <section className="empty"><h2>Aún no hay comercios</h2><p>Inicia un alta recuperable para crear el primero.</p></section>}
    <section className="panel"><h2>Exportar listado</h2><p className="muted">SU02.A3 requiere el trabajo asíncrono de P21. La acción se muestra deshabilitada y no genera un archivo ficticio.</p><button disabled>Exportar listado</button></section>
  </>;
}
