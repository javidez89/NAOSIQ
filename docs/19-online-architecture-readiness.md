# Preparación arquitectónica para publicación

Fecha de revisión: 2026-09-21.

## Veredicto

La aplicación puede publicarse primero como **staging sintético protegido**. La
arquitectura base no necesita dividirse en microservicios: Next.js en Vercel y un
proyecto Supabase separado son suficientes para el piloto. Producción con datos
reales continúa bloqueada por `docs/12-release.md`.

La compilación limpia de producción, el chequeo estructural y la plantilla de
staging pasan. El repositorio contiene CI con acciones fijadas por SHA, migraciones
SQL, RLS, contratos TypeScript y una puerta explícita de release.

## Topología de salida

1. GitHub conserva el código y ejecuta CI.
2. Vercel sirve el monolito Next.js desde un proyecto enlazado al repositorio.
3. Supabase staging aloja Auth, PostgreSQL y Data API con datos sintéticos.
4. `/api/health` comprueba el proceso web; `/api/ready` comprueba de forma privada
   la Data API y la migración esperada usando `READINESS_TOKEN`.
5. Un entorno productivo posterior usa otro proyecto Supabase, otro conjunto de
   secretos y un dominio propio.

## Necesario para abrir staging

- Crear un proyecto Supabase de ensayo y aplicar todas las migraciones en orden.
- Crear un proyecto Vercel con Node.js 24 y enlazar el repositorio.
- Configurar `APP_ORIGIN`, URL y clave publicable de Supabase, y un
  `READINESS_TOKEN` aleatorio de 32 caracteres o más.
- Mantener `ALLOW_REAL_DATA=false`, `SYNTHETIC_PILOT_ONLY=true` y todas las
  integraciones externas apagadas.
- Configurar en Supabase las URL de sitio y redirección exactas de Vercel.
- Proteger previews, ejecutar CI y probar los tres portales con cuentas sintéticas.
- Activar backups del proyecto de ensayo y verificar al menos una restauración.

## Bloqueos para datos reales

- Aprobar D01–D14 y cerrar la aceptación visual de las 118 vistas.
- Ejecutar Security Advisor, pruebas RLS entre tenants, SAST/SCA, secret scanning,
  pentest autorizado y retest.
- Definir privacidad, consentimiento, retención, exportación y eliminación.
- Implementar rate limiting también frente a Data API/RPC y recuperación segura
  de MFA/sesiones.
- Implementar worker y alertas de outbox antes de prometer correo o WhatsApp.
- Implementar Storage privado con cuarentena, validación, antivirus y backup antes
  de habilitar fotos.
- Conectar observabilidad con responsable de alertas e incidentes.
- Medir backup/restore y aprobar RPO/RTO, soporte, dominio y presupuesto.

## Orden recomendado

1. Staging sintético protegido.
2. Migraciones y semilla sintética controlada.
3. Validación E2E, RLS, seguridad y restauración en staging.
4. Corrección de hallazgos y aprobación de decisiones.
5. Crear infraestructura de producción separada.
6. Construir un candidato con variables productivas, aprobarlo y promover el mismo
   artefacto. Sólo entonces habilitar `RELEASE_APPROVED=true` y, tras autorización
   específica, `ALLOW_REAL_DATA=true`.
