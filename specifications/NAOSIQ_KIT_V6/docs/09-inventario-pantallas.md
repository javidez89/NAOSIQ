> Base funcional heredada de v5. Presentación NAOSIQ v6. Para identidad visual prevalecen BRAND_MIGRATION.md y el manual recibido.

# Inventario UX/UI actualizado

**118 vistas y 363 acciones.** Contrato vigente: contracts/screens-actions.json. Las vistas originales conservan su diseño base v4; los vouchers provienen de v4.1. La implementación todavía no existe.

## Cambios de vouchers

Se añaden VR01-VR04 y las A4 identificadas. CL06 mantiene el documento de solicitud; CL12 incorpora recepción/pago, y CL19 abre impresión sin confirmar hechos.

## Acceso y recuperación

| ID | Pantalla | Acciones | Perfil |
| --- | --- | --- | --- |
| AU01 | Acceso del personal | AU01.A1: Continuar con Google; AU01.A2: Reintentar acceso; AU01.A3: Ver ayuda | AUTH |
| AU02 | Selección de contexto | AU02.A1: Entrar al comercio; AU02.A2: Abrir CRM Maestro; AU02.A3: Cambiar cuenta | READ |
| AU03 | Aviso y renovación de sesión | AU03.A1: Continuar sesión; AU03.A2: Verificar identidad; AU03.A3: Cerrar sesión | AUTH |
| AU04 | Carga fallida y acceso restringido | AU04.A1: Reintentar lectura; AU04.A2: Volver al inicio; AU04.A3: Contactar soporte | READ |
| AU05 | Recuperación y conflicto de borrador | AU05.A1: Recuperar borrador; AU05.A2: Comparar versiones; AU05.A3: Descartar copia | READ |
| AU06 | Centro de avisos y ayuda | AU06.A1: Abrir notificación; AU06.A2: Activar avisos; AU06.A3: Actualizar aplicación | READ |

## CRM Maestro

| ID | Pantalla | Acciones | Perfil |
| --- | --- | --- | --- |
| SU01 | Dashboard Maestro | SU01.A1: Abrir comercios; SU01.A2: Revisar renovaciones; SU01.A3: Ver incidente | READ |
| SU02 | Comercios | SU02.A1: Crear comercio; SU02.A2: Abrir Tecno Cell; SU02.A3: Exportar listado | READ |
| SU03 | Crear comercio | SU03.A1: Validar URL; SU03.A2: Guardar borrador; SU03.A3: Crear comercio | WRITE |
| SU04 | Detalle del comercio | SU04.A1: Entrar al CRM; SU04.A2: Editar comercio; SU04.A3: Gestionar suscripción | READ |
| SU05 | Control de un comercio | SU05.A1: Confirmar identidad; SU05.A2: Entrar con control total; SU05.A3: Salir del comercio | WRITE |
| SU06 | Planes | SU06.A1: Crear plan; SU06.A2: Editar Básico; SU06.A3: Archivar plan | READ |
| SU07 | Suscripciones | SU07.A1: Abrir suscripción; SU07.A2: Filtrar vencidas; SU07.A3: Exportar cartera SaaS | READ |
| SU08 | Facturación y pagos SaaS | SU08.A1: Abrir cargo SaaS; SU08.A2: Conciliar pago; SU08.A3: Registrar cortesía | FIN |
| SU09 | URLs y dominios | SU09.A1: Comprobar disponibilidad; SU09.A2: Guardar URL; SU09.A3: Verificar dominio | WRITE |
| SU10 | Usuarios globales | SU10.A1: Invitar usuario; SU10.A2: Guardar roles; SU10.A3: Revocar sesiones | WRITE |
| SU11 | Integraciones globales | SU11.A1: Probar conexión; SU11.A2: Actualizar secreto; SU11.A3: Desactivar integración | WRITE |
| SU12 | WhatsApp global | SU12.A1: Previsualizar; SU12.A2: Publicar plantilla; SU12.A3: Abrir prueba en WhatsApp | WRITE |
| SU13 | Auditoría global | SU13.A1: Ver evento; SU13.A2: Filtrar por comercio; SU13.A3: Exportar evidencia | READ |
| SU14 | Soporte e incidentes | SU14.A1: Abrir caso; SU14.A2: Enviar respuesta; SU14.A3: Cerrar caso | MSG |
| SU15 | Configuración global | SU15.A1: Guardar política; SU15.A2: Ver impacto; SU15.A3: Restaurar versión | WRITE |
| SU16 | Editor de plan | SU16.A1: Guardar borrador; SU16.A2: Publicar versión; SU16.A3: Cancelar cambios | WRITE |
| SU17 | Detalle de cargo SaaS | SU17.A1: Confirmar conciliacion; SU17.A2: Rechazar reporte; SU17.A3: Ver movimientos | FIN |
| SU18 | Detalle de suscripción | SU18.A1: Suspender servicio; SU18.A2: Reactivar por cortesía; SU18.A3: Abrir pago SaaS | WRITE |
| SU19 | Editar comercio | SU19.A1: Guardar comercio; SU19.A2: Gestionar URL; SU19.A3: Cancelar edicion | WRITE |
| SU20 | Analítica y exportaciones SaaS | SU20.A1: Aplicar período; SU20.A2: Solicitar exportacion; SU20.A3: Descargar resultado | READ |

