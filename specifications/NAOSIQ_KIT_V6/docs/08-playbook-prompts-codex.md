> Base funcional heredada de v5. Presentación NAOSIQ v6. Para identidad visual prevalecen BRAND_MIGRATION.md y el manual recibido.

# Playbook y prompts de Codex

**32 tareas versionadas. El primer paso es P00 en solo lectura. Los archivos prompts/P00.md a prompts/P31.md contienen el texto para cada tarea.**

## Trabajo por objetivos acotados

Cargar AGENTS.md y el contexto relevante, inspeccionar, planear, implementar, ejecutar pruebas y revisar el diff. No pedir construir toda la plataforma en una tarea. Un archivo TASK_LOG.md y commits/PRs permiten reanudar sin depender de memoria del chat. Las instrucciones del repositorio son compatibles con el mecanismo AGENTS.md documentado por OpenAI [W1].

En un entorno cloud se selecciona el repositorio y se configura el entorno de dependencias/variables y acceso requerido [W2]. En una sesión local/IDE se abre el mismo repo. La documentación no está automáticamente disponible para Codex por haber sido creada en este chat: debe incorporarse al repo o al contexto de trabajo.

## Contexto y costos de atención

AGENTS.md debe ser breve y apuntar a SPEC_INDEX.md. Para una tarea de recepción, leer el flujo, permisos y vouchers, no todos los PDFs completos. Conservar un solo contrato vigente y referencias de cambios evita repetir explicaciones. No afirmar una cantidad garantizada de tokens ahorrados.

## Comprobaciones antes de cambiar código

Repositorio correcto y rama de trabajo; permisos del entorno; dependencias presentes; decisiones bloqueantes; mocks claramente marcados; acceso a la referencia visual correspondiente. No copiar ni enviar credenciales a los prompts. No sobreescribir un proyecto existente por asumir que está vacío.

## Pausas y continuidad

Antes de una pausa controlada, resumir tarea/commit, archivos cambiados, pruebas ejecutadas, fallos y siguiente paso en TASK_LOG.md. Si se corta inesperadamente, inspeccionar git diff/status y logs al retomar; no afirmar guardados que no existen. Este paquete no instala una ejecución automática futura ni reanuda tareas por sí solo.

## Entrega de cada tarea

Resumen funcional, archivos cambiados, referencias de pantalla/acción, pruebas y resultados, decisiones, limitaciones, datos simulados, riesgos y propuesta de siguiente tarea. La revisión humana precede merge y despliegue. No declarar "todo probado" por una validación de JSON.


## P00 - Auditoría y plan de arranque

**Fase:** 0. **Dependencias:** ninguna. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `START_HERE.md`
- `SPEC_INDEX.md`
- `docs/03-arquitectura-datos-api.md`

### Objetivo y alcance

Inspeccionar el repositorio real y contrastar esta base sin modificar archivos. Determinar si está vacío o tiene código. Identificar stack, comandos, restricciones y decisiones bloqueantes.

### Entregable esperado

Informe de hallazgos, mapa real de carpetas y plan de PRs. No simular archivos existentes ni ejecutar cambios.

### Criterios especiales

Distinguir documentos de implementación. No instalar dependencias ni crear un proyecto sin aprobación del plan.

Historias asociadas: transversal; ver backlog/stories.json.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Esta tarea es SOLO LECTURA: no modifiques archivos, no instales paquetes ni ejecutes migraciones. Devuelve el plan en la conversación.
4. Identifica las pruebas existentes y propone las faltantes; no crees archivos todavía.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P01 - Foundation del repositorio

**Fase:** 1. **Dependencias:** P00. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `START_HERE.md`
- `SPEC_INDEX.md`
- `docs/03-arquitectura-datos-api.md`

### Objetivo y alcance

Crear o adaptar Next.js/TypeScript como monolito modular; tokens, shells por rol, errores base, logging, interfaces para jobs/outbox y CI. Fijar versiones y lockfile tras inspección.

### Entregable esperado

Proyecto ejecutable con comandos reales de lint, typecheck, test y build; .env.example sin secretos.

### Criterios especiales

No crear pantallas que confirmen pagos ficticios. Documentar qué infraestructura sigue simulada.

Historias asociadas: HU-001.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P02 - Modelo multiempresa y permisos

