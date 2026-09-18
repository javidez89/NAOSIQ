> Base funcional heredada de v5. Presentación NAOSIQ v6. Para identidad visual prevalecen BRAND_MIGRATION.md y el manual recibido.

# Casos de aceptación del arranque

**Especificaciones, no resultados de ejecución.** Cada caso se conecta a la historia, prompt y pantallas. Completar datos de escenario y step definitions al automatizar.

## HU-001 - Base ejecutable

Prompt: P01. Vistas: AU04.

**Objetivo:** Foundation con comandos y errores visibles.

**HU-001.AC1 / success:** El proyecto de ensayo ejecuta sus verificaciones y muestra un error recuperable en lugar de pagina blanca.

**HU-001.AC2 / negative_or_exception:** Falta variable obligatoria y el arranque falla con mensaje seguro, sin exponer secretos.

## HU-002 - Tenant y membresias

Prompt: P02. Vistas: AU02, AD25.

**Objetivo:** Aislar todos los recursos por comercio.

**HU-002.AC1 / success:** Usuario de A consulta solo recursos de A con membresia activa.

**HU-002.AC2 / negative_or_exception:** Solicitar OT/documento de B devuelve denegacion y no revela su contenido.

## HU-003 - Google y retorno

Prompt: P03. Vistas: AU01, CL02.

**Objetivo:** Identidad sin autoasignacion de roles.

**HU-003.AC1 / success:** Login valido retorna al contexto autorizado y conserva el destino seguro.

**HU-003.AC2 / negative_or_exception:** Callback manipulado o destino externo no crea rol ni redirige a un sitio no permitido.

## HU-004 - Revocacion y sesion

Prompt: P27. Vistas: AU03, AU05.

**Objetivo:** Reautenticar sin repetir mutaciones.

**HU-004.AC1 / success:** Tras reingresar, se recupera el ultimo borrador confirmado de la misma identidad.

**HU-004.AC2 / negative_or_exception:** Reingreso con otra cuenta no recupera datos ni reproduce un pago de la anterior.

## HU-005 - Crear comercio

Prompt: P04. Vistas: SU02, SU03, SU04.

**Objetivo:** Alta idempotente central.

**HU-005.AC1 / success:** Dos intentos con la misma clave devuelven la misma organizacion.

**HU-005.AC2 / negative_or_exception:** Falla de invitacion permite reenviar sin duplicar el negocio.

## HU-006 - Control total auditado

Prompt: P04. Vistas: SU05, SU19.

**Objetivo:** Super Usuario opera cualquier comercio.

**HU-006.AC1 / success:** Entrada muestra negocio, actor real y motivo; cambios tienen evento auditable.

**HU-006.AC2 / negative_or_exception:** Administrador de comercio no puede abrir control global ni elevarse.

## HU-007 - URL central

Prompt: P05. Vistas: SU09.

**Objetivo:** Asignar URL sin colisiones.

**HU-007.AC1 / success:** Cambio de slug conserva vinculos a documentos por ID estable.

**HU-007.AC2 / negative_or_exception:** Dos comercios intentan mismo slug y solo uno lo confirma.

## HU-008 - Onboarding reanudable

Prompt: P06. Vistas: SU03, AD24.

**Objetivo:** No perder el alta incompleta.

**HU-008.AC1 / success:** Volver al wizard recupera pasos confirmados y muestra lo pendiente.

**HU-008.AC2 / negative_or_exception:** Precio sin aprobar no genera cargo real ni lo anuncia como tarifa.

## HU-009 - Publicacion y pagina

Prompt: P07. Vistas: CL01, AD19, CL20, CL21, CL22, CL23, CL26.

**Objetivo:** Micrositio aislado.

**HU-009.AC1 / success:** Publicar version aprobada muestra solo datos publicables del negocio.

**HU-009.AC2 / negative_or_exception:** Consulta por OT correlativa sin autenticacion no revela cliente, fotos o saldo.

## HU-010 - Clientes y equipos

Prompt: P08. Vistas: AD12, AD13, AD27, CL17, AS02.

**Objetivo:** Relacion contextual.

**HU-010.AC1 / success:** Crear cliente y equipo conserva historial en el comercio correcto.

**HU-010.AC2 / negative_or_exception:** Coincidencia de telefono no fusiona automaticamente ni revela otro cliente.

## HU-011 - Nueva solicitud

