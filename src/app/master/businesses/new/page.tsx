import Link from 'next/link';
import { randomUUID } from 'node:crypto';
import { ActionForm } from '@/components/action-form';
import { currentUser } from '@/lib/access';
import { provision, startOnboarding } from '../../actions';
export const dynamic = 'force-dynamic';
type Identity = { user_id: string; display_name: string; email: string };

export default async function NewBusiness() {
  const { db } = await currentUser();
  const { data: master } = await db.rpc('is_platform_admin');
  if (master !== true) return <section className="panel"><h1>Alta protegida</h1><Link className="button" href="/master/security">Verificar identidad</Link></section>;
  const { data, error } = await db.rpc('list_verified_users');
  if (error) throw new Error('No se pudieron cargar las identidades verificadas.');
  const identities = (data ?? []) as Identity[];
  return <>
    <Link href="/master/businesses">← Comercios</Link>
    <div className="page-heading"><div><p className="eyebrow">SU03</p><h1>Crear comercio</h1><p className="lead">Una operación crea organización, plan Básico, período e identidad administradora.</p></div></div>
    <section className="panel narrow"><h2>Alta reanudable P06</h2><p>Guarda negocio, plan, URL, administrador, marca, pagos y publicación antes de crear la organización.</p><ActionForm action={startOnboarding} submit="Iniciar alta reanudable"><input type="hidden" name="requestId" value={randomUUID()}/></ActionForm></section>
    <details className="panel spaced" open><summary>Alta rápida con administrador ya verificado</summary><ActionForm action={provision} submit="Crear comercio y acceso"><input type="hidden" name="requestId" value={randomUUID()}/><label>Nombre comercial<input name="name" required minLength={2} maxLength={120}/></label><label>Nombre para su dirección<input name="slug" placeholder="mi-taller" required pattern="[a-z0-9]+(-[a-z0-9]+)*" minLength={3} maxLength={48}/></label><label>Administrador inicial<select name="admin" defaultValue="" required><option value="" disabled>Selecciona una identidad verificada</option>{identities.map(user => <option key={user.user_id} value={user.user_id}>{user.display_name} · {user.email}</option>)}</select></label><label>Fin del período de prueba <small>(UTC)</small><input name="periodEnd" type="datetime-local" required/></label></ActionForm><p className="muted">Esta variante exige una identidad previamente verificada.</p></details>
  </>;
}
