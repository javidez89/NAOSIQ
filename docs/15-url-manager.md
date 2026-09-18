# URL Manager central — P05

`tenant_routes` conserva una única ruta primaria por comercio y mantiene cada slug
anterior como redirección al slug actual. La asignación sólo está disponible para el
Super Usuario con MFA; el Administrador del comercio no puede modificar la URL
estructural.

`assign_tenant_slug` exige versión y clave idempotente. Primero reserva el slug global
solicitado y sólo después reemplaza la ruta primaria dentro de la misma transacción.
Así, ante dos solicitudes por el mismo slug, una gana y la otra recibe conflicto sin
cambiar su tenant. Repetir la solicitud original devuelve la versión registrada;
reusar su clave con otra carga produce conflicto.

La vista SU09 permite comprobar disponibilidad y asignar slugs. Muestra las rutas
primarias y sus redirecciones. La verificación de dominio propio/DNS continúa
deshabilitada: no hay proveedor ni configuración aprobada y D14 sigue abierto.

Los comprobantes se consultan por `/.../t/:tenantId/vouchers/:voucherId`; no dependen
del slug reutilizable. La aplicación HTTP de la redirección pública se conectará al
micrositio de P07. Evidencia ejecutable: `reports/local/p05/url-manager.json` y
`supabase/tests/database/tenant_routes.test.sql`.