Prompt: P09. Vistas: CL03, CL04, CL05, CL06, AD03.

**Objetivo:** Solicitud no es custodia.

**HU-011.AC1 / success:** Cliente envia solicitud y obtiene OT inicial con falla y contacto.

**HU-011.AC2 / negative_or_exception:** Sin recepcion fisica, no se obtiene voucher de custodia.

## HU-012 - Recepcion con evidencia

Prompt: P09. Vistas: AS03, AD05, TE11.

**Objetivo:** Confirmar custodia real.

**HU-012.AC1 / success:** Personal autorizado confirma estado fisico/accesorios y evento unico.

**HU-012.AC2 / negative_or_exception:** Usuario sin permiso o version obsoleta no confirma; datos se mantienen para revisar.

## HU-013 - Voucher de recepcion

Prompt: P28. Vistas: VR01, VR02.

**Objetivo:** Copia imprimible del equipo recibido.

**HU-013.AC1 / success:** Cliente obtiene documento con la fecha y actor del evento real.

**HU-013.AC2 / negative_or_exception:** PDF falla: reintentar render conserva evento, fecha y numero sin nueva recepcion.

## HU-014 - Derivacion y asignacion

Prompt: P26. Vistas: AS04, AD14, AD09, TE01, TE02.

**Objetivo:** Pasar contexto al tecnico.

**HU-014.AC1 / success:** Tecnico asignado recibe falla, fotos y condiciones del equipo.

**HU-014.AC2 / negative_or_exception:** Asesor no adquiere permisos tecnicos por abrir un componente compartido.

## HU-015 - Diagnostico

Prompt: P10. Vistas: AD06, TE04, TE05.

**Objetivo:** Hallazgos y propuesta.

**HU-015.AC1 / success:** Tecnico asignado guarda hallazgos y evidencia con version.

**HU-015.AC2 / negative_or_exception:** Otro miembro sin alcance no altera el diagnostico ni ve notas protegidas.

## HU-016 - Cotizacion versionada

Prompt: P10. Vistas: AD07, AD08, AD26, CL09, AS05.

**Objetivo:** Aprobar exactamente lo publicado.

**HU-016.AC1 / success:** Cliente acepta version vigente y queda evidencia fechada.

**HU-016.AC2 / negative_or_exception:** Version vencida/reemplazada o cliente ajeno no se puede aprobar.

## HU-017 - Proceso tecnico

Prompt: P11. Vistas: TE07, TE06, AD09.

**Objetivo:** Transiciones permitidas.

**HU-017.AC1 / success:** Estado/subestado cambia con motivo y actor, conservando historia.

**HU-017.AC2 / negative_or_exception:** No se salta de recibido a entregado sin controles.

## HU-018 - QA y cierre

Prompt: P11. Vistas: AD10, TE08.

**Objetivo:** Prueba antes de completar.

**HU-018.AC1 / success:** Pruebas obligatorias aprobadas permiten cerrar tecnicamente.

**HU-018.AC2 / negative_or_exception:** QA fallido no indica completado ni pagado; vuelve a reparacion.

## HU-019 - Reportar pago

Prompt: P14. Vistas: CL10, CL11, CL25, AS07.

**Objetivo:** Reporte no es ingreso.

**HU-019.AC1 / success:** Cliente recibe estado reportado y saldo sin cambio.

**HU-019.AC2 / negative_or_exception:** Adjuntar comprobante no emite voucher de pago ni reduce deuda.

## HU-020 - Verificacion financiera

Prompt: P14. Vistas: AD31, AD11.

**Objetivo:** Aplicar dinero una vez.

**HU-020.AC1 / success:** Admin confirma evidencia y se crea asignacion/recibo/operation unico.

**HU-020.AC2 / negative_or_exception:** Dos aprobaciones simultaneas del mismo reporte no duplican dinero.

## HU-021 - Efectivo y cambio

Prompt: P14. Vistas: AS08, TE13.

**Objetivo:** Caja delegada explicita.

**HU-021.AC1 / success:** Cajero autorizado aplica importe correcto y calcula cambio sin sumarlo al ingreso.

**HU-021.AC2 / negative_or_exception:** Asesor sin delegacion no confirma efectivo aunque el boton exista en la maqueta.

## HU-022 - Abonos y saldos

Prompt: P13. Vistas: CL18, AD11.

**Objetivo:** Libro de movimientos.