**Fase:** 2. **Dependencias:** P01. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Implementar organizaciones, usuarios, membresías, cinco roles y delegaciones; guards server-side, restricciones DB y aislamiento de archivos/jobs. Incluir actor real y audit hook desde el inicio.

### Entregable esperado

Migraciones revisadas, semillas A/B y pruebas de lectura/mutación cross-tenant.

### Criterios especiales

Cliente no asigna role/organization por body. Asesor sin caja por defecto; Super Usuario con acceso auditado.

Historias asociadas: HU-002.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P03 - Google y ciclo de sesión

**Fase:** 2. **Dependencias:** P02. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/04-ux-ui-y-resiliencia.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Configurar adaptador Google elegido; invitación, aceptación y rol como hechos distintos. Contexto, logout, revocación, reautenticación y retorno seguro.

### Entregable esperado

Flujo de identidad probado en entorno de ensayo y contratos de sesión.

### Criterios especiales

Cancelar Google no crea cuenta activa ni rol. Callback tardío se valida. D04 sigue pendiente para política productiva.

Historias asociadas: HU-003.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P04 - CRM Maestro y control total

**Fase:** 3. **Dependencias:** P03. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Comercios, listado/detalle, alta, configuración y control elevado sobre cualquier negocio. Banda de actor y contexto; eventos auditados.

### Entregable esperado

SU01-SU20 de acuerdo con capacidades disponibles; acciones no implementadas claramente deshabilitadas.

### Criterios especiales

No suplantar actor ni exponer clave privilegiada. Nunca confundir cortesía con ingreso.

Historias asociadas: HU-005, HU-006.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P05 - URL Manager central

**Fase:** 3. **Dependencias:** P04. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Gestionar slug/dominio, validación, palabras reservadas, colisiones y redirección segura. Documento por ID estable no por slug reutilizable.

### Entregable esperado

Asignación central idempotente; reglas de enlace en vouchers.

### Criterios especiales

Dos altas al mismo slug: una gana y otra informa conflicto sin perder borrador. Admin del comercio no cambia URL estructural.

Historias asociadas: HU-007.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P06 - Onboarding reanudable

**Fase:** 4. **Dependencias:** P05. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Wizard comercio-plan-URL-admin-marca-pagos-publicación, conservando IDs por paso y aislando invitación de creación.

### Entregable esperado

Alta reanudable con snapshot y versión, sin duplicados al reintentar.

### Criterios especiales

Correo fallido no crea otra organización. Plan sin precio no cobra por defecto.

Historias asociadas: HU-008.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P07 - Micrositio y catálogo

**Fase:** 4. **Dependencias:** P06. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Publicación por slug con proyección pública de marca/servicios/productos/contacto, solicitudes y acceso a consulta privada.

### Entregable esperado

CL01, CL20-CL23, CL26 y editor del comercio conectados.

### Criterios especiales

No exponer notas, cuentas privadas o clientes. Cambio de slug mantiene el comercio correcto.

Historias asociadas: HU-009.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P08 - Clientes y equipos

**Fase:** 5. **Dependencias:** P03. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Clientes del comercio, equipos, búsquedas contextuales y revisión de duplicados. Preparar acceso al cliente autenticado propietario.

### Entregable esperado

Altas desde staff/portal e historial por equipo.

### Criterios especiales

Coincidencia de teléfono o serial no fusiona ni revela datos de otro cliente/comercio.

Historias asociadas: HU-010.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P09 - Órdenes y recepción

**Fase:** 5. **Dependencias:** P08. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Crear OT, evidencia, recepción física, custodia, asignación y estados separados; operation_id, versión y evento de recepción.

### Entregable esperado

Recorrido CL03-CL06, AD03-AD05 y AS03 sin confundir solicitud con custodia.

### Criterios especiales

Sin recepción confirmada no hay voucher de recepción. Dos clics devuelven mismo evento.

Historias asociadas: HU-011, HU-012, HU-039.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P10 - Diagnóstico y cotización

**Fase:** 5. **Dependencias:** P09. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Diagnóstico, ítems, versión publicada, vigencia, aprobación/rechazo del cliente y seguimiento del Asesor.

### Entregable esperado

Presupuesto versionado y respuesta autorizada.

### Criterios especiales

Cotización expirada/reemplazada no se aprueba; modificar precio crea revisión. Asesor no acepta por cliente.

