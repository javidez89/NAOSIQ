> Base funcional heredada de v5. Presentación NAOSIQ v6. Para identidad visual prevalecen BRAND_MIGRATION.md y el manual recibido.

# Vouchers y motor documental

**Cambio VCH-01 del usuario, desarrollado en F9. Esta versión lo integra en producto, datos, API, UX, fases y pruebas.**

## Dos hechos confirmados

El cliente puede generar/obtener la copia imprimible de recepción y de pago. No confirma el hecho desde el portal: el servidor comprueba recepción o dinero aprobado. El Asesor/Administrador también puede imprimir una copia en mostrador según permiso. Reimprimir no modifica la OT ni el saldo.

| Documento | Precondición | No acredita |
| --- | --- | --- |
| Solicitud / OT inicial | Solicitud registrada | Que el taller tiene físicamente el equipo. |
| Voucher de recepción | Evento de recepción confirmado | Pago, diagnóstico terminado o entrega. |
| Voucher de pago final | Pago confirmado que completa el saldo | Entrega física del equipo. |
| Voucher por abono | Movimiento parcial confirmado; habilitación D06 | Saldo cero cuando aún se debe. |
| Constancia de entrega | Evento de entrega confirmado | Un ingreso adicional. |

El voucher de pago reutiliza el recibo existente como presentación imprimible. No crear un módulo contable paralelo de vouchers. Estos documentos son comprobantes internos de la propuesta; no se presentan como factura electrónica ni voucher bancario certificado.

## Contenido mínimo

### Recepción

Comercio/sede, consecutivo del documento, OT, fecha real de recepción, cliente, tipo/marca/modelo, identificador de equipo necesario, falla informada, estado físico, accesorios, persona que recibe, condiciones informadas y constancia de aceptación cuando exista. Mostrar claramente "Recibido para diagnóstico/reparación"; no imprimir un presupuesto no aceptado como deuda definitiva.

### Pago

Comercio, consecutivo del recibo, OT/venta, fecha, cliente o referencia autorizada, concepto, moneda, medio, referencia, importe confirmado del movimiento, abonos previos, acumulado y saldo al emitir. Relación interna a payment_id y confirmador. Mostrar "Pago total confirmado" solo cuando corresponde; para parcial usar abono y saldo pendiente.

En efectivo, cambio y dinero entregado pueden documentarse como campos auxiliares si se aprueba; el importe aplicado a la deuda excluye el cambio. Nunca sumar el total de la reparación más los abonos como ingresos separados.

### Exclusiones de privacidad

No PIN, contraseñas, llaves privadas, notas internas, evidencia sensible irrelevante ni tokens permanentes. QR opcional de producción: enlace al recurso autorizado y estable, no ficha pública completa. Los modelos entregados usan datos ficticios y no tienen QR de pago operativo.

## Modelo documental propuesto

| Elemento | Identidad y función |
| --- | --- |
| Evento fuente | intake_event_id o payment_id/event_id confirmado. |
| Documento lógico | document_id, organization_id, tipo, source_event_id y versión. |
| Snapshot | Datos del hecho al emitir; incluye template_version y saldo histórico. |
| Representación | Documento/versión/formato; archivo privado y checksum. |
| Trabajo | job_id, estado, reintentos y error del render. |
| Auditoría | Emisión, descarga solicitada, impresión solicitada, cambio de versión/ajuste. |

Unicidad: `organization_id + document_type + source_event_id + version`. Un formato diferente no cambia la identidad contable. Si falta el archivo se vuelve a renderizar el snapshot con su versión de plantilla; no se toman silenciosamente datos comerciales nuevos para cambiar un recibo antiguo.

Las correcciones conservan original y referencia al ajuste. No editar el PDF manualmente para simular otro importe. El portal distingue saldo al emitir y saldo actual; una corrección no destruye la trazabilidad.

## Integración de pantallas

| Vista origen | Extensión | Nueva acción |
| --- | --- | --- |
| AD05 / AS03 / TE11 | VR01: recepción confirmada | A4: ver voucher de recepción. |
| CL12 | VR02: documentos del cliente | A4: documentos de recepción. |
| AD11 / AS08 / CL18 | VR03: pago confirmado | A4: ver voucher de pago. |
| CL19 / AD32 | VR04: vista previa e impresión | A4: imprimir voucher. |

CL06 conserva el documento inicial. Las A1-A3 originales no se renumeran. El mismo visor se usa en cualquier rol autorizado sin cambiarle su contexto.

## Impresión y formatos