**HU-022.AC1 / success:** 350000 total menos 100000 confirmado da 250000 pendiente; pago final deja cero.

**HU-022.AC2 / negative_or_exception:** Reporte pendiente o rechazo no modifica el saldo; sobrepago queda bloqueado D07.

## HU-023 - Voucher de pago

Prompt: P28. Vistas: VR03, CL18, CL12.

**Objetivo:** Voucher del recibo existente.

**HU-023.AC1 / success:** Pago final confirmado permite consultar mismo recibo y saldo al emitir.

**HU-023.AC2 / negative_or_exception:** Reimprimir o pedir otro formato no crea una asignacion ni ingreso extra.

## HU-024 - Vista previa y descarga

Prompt: P28. Vistas: VR04, CL19, AD32.

**Objetivo:** Archivo autorizado.

**HU-024.AC1 / success:** Descarga valida obtiene snapshot/version correctos en formato propuesto.

**HU-024.AC2 / negative_or_exception:** Enlace vencido pide reautorizar; otro cliente o tenant no descarga por cambiar ID.

## HU-025 - Cancelacion de impresion

Prompt: P28. Vistas: VR04.

**Objetivo:** Dialogo no demuestra salida fisica.

**HU-025.AC1 / success:** Al cerrar dialogo se conserva voucher y saldo.

**HU-025.AC2 / negative_or_exception:** afterprint no se registra como papel impreso ni cancela la operacion.

## HU-026 - Resultado financiero incierto

Prompt: P27. Vistas: AD31, AS08, CL11.

**Objetivo:** No duplicar tras timeout.

**HU-026.AC1 / success:** Consultar misma clave despues del commit devuelve pago confirmado original.

**HU-026.AC2 / negative_or_exception:** Timeout no crea REJECTED ni solicita pagar de nuevo sin reconciliar.

## HU-027 - Inventario y reservas

Prompt: P15. Vistas: AD15, AD16, AD28, TE06.

**Objetivo:** Stock transaccional.

**HU-027.AC1 / success:** Un consumo vinculado a OT descuenta una vez.

**HU-027.AC2 / negative_or_exception:** Carrera entre venta y reparacion por ultima unidad no genera stock negativo.

## HU-028 - Venta asistida

Prompt: P16. Vistas: AD17, AD29, AD30, AS11.

**Objetivo:** Reutilizar dinero e inventario.

**HU-028.AC1 / success:** Venta valida registra items, pago y movimiento vinculado.

**HU-028.AC2 / negative_or_exception:** Cancelar venta no oculta dinero ni devuelve stock sin evento autorizado.

## HU-029 - Entrega del equipo

Prompt: P11. Vistas: AD35, AS09, CL24.

**Objetivo:** Custodia separada de dinero.

**HU-029.AC1 / success:** Con habilitacion y receptor verificados se guarda constancia de entrega.

**HU-029.AC2 / negative_or_exception:** Saldo o QA pendiente bloquean entrega salvo excepcion aprobada; pago no marca entregado solo.

## HU-030 - Reingreso y no reparable

Prompt: P11. Vistas: AD36.

**Objetivo:** Conservar la historia.

**HU-030.AC1 / success:** Garantia genera nueva OT vinculada y resolucion conserva la original.

**HU-030.AC2 / negative_or_exception:** No borrar trabajo/cobros originales para simular devolucion o cancelacion.

## HU-031 - Mensajes por audiencia

Prompt: P18. Vistas: AD18, AS06, TE09, CL13.

**Objetivo:** Nota interna nunca llega al cliente.

**HU-031.AC1 / success:** Mensaje con client_message_id llega una vez al destinatario autorizado.

**HU-031.AC2 / negative_or_exception:** Intento de leer nota interna desde cliente se deniega sin filtrar texto.

## HU-032 - WhatsApp para todos

Prompt: P17. Vistas: SU12, AD21, CL23.

**Objetivo:** Abrir no equivale a enviar.

**HU-032.AC1 / success:** Basico abre mensaje preconfigurado con datos permitidos.

**HU-032.AC2 / negative_or_exception:** Volver de WhatsApp no marca entregado/leido sin evidencia del proveedor.

## HU-033 - Agenda y perfil Asesor

Prompt: P26. Vistas: AS01, AS10, AS12.

**Objetivo:** Atencion sin privilegios globales.

**HU-033.AC1 / success:** Asesor organiza tareas del alcance y solicita permiso sin concederselo.