## CRM del negocio

| ID | Pantalla | Acciones | Perfil |
| --- | --- | --- | --- |
| AD01 | Dashboard del negocio | AD01.A1: Abrir pendientes; AD01.A2: Crear orden; AD01.A3: Nueva venta | READ |
| AD02 | Reparaciones | AD02.A1: Abrir OT-000154; AD02.A2: Crear orden; AD02.A3: Exportar bandeja | READ |
| AD03 | Nueva orden de trabajo | AD03.A1: Buscar cliente; AD03.A2: Guardar borrador; AD03.A3: Crear orden | WRITE |
| AD04 | Detalle de OT | AD04.A1: Editar diagnóstico; AD04.A2: Registrar pago; AD04.A3: Preparar entrega | READ |
| AD05 | Recepción del equipo | AD05.A1: Cargar evidencia; AD05.A2: Guardar borrador; AD05.A3: Confirmar recepción; AD05.A4: Ver voucher de recepción | WRITE |
| AD06 | Diagnóstico | AD06.A1: Guardar diagnóstico; AD06.A2: Preparar cotización; AD06.A3: Marcar no reparable | WRITE |
| AD07 | Cotización | AD07.A1: Guardar cotización; AD07.A2: Enviar al cliente; AD07.A3: Previsualizar PDF | WRITE |
| AD08 | Aprobación del cliente | AD08.A1: Abrir recordatorio; AD08.A2: Ver evidencia; AD08.A3: Revisar cotización | LOCAL |
| AD09 | Proceso de reparación | AD09.A1: Asignar técnico; AD09.A2: Registrar avance; AD09.A3: Enviar a QA | WRITE |
| AD10 | QA de reparación | AD10.A1: Guardar pruebas; AD10.A2: Aprobar QA; AD10.A3: Devolver a reparación | WRITE |
| AD11 | Pagos y abonos de la OT | AD11.A1: Revisar reporte; AD11.A2: Registrar efectivo; AD11.A3: Ver recibos; AD11.A4: Ver voucher de pago | READ |
| AD12 | Clientes | AD12.A1: Abrir cliente; AD12.A2: Crear cliente; AD12.A3: Crear OT | READ |
| AD13 | Detalle del cliente | AD13.A1: Nueva orden; AD13.A2: Actualizar contacto; AD13.A3: Enviar mensaje | READ |
| AD14 | Técnicos y asignaciones | AD14.A1: Invitar técnico; AD14.A2: Asignar OT; AD14.A3: Desactivar técnico | READ |
| AD15 | Inventario | AD15.A1: Crear producto; AD15.A2: Abrir producto; AD15.A3: Ver movimientos | READ |
| AD16 | Detalle de producto | AD16.A1: Guardar producto; AD16.A2: Registrar movimiento; AD16.A3: Ver vitrina | WRITE |
| AD17 | Venta / punto de venta | AD17.A1: Guardar venta; AD17.A2: Revisar cobro; AD17.A3: Finalizar venta | FIN |
| AD18 | Mensajes del negocio | AD18.A1: Enviar al cliente; AD18.A2: Guardar nota interna; AD18.A3: Abrir WhatsApp | MSG |
| AD19 | Editor de página pública | AD19.A1: Guardar borrador; AD19.A2: Ver vista previa; AD19.A3: Publicar cambios | WRITE |
| AD20 | Medios de pago | AD20.A1: Guardar medios; AD20.A2: Ver como cliente; AD20.A3: Desactivar medio | WRITE |
| AD21 | WhatsApp del negocio | AD21.A1: Guardar configuración; AD21.A2: Abrir mensaje; AD21.A3: Copiar texto | WRITE |
| AD22 | Estadísticas del negocio | AD22.A1: Aplicar filtros; AD22.A2: Ver órdenes; AD22.A3: Exportar reporte | READ |
| AD23 | Mi suscripción | AD23.A1: Pagar mensualidad; AD23.A2: Cambiar plan; AD23.A3: Contactar soporte | FIN |
| AD24 | Configuración del negocio | AD24.A1: Guardar datos; AD24.A2: Gestionar usuarios; AD24.A3: Configurar documentos | WRITE |
| AD25 | Usuarios y permisos | AD25.A1: Invitar Asesor; AD25.A2: Guardar permisos; AD25.A3: Desactivar miembro | WRITE |
| AD26 | Bandeja de cotizaciones | AD26.A1: Abrir cotización; AD26.A2: Enviar recordatorio; AD26.A3: Crear nueva versión | READ |
| AD27 | Equipos e historial | AD27.A1: Abrir historial; AD27.A2: Nueva OT del equipo; AD27.A3: Corregir identificador | READ |
| AD28 | Movimientos de inventario | AD28.A1: Validar movimiento; AD28.A2: Confirmar movimiento; AD28.A3: Cancelar movimiento | WRITE |
| AD29 | Listado de ventas | AD29.A1: Abrir venta; AD29.A2: Nueva venta; AD29.A3: Exportar ventas | READ |
| AD30 | Detalle de venta | AD30.A1: Descargar recibo; AD30.A2: Anular venta; AD30.A3: Volver a ventas | DOC |
| AD31 | Verificación de pago | AD31.A1: Confirmar abono; AD31.A2: Rechazar reporte; AD31.A3: Abrir historial | FIN |
| AD32 | Documentos y recibos | AD32.A1: Abrir documento; AD32.A2: Reintentar PDF; AD32.A3: Compartir enlace; AD32.A4: Imprimir voucher | DOC |
| AD33 | Garantías y políticas | AD33.A1: Guardar borrador; AD33.A2: Publicar condiciones; AD33.A3: Ver texto público | WRITE |
| AD34 | Numeración y plantillas | AD34.A1: Guardar configuración; AD34.A2: Previsualizar orden; AD34.A3: Ver secuencias | WRITE |
| AD35 | Entrega del equipo | AD35.A1: Validar entrega; AD35.A2: Confirmar entrega; AD35.A3: Ver comprobante | WRITE |
| AD36 | Reingreso, cancelación y garantía | AD36.A1: Crear reingreso; AD36.A2: Cancelar servicio; AD36.A3: Preparar devolucion | WRITE |

