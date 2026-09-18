# Verificación local de CRM TECHI

Fecha: 10 de septiembre de 2026. Esta ejecución amplía la base 0.1.0 guardada.
Solo se usan servicios locales y datos sintéticos.

## Cambio y aceptación

La primera entrega local conecta recepción → asignación → seguimiento → pago
pendiente → confirmación con MFA → comprobante a una base PostgreSQL real.
Los selectores muestran nombres en lugar de exigir UUIDs al usuario; se mantienen
la matriz de permisos y las decisiones de producto pendientes.

Se añadieron dos comercios y siete cuentas de prueba, directorios SQL autorizados,
disponibilidad por comercio, paginación y errores explícitos, tipos generados,
inicio local reproducible y pruebas autenticadas. Los datos se conservan en los
volúmenes Docker del proyecto. No se creó infraestructura remota.

## Evidencia ejecutada

- `npm ci`: instalación realizada con lockfile real y versiones fijadas.
- PostgreSQL local: migraciones `20260909204051_foundation.sql` y
  `20260909204324_directory.sql`, más `20260910134459_display_names.sql`, aplicadas.
- `npm run test:db`: 95 comprobaciones pgTAP aprobadas en tres archivos, incluidas
  separación A/B, matriz de roles, MFA y directorios.
- `npm run test:unit`: 111 pruebas de dominio aprobadas.
- Seed: dos ejecuciones con IDs y credenciales idénticos; sin duplicación ni
  sobrescritura de datos existentes. Tres pruebas del script aprobadas.
- `npm run db:types`: contrato generado realmente desde PostgreSQL y conectado al
  cliente del servidor, proxy y cliente MFA.

- Compilación final Next.js completada, TypeScript y ESLint sin errores.
- E2E final: **8 aprobadas, 0 fallidas**, ejecutadas en Microsoft Edge contra la
  aplicación compilada y Supabase local. Cubren recepción, descarga, asignación,
  actualización por técnico, pago pendiente, rechazo financiero con AAL1,
  confirmación con TOTP real, comprobante de pago, portal propio A/B, aislamiento
  por URL y Data API, permisos del Asesor y acceso maestro con MFA.
- La regresión encontrada al descargar PDF quedó corregida: los comprobantes usan
  enlaces nativos; el test descarga y después guarda la asignación correctamente.
- El directorio reconoce el campo `display_name` de las identidades locales, sin
  utilizar metadata editable para decidir permisos.
- Revisión visual: comercios, reparaciones y detalle en escritorio de 1440 px;
  reparaciones en móvil de 390 px. No se observó desbordamiento del documento ni
  errores JavaScript. La tabla conserva desplazamiento horizontal en su contenedor.
- Entorno realmente ejecutado: Node 24.12.0, TypeScript 5.9.3, Next.js 16.3.4,
  Supabase CLI 2.117.0. El pin histórico Node 24.21.0 aún no está instalado.

Evidencia local: `reports/local/build.log`, `database-tests.log`, `e2e.log`,
`visual-check.json` y capturas PNG en la misma carpeta. Los logs privados y
credenciales están fuera del informe y excluidos de Git.

La versión compilada está iniciada con el servidor standalone, enlazado a
127.0.0.1. El comando `npm run local` permite retomar el desarrollo; aplica
migraciones locales pendientes y conserva los datos. `npm run local:serve`
abre una compilación existente con Supabase ya activo.

## Límites conservados

No hay pagos bancarios, mensajes enviados, OAuth Google configurado, fotos,
inventario/ventas, PWA ni publicación. Los totales muestran ingresos pendientes o
confirmados; no representan un saldo contra presupuesto. El nombre y los colores
siguen siendo provisionales. Las pruebas no son un pentest ni certificación de
seguridad, accesibilidad o cumplimiento fiscal.

Las plantillas de CI remoto siguen pendientes de resolver/verificar; no bloquean
el arranque local. La puerta de producción de `docs/12-release.md` permanece
cerrada. Los informes 0.1.0 originales se conservan como evidencia histórica.
