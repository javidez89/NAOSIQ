import Link from 'next/link';
import { tenantContext } from '@/lib/access';
export const dynamic='force-dynamic';
const modules=[
 ['P08','Clientes y equipos','Registro de propietarios, equipos e historial sin mezclar comercios.'],
 ['P09','Órdenes y recepción','Solicitud, evidencia, custodia y asignación con hechos separados.'],
 ['P10','Diagnóstico y cotización','Versiones, vigencia, publicación y respuesta del cliente.'],
 ['P11','Control de calidad','Checklist con aprobado, fallido y no aplica con motivo.'],
 ['P12','Documentos','Snapshots inmutables y formatos A4/80 mm.'],
 ['P13–P14','Cartera y pagos','Obligaciones, movimientos, asignaciones, reversos y saldo.'],
 ['P15','Inventario','Recibir, reservar, liberar y consumir sin stock negativo.'],
 ['P16','Ventas','Ítems, descuentos autorizados, stock y cobro separados.'],
 ['P17–P18','Comunicaciones','Enlaces WhatsApp, chat y outbox sin afirmar entrega externa.'],
 ['P19–P20','Suscripción','Ciclos SaaS, cargos, pagos y restricciones explícitas.'],
 ['P21–P22','Reportes y auditoría','Métricas por comercio, exportaciones y trazabilidad.'],
];
export default async function Operations({params}:{params:Promise<{tenantId:string}>}){const{tenantId}=await params;const{db,role}=await tenantContext(tenantId);const [tenant,kpis,restriction]=await Promise.all([db.from('tenants').select('name').eq('id',tenantId).single(),db.from('tenant_kpis').select('*').eq('tenant_id',tenantId).maybeSingle(),db.from('tenant_restrictions').select('mode,reason').eq('tenant_id',tenantId).maybeSingle()]);return <><Link href={`/comercio/t/${tenantId}`}>← Volver al comercio</Link><div className="page-heading"><div><p className="eyebrow">Centro operativo · {role}</p><h1>{tenant.data?.name??'Comercio'}</h1><p className="lead">Procesos del taller organizados por dominio y respaldados por contratos transaccionales.</p></div><Link className="button" href={`/comercio/t/${tenantId}/site`}>Editar sitio público</Link></div>{restriction.data&&restriction.data.mode!=='none'&&<p className="notice warning"><strong>{restriction.data.mode}</strong> · {restriction.data.reason}</p>}<div className="metrics grid"><article className="panel"><p className="eyebrow">Órdenes</p><p className="kpi">{kpis.data?.repair_count??0}</p></article><article className="panel"><p className="eyebrow">Abiertas</p><p className="kpi">{kpis.data?.open_count??0}</p></article><article className="panel"><p className="eyebrow">Completadas</p><p className="kpi">{kpis.data?.completed_count??0}</p></article></div><section className="grid spaced">{modules.map(([code,title,description])=><article className="panel" key={code}><p className="eyebrow">{code}</p><h2>{title}</h2><p>{description}</p><span className="pill">Disponible en local</span></article>)}</section></>}
