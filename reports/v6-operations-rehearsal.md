# Ensayo local de operación y recuperación V6

Fecha: 2026-09-17. Alcance: instalación local y datos sintéticos.

## Backup y restore

Se generaron respaldos SQL de esquema y datos y una copia completa de los esquemas `public`, `private`, `auth` y `storage`. La restauración se ejecutó en una base desechable llamada `naosiq_restore_rehearsal`; la base principal no fue reemplazada.

La restauración válida requirió preparar `extensions` y `vault`, y excluir esquemas internos administrados como `realtime`. Comprobaciones recuperadas:

- 2 comercios, 32 órdenes, 6 membresías y 12 pagos en la instantánea.
- 7 identidades Auth y 131 eventos de auditoría.
- 0 tablas públicas sin RLS.

La base y los archivos temporales del contenedor fueron eliminados después de verificar. Las copias SQL locales permanecen en `reports/local/ops/`, fuera de Git. No se ensayó recuperación de objetos binarios porque este piloto no cargó evidencias reales a Storage.

## Observabilidad

- `/api/health`: correcto; sólo acredita liveness.
- Outbox pendiente observado en modo de solo lectura: 83 eventos disponibles; no hay worker que confirme consumidores reales. Es un bloqueo para mensajería o integraciones de staging.
- Entregas de outbox fallidas: 0.
- Eventos de seguridad registrados: 0; falta provocar y observar escenarios de alerta antes de producción.

## Seguridad y calidad

- 208 pruebas pgTAP: aprobadas.
- 132 pruebas unitarias: aprobadas.
- 15 pruebas E2E locales: aprobadas.
- Lint, TypeScript, build y revisión estructural: aprobados.
- `supabase db lint`: dos avisos por variables no usadas en `private.create_repair`; sin hallazgo de seguridad.
- Restauración: todas las tablas públicas recuperadas conservaron RLS.

## Veredicto operativo

La recuperación de base local queda ensayada. Staging y datos reales permanecen en **NO-GO** hasta tener worker/alertas, respaldo de Storage, responsable operativo, credenciales de ensayo y decisiones D01–D14 aprobadas.
