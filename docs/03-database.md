# 03. Datos, acceso y arranque

## Matriz base de permisos

| Operación | Super Usuario | Admin | Asesor | Técnico | Cliente |
|---|---|---|---|---|---|
| CRM maestro / alta / estado de negocios | Sí, MFA | No | No | No | No |
| Administrar membresías | Sí, MFA | Pendiente de delegación | No | No | No |
| Crear cliente/recibir equipo | Sí, MFA | Su negocio | Su negocio | No | Autorregistro pendiente |
| Ver reparaciones | Todos, MFA | Su negocio | Su negocio | Solo asignadas | Solo propias |
| Cambiar estado técnico | Sí, MFA | Su negocio | No | Solo asignadas | No |
| Asignar técnico | Sí, MFA | Su negocio | No | No | No |
| Registrar pago pendiente | Sí, MFA | Su negocio | No, por aprobar | No | No |
| Confirmar ingreso | Sí, MFA | Su negocio + MFA | No, por aprobar | No | No |
| Consultar pagos | Todos, MFA | Su negocio | No | No | Propios |
| Voucher recepción | Sí, MFA | Su negocio | Su negocio | No | Propios |
| Voucher pago | Sí, MFA | Su negocio | No | No | Propios |
| Auditoría de comandos | Todos, MFA | Su negocio | No | No | No |

El dominio TypeScript sirve a la UI y a pruebas, pero SQL es la autoridad. Un
mismo cambio debe actualizar ambas reglas y sus casos de contrato. No existe
un rol Super Usuario editable desde una membresía ordinaria.

## Modelo e invariantes

Los principales agregados son tenants, memberships, customers, repairs, payments,
vouchers, subscriptions, plans, repair_events y audit_events. Platform admins y
outbox viven en private. Fechas en timestamptz/UTC; representación al usuario con
zona explícita. Importes COP en unidades menores enteras; no float. El límite
inicial es 999999999999 unidades menores y debe revisarse al ampliar monedas.

Las referencias críticas usan `(tenant_id, id)`: un pago no puede apuntar a una
orden de otro negocio, ni una orden a un cliente de otro. Un cliente del portal
necesita identidad verificada y membresía; las cuentas de cliente no se vinculan
por una coincidencia de nombre o número telefónico. El linking inicial está
restringido al maestro y auditado.

No se guardan PAN, CVV, contraseñas de dispositivos, patrones de desbloqueo ni
archivos personales extraídos del equipo. Diseñar un flujo separado y consentimiento
explícito para necesidades excepcionales; no añadir un campo libre de secretos.
La base actual no tiene libros contables completos, presupuestos, impuestos,
notas de crédito, reembolsos ni cierre de caja. No inferir saldo a pagar sin un
presupuesto aprobado e historial de ajustes.

## Inicialización segura

1. `npm run bootstrap` resuelve dependencias y SHA reales con red disponible.
2. `npm run db:init` invoca la CLI fijada, consulta ayuda, genera config.toml y usa
   `supabase migration new foundation`. Las cuatro fuentes se combinan en una
   sola transacción. No se inventa una migración aplicada.
3. Revisar el config.toml generado: esquemas expuestos solo los necesarios,
   `private` nunca expuesto; acceso anónimo deshabilitado en Auth; URLs locales
   permitidas exactas; versión de PostgreSQL compatible con 17.
4. Iniciar Docker y `npm run db:start`. `npm run db:reset:local` borra y recrea
   exclusivamente el entorno local. Nunca sustituir --local por --linked.
5. `npm run test:db`; `npm run db:types`. Conectar el tipo Database generado al
   cliente Supabase y tipar los despachos RPC antes de liberar producción: el
   cliente inicial aún no tiene ese contrato generado enlazado.

## Primera cuenta Super Usuario

Desde Supabase Studio LOCAL cree un usuario sintético verificado. Copie su UUID.
En el editor SQL administrativo local ejecute, reemplazando el valor:

```sql
-- Solo bootstrap administrativo autorizado; no es una ruta pública.
insert into private.platform_admins(user_id)
values ('UUID-REAL-DEL-USUARIO-VERIFICADO');
```

El valor mostrado es un marcador, no un UUID ejecutable ni una cuenta creada.
Entre por `/login`, configure TOTP en `/app/security`, verifique el factor y abra
`/master`. Cree una segunda cuenta de administrador de comercio y aprovisione el
negocio con un período explícito. Las fechas del formulario maestro se introducen
en UTC. Use datos sintéticos, nunca clientes reales para este ejercicio.

En producción este bootstrap debe ser una operación controlada, con revisión y
registro externo. No permitir altas libres de platform_admins. Mantener un plan
de recuperación de acceso sin desactivar MFA para todos.

## Evolución del esquema

Crear una nueva migración para cada cambio. No editar la inicial ya aplicada ni
volver a copiar sus plantillas. Generar tipos y revisar diff. Aplicar primero a
base vacía local y luego a una copia sintética con la versión anterior. Probar
ambos recorridos. Los cambios productivos siguen expandir -> migrar datos ->
validar -> desplegar lectores/escritores compatibles -> contraer en otro release.
Un rollback de código no restaura una base ni revierte de forma segura todo DDL.

Las vistas futuras deben ser security invoker o privadas; revisar permisos de
columnas y RPCs. Revisar advisors de Supabase usando la CLI/API disponible y
adjuntar hallazgos, no solo afirmar que RLS está encendido. No modificar esquemas
internos de Realtime o Auth para resolver un error de nuestra aplicación.
