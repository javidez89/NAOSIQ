import Link from 'next/link';
import { currentUser } from '@/lib/access';
import { MfaSettings } from '@/components/mfa-settings';
export const dynamic = 'force-dynamic';
export default async function Security() {
  const { db, portal, base } = await currentUser();
  const [{ data: list }, { data: assurance }] = await Promise.all([db.auth.mfa.listFactors(), db.auth.mfa.getAuthenticatorAssuranceLevel()]);
  return <><Link href={base}>Volver al inicio</Link><h1>Seguridad de la cuenta</h1><MfaSettings portal={portal} factors={list?.totp.filter(f => f.status === 'verified') ?? []} currentLevel={assurance?.currentLevel ?? 'aal1'}/></>;
}
