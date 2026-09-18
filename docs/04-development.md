# 04. Desarrollo, versionamiento y mantenimiento

## Convenciones

TypeScript strict, funciones pequeñas, validación de entradas y errores
interpretables. Dominio sin I/O; adaptadores con contratos explícitos. Nombres de
código en inglés y experiencia de usuario en español. Mantener fechas en UTC y
presentación localizada. No introducir secretos en mensajes de error ni logs.
Preferir composición y casos de uso simples a jerarquías extensas.

El esquema es fuente de verdad para datos. Los tipos generados se versionan y
se validan contra la base. La entrega inicial no finge una generación que no
pudo ejecutar: el enlace tipado completo de RPC es una tarea de bootstrap.

## Ramas y pull requests

Modelo trunk-based: main estable, ramas cortas `feat/TECHI-123-descripcion`,
`fix/TECHI-124-descripcion`, `chore/...`. Una historia o corrección coherente por
PR. Prohibir pushes directos y force-push a main. Requerir checks y revisor; los
permisos de aprobación se configuran en GitHub, no se activan por tener este texto.
No usar GitFlow largo ni mantener entornos divergentes a base de cherry-picks.

Mensajes sugeridos: `feat(repairs): add intake voucher`, `fix(auth): reject unsafe
callback`, `test(rls): deny cross-tenant access`. En 0.x no se promete estabilidad
pública de API. Al publicar una API externa, versionarla y documentar cambios
incompatibles, deprecación y migración. Releases con tags vX.Y.Z, changelog, SHA,
resultado de tests y migraciones incluidas. Una versión de aplicación no reemplaza
el registro de migraciones.

## Dependencias y cadena de suministro

Versiones exactas en package.json, lockfile generado de verdad, `npm ci` en CI.
Resolver SHA de Actions una vez con el script y revisar el repo/tag/commit
resultante. No descargar una versión flotante en cada build. Dependabot propone
cambios semanales; parches críticos se atienden antes según riesgo. No autorizar
un major automáticamente solo porque los tests unitarios pasen.

Una actualización incluye changelog, compatibilidad Node/React/Next/Supabase,
instalación limpia, build, tests de sesión/MFA, migraciones, pruebas de dos negocios,
preview y revisión humana. No ejecutar `npm audit fix --force` como política.
Generar SBOM y revisar licencias antes de distribuir.

## Hecho significa verificable

Una historia está lista cuando el código, pruebas, documentación, permisos,
observabilidad y reversión están revisados. Adjuntar evidencia con comandos y
entorno. Un pantallazo no acredita que la base aisló comercios. Un pipeline verde
con tests omitidos no habilita una funcionalidad sensible.

## Manejo de deuda

Mantener issues con impacto, dueño y criterio de cierre. Revisar arquitectura al
aparecer necesidad medible: latencia sostenida, costes, fallos de concurrencia,
acoplamiento que bloquea equipos o requisitos de aislamiento contractual.
No reescribir todo el sistema por cambiar una librería de componentes.

## Exportabilidad

Guardar SQL, datos exportables, contratos y decisiones fuera de paneles de
proveedor. Versionar configuración no secreta. Definir procedimientos de salida,
exportación por negocio y desactivación de integraciones. Eliminar un comercio no
significa borrar a ciegas pagos y auditoría sujetos a retención.
