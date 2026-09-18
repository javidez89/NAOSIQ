'use strict';
const orders=[
{id:'OT-001',device:'Laptop / Demo 01',status:'En reparación',kind:'progress',owner:'Técnico demo 01',tech:1,customer:1},
{id:'OT-002',device:'Teléfono / Demo 02',status:'Pendiente de repuesto',kind:'waiting',owner:'Técnico demo 02',tech:2,customer:2},
{id:'OT-003',device:'Consola / Demo 03',status:'Instalación de software',kind:'progress',owner:'Técnico demo 01',tech:1,customer:3},
{id:'OT-004',device:'Laptop / Demo 04',status:'Completado',kind:'complete',owner:'Técnico demo 02',tech:2,customer:1},
{id:'OT-005',device:'Teléfono / Demo 05',status:'En reparación',kind:'progress',owner:'Técnico demo 01',tech:1,customer:4}];
const roles={
admin:['Todo tu trabajo, en orden.','CONTROL DEL COMERCIO','Reparaciones del comercio','Conciliar antes de confirmar.','Registrar una transferencia deja el pago pendiente. Solo la conciliación autorizada genera el comprobante de pago.','Administrador: visión de su comercio. La delegación de membresías requiere aprobación.'],
advisor:['Recibir bien es el primer paso.','ATENCIÓN Y SEGUIMIENTO','Bandeja de recepción','Una recepción clara.','Identificar al cliente, registrar la falla y entregar el comprobante. El Asesor no tiene autorización financiera en esta base.','Asesor: recepción y seguimiento. Sin conciliación, anulación de pagos ni administración de roles.'],
technician:['Enfócate en tus asignaciones.','TRABAJO TÉCNICO','Mis reparaciones asignadas','El estado también comunica.','Actualizar el avance mantiene trazabilidad. Un equipo completado no se marca como pagado automáticamente.','Técnico: solo reparaciones asignadas, sin directorio completo de clientes ni conciliación financiera.'],
customer:['Tu equipo, siempre a la vista.','PORTAL DEL CLIENTE','Mis equipos','Dos comprobantes, claros.','Un comprobante al recibir el equipo y otro al confirmar un pago. Consulta, descarga e impresión de tus documentos.','Cliente: solo equipos y comprobantes propios. Los ejemplos son ficticios.'],
super_user:['Control central, acceso responsable.','CRM MAESTRO','Referencia del comercio','Control total, con trazabilidad.','Los cambios globales requieren MFA y motivo. El maestro administra comercios sin mezclar sus cuentas de cobro.','Super Usuario: vista objetivo global de comercios, planes, suscripciones, auditoría e integraciones; la maqueta no ejecuta operaciones.']};
const $=id=>document.getElementById(id);
function render(){const role=$('role').value;const config=roles[role];const visible=orders.filter(o=>role==='customer'?o.customer===1:role==='technician'?o.tech===1:true);
['title','eyebrow','table-title','focus-title','focus-text','role-note'].forEach((id,i)=>$(id).textContent=config[i]);
$('total').textContent=visible.length;['progress','waiting','complete'].forEach(k=>$(k).textContent=visible.filter(o=>o.kind===k).length);
const term=$('search').value.toLocaleLowerCase('es');const filtered=visible.filter(o=>(o.device+' '+o.id).toLocaleLowerCase('es').includes(term));
// Only fixed synthetic records enter this markup, never the search input.
$('orders').innerHTML=filtered.map(o=>`<tr><td><span class="order-id">${o.id}</span><strong>${o.device}</strong></td><td><span class="status ${o.kind}">${o.status}</span></td><td>${o.owner}</td></tr>`).join('');$('empty').hidden=filtered.length!==0;}
$('role').addEventListener('change',render);$('search').addEventListener('input',render);render();