**HU-033.AC2 / negative_or_exception:** Cambiar preferencia del perfil no modifica rol ni delegacion.

## HU-034 - Documentos y plantillas

Prompt: P12. Vistas: AD34, AD32, SU15.

**Objetivo:** Snapshot versionado.

**HU-034.AC1 / success:** Cambio de plantilla afecta nuevas emisiones; copia antigua conserva version.

**HU-034.AC2 / negative_or_exception:** Nueva descarga no toma importes editados para reescribir un recibo.

## HU-035 - Medios de pago negocio

Prompt: P14. Vistas: AD20.

**Objetivo:** Cuentas del comercio correcto.

**HU-035.AC1 / success:** Configurar Bre-B/Nequi/transferencia/efectivo muestra instrucciones propias.

**HU-035.AC2 / negative_or_exception:** Cuenta receptora de otro comercio o SaaS no aparece en cobro de OT.

## HU-036 - Planes y ciclo SaaS

Prompt: P19. Vistas: SU06, SU16, SU07, SU17, SU08, AD23.

**Objetivo:** Facturar un ciclo una vez.

**HU-036.AC1 / success:** Job con politica de ensayo crea un solo cargo por periodo.

**HU-036.AC2 / negative_or_exception:** Reintentar job o pago cliente al negocio no paga ni duplica mensualidad.

## HU-037 - Suspension y cortesia

Prompt: P20. Vistas: SU18, CL15, AD23.

**Objetivo:** Control de acceso por servidor.

**HU-037.AC1 / success:** Impago tras gracia aprobada restringe operaciones y deja pago/soporte.

**HU-037.AC2 / negative_or_exception:** Peticion directa no elude suspension; cortesia no se suma a ingresos.

## HU-038 - PWA offline y actualizacion

Prompt: P23. Vistas: TE10, AU06.

**Objetivo:** Borrador local no es hecho.

**HU-038.AC1 / success:** Nota local se identifica pendiente y se revalida al reconectar.

**HU-038.AC2 / negative_or_exception:** Stock, pago, entrega o aprobacion offline no se confirman definitivamente.

## HU-039 - Evidencias y subidas

Prompt: P09. Vistas: TE12, CL04, AD05.

**Objetivo:** Archivos seguros.

**HU-039.AC1 / success:** Archivo permitido se valida y asocia al recurso correcto.

**HU-039.AC2 / negative_or_exception:** MIME/tamano rechazado no pierde archivos ya subidos ni deja acceso publico.

## HU-040 - Dashboards y exportes

Prompt: P21. Vistas: SU01, SU20, AD01, AD22.

**Objetivo:** Metricas sin doble conteo.

**HU-040.AC1 / success:** Cobros netos consideran abonos una vez y muestran fecha del dato.

**HU-040.AC2 / negative_or_exception:** Datos parciales no parecen cero real ni se mezclan en exporte cross-tenant.

## HU-041 - Auditoria y soporte

Prompt: P22. Vistas: SU13, SU14, SU11.

**Objetivo:** Acciones rastreables.

**HU-041.AC1 / success:** Soporte relaciona evento, operacion y documento con actor real.

**HU-041.AC2 / negative_or_exception:** Ninguna UI elimina trazas ni muestra secretos completos en logs.

## HU-042 - Privacidad y condiciones

Prompt: P31. Vistas: AD33, CL14.

**Objetivo:** Politicas aprobadas.

**HU-042.AC1 / success:** Piloto muestra condiciones versionadas y preferencias registradas.

**HU-042.AC2 / negative_or_exception:** No se activa borrado irreversible o plazo de garantia inventado.

## HU-043 - Cobertura de controles UX

Prompt: P29. Vistas: contrato completo.

**Objetivo:** Cada accion tiene exito, error y recuperacion.

**HU-043.AC1 / success:** Las 363 acciones del catalogo conservan IDs y contrato de resultados.

**HU-043.AC2 / negative_or_exception:** Ningun destino compartido concede otro rol; los pendientes de implementacion son explicitos.

## HU-044 - Piloto operativo e impresora

Prompt: P31. Vistas: VR04.

**Objetivo:** Validacion en entorno real autorizado.

**HU-044.AC1 / success:** Se prueba restore y salida fisica Carta/A4/80mm segun decision del piloto.

**HU-044.AC2 / negative_or_exception:** Sin evidencia de hardware no se declara compatibilidad certificada ni go-live completo.
