# 08. Operación, respaldos e incidentes

## Sumidero local de eventos

`npm run local:outbox:inspect` observa la cola del contenedor local sin modificar eventos. Informa cantidad pendiente, eventos disponibles y edad del más antiguo, con `external_delivery=false`. El vaciado requiere un worker real con confirmación por consumidor; no se simula marcando eventos como procesados.

## Observabilidad propuesta

Registrar request_id, versión de despliegue, ruta, tipo de operación, duración,
resultado y tenant cuando sea necesario. No registrar sesiones, tokens, claves,
códigos MFA, contenido de fotos ni descripciones de fallas completas. Los errores
actuales de UI son genéricos; falta conectar un recolector estructurado con
correlación completa entre Next.js, RPC y proveedores. La cabecera request-id no
acredita por sí sola trazabilidad extremo a extremo.

Medir: disponibilidad de consulta/recepción, p95 por operación, fallos de login,
denegaciones, errores de DB, pagos pendientes/confirmados, edad y tamaño de outbox,
fallos de entrega WhatsApp, almacenamiento, egreso y gasto por comercio. Separar
métricas operativas del taller de ingresos de suscripciones del SaaS.

`/api/health` es liveness sin secretos ni consulta de DB. No es readiness, una
transacción sintética ni un informe de seguridad. Añadir un chequeo privado de
preparación para dependencias y esquema sin divulgar configuración al público.

## Objetivos de servicio a aprobar

Para el piloto se propone disponibilidad mensual de rutas principales >=99.5 %,
RPO de datos financieros <=15 minutos y RTO <=4 horas, **solo después** de
contratar capacidades compatibles y verificar una restauración. Son objetivos,
no prestaciones ya medidas ni promesas contractuales. La frecuencia real del
backup y PITR determinará el RPO posible. Un backup diario no satisface por sí
solo un RPO de 15 minutos.

## Copias de seguridad

Cubrir por separado: PostgreSQL (datos, esquema, roles aplicables), objetos de
Storage, configuración OAuth/URLs/webhooks, secretos custodiados, y código/lockfile.
Los backups de la base Supabase no incluyen los archivos binarios de Storage;
conservarlos por un mecanismo independiente. Backups de una tabla de objetos no
recrean automáticamente los objetos borrados.

Cifrar, restringir acceso, registrar periodicidad/retención y mantener una copia
con independencia del fallo principal. No enviar backups a GitHub ni compartir
SQL con datos personales. Establecer responsables y pruebas periódicas. Registrar
último backup, edad, resultado de restauración y pérdida máxima observada.

## Ejercicio de restauración

Crear un destino aislado autorizado; restaurar versión compatible; validar conteos,
constraints, RLS, usuarios/membresías, historial y vouchers; recuperar objetos y
validar hashes; bloquear envíos/pagos externos; ejecutar pruebas A/B; medir tiempo;
registrar discrepancias; destruir de forma controlada el entorno del ensayo.
Nunca probar restore escribiendo encima de producción por primera vez.

## Incidentes

Sospecha de fuga entre tenants o confirmación indebida: limitar operaciones,
preservar evidencia, revocar accesos afectados, confirmar alcance, rotar secretos
expuestos, corregir y retestar, comunicar según obligaciones aplicables y hacer
postmortem. El objetivo es evitar daño y restablecer integridad, no ocultar alertas.
La persona de guardia y el canal deben existir antes del piloto; no hay una
rotación de soporte 24/7 contratada en esta entrega.

## Suscripciones y suspensión

El vencimiento se evalúa al escribir; no depende de que corra un cron a tiempo.
El comportamiento provisional es solo lectura para usuarios previamente
autorizados y bloqueo de nuevas operaciones, salvo maestro con MFA. Un comercio
cerrado pierde acceso ordinario. Gracia, recuperación de cuenta, exportación,
eliminación y continuidad del cliente requieren decisión de producto/privacidad.
El estado de una suscripción no confirma un pago de reparación ni viceversa.

## Continuidad de proveedores

Cuando una pasarela o WhatsApp falla, no bloquear la recepción de una orden ni
confirmar resultados ficticios. Persistir el evento, mostrar estado pendiente,
reintentar de forma controlada y escalar por edad. El worker outbox y esta UX
operativa son entregables pendientes; la tabla por sí sola no envía mensajes.
