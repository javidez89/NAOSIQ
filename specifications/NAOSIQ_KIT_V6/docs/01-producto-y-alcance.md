> Base funcional heredada de v5. Presentación NAOSIQ v6. Para identidad visual prevalecen BRAND_MIGRATION.md y el manual recibido.

# Plan maestro de producto y negocio

**Base de origen: F2 pp. 2-9, F4, F7 pp. 8-19 y F9. Las extensiones para ejecutar se identifican como propuesta.**

## Visión y objetivo

NAOSIQ es una plataforma SaaS multiempresa para talleres de celulares, computadores y objetos/equipos reparables definidos por cada comercio. Digitaliza el ciclo de solicitud, recepción, diagnóstico, presupuesto, reparación, pruebas, cobro y entrega. También permite registrar ventas e inventario y publicar la página de cada negocio.

Un **CRM Maestro** controla la plataforma completa. Su **Super Usuario** puede configurar y operar cualquier comercio. Cada negocio conserva su espacio operativo y sus datos aislados de los demás. La misma identidad puede tener membresías diferentes; un cliente de un taller no se convierte en cliente visible de todos los talleres.

La experiencia debe servir al trabajo cotidiano: recepción rápida, trazabilidad del equipo, claridad del estado y del saldo, comunicación contextual y comprobantes imprimibles. Una orden no se considera recibida solo porque se generó un formulario.

## Modelo comercial

El comercio paga una suscripción mensual a NAOSIQ. Su cliente paga reparaciones o ventas al comercio. Son dos relaciones, dos cuentas receptoras y dos registros financieros diferentes. La interfaz puede reutilizar componentes, pero no mezclar saldos, referencias ni permisos de conciliación.

| Capacidad | Base confirmada | Pendiente / evolución |
| --- | --- | --- |
| WhatsApp | Disponible en todos los planes | Automatización oficial, volumen y proveedor por definir. |
| Plan Básico | Bre-B, Nequi, transferencia bancaria y efectivo | Datos y orden de visualización configurados por comercio. |
| Pasarelas | Se conserva la modalidad opcional | Wompi/Bold son candidatos, no integraciones activadas. |
| Vouchers | Cliente obtiene e imprime recepción y pago | Inclusión en Básico, abonos y formatos propuestos en F9. |
| Suscripción | Mensualidad con interrupción por impago | Precios, gracia, fecha de corte y pago tardío por aprobar. |
| URL pública | Configurada desde CRM Maestro | Dominio propio y límites por plan pendientes. |

El plan de desarrollo no lleva precios ficticios a producción. En datos semilla las tarifas pendientes usan `null` y un estado de borrador. La plataforma puede prepararse para planes superiores sin vender aún capacidades no implementadas.

## Alcance por experiencia

### CRM Maestro / Super Usuario

Alta, edición, activación, suspensión y reactivación de comercios; gestión de usuarios y URLs; planes y suscripciones; configuración global; proveedores; soporte y auditoría. Puede abrir cualquier comercio sin suplantar silenciosamente a su administrador. Una banda de contexto muestra negocio y actor real.

El control total incluye cambiar una suscripción o conceder cortesía. La cortesía no se registra como ingreso bancario. Corregir pagos o stock conserva el hecho anterior y crea un ajuste, una reversa o una versión vinculada. No se ofrece borrar el historial financiero para ocultar un error.

### CRM del comercio / Administrador

Dashboard, órdenes, clientes, equipos, técnicos y asesores; diagnósticos y cotizaciones; inventario y ventas; pagos, abonos y documentos; mensajes; página pública, medios de pago y configuración; consulta y pago de su plan. No controla las tarifas globales ni cambia su vencimiento sin una acción autorizada del Maestro.

### Asesor

Atención comercial y recepción: busca al cliente, completa datos, registra condiciones y accesorios, deriva al técnico, hace seguimiento de cotizaciones, responde consultas, coordina entregas y venta asistida. Tiene pantallas de pagos reportados y caja, pero confirmar transferencias o registrar efectivo requiere delegación expresa. No acepta un presupuesto en nombre del cliente por defecto ni altera el diagnóstico técnico.

### Técnico

Cola de trabajo según asignación/permisos, escaneo de QR, diagnóstico, fotos, repuestos, mano de obra, subestados, pruebas y bitácora. Las acciones delegadas de recepción o caja no se conceden por disponer del visor. Offline permite preparar borradores, no declarar una operación terminada sin respuesta del servidor.

