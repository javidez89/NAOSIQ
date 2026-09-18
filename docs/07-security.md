# 07. Seguridad, privacidad y pentest

## Principios y estado

Se propone OWASP ASVS como catálogo de controles, con nivel 2 como objetivo del
producto según análisis de riesgo. No se declara conformidad ASVS ni auditoría
independiente. Las reglas SQL existentes necesitan prueba real. El paquete
contiene controles y un plan, no un certificado de seguridad.

## Modelo inicial de amenazas

| Amenaza | Activo / caso | Control existente o previsto | Evidencia necesaria |
|---|---|---|---|
| Suplantación | Sesión, OAuth, MFA | Auth proveedor, validación servidor, MFA privilegiado | E2E OAuth/refresh/revocación |
| Manipulación | Monto, estado, tenant | SQL con permisos, validación, FKs y versión | pgTAP + concurrencia |
| Repudio | Confirmación y cambio de rol | Auditoría de comandos | Revisar integridad y acceso a logs |
| Divulgación | Datos de otro negocio, vouchers | RLS, consulta propia, no-store | Pruebas A/B y caché CDN |
| Denegación de servicio | RPC, PDFs, login | Límites de forma y resultado; cuotas pendientes | Rate limit efectivo también en API directa |
| Elevación | Super Usuario / roles financieros | Tabla privada, MFA, sin user_metadata | Pruebas de escalamiento |
| Cadena de suministro | Dependencias y CI | Versiones, lock real, SHA, revisión | SCA/SAST/secret scanning |
| Archivos maliciosos | Fotos/documentos futuros | Upload deshabilitado por ahora | Cuarentena, validación real y AV antes de habilitar |

## Controles presentes en código

RLS en las tablas de la aplicación, permisos SELECT explícitos, sin escrituras
directas del rol authenticated, comandos con autorización, transacciones,
idempotencia de pagos, snapshots de vouchers, MFA por JWT en operaciones
privilegiadas, validación de origen en acciones, redirección restringida, CSP con
nonce y cabeceras básicas. CSP conserva unsafe-inline para estilos: no presentarla
como una política completamente estricta en todos los recursos.

Ninguno de esos controles se considera probado E2E hasta ejecutar su evidencia.
El frontend no usa claves secretas para saltar RLS. No se embebe HTML arbitrario
en PDFs ni se descargan URLs que el cliente suministre para generarlos.

## Bloqueadores de seguridad previos al piloto

Rate limiting distribuido y cuotas deben cubrir también RPC/Data API, no solo
Next.js. Falta probar cierre de sesión y revocación estricta: JWT válido puede
seguir vigente hasta expirar, aunque la app consulte membresías actuales. Definir
validación de sesión viva/step-up reciente para operaciones de alto riesgo y
probar JWT AAL2 antiguo tras retirar un factor. No afirmar revocación instantánea
de todos los tokens por borrar o cerrar una cuenta.

Falta recuperar/rotar MFA sin bypass; auditar lecturas privilegiadas, exportaciones
masivas y soporte; escaneo de secretos completo; SAST; análisis del contenedor;
configurar Auth contra abuso; hardening de invitaciones; alertas de anomalías;
control de costes; revisar cabeceras y CSP con el build real.

Los logs SQL de aplicación son inmutables para usuarios ordinarios porque no tienen
permisos de escritura. **No son inmutables frente al administrador de base de
datos**. Una exigencia de evidencia resistente a administradores requerirá
almacenamiento externo, controles de acceso y retención independiente.

## Plan de pentest autorizado

Antes: autorización escrita, dominios/IP de staging propios, dos tenants
sintéticos, cuentas por rol, responsable de parada, franja operativa y límites
de carga. Excluir pagos reales, mensajes a clientes y sistemas de terceros.
Acordar tratamiento y eliminación de evidencias. No realizar DoS ni operaciones
destructivas sin un alcance adicional específico.

Durante: revisar autenticación, sesiones/MFA, BOLA/IDOR, cambio de tenant,
autorización de funciones, mass assignment, SQLi, XSS, CSRF, redirecciones,
SSRF en integraciones futuras, exposición de secretos, race conditions,
idempotencia, fraude de conciliación, inyección en exportaciones y almacenamiento.
Probar llamadas a Supabase directamente y las rutas Next; proteger solo la web
no es suficiente. Las pruebas de archivos y webhooks esperan su implementación.

Después: informe reproducible, alcance/exclusiones, severidad y efecto en negocio,
propietario de cada hallazgo, corrección, retest y riesgo residual aceptado. Un
hallazgo de acceso cruzado o confirmación no autorizada bloquea el release.

El script de ZAP es baseline pasivo y conserva códigos de advertencia/error. No
es un pentest autenticado ni una autorización para escanear cualquier dominio.
El evaluador independiente debe conocer las reglas de negocio, no solo ejecutar
un scanner. No se realizó ningún ataque externo al producir esta entrega.

## Privacidad colombiana

Revisar la Ley 1581 de 2012 y demás normas aplicables con asesoría competente.
Definir responsable/encargado por cada tratamiento, finalidades, autorizaciones,
política de privacidad, atención de derechos, proveedores y transferencias,
retención y eliminación. Un consentimiento genérico no autoriza cualquier uso.
No se fija un plazo legal de retención sin analizar los datos y obligaciones.
Minimizar nombres/teléfonos/fotos, ocultar identificadores sensibles y prohibir
copias de datos reales en QA. Ver fuentes oficiales en 14-sources.
