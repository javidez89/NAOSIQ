'use client';
import { portalCookie, type Portal } from '@/config/portals';
import { brand } from '@/config/brand';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Database } from '@/types/database.generated';
export function MfaSettings({ factors, currentLevel, portal }: { portal: Portal; factors: { id: string; friendly_name?: string }[]; currentLevel: string }) {
  const router = useRouter();
  const [factorId, setFactorId] = useState(factors[0]?.id ?? '');
  const [qr, setQr] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  function client() { return createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { cookieOptions: portalCookie(portal), isSingleton: false }); }
  async function enroll() {
    setPending(true); setMessage('');
    try {
      const { data, error } = await client().auth.mfa.enroll({ factorType: 'totp', friendlyName: `${brand.name} ${new Date().toISOString().slice(0, 10)}` });
      if (error || !data) { setMessage('No fue posible crear el factor. Revise factores existentes antes de reintentar.'); return; }
      setFactorId(data.id); setQr(data.totp.qr_code);
    } catch { setMessage('Error de conexión. No comparta el código ni el QR.'); }
    finally { setPending(false); }
  }
  async function verify(event: React.FormEvent) {
    event.preventDefault(); setPending(true); setMessage('');
    try {
      const { error } = await client().auth.mfa.challengeAndVerify({ factorId, code });
      if (error) setMessage('Código no válido o vencido. Revise la hora del dispositivo.');
      else { setCode(''); setQr(''); setMessage('Verificación completada.'); router.refresh(); }
    } catch { setMessage('No fue posible verificar el factor.'); }
    finally { setPending(false); }
  }
  const qrSource = qr.startsWith('data:') ? qr : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`;
  return <section className="panel narrow"><h2>Autenticación multifactor</h2><p>Nivel actual: <strong>{currentLevel}</strong>. {portal === 'master' ? 'Verifica tu identidad para administrar la plataforma.' : portal === 'comercio' ? 'El segundo factor es necesario para confirmar ingresos.' : 'Añade una verificación adicional para proteger tu cuenta.'}</p>
    {!factorId && <button onClick={enroll} disabled={pending}>Configurar autenticador TOTP</button>}
    {qr && <><p>Escanee el QR en su autenticador. Es un secreto: no lo envíe por correo ni WhatsApp.</p><Image src={qrSource} width={220} height={220} unoptimized alt="QR privado para configurar su autenticador"/></>}
    {factorId && <form onSubmit={verify}><label>Código de seis dígitos<input value={code} onChange={e => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required/></label><div className="actions"><button disabled={pending}>Verificar código</button></div></form>}
    {message && <p role="status" className="notice">{message}</p>}<p className="muted">La recuperación y rotación de factores requieren un procedimiento de soporte verificado antes de producción. No se incluye un bypass de MFA.</p>
  </section>;
}
