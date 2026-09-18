'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { portals, portalForPath } from '@/config/portals';
import { logout } from '@/app/login/actions';
export function PortalNavigation() {
  const path = usePathname();
  const portal = portalForPath(path);
  if (!portal || path.endsWith('/login')) return null;
  const info = portals[portal];
  return <nav aria-label="Navegación principal"><Link href={info.base}>{info.label}</Link><Link href={info.base + '/security'}>Seguridad</Link><form action={logout}><button className="secondary">Cerrar sesión</button></form></nav>;
}