Historias asociadas: HU-015, HU-016.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P11 - Reparación y QA

**Fase:** 5. **Dependencias:** P10. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Subestados, pruebas por equipo, no aplicable con motivo, retorno por fallo y cierre técnico.

### Entregable esperado

Checklist, evidencia y transiciones permitidas server-side.

### Criterios especiales

COMPLETED no significa PAID ni DELIVERED. QA incompleto impide cierre salvo excepción aprobada y trazable.

Historias asociadas: HU-017, HU-018, HU-029, HU-030.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P12 - Motor documental PDF y QR

**Fase:** 5. **Dependencias:** P09. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/05-vouchers-documentos.md`
- `contracts/voucher-rules.json`
- `contracts/openapi.yaml`

### Objetivo y alcance

Documentos lógicos, snapshots, templates versionados, jobs/render/storage privado y visor. Incluir voucher de recepción y de pago elegible; pago se conecta en P13/P14.

### Entregable esperado

Servidor produce representación autorizada; copia y nuevo formato no crean hechos.

### Criterios especiales

Unicidad por tenant/tipo/evento/versión. PDF fallido no duplica recepción. QR no abre ficha privada pública.

Historias asociadas: HU-034.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P13 - Motor de pagos y abonos

**Fase:** 6. **Dependencias:** P09. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/05-vouchers-documentos.md`
- `contracts/voucher-rules.json`
- `contracts/openapi.yaml`

### Objetivo y alcance

Obligaciones, movimientos, asignaciones, saldo exacto, reversas y recibos. BREB/NEQUI/TRANSFER/CASH. Libro independiente de SaaS.

### Entregable esperado

Transacciones y cálculo exacto, locks/versiones e idempotencia.

### Criterios especiales

Reporte no reduce saldo. Sobrepago D07 bloqueado. Abonos existen aunque voucher parcial D06 siga sin aprobar.

Historias asociadas: HU-022.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P14 - Reportar, verificar y cobrar

