import 'server-only';
import { headers } from 'next/headers';
import { parsePortal, portals } from '@/config/portals';
export async function currentPortal() {
  // Proxy overwrites this header from the route, never from a submitted role.
  return parsePortal((await headers()).get('x-naosiq-portal')) ?? 'comercio';
}
export async function portalBase() { return portals[await currentPortal()].base; }
