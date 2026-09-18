> Base funcional heredada de v5. Presentación NAOSIQ v6. Para identidad visual prevalecen BRAND_MIGRATION.md y el manual recibido.

# Flujos, reglas y permisos

**Origen: F2 pp. 3-8; F7 pp. 9-19 y 38; F9 pp. 2-11. La matriz detallada es propuesta de ejecución.**

## Identidad y alcance

Google prueba identidad; no decide el rol. La membresía autorizada vincula usuario, organización, rol y delegaciones. El backend resuelve ese alcance antes de aceptar una acción. `organization_id` recibido desde la interfaz no acredita pertenencia. Los recursos secundarios (archivos, chat, reportes, jobs y documentos) se validan igual que una OT.

| Capacidad | Super Usuario | Administrador | Asesor | Técnico | Cliente |
| --- | --- | --- | --- | --- | --- |
| Cualquier comercio | Total con auditoría | No | No | No | No |
| Configurar negocio | Cualquiera | Propio | No por defecto | No | No |
| Recibir equipo | Sí | Sí | Propuesto por rol | Delegado | No |
| Diagnóstico / QA | Con responsable | Según capacidad | No por defecto | Asignado | Consulta |
| Publicar cotización | Sí | Sí | Delegado | Proponer | Consulta |
| Aceptar presupuesto | Excepción/evidencia | Evidencia autorizada | No suplanta | No | Propio vigente |
| Reportar pago | Sí | Sí | Sí | Según permiso | Propio |
| Confirmar transferencia | Evidencia + auditoría | Sí | D01 / delegado | D01 / delegado | No |
| Registrar efectivo | Sí | Sí | D01 / delegado | D01 / delegado | No |
| Descargar voucher | Cualquiera autorizado | Comercio | Alcance asignado | Delegado | Propio |
| Cambiar URL / cortesía | Maestro | Solicita | No | No | No |

La propuesta `contracts/rbac.json` mantiene dinero delegado desactivado para Asesor/Técnico. Una acción restringida puede mostrar la causa y ofrecer derivar a quien tiene permiso; no permite autoasignarse la facultad. El Administrador no crea un Super Usuario desde su panel.

## Flujo E2E A: alta y publicación del comercio

1. Super Usuario registra datos del comercio y un borrador de alta.
2. Elige plan/configuración aprobados o un plan de ensayo no cobrable.
3. Reserva y confirma el slug desde CRM Maestro. La comprobación previa no garantiza disponibilidad hasta guardar con unicidad.
4. Crea la organización e invita al administrador. Si falla el correo, reintenta la invitación; no vuelve a crear el comercio.
5. Administrador configura marca, contacto, horarios, servicios, pagos y WhatsApp.
6. Vista previa aislada; publicación versionada. Verificar que cada CTA apunta al mismo comercio.
7. Se habilita la operación según suscripción. El dominio propio es opcional y conserva ruta de plataforma mientras se verifica.

**Excepciones:** slug ocupado, usuario sin membresía, correo rechazado, tarea de publicación lenta, versión desactualizada, dominio no verificado. Conservar el borrador y el ID del alta. El cambio de URL posterior no reasigna documentos a otro comercio.

## Flujo E2E B: recepción y voucher

1. Cliente crea solicitud con su equipo, falla, fotos y contacto. Obtiene la OT/documento inicial, no una prueba de custodia.
2. Asesor o personal autorizado localiza esa solicitud; evita duplicarla y verifica identidad operativa.
3. Registra estado físico, accesorios, evidencia y condiciones informadas.
4. Confirma recepción. Servidor valida permisos y versión; registra actor, fecha real y evento de custodia.
5. Genera o recupera el documento lógico de recepción. La tarea PDF puede terminar después.
6. Cliente y personal autorizado abren vista previa, descargan PDF o solicitan impresión.
7. Si falla el archivo, se reintenta la representación del documento existente. No se repite la recepción.

**Excepciones:** equipo no entregado, datos críticos incompletos, posible OT duplicada, falta de permiso, cambio concurrente, PDF fallido. Recibir un equipo dos veces por el mismo evento no debe crear dos vouchers ni alterar su fecha original.

## Flujo E2E C: diagnóstico, presupuesto y autorización

Técnico asignado documenta hallazgos, evidencia y solución. El presupuesto incluye versión, vigencia, conceptos, importes y alcance. Administrador o delegado lo publica y notifica. El cliente revisa la versión vigente y confirma aprobar o rechazar. Aprobación y pago son acciones diferentes.

Un costo adicional genera nueva versión; la autorización anterior no cubre el cambio. Si el presupuesto fue reemplazado o venció durante la lectura, la confirmación se rechaza con opción de revisar el nuevo. No convertir recordatorio de WhatsApp en aceptación. No reparar un alcance rechazado sin nueva autorización/evidencia admitida.

