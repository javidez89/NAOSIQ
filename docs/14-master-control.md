# CRM Maestro y control explícito — P04

## Actor y contexto

El Super Usuario mantiene su identidad real. Para abrir `/master/t/:tenantId` debe
verificar MFA, seleccionar un comercio y registrar un motivo. El servidor crea un
`master_control_contexts` ligado a actor, tenant y clave idempotente; el navegador
recibe únicamente su UUID opaco en una cookie `HttpOnly`, `SameSite=Strict` y limitada
a `/master`.

La cookie no asigna una membresía ni cambia el usuario. Cada acceso vuelve a consultar
el contexto en PostgreSQL. Un contexto cerrado, perteneciente a otro actor o ligado a
otro comercio falla cerrado. La banda visible muestra `CONTROL TOTAL`, comercio y
actor real. Salir incrementa la versión, registra auditoría y elimina la cookie.

D04 continúa pendiente, así que no se inventa una duración numérica. La cookie es de
sesión y el registro sólo es reutilizable mientras coincidan sesión autenticada, MFA,
actor, comercio y contexto abierto.

## Alta recuperable

`provision_tenant_v2` crea una organización, membresía administrativa, suscripción de
prueba Básico y configuración en una transacción. `provision_request_id` permite
consultar el mismo resultado después de un timeout. Reusar la clave con datos distintos
genera conflicto. El RPC anterior sin idempotencia ya no es ejecutable por la API.

El alta usa una identidad ya verificada. La variante que invita a un administrador
nuevo sigue parcial: P03 ya separa invitación, aceptación y activación, pero P04 aún no
orquesta esos pasos en una sola alta reanudable.

## Cobertura SU01–SU20

SU01, SU02, SU04 y SU05 tienen recorridos locales completos. SU03 es parcial por el
administrador nuevo. Los módulos con lecturas reales muestran planes, suscripciones,
URLs, identidades y auditoría. SU10 permite crear invitaciones y administrar
membresías, manteniendo revocación global de sesiones pendiente. Las acciones que
dependen de prompts posteriores aparecen deshabilitadas con su ID, sin simular cobros,
mensajes, dominios, soporte o exportaciones.

La matriz ejecutable está en `reports/local/p04/master-control.json`.