### Cliente y página pública

Consulta servicios y productos, inicia sesión con Google, registra equipo/falla/fotos/contacto, recibe su documento inicial, consulta seguimiento y presupuestos, aprueba o rechaza, reporta pagos, descarga documentos y conversa con el taller. Puede obtener e imprimir vouchers cuando el comercio haya confirmado el hecho respectivo.

La vitrina pública no publica la ficha privada de un cliente. La consulta de una OT y los QR exigen autorización apropiada. Un número correlativo no funciona como contraseña.

## Módulos y entregables funcionales

| Dominio | Resultado que debe quedar operativo |
| --- | --- |
| Identidad | Google, sesiones, contexto de comercio y cinco roles. |
| Comercios | Alta reanudable, configuración, URL y publicación. |
| Reparaciones | Solicitud, custodia, diagnóstico, presupuesto, ejecución, QA y entrega. |
| Pagos | Reportar, verificar, efectivo autorizado, movimientos, saldo e idempotencia. |
| Documentos | Solicitud/OT, cotización, voucher de recepción, pago y entrega. |
| Inventario | Productos, entradas, reservas, consumos y reversas por OT/venta. |
| Ventas | Borrador, confirmación, cobro, salida de stock y documento. |
| Comunicación | Chat por contexto, nota interna, WhatsApp básico y notificaciones. |
| Suscripciones | Ciclos, avisos, gracia, suspensión, pago y reactivación. |
| Operación SaaS | Soporte, auditoría, monitoreo, backups y restauración probada. |

## Estados: cuatro dimensiones, no una sola barra

La especificación conserva los conceptos de F7 p. 38. Los valores técnicos exactos son el contrato propuesto en `contracts/state-machines.json`.

| Dimensión | Ejemplo | Regla |
| --- | --- | --- |
| Técnica | En reparación / esperando repuesto / QA / completado | No implica que se recibió dinero. |
| Financiera | Sin pagar / parcial / pagado | Derivada del importe exigible y movimientos confirmados. |
| Custodia | No recibido / en taller / listo / entregado / devuelto | Pagar no confirma entrega física. |
| Suscripción | Active / pending / grace / suspended | Controla la capacidad de operar del comercio, no el estado de sus equipos. |

Una reparación puede estar técnicamente completa, parcialmente pagada y en custodia. La interfaz debe mostrar las tres etiquetas. Un abono puede registrarse antes de finalizar el trabajo cuando la política aprobada lo permita; nunca se exige forzar el estado Completado para registrar un movimiento real.

## Indicadores y definiciones

No presentar ventas, cobros y abonos como si fueran ingresos adicionales independientes. Un abono pertenece al cobro de una obligación; no se suma dos veces. Propuesta de indicadores: órdenes abiertas por estado; tiempo desde recepción; espera por repuesto/aprobación; trabajos terminados; saldo pendiente; pagos netos confirmados; devoluciones; stock disponible; reingresos vinculados; suscripciones activas y renovaciones.

La rentabilidad necesita costos de repuestos y mano de obra consistentes. Si no existen, mostrar "Costos incompletos" y no una utilidad inventada. Las fórmulas SaaS de MRR/ARR y las metas de disponibilidad se revisan antes de usarlas como compromisos comerciales. F2 p. 8 propuso objetivos; no aportó mediciones de producción.

## Fuera del primer arranque

No implementar por omisión marketplace, custodia de dinero de terceros, factura electrónica, depósitos masivos de backups de dispositivos, aplicaciones nativas, impresión silenciosa ni multi-sucursal avanzada. Son expansiones o asuntos por definir. La tarea de backup del técnico se registra como actividad; alojar el contenido completo del dispositivo necesita una decisión independiente de privacidad, volumen y seguridad.

## Criterio de producto listo para piloto

Un comercio y dos clientes de prueba completan el recorrido; otro comercio no puede consultar sus datos. El Asesor recibe el equipo; el cliente obtiene el voucher; el Técnico trabaja y registra QA; el pago verificado actualiza saldo y voucher sin duplicados; la entrega conserva constancia. Suspender y reactivar el comercio aplica la política aprobada. El hardware de impresión y el flujo de recuperación se prueban en el entorno del piloto.