## Flujo E2E D: reparación, pruebas y entrega

Asignar responsable, reservar o solicitar repuestos, ejecutar trabajo y registrar subestado (pendiente de repuesto, instalación de software, backup u otro permitido). Registrar consumo de inventario con evento único. Checklist según equipo distingue aprobado, fallido y no aplicable con motivo.

Para declarar completado: revisar pruebas obligatorias y versión actual. Un QA fallido retorna al trabajo; no borra pruebas. Para entregar: validar custodia, cliente/receptor, saldo y política de excepciones. La confirmación guarda receptor, fecha, responsable y constancia. Un pago total no ejecuta esa confirmación.

**No reparable o cancelado:** registrar resolución, cargos aceptados y devolución. **Garantía:** crear nueva OT vinculada; no reabrir y reescribir silenciosamente la original. Plazos y condiciones se mantienen pendientes de definición por el comercio.

## Flujo E2E E: pago directo y voucher

| Etapa | Regla | Efecto en saldo |
| --- | --- | --- |
| Elegir medio | Solo métodos activos del comercio | Ninguno. |
| Ver instrucciones | Llave/QR Bre-B, número Nequi, cuenta bancaria o efectivo | Ninguno. |
| Reportar | Cliente indica importe, referencia y soporte según política | Ninguno hasta verificación. |
| Verificar | Usuario con permiso contrasta el movimiento real | Al aprobar registra ingreso neto. |
| Efectivo | Personal autorizado recibe, verifica importe y cambio | Al confirmar registra lo aplicado, no el dinero entregado antes del cambio. |
| Emitir | Recibo y voucher del hecho confirmado | No genera otro ingreso. |
| Reimprimir | Misma identidad/versión, otro intento de salida | Ninguno. |

El saldo se deriva de la obligación y asignaciones confirmadas netas de reversas. Ejemplo de F9: total COP 350.000; primer abono COP 100.000, saldo COP 250.000; pago posterior COP 250.000, saldo COP 0. El voucher conserva el saldo **al emitir**, mientras el portal puede mostrar saldo vigente distinto tras ajustes.

Los abonos financieros se mantienen. El voucher por cada abono sigue propuesto para aprobar (D06). No ocultar un movimiento confirmado porque su archivo falló. Un reporte rechazado conserva motivo y evidencia sin restar dinero previamente recibido.

**Timeout:** la interfaz indica resultado por verificar y consulta la misma operación. No crea nueva referencia ni ordena pagar de nuevo. **Doble clic:** misma clave y mismo cuerpo devuelven el mismo resultado; distinta carga con la misma clave produce conflicto. **Dos operadores:** bloqueo/versionado evita dos aprobaciones y valida saldo dentro de la transacción.

## Flujo E2E F: venta e inventario

Seleccionar cliente o venta de mostrador según política; añadir productos disponibles; validar precios y descuentos; reservar si procede; cobrar; confirmar venta; registrar salida de stock y documento. Confirmar no aplica dos veces el descuento de inventario. Cancelación comercial, devolución financiera y reingreso físico de producto son eventos vinculados pero distintos.

No usar la misma unidad como repuesto y venta simultáneamente. Las reservas caducadas no deben dejar stock negativo. El costo utilizado por la venta o reparación conserva referencia histórica; editar el catálogo no reescribe ventas anteriores.

## Flujo E2E G: suscripción y suspensión

Preparar cargo del ciclo; avisar; recibir pago manual verificado o respuesta de proveedor habilitado. Confirmar el pago activa/renueva según la política de fechas aprobada. Ante impago: pendiente, gracia y suspendido. El orden y los estados provienen de F2/F7; la duración permanece abierta en D03.

La API bloquea mutaciones ordinarias del comercio suspendido. Conserva el camino a mensualidad, soporte y acciones de plataforma necesarias. El acceso de cliente a documentos anteriores es D08. La cortesía del Super Usuario cambia derecho de acceso con motivo; no se registra como dinero pagado.

Una notificación bancaria tardía no se descarta solo porque el negocio se suspendió: el adaptador de confianza la concilia en el dominio correcto, con controles y auditoría. Esta es una precisión técnica propuesta V5 para no perder hechos externos. La cancelación voluntaria al final del período no equivale a eliminación de datos.

## Flujo E2E H: comunicación

Un evento confirmado alimenta outbox; un worker prepara el mensaje adecuado. En chat, distinguir público al cliente de nota interna; no cambiar audiencia de un mensaje ya enviado. En WhatsApp básico, se abre texto preconfigurado, sin afirmar que se envió. El proveedor automático requiere autorizaciones, configuración, límites y evidencias de entrega propias.

La falla de un canal no revierte un pago ni una recepción. Mostrar estado fallido y siguiente acción. Usar IDs estables para evitar duplicados al reconectar.
