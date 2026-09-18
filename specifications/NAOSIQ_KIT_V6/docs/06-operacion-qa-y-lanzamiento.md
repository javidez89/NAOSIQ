> Base funcional heredada de v5. Presentación NAOSIQ v6. Para identidad visual prevalecen BRAND_MIGRATION.md y el manual recibido.

# Calidad, operación y lanzamiento

**Base: F2 pp. 8-9 y 13-14; F4 p. 8; F7 pp. 47-59; F9 p. 11. Los casos aquí descritos aún no son pruebas ejecutadas sobre una aplicación.**

## Definition of Ready

Historia con actor, resultado, límite de alcance, fuente, IDs de pantalla/acción, contrato y aceptación. Permisos y decisiones bloqueantes identificados. Datos ficticios preparados. Las integraciones conocen si operan con adaptador falso local, sandbox o proveedor real. Ninguna tarea de desarrollo presupone credenciales que no se entregaron.

## Definition of Done por historia

Criterios positivos y negativos cubiertos; autorización server-side y pertenencia; validación de estados; idempotencia si muta dinero, custodia, documentos, stock o mensajes; errores y recuperación visual; accesibilidad y responsive; auditoría; pruebas ejecutadas y resultados registrados; documentación actualizada; diff revisado. Si un comando no puede ejecutarse, reportarlo como no ejecutado, no como aprobado.

`python scripts/validate_pack.py` valida el paquete documental. No reemplaza lint, typecheck, unitarias, integración, E2E ni build de la aplicación. P01 debe crear/verificar los comandos reales del repo; `npm test` no existe por el hecho de aparecer en una guía.

## Estrategia de pruebas

| Nivel | Ejemplos |
| --- | --- |
| Unitario | Saldos exactos, elegibilidad de voucher, transiciones, calculadora de cambio, permisos, ancla de ciclo. |
| Integración | Constraints/transactions/RLS, uploads, workers, outbox, operación idempotente, storage privado. |
| API | 401/403/409/422, doble solicitud, manipulación de tenant, ownership y versión. |
| E2E | Comercio nuevo, recepción-voucher, presupuesto, QA, pagos-voucher, venta, suspensión y cortesía. |
| Seguridad | Escape de tenant, escalamiento de rol, documentos privados, SSRF de URL, XSS, CSRF y secretos. |
| UX | Foco, teclado, zoom, mensajes, timeouts, offline, reauth y recuperación tras cierre. |
| Operación | Cola fallida, proveedor caído, restore, deploy, rollover mensual y alertas. |
| Impresión | Carta/A4/80 mm, textos largos, cancelación, impresora real y consistencia del saldo impreso. |

## Datos de prueba mínimos

Dos comercios A/B; Super Usuario; administrador de cada comercio; Asesor sin caja y Asesor delegado de ensayo; técnico asignado/no asignado; dos clientes distintos. OT sin recibir, recibida, rechazada, completada, parcialmente pagada, pagada y entregada. Producto con una unidad para carrera de stock. Una suscripción en cada estado. Un PDF pendiente, uno listo y uno fallido. Todo ficticio, sin credenciales personales.

Los flujos de dinero usan COP 350.000 / 100.000 / 250.000 de F9; los mocks no se confunden con transacciones reales. Las condiciones propuestas no aprobadas se prueban como parámetros de ensayo, no como oferta al comercio.

## Casos críticos de no regresión

- Cliente A no lee OT ni voucher de cliente B; comercio A no obtiene datos del comercio B por API, realtime, buscador o PDF.
- Solicitud web no crea recepción física. Descargar OT inicial no habilita voucher de custodia.
- Reporte y soporte de pago no reducen saldo; solo confirmación autorizada aplica dinero.
- Dos aprobaciones simultáneas del mismo reporte no generan dos movimientos, recibos ni comprobantes.
- Timeout después del commit devuelve el resultado original al consultar; no exige pagar otra vez.
- PDF fallido y reimpresión no cambian pagos ni fecha de recepción.
- Descuento, reversa, entrega excepcional y caja delegada se validan en servidor, no solo con disabled.
- Aprobación de presupuesto expirado/versionado se rechaza sin sobrescribir una respuesta previa.
- Consumo de repuesto y venta concurrentes no llevan stock a negativo ni duplican salida.
- Suscripción suspendida bloquea operaciones ordinarias; reactivación respeta pago o cortesía con auditoría.
- Una nota interna nunca aparece en el portal o voucher del cliente.
- Reautenticación con otra identidad no recupera el borrador privado del usuario anterior.

## Evidencia por entrega

En TASK_LOG.md registrar tarea, commit/base, archivos, decisión aplicada, comandos, salida, capturas por pantalla, limitaciones y siguiente tarea. La evidencia de una prueba debe incluir qué se ejecutó y en qué entorno. Los escenarios Gherkin del paquete requieren step definitions futuras; no simular un runner verde por archivos de texto existentes.

## Entornos y secretos

Local y CI usan datos ficticios y adaptadores de prueba. Preview no puede enviar WhatsApp ni cobrar por accidente. Staging valida proveedor sandbox autorizado. Producción necesita responsables, contratos y parámetros aprobados. Secretos por entorno, nunca en Git, PDF, prompts o logs. `.env.example` contiene campos vacíos y es solo una plantilla a adaptar al stack confirmado.

Las sesiones o cookies de un entorno no deben dar acceso al otro. El Super Usuario de staging no se replica como identidad privilegiada de producción sin proceso explícito.

## Observabilidad

Correlation ID por petición, operation_id por mutación, event_id por evento y job_id por tarea. Log estructurado con dominio, organización cuando sea necesario y código de error, minimizando datos personales. Métricas de fallos, latencias, backlog de jobs, documentos pendientes y pagos en reconciliación. Nunca registrar tokens, comprobantes completos o PIN.

Una alerta técnica no informa al cliente que el pago falló si el resultado es incierto. El soporte debe poder consultar operación sin pedirle que repita el cobro.

## Backups, restauración y migraciones

Plan para base de datos y archivos privados. Ensayar restauración con referencias documento-storage válidas. Definir RPO/RTO después de conocer el servicio contratado; no prometer cifras heredadas como garantía. Migraciones con revisión, respaldo y compatibilidad. No resetear producción ni ejecutar comandos destructivos por conveniencia del agente.

## Puertas de salida

**Gate A / Foundation:** repo ejecutable, versiones fijadas, CI y manejo de errores. **Gate B / Seguridad:** tenant isolation probado y privilegios controlados. **Gate C / Operación:** recorrido cliente-Asesor-Técnico completo. **Gate D / Dinero y documentos:** abonos, idempotencia, recepción, vouchers y no duplicación. **Gate E / SaaS:** ciclo aprobado, suspensión y reactivación. **Gate F / Piloto:** backup/restore, hardware, políticas, monitoreo y aprobación humana.

## Go / no-go

No lanzar si hay fuga cross-tenant, privilegios escalables desde cliente, saldo incorrecto, dinero duplicado, vouchers de hechos no confirmados, falta de recuperación observable o secretos expuestos. No declarar producción por un build exitoso. Una capacidad opcional sin validar permanece desactivada y documentada. El propietario acepta los pendientes no críticos del piloto antes de activarlo.