## Asesor

| ID | Pantalla | Acciones | Perfil |
| --- | --- | --- | --- |
| AS01 | Inicio del Asesor | AS01.A1: Nueva recepción; AS01.A2: Buscar cliente; AS01.A3: Abrir seguimientos | READ |
| AS02 | Cliente y contacto rápido | AS02.A1: Buscar coincidencias; AS02.A2: Guardar contacto; AS02.A3: Abrir historial | WRITE |
| AS03 | Recepción asistida | AS03.A1: Agregar fotos; AS03.A2: Guardar borrador; AS03.A3: Confirmar recepción; AS03.A4: Ver voucher de recepción | WRITE |
| AS04 | Derivar al area técnica | AS04.A1: Revisar recepción; AS04.A2: Enviar a cola técnica; AS04.A3: Solicitar asignacion | WRITE |
| AS05 | Seguimiento de cotizaciones | AS05.A1: Abrir cotización; AS05.A2: Preparar recordatorio; AS05.A3: Solicitar revisión | LOCAL |
| AS06 | Atención y mensajes | AS06.A1: Enviar respuesta; AS06.A2: Consultar al técnico; AS06.A3: Abrir WhatsApp | MSG |
| AS07 | Pagos reportados del cliente | AS07.A1: Abrir comprobante; AS07.A2: Enviar a verificación; AS07.A3: Confirmar abono | WRITE |
| AS08 | Registrar efectivo | AS08.A1: Calcular cambio; AS08.A2: Confirmar efectivo; AS08.A3: Cancelar cobro; AS08.A4: Ver voucher de pago | FIN |
| AS09 | Entrega en mostrador | AS09.A1: Revisar habilitacion; AS09.A2: Confirmar entrega; AS09.A3: Compartir documento | WRITE |
| AS10 | Agenda y tareas | AS10.A1: Crear tarea; AS10.A2: Marcar completada; AS10.A3: Reprogramar | WRITE |
| AS11 | Venta asistida | AS11.A1: Guardar borrador; AS11.A2: Solicitar cobro; AS11.A3: Confirmar venta | READ |
| AS12 | Mi perfil y acceso | AS12.A1: Guardar preferencias; AS12.A2: Solicitar permiso; AS12.A3: Cerrar sesión | WRITE |