**Fase:** 6. **Dependencias:** P13. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/05-vouchers-documentos.md`
- `contracts/voucher-rules.json`
- `contracts/openapi.yaml`

### Objetivo y alcance

Cliente reporta; staff autorizado verifica; efectivo recibe/aplica/cambio. Integrar operation_id, conciliación tras timeout y documento elegible.

### Entregable esperado

UI de pago por rol y resultados verificables.

### Criterios especiales

Asesor/Técnico necesitan delegación para dinero. Doble aprobación concurrente no duplica ni sobreasigna.

Historias asociadas: HU-019, HU-020, HU-021, HU-035.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P15 - Inventario transaccional

**Fase:** 7. **Dependencias:** P09. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Catálogo, movimientos, reserva, consumo por OT, liberación y ajustes trazables.

### Entregable esperado

Stock derivado y reserva/consumo atómicos.

### Criterios especiales

Reintentar consumo no descuenta dos veces; dos operaciones compiten por una unidad sin stock negativo.

Historias asociadas: HU-027.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P16 - Venta y devolución vinculada

**Fase:** 7. **Dependencias:** P14, P15. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Venta, ítems, precios, descuentos autorizados, pago reutilizado y movimiento de stock. Cancelación no implica automáticamente devolución bancaria.

### Entregable esperado

POS y venta asistida con recibo existente imprimible.

### Criterios especiales

Inventario se descuenta una vez; original preservado; descuento y reversa dependen de permiso.

Historias asociadas: HU-028.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P17 - WhatsApp básico

**Fase:** 8. **Dependencias:** P07, P09. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Enlace por comercio, variables permitidas, plantillas y contexto de OT para todos los planes.

### Entregable esperado

Acción abrir/copiar mensaje; registro de intención.

### Criterios especiales

No mostrar Enviado/Leído por abrir el enlace. No filtrar notas internas en texto.

Historias asociadas: HU-032.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P18 - Eventos, chat y notificaciones

**Fase:** 8. **Dependencias:** P09. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Outbox/consumers, chat por OT, audiencia pública/interna, IDs estables y reintentos por canal.

### Entregable esperado

Conversaciones y jobs observables con fallos aislados.

### Criterios especiales

Consumer repetido no duplica mensajes. Fallo de WhatsApp/PDF no revierte pago confirmado.

Historias asociadas: HU-031.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P19 - Ciclos de suscripción

**Fase:** 9. **Dependencias:** P04. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Planes versionados, ciclos, cargos y pagos SaaS separados. Gracia/ancla/pago tardío configurables; no hardcodear precio o fecha sin D02/D03.

### Entregable esperado

Modelo de calendario y jobs idempotentes en ensayo.

### Criterios especiales

Fin de mes y reintento del job no duplican cargo. Pago a comercio no paga mensualidad.

Historias asociadas: HU-036.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P20 - Suspensión y reactivación

**Fase:** 9. **Dependencias:** P19. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Guard server-side por operación; whitelist pago SaaS/soporte y política D08. Cortesía auditada del Maestro.

### Entregable esperado

Suspensión real de mutaciones ordinarias y reactivación controlada.

### Criterios especiales

No borrar datos ni registrar ingreso por cortesía. Webhook legítimo tardío se concilia como hecho, no se pierde.

Historias asociadas: HU-037.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P21 - Estadísticas y exportaciones

**Fase:** 10. **Dependencias:** P14, P16, P20. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

KPIs definidos, separación ventas/cobros/abonos, exportes privados y estados de datos parciales.

### Entregable esperado

Dashboards por tenant y Maestro con fórmulas documentadas.

### Criterios especiales

Sin costos suficientes no inventar utilidad; exporte no mezcla tenants.

Historias asociadas: HU-040.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P22 - Auditoría y trazabilidad integral

**Fase:** 10. **Dependencias:** P04, P14, P20, P28. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Verificar y completar audit hooks de fases anteriores; actor, motivo, recurso, diff redactado y operación.

### Entregable esperado

Mapa auditable recepción-pago-voucher-entrega-suscripción.

### Criterios especiales

No permitir borrar audit log desde UI ni convertir print requested en impresión física probada.

Historias asociadas: HU-041.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P23 - PWA e instalación segura

**Fase:** 10. **Dependencias:** P07, P27. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/04-ux-ui-y-resiliencia.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Manifest, instalabilidad, shell, actualización segura, permisos progresivos y borradores offline solo donde aprobados.

### Entregable esperado

PWA probada en dispositivos objetivo y fallback web.

### Criterios especiales

Cambio de cuenta/tenant limpia contexto. Ningún pago o QA definitivo se confirma offline.

Historias asociadas: HU-038.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P24 - Endurecimiento de seguridad

**Fase:** 10. **Dependencias:** P22, P23. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Revisar tenant escape, roles, CSRF/XSS/SSRF, uploads, secretos, firma webhooks si existen y sesiones.

### Entregable esperado

Hallazgos priorizados y correcciones con pruebas.

### Criterios especiales

No dar por aprobado por un scanner sin revisar; reportar capacidades no ensayadas.

Historias asociadas: transversal; ver backlog/stories.json.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P25 - Regresión E2E de release

**Fase:** 10. **Dependencias:** P11, P16, P17, P18, P20, P24, P28, P29. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Automatizar y ejecutar los recorridos y excepciones del paquete con dos tenants y cinco roles.

### Entregable esperado

Reporte real de comandos, escenarios, capturas y fallos; build revisado.

### Criterios especiales

Incluir vouchers, abonos, cierres/timeout, impresión cancelada, permisos de Asesor y suspensión.

Historias asociadas: transversal; ver backlog/stories.json.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P26 - Workspace completo del Asesor

**Fase:** 5. **Dependencias:** P03, P09. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

AS01-AS12: recepción, derivación, seguimiento, mensajes, agenda, reportes de pago y venta asistida. Componentes compartidos sin elevación de rol.

### Entregable esperado

Pantallas específicas y trazas de acción; caja delegada desactivada salvo ensayo autorizado.

### Criterios especiales

AS07.A3 y AS08.A2 no se habilitan por defecto. No alterar diagnóstico ni aprobar por cliente.

Historias asociadas: HU-014, HU-033.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P27 - Resiliencia y estados UX

**Fase:** 2. **Dependencias:** P03. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/04-ux-ui-y-resiliencia.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

AU01-AU06; skeleton, vacío, error, sesión, conflicto, operation status y recuperación. Aplicar perfiles por acción.

### Entregable esperado

Componentes compartidos y pruebas de cierres/reauth/resultado incierto.

### Criterios especiales

No prometer recuperar lo no persistido. Probar callback tardío y cambio de identidad.

Historias asociadas: HU-004, HU-026.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P28 - Vouchers imprimibles integrados

**Fase:** 6. **Dependencias:** P12, P14, P26. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/05-vouchers-documentos.md`
- `contracts/voucher-rules.json`
- `contracts/openapi.yaml`

