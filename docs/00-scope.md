# 00. Alcance, procedencia y trazabilidad

## Base de conocimiento

Se conserva el contexto disponible de CRM TECHI: plataforma multi-negocio para
servicios técnicos, CRM maestro, cinco roles, reparaciones, ventas/inventario,
pagos/abonos, suscripciones, WhatsApp, portal del cliente y dos comprobantes.
El repositorio conserva el paquete fuente completo en
`specifications/NAOSIQ_KIT_V6`. Su `SPEC_INDEX.md` identifica las fuentes vigentes
de identidad, recorridos, pantallas, acciones, permisos y reglas. La aplicación y
su matriz de cobertura deben enlazar esas fuentes sin modificar sus IDs ni
presentar una capacidad parcial como cumplimiento completo.

La marca visual es provisional. El lema disponible se conserva como configurable.
El producto sigue identificado técnicamente como CRM TECHI; un cambio de marca no
debe exigir renombrar tablas, IDs, paquetes o recursos desplegados.

## Trazabilidad inicial

| ID | Requisito | Situación en 0.1.0 | Evidencia/continuación |
|---|---|---|---|
| R01 | CRM maestro central | Alta, consulta, estados y membresías codificadas | /master; RPC; ampliar configuración, planes y analítica |
| R02 | Datos separados por comercio | RLS, predicados de rol y FKs compuestas | SQL + pgTAP pendiente de ejecución |
| R03 | Cinco roles | Dominio, SQL y pantallas base | Matriz 03; permisos financieros Asesor bloqueados |
| R04 | Recepción y seguimiento | Clientes, orden, asignación, estados, historial | Formularios y comandos; probar integración |
| R05 | Cliente registra equipo/fotos | Consulta propia inicial; autorregistro/fotos pendientes | E07 de backlog |
| R06 | Voucher recepción | Snapshot transaccional y generador PDF | Validar PDF, firma, formato comercial e impresión |
| R07 | Voucher al pagar | Solo al confirmar ingreso con MFA | Pendiente no produce comprobante de pago |
| R08 | Efectivo, Bre-B, Nequi, transferencia | Registro manual pendiente y confirmación | No integración bancaria, no prueba por captura |
| R09 | Abonos y saldos | Varios pagos por orden; estado y monto | Presupuesto, deuda, saldo, devolución pendientes |
| R10 | Suscripción mensual por comercio | Esquema, fin de período y bloqueo de escritura | Renovación/cobro automático pendientes |
| R11 | WhatsApp en todos los planes | Entitlement base y contrato de adaptador | Proveedor, consentimiento, outbox worker pendientes |
| R12 | Página y URL pública | Slug reservado en esquema, publicación desactivada | Página pública y dominios pendientes |
| R13 | Inventario y ventas | Diseño y backlog | Sin tablas ni CRUD incompletos presentados como módulo |
| R14 | Login Google | Flujo OAuth y callback codificados | Proveedor Google no configurado ni verificado |
| R15 | PWA instalable | Requisito conservado | Manifest, service worker y pruebas pendientes |
| R16 | Auditoría y estadísticas | Auditoría de comandos; no de todas las lecturas | Analítica y auditoría privilegiada completa pendientes |
| R17 | QA, seguridad y despliegue | Pruebas, guías y automatización base | No hay certificación ni pentest ejecutado |

## Límites deliberados

No se decide aún el precio de los planes, proveedor definitivo de pagos, reglas
fiscales, período de gracia, garantías, retiro de equipos, cancelación, reapertura
ni política de reembolsos. Tampoco se concede al Asesor permiso para conciliar,
anular pagos o administrar roles. Los seis estados técnicos se conservan como
punto de partida; `backup_completed` normaliza la expresión ambigua sobre backup
y necesita aprobación de producto. `completed` no significa automáticamente
entregado, pagado, facturado ni sin garantía.

Las restricciones provisionales son más conservadoras que una delegación amplia:
las membresías se administran inicialmente desde el maestro. Una persona puede
tener roles diferentes en comercios diferentes, pero esta versión admite un
solo rol por persona y comercio. Acumular roles requiere una decisión explícita.

## Completitud de la entrega

Completo significa que el paquete contiene sus fuentes, scripts, pruebas y
manuales para iniciar la construcción. No significa que todos los módulos del
producto estén desarrollados o que el paquete ya haya pasado integración.
Las dependencias no pudieron descargarse en este entorno y no había Docker ni
PostgreSQL. El lockfile, SHA de Actions y migración final se crean con herramientas
reales en la estación de desarrollo, no se simulan.
