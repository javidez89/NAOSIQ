export const portals = {
  master: { base: '/master', label: 'CRM maestro', description: 'Administración de la plataforma y sus comercios.' },
  comercio: { base: '/comercio', label: 'Comercio', description: 'Recepción, equipo de trabajo y operación de tu negocio.' },
  cliente: { base: '/cliente', label: 'Cliente', description: 'Consulta tus equipos, su avance y tus comprobantes.' },
} as const;
export type Portal = keyof typeof portals;
export function parsePortal(value: string | null): Portal | null {
  return value === 'master' || value === 'comercio' || value === 'cliente' ? value : null;
}
export function portalForPath(path: string): Portal | null {
  return parsePortal(path.split('/')[1] ?? null);
}
export function portalCookie(portal: Portal) {
  return { name: `naosiq-${portal}-auth`, path: '/', sameSite: 'lax' as const };
}
export function portalAllowsRole(portal: Portal, role: string): boolean {
  return portal === 'cliente' ? role === 'customer' : portal === 'comercio' && ['admin', 'advisor', 'technician'].includes(role);
}
