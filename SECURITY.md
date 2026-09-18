# Seguridad

## Estado
Versión 0.1.0 de construcción. Sin autorización para operar con datos reales.
No ha recibido un pentest ni una auditoría independiente. El código de control de
acceso requiere validación integrada antes de cualquier piloto real.

## Reportes privados
No publique secretos, explotaciones contra producción ni datos personales en issues.
Habilitar Private Vulnerability Reporting en GitHub y definir el responsable/canal
privado antes de publicar el repositorio. No se ha inventado una dirección de correo.

## Prohibiciones del proyecto
No emplear service_role/secret keys en clientes. No copiar datos de producción a
previews. No usar user_metadata como autoridad. No permitir mutaciones financieras
directas. No publicar fotos, vouchers o backups en buckets públicos. No ejecutar
escaneos activos contra terceros o producción sin autorización y reglas de alcance.

## Divulgación y respuesta
Clasificar impacto, preservar evidencia limitada, contener accesos, rotar secretos
expuestos, corregir, validar y documentar. Las notificaciones regulatorias dependen
del incidente y deben revisarse con el responsable de privacidad y asesoría jurídica.
No se promete un SLA de respuesta que aún no tiene equipo operativo asignado.

Ver docs/07-security.md y docs/08-operations.md.