### Objetivo y alcance

VR01-VR04 y A4 agregadas. Recepción/pago con snapshot, permisos, descarga y print intent; Carta/A4/80mm de referencia D12.

### Entregable esperado

Voucher final y de recepción conectados; abono como capacidad pendiente D06.

### Criterios especiales

afterprint no es exito físico. Reimpresión conserva IDs/saldo; cambio de slug no rompe acceso.

Historias asociadas: HU-013, HU-023, HU-024, HU-025.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P29 - Trazabilidad y pruebas de contratos

**Fase:** 10. **Dependencias:** P11, P16, P20, P28. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Mapear historias a 118 vistas/363 acciones, comparar API con contratos y formalizar tests críticos.

### Entregable esperado

Cobertura revisada, contratos actualizados y lista honesta de pruebas faltantes.

### Criterios especiales

No confundir la validación documental con ejecución de Gherkin o E2E real.

Historias asociadas: HU-043.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P30 - Integraciones avanzadas opcionales

**Fase:** 12. **Dependencias:** P25. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Solo con D10 aprobado: investigar capacidades actuales, sandbox, webhooks y credenciales por comercio; separar suscripción y pagos.

### Entregable esperado

Adaptador escogido, tests de firma/replay/importe y degradación controlada.

### Criterios especiales

No prometer recurrencia Wompi/Bold sin verificación específica. No cobrar en producción sin autorización.

Historias asociadas: transversal; ver backlog/stories.json.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.

## P31 - Preparación del piloto

**Fase:** 11. **Dependencias:** P25. **Estado:** planificado, no ejecutado.

### Instrucción para Codex

Actúa sobre el repositorio real de NAOSIQ. Lee las instrucciones AGENTS.md aplicables y revisa primero el estado del repo. No supongas que los PDFs equivalen a código ni que una pantalla ya está implementada.

Lee solamente el contexto relevante:

- `docs/00-control-documental.md`
- `docs/DECISIONS.md`
- `contracts/rbac.json`
- `docs/02-flujos-reglas-y-permisos.md`
- `contracts/screens-actions.json`

### Objetivo y alcance

Preparar migración, backup/restore, monitoreo, soporte, políticas aprobadas y pruebas con impresora real.

### Entregable esperado

Checklist go/no-go, responsables y pendientes documentados; no desplegar sin confirmación.

### Criterios especiales

D02/D03/D04/D08/D11/D12/D13 resueltos donde afectan producción. Evidencia física de voucher.

Historias asociadas: HU-042, HU-044.

### Procedimiento

1. Identifica componentes, contratos y comandos reales; reporta decisiones abiertas que bloqueen esta tarea.
2. Propón cambios acotados y respeta IDs de pantallas/acciones. No reescribas módulos ajenos.
3. Implementa solo este alcance después del control de cambios correspondiente. Si una decisión comercial no está aprobada, conserva flag desactivado o declara el bloqueo, sin inventar valores.
4. Añade pruebas positivas y negativas: tenant, permiso, versión, idempotencia, tiempo y recuperación según riesgo.
5. Ejecuta las verificaciones disponibles en el repo; distingue ejecutado, fallido, omitido y no disponible.
6. Entrega resumen de archivos/diff, pruebas con salida, decisiones, riesgos, estado de historias y siguiente tarea. Actualiza TASK_LOG.md cuando la tarea autorice escrituras.

### Reglas no negociables

Cinco roles incluido ADVISOR. CRM Maestro controla todo con auditoría. No mezclar pagos del cliente con suscripciones SaaS. Básico mantiene Bre-B, Nequi, transferencia, efectivo y WhatsApp. Solicitud no implica recepción; reporte no implica pago; pagar no implica entrega. Reimpresión no crea dinero. Timeout no demuestra rollback. No introducir secretos, acceso cross-tenant ni datos reales del cliente en tests.

### Fuera de alcance

No contratar servicios, cobrar, enviar mensajes reales, desplegar a producción o borrar datos sin autorización expresa. No marcar listo lo que solo fue simulado. No ejecutar todas las fases a la vez.
