# Changelog

## Desarrollo local - 2026-09-10

Aplicación conectada a Supabase local con cuentas sintéticas persistentes,
directorio de personal autorizado, selectores por nombre, búsqueda y paginación,
resumen de pagos y verificación MFA. Tipos generados desde PostgreSQL real,
scripts de arranque y pruebas E2E de roles, A/B y comprobantes.

Los PDF usan enlaces nativos para conservar la ruta de la orden al descargar y
permitir guardar operaciones posteriores. Se mantienen las decisiones de
producto pendientes y el bloqueo de producción. Ver reports/local-verification.md.

## 0.1.0 - 2026-09-08

Base inicial de desarrollo: dominio, pruebas unitarias, aplicación Next.js,
plantillas SQL de aislamiento y comandos, pruebas pgTAP, pipeline parametrizado,
Docker opcional y documentación de gobierno.

No publicado ni desplegado. Ver reports/verification.md para evidencia de ejecución.
No incluye una integración operativa con WhatsApp, pasarela, inventario o ventas.
