# Identidad, invitaciones y sesión — P03

## Adaptador elegido

Google se integra mediante Supabase Auth y el flujo PKCE de `@supabase/ssr`. La ruta
`/auth/callback` intercambia el código una sola vez, vuelve únicamente a una ruta del
portal que inició el acceso y comprueba la membresía actual antes de navegar. Un
callback cancelado, inválido o tardío no asigna membresías y no se presenta como
sesión iniciada.

El adaptador permanece desactivado en local hasta disponer de un cliente Google de
ensayo. Para habilitarlo se requieren, por separado:

1. Configurar el cliente de ensayo en `[auth.external.google]` de
   `supabase/config.toml` y mantener `skip_nonce_check = false`.
2. Definir `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` fuera del repositorio.
3. Registrar `http://127.0.0.1:54321/auth/v1/callback` en Google y
   `http://127.0.0.1:3000/auth/callback` en la lista de retornos de Supabase.
4. Activar `GOOGLE_AUTH_ENABLED=true` solo en el entorno configurado y reiniciar el
   servicio local.

No se solicitan tokens de Google para APIs adicionales y no se guardan tokens del
proveedor. La contraseña de Google nunca se captura en NAOSIQ.

## Hechos separados

`identity_invitations` registra la intención de invitar. `accept_identity_invitation`
registra que una identidad verificada aceptó una invitación dirigida a su correo.
`activate_invited_membership` crea o activa la membresía en una acción posterior del
Administrador o Super Usuario. Ninguno de los dos primeros hechos concede un rol.

La outbox registra una intención de entrega de invitación, pero no existe aún un
worker de correo y por ello la aplicación no afirma que el mensaje fue enviado. La
revocación de una invitación no revoca una membresía ya activada; esa acción se
gestiona explícitamente mediante la administración de membresías.

Cuando un Administrador vuelve a invitar al mismo correo, cualquier invitación
pendiente cuyo plazo ya terminó se materializa primero como `expired`, aumenta su
versión y registra al actor en auditoría. Esto libera la restricción de invitación
abierta sin borrar el hecho vencido ni permitir que el invitado lo reactive.

## Sesión y D04

Logout usa alcance local para cerrar solamente la sesión del portal actual. Las rutas
`/master/reauth`, `/comercio/reauth` y `/cliente/reauth` refrescan la sesión y vuelven
a comprobar identidad, portal y acceso. El retorno se limita al mismo portal.

Los valores propuestos de aviso, inactividad, duración absoluta y elevación siguen
sin aprobar en D04. El contrato `src/domain/session.ts` los conserva en `null`; no hay
temporizadores presentados como política productiva. MFA continúa siendo el mecanismo
real de elevación para las operaciones que ya lo exigen.

## Evidencia y límites

La base local prueba creación, idempotencia, aceptación, activación, revocación,
versión, expiración, auditoría y aislamiento A/B. El navegador prueba cancelación,
callback inválido/tardío, retorno seguro, refresh y logout. El login Google completo
requiere credenciales externas de ensayo y permanece pendiente.