Carta, A4 y 80 mm son propuestas de salida inicial; 58 mm y hardware concreto quedan abiertos. Modelos separados están en references/visual. Estilos de impresión excluyen sidebar, botones y fondos decorativos; priorizan monocromo, importes legibles y saltos de página seguros. Campos largos, caracteres en español, varios conceptos y logos deben probarse.

La acción explícita del usuario abre el diálogo de impresión. El evento `afterprint` también puede ocurrir al cerrar la vista previa: no demuestra que salió papel [W5]. Registrar `DOCUMENT_PRINT_REQUESTED`, no `PRINT_SUCCESS` inventado. PDF descargable es alternativa si no hay impresora o el navegador no permite el flujo esperado. CSS `@media print` y `@page` controlan presentación, no el estado del hardware [W5].

## Escenarios que no cambian el hecho

PDF lento/fallido, enlace vencido, diálogo cancelado, impresora apagada, falta de papel, nueva descarga o nuevo formato. Todos conservan recepción/pago. Solo una operación de dominio autorizada y auditada puede ajustar el hecho.

| Error | Respuesta |
| --- | --- |
| SOURCE_FACT_NOT_CONFIRMED | Explicar que aún no hay recepción o pago confirmado. |
| DOCUMENT_PENDING | Mostrar tarea y consultar el job existente. |
| DOCUMENT_RENDER_FAILED | Reintentar archivo, sin nuevo consecutivo ni dinero. |
| LINK_EXPIRED | Reautorizar y generar enlace nuevo para el mismo documento. |
| ACCESS_DENIED | Denegar sin revelar datos de tercero. |
| DOCUMENT_ADJUSTED | Mostrar original y ajuste/versión vinculados según permiso. |
| PRINT_DIALOG_CLOSED | Mensaje neutral; voucher disponible. |

## Pruebas de aceptación

Antes de recibir no existe voucher de custodia; después contiene mismo responsable y fecha del evento. Reporte pendiente nunca emite voucher de dinero confirmado. Doble clic genera un documento lógico. Falla del worker PDF no duplica pagos. Otro cliente/tenant no descarga por adivinar ID. Cancela impresión sin alterar saldo. Cambio de slug no rompe el acceso autorizado. Ajuste mantiene original. Carta/A4/80 mm se comprueban en pantalla y hardware del piloto.

## Fases y decisiones

Fase 5: recepción y voucher. Fase 6: pago y representación del recibo. Fase 10: idempotencia, permisos, PDF e impresión. Fase 11: ensayo físico. P12, P13, P14 y P25 se actualizan; P28 profundiza el contrato. D06, D08 y D12 definen abonos, lectura en suspensión, plan, formatos y hardware. No se asume impresión silenciosa ni aprobación fiscal.

## Lista de revision del recorrido completo

| Momento | Resultado esperado | No debe ocurrir |
| --- | --- | --- |
| Crear la solicitud | OT identificada y visible para el cliente | Afirmar que el taller recibio un equipo que aun no ha llegado. |
| Confirmar recepcion | Un evento de custodia y una identidad documental | Duplicar la recepcion porque el PDF tarde en generarse. |
| Abrir documentos | Mostrar original vigente, version y formatos disponibles | Autorizar acceso solo por conocer el numero visible de OT. |
| Reportar transferencia | Reporte pendiente con evidencia cuando corresponda | Descontar saldo antes de verificar el ingreso. |
| Confirmar dinero | Una aplicacion de pago y su comprobante | Contabilizar el voucher como un segundo ingreso. |
| Imprimir o cancelar | Conservar documento, dinero y custodia sin cambios | Marcar impresora OK solamente porque se cerro el dialogo. |
| Volver a descargar | Copia autorizada del mismo documento | Generar nuevo folio de pago por cada descarga. |
| Entregar el equipo | Evento de entrega independiente | Confundir saldo cero con entrega fisica ya realizada. |

## Modelos conservados para revision

Los modelos Carta, A4 y 80 mm se adjuntan como antecedentes visuales de v4.1. Cada conjunto contiene recepcion, abono propuesto y pago final. Son ejemplos con datos ficticios, no comprobantes de un negocio real. El modelo de abono no convierte D06 en una decision aprobada y la presencia de 80 mm no acredita compatibilidad con una impresora especifica.

Antes del piloto se debe revisar con el comercio el papel, los margenes imprimibles, el corte, el desbordamiento de textos largos, el QR, la legibilidad y la copia del cliente. La prueba fisica se registra como evidencia separada de la generacion correcta del PDF. La especificacion vigente para construir sigue siendo la de este documento y contracts/voucher-rules.json.
