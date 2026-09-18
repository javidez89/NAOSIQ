# 06. Estrategia de calidad

## Calidad basada en riesgo

Prioridad máxima: aislamiento multi-negocio, escalamiento de privilegios,
confirmación financiera, unicidad de comprobantes y recuperación. Después:
exactitud funcional, sesión, rendimiento, accesibilidad y experiencia visual.
No usar un porcentaje de cobertura como sustituto de casos de negocio.

| Nivel | Herramienta / evidencia | Estado inicial |
|---|---|---|
| Dominio | TypeScript + Node Test Runner | Ejecutado, ver informe |
| SQL/permiso | pgTAP: roles, tenants, FKs y RPC | Escrito; pendiente de ejecutar |
| Contrato | Tipos generados y diferencias SQL/dominio | Enlace tipado inicial pendiente |
| Navegador smoke | Playwright desktop y mobile | Escrito; no ejecutado aquí |
| E2E de negocio | Cuentas por rol y dos comercios | Pendiente de desarrollar |
| Accesibilidad | Teclado, lector, contraste, ampliación + análisis automático | Plan y criterios, sin certificación |
| Rendimiento | Pruebas de carga autorizadas | Plan, sin resultados |
| Seguridad | SAST/SCA/secret scan/DAST/pentest | SCA en plantilla; resto pendiente |
| Recuperación | Restore de base y objetos | Pendiente |

## Escenarios críticos de aceptación

QA-01: Admin A intenta consultar/modificar el ID de B desde UI, RPC y API directa.
Resultado: ningún dato B ni cambio; la evidencia no incluye datos reales.
QA-02: usuario cambia metadata a super_user. Resultado: sin nuevos privilegios.
QA-03: Asesor con MFA intenta confirmar o registrar pago. Resultado: denegado.
QA-04: técnico solicita orden ajena dentro de su mismo comercio. Denegado.
QA-05: cliente solicita voucher de otro cliente del mismo negocio. Denegado.
QA-06: dos cambios de estado con igual versión. Solo uno puede modificarla;
el otro debe refrescar, no sobreescribir silenciosamente.
QA-07: doble confirmación concurrente del mismo pago. Un movimiento confirmado
y un voucher. Probar concurrencia real, no solo dos llamadas secuenciales.
QA-08: misma clave idempotente con otro monto/orden. Rechazada.
QA-09: pago pendiente no aumenta ingreso confirmado ni genera voucher de pago.
QA-10: vence la suscripción mientras la sesión continúa. Se bloquea nueva escritura.
QA-11: se inactiva membresía. Se pierde acceso en la siguiente consulta autorizada.
QA-12: Google callback con estado/código incorrecto, retorno externo o sesión vieja.
Resultado: sin login falso ni redirección externa.
QA-13: renovación de cookies bajo CDN no entrega la sesión de A a B.
QA-14: descarga PDF propia, ajena, tras revocar rol y tras suspensión. Permisos
consistentes, sin caché compartida. Validar textos largos y varias páginas.
QA-15: backup restaurado conserva membresías, RLS, pagos y relaciones correctas.

## Matriz de datos y dispositivos

Dos comercios como mínimo, usuarios por cada rol, identidades inactivas, cliente
con dos órdenes, cliente sin órdenes, técnico sin asignación, importe mínimo/máximo,
texto Unicode, datos vacíos, ID inválido, hora límite de suscripción y duplicados.
Desktop 1366/1440, móvil 390/412 y zoom 200 %. Añadir Safari/iOS y Edge antes
el piloto; los dos proyectos Playwright actuales usan Chromium, no WebKit.

## Objetivos propuestos, no mediciones

Rutas de consulta habituales p95 <= 600 ms de servidor bajo la carga acordada;
LCP objetivo <= 2.5 s, CLS <= 0.1 en equipos/red representativos. Presupuesto de
consulta: página de 50 órdenes y sin listados infinitos. Medir con volumen
realista sintético, por ejemplo 20 comercios y 2000 órdenes por comercio; ajustar
al alcance comercial antes de contratar infraestructura. Aún no hay un benchmark.

La app limita resultados, pero no incluye paginación navegable completa: más de
50 órdenes, 100 clientes o 100 movimientos requieren esa historia antes del uso
habitual. No confundir un límite de seguridad/coste con un módulo de búsqueda.

## Salida de QA

Todos los casos P0 de aislamiento y dinero aprobados; ningún defecto crítico o
alto pendiente sin bloqueo; cero tests sensibles desactivados; verificación de
migración limpia y desde versión anterior; resultado de navegadores y PDF;
revisión de seguridad independiente y evidencia de restore. Un test fallido crea
un defecto reproducible, no se elimina para conseguir un pipeline verde.
