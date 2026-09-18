import { PortalNavigation } from '@/components/portal-navigation';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import localFont from 'next/font/local';
import { brand } from '@/config/brand';
import { PwaRegister } from '@/components/pwa-register';
import './globals.css';
const inter = localFont({ src: '../../public/fonts/InterVariable.woff2', variable: '--font-inter', weight: '100 900', display: 'swap', fallback: ['Arial'] });
export const metadata: Metadata = {
  title: { default: brand.name, template: `%s | ${brand.name}` },
  description: 'Recepción, seguimiento y gestión de servicios técnicos.',
  manifest: '/manifest.webmanifest',
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: '#14213d' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" className={inter.variable}><body><PwaRegister/><a className="skip" href="#main">Saltar al contenido</a>
    <header className="topbar"><Link className="wordmark" href="/" aria-label={`${brand.name} · Inicio`}>{brand.name}<span className="version">LOCAL</span></Link>
      <PortalNavigation/></header>
    <main id="main" className="container">{children}</main>
    <footer className="container muted"><span>{brand.slogan}</span><span>Desarrollo local · Datos de prueba</span></footer>
  </body></html>;
}
