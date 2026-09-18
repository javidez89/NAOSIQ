import Link from 'next/link';
import { currentUser } from '@/lib/access';
import { logout } from '@/app/login/actions';
import { continueSession } from '@/app/session/actions';
import { sessionPolicy, safePortalReturnPath } from '@/domain/session';

export default async function SessionReauth({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const [{ base }, query] = await Promise.all([currentUser(), searchParams]);
  const returnTo = safePortalReturnPath(query.returnTo, base);
  return <section className="panel narrow spaced">
    <p className="eyebrow">AU03 · Sesión</p>
    <h1>Revisa tu sesión</h1>
    <p>El servidor volverá a validar tu identidad y tus permisos antes de regresar al punto solicitado.</p>
    <p className="notice">Los tiempos de aviso, vencimiento y elevación siguen pendientes en {sessionPolicy.decision}; no se aplica un temporizador comercial inventado.</p>
    <div className="actions">
      <form action={continueSession}><input type="hidden" name="returnTo" value={returnTo}/><button>Continuar sesión</button></form>
      <Link className="button secondary" href={`${base}/security`}>Verificar identidad</Link>
      <form action={logout}><button className="secondary">Cerrar sesión</button></form>
    </div>
  </section>;
}