## Técnico

| ID | Pantalla | Acciones | Perfil |
| --- | --- | --- | --- |
| TE01 | Inicio técnico | TE01.A1: Abrir mis trabajos; TE01.A2: Escanear QR; TE01.A3: Ver sincronización | READ |
| TE02 | Mis trabajos | TE02.A1: Abrir OT-000154; TE02.A2: Filtrar trabajos; TE02.A3: Actualizar cola | READ |
| TE03 | Escanear QR | TE03.A1: Activar camara; TE03.A2: Buscar código; TE03.A3: Ingresar manual | LOCAL |
| TE04 | OT móvil | TE04.A1: Editar diagnóstico; TE04.A2: Cambiar estado; TE04.A3: Abrir QA | READ |
| TE05 | Diagnóstico móvil | TE05.A1: Guardar borrador; TE05.A2: Adjuntar evidencia; TE05.A3: Enviar diagnóstico | WRITE |
| TE06 | Repuestos y mano de obra | TE06.A1: Buscar repuesto; TE06.A2: Solicitar repuesto; TE06.A3: Registrar consumo | WRITE |
| TE07 | Cambiar estado | TE07.A1: Guardar nota; TE07.A2: Confirmar estado; TE07.A3: Cancelar cambio | WRITE |
| TE08 | Checklist QA móvil | TE08.A1: Guardar resultados; TE08.A2: Aprobar QA; TE08.A3: Reportar fallo | WRITE |
| TE09 | Mensajes del técnico | TE09.A1: Enviar nota interna; TE09.A2: Responder al cliente; TE09.A3: Ver historial | MSG |
| TE10 | Offline y sincronización | TE10.A1: Sincronizar borradores; TE10.A2: Resolver conflicto; TE10.A3: Descartar copia local | WRITE |
| TE11 | Recepción móvil | TE11.A1: Guardar datos; TE11.A2: Tomar evidencia; TE11.A3: Confirmar recepción; TE11.A4: Ver voucher de recepción | WRITE |
| TE12 | Fotos y evidencias | TE12.A1: Tomar foto; TE12.A2: Subir archivos; TE12.A3: Volver a la orden | UPLOAD |
| TE13 | Efectivo autorizado | TE13.A1: Calcular cambio; TE13.A2: Registrar efectivo; TE13.A3: Derivar a caja | FIN |
| TE14 | Historial de la OT | TE14.A1: Filtrar eventos; TE14.A2: Abrir evidencia; TE14.A3: Solicitar correccion | READ |

## Cliente y página pública

