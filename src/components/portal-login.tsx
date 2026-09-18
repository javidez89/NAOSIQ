import { ActionForm } from '@/components/action-form';
import { login, googleLogin } from '@/app/login/actions';
import { isConfigured } from '@/lib/env';
import { brand } from '@/config/brand';
import { currentPortal } from '@/lib/portal';
import { portals } from '@/config/portals';
import { safePortalReturnPath } from '@/domain/session';
import Link from 'next/link';
const notices: Record<string,string> = {
  cancelled: 'Cancelaste el acceso con Google. No se creó una sesión ni se asignó un rol.',
  access: 'La identidad fue verificada, pero no tiene acceso activo a este portal.',
  oauth: 'El retorno de Google no pudo validarse o ya venció. Inicia un intento nuevo.',
  config: 'El acceso solicitado no está configurado en este entorno.',
};
export default async function Login({ searchParams }: { searchParams: Promise<{ notice?: string; returnTo?: string }> }) {
  const { notice, returnTo: requestedReturn } = await searchParams;
  const portal = await currentPortal();
  const info = portals[portal];
  const returnTo = safePortalReturnPath(requestedReturn, info.base);
  return <div className="login-grid"><section className="login-intro"><p className="eyebrow">{info.label}</p><h1>{portal === 'cliente' ? 'Tus equipos, a la vista.' : portal === 'master' ? 'Tu plataforma, en orden.' : 'Tu comercio, en orden.'}</h1><p className="lead">{info.description}</p>{portal === 'comercio' && <div className="workflow-preview" aria-label="Flujo de una reparación"><p><span>01</span> Recepción física y comprobante</p><p><span>02</span> Asignación y seguimiento</p><p><span>03</span> Pagos y trazabilidad</p></div>}<p className="muted">{brand.name} · Espacio de desarrollo local</p></section><section className="panel login-panel"><p className="eyebrow">Acceso al espacio de trabajo</p><h2>Bienvenido de nuevo</h2><p className="muted">Ingresa con tu cuenta de {info.label.toLowerCase()}.</p>
    {!isConfigured() ? <p role="status" className="notice">Antes de iniciar: copie .env.example a .env.local, configure Supabase y aplique el esquema. No hay credenciales de demostración ni acceso automático.</p> : <>
      {notice && <p role="alert" className="notice error">{notices[notice] ?? 'No fue posible completar el acceso. Vuelve a intentarlo.'}</p>}
      <ActionForm action={login} submit="Iniciar sesión"><input name="returnTo" type="hidden" value={returnTo}/><label>Correo electrónico<input name="email" type="email" required autoComplete="username" maxLength={254}/></label><label>Contraseña<input name="password" type="password" required minLength={8} maxLength={256} autoComplete="current-password"/></label></ActionForm>
      {process.env.GOOGLE_AUTH_ENABLED === 'true' && <form action={googleLogin} className="actions"><input name="returnTo" type="hidden" value={returnTo}/><button className="secondary">Continuar con Google</button></form>}
      <p className="login-note">La sesión de este portal es independiente de los demás accesos.</p></>}
  <p><Link href="/login">Elegir otro acceso</Link></p></section></div>;
}
