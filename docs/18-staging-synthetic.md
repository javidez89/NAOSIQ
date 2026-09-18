# Staging sintético

## Estado

La configuración está preparada, pero no desplegada. D13 y las credenciales de un proyecto de ensayo siguen pendientes. El entorno sólo podrá recibir datos sintéticos.

## Controles obligatorios

- `APP_ENV=staging`, orígenes HTTPS y proyecto Supabase separado.
- `ALLOW_REAL_DATA=false` y `SYNTHETIC_PILOT_ONLY=true`.
- Google, WhatsApp, pasarela, correo y Sentry deshabilitados. Cada integración exige aprobación explícita, credenciales de ensayo y una prueba aislada.
- Migraciones aplicadas desde el repositorio; no editar el esquema manualmente.
- Secretos en el gestor del proveedor. No se copian a archivos del repositorio ni a capturas.
- Una cuenta responsable de operación, alertas, respaldo y restauración antes de abrir el entorno.

Validación previa:

```powershell
node scripts/check-staging-config.mjs .env.staging
```

Esta preparación no autoriza despliegue, proveedores externos ni información real.