| ID | Pantalla | Acciones | Perfil |
| --- | --- | --- | --- |
| CL01 | Página pública del negocio | CL01.A1: Solicitar reparación; CL01.A2: Consultar mi orden; CL01.A3: Ver servicios | READ |
| CL02 | Acceso del cliente con Google | CL02.A1: Continuar con Google; CL02.A2: Volver al negocio; CL02.A3: Ver ayuda de acceso | AUTH |
| CL03 | Solicitud / equipo | CL03.A1: Continuar a la falla; CL03.A2: Usar equipo guardado; CL03.A3: Guardar y salir | WRITE |
| CL04 | Solicitud / falla y fotos | CL04.A1: Agregar fotos; CL04.A2: Continuar a contacto; CL04.A3: Volver al equipo | WRITE |
| CL05 | Solicitud / contacto y revisión | CL05.A1: Revisar equipo; CL05.A2: Crear solicitud; CL05.A3: Guardar borrador | WRITE |
| CL06 | Orden creada | CL06.A1: Ver seguimiento; CL06.A2: Descargar orden; CL06.A3: Contactar al taller | READ |
| CL07 | Mis reparaciones | CL07.A1: Abrir reparación; CL07.A2: Nueva solicitud; CL07.A3: Filtrar historial | READ |
| CL08 | Seguimiento de reparación | CL08.A1: Ver cotización; CL08.A2: Ver pagos; CL08.A3: Enviar consulta | READ |
| CL09 | Revisar cotización | CL09.A1: Aprobar cotización; CL09.A2: Rechazar cotización; CL09.A3: Hacer una pregunta | WRITE |
| CL10 | Elegir medio de pago | CL10.A1: Ver instrucciones; CL10.A2: Reportar pago; CL10.A3: Ver pagos anteriores | READ |
| CL11 | Reportar un pago | CL11.A1: Adjuntar comprobante; CL11.A2: Enviar reporte; CL11.A3: Cancelar reporte | FIN |
| CL12 | Mis documentos, recibos y vouchers | CL12.A1: Abrir recibo; CL12.A2: Ver abonos; CL12.A3: Solicitar documento; CL12.A4: Ver documentos de recepción | DOC |
| CL13 | Mensajes del cliente | CL13.A1: Enviar mensaje; CL13.A2: Adjuntar imagen; CL13.A3: Volver a mi orden | MSG |
| CL14 | Mi perfil | CL14.A1: Guardar perfil; CL14.A2: Gestionar notificaciones; CL14.A3: Cerrar sesión | WRITE |
| CL15 | Negocio no disponible | CL15.A1: Reintentar consulta; CL15.A2: Contactar al negocio; CL15.A3: Entrar a mis documentos | READ |
| CL16 | Inicio del cliente | CL16.A1: Ver mi reparación; CL16.A2: Nueva solicitud; CL16.A3: Retomar borrador | READ |
| CL17 | Mis equipos | CL17.A1: Usar este equipo; CL17.A2: Agregar equipo; CL17.A3: Ver historial | READ |
| CL18 | Mis pagos y saldos | CL18.A1: Ver reporte; CL18.A2: Abrir recibo; CL18.A3: Reportar otro abono; CL18.A4: Ver voucher de pago | READ |
| CL19 | Visor de documento PDF | CL19.A1: Descargar PDF; CL19.A2: Compartir documento; CL19.A3: Volver a documentos; CL19.A4: Imprimir voucher | DOC |
| CL20 | Servicios del comercio | CL20.A1: Solicitar servicio; CL20.A2: Consultar por WhatsApp; CL20.A3: Volver al inicio | READ |
| CL21 | Productos del comercio | CL21.A1: Ver cargador; CL21.A2: Consultar disponibilidad; CL21.A3: Filtrar catálogo | READ |
| CL22 | Detalle de producto público | CL22.A1: Consultar compra; CL22.A2: Ver compatibilidad; CL22.A3: Volver a productos | LOCAL |
| CL23 | Contacto y ubicación | CL23.A1: Abrir WhatsApp; CL23.A2: Ver ubicación; CL23.A3: Leer condiciones | LOCAL |
| CL24 | Entrega y cierre para el cliente | CL24.A1: Ver comprobante; CL24.A2: Solicitar revisión; CL24.A3: Valorar servicio | DOC |
| CL25 | Instrucciones del medio elegido | CL25.A1: Copiar dato de pago; CL25.A2: Ya realice el pago; CL25.A3: Elegir otro medio | READ |
| CL26 | Consulta segura de orden | CL26.A1: Iniciar sesión; CL26.A2: Consultar orden; CL26.A3: Pedir ayuda | READ |

## Vouchers

| ID | Pantalla | Acciones | Perfil |
| --- | --- | --- | --- |
| VR01 | Voucher de recepción | VR01.A1: Obtener voucher; VR01.A2: Imprimir voucher; VR01.A3: Descargar PDF | DOC |
| VR02 | Documentos del cliente | VR02.A1: Obtener voucher; VR02.A2: Ver versión; VR02.A3: Volver a mi orden | DOC |
| VR03 | Voucher de pago confirmado | VR03.A1: Imprimir voucher; VR03.A2: Descargar PDF; VR03.A3: Ver movimientos | DOC |
| VR04 | Vista previa e impresión | VR04.A1: Abrir impresión; VR04.A2: Descargar PDF; VR04.A3: Volver a documentos | DOC |
