import { portals } from '@/config/portals';
export default function PortalSelector() {
  return <><div className="page-heading"><div><p className="eyebrow">NAOSIQ · Accesos independientes</p><h1>Elige tu acceso</h1><p className="lead">Cada espacio tiene su propia cuenta de acceso, navegación y sesión.</p></div></div><div className="grid">{Object.values(portals).map(portal => <a key={portal.base} className="panel card-link" href={portal.base + '/login'}><h2>{portal.label}</h2><p>{portal.description}</p><span className="card-action">Ingresar →</span></a>)}</div></>;
}
