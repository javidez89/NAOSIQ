# Implementación local P06–P31

Fecha de corte: 2026-09-17. Fuente contractual: `D:/NAOSIQ/NAOSIQ_KIT_V6/prompts` y los siete PDF inventariados en `docs/14-sources.md`.

## Contratos implementados

| Prompt | Resultado local |
| --- | --- |
| P06 | Onboarding reanudable de ocho pasos, snapshot versionado, finalización idempotente e invitación independiente del administrador. |
| P07 | Perfil público, catálogo y rutas por slug; editor de Comercio y proyecciones públicas sin datos privados. |
| P08 | Registro de equipos, historial y búsqueda por serial dentro del tenant, sin mezcla automática de duplicados. |
| P09 | Orden, recepción física, evidencia, custodia y asignación como hechos distintos. |
| P10 | Diagnóstico, cotización con revisiones, publicación, reemplazo, vigencia y respuesta idempotente del cliente. |
| P11 | Ejecuciones de QA, checks pass/fail/N/A, motivo obligatorio y retorno a reparación cuando falla. |
| P12 | Plantillas, snapshots inmutables y cola de render; generar otra representación no crea un hecho operativo. |
| P13–P14 | Obligaciones, ledger, asignaciones, saldo, pago idempotente y bloqueo de sobrepago; MFA para registrar dinero. |
| P15 | Movimientos de inventario transaccionales y stock/reserva no negativos. |
| P16 | Ventas e ítems separados; descuentos requieren actor autorizado y cancelar no afirma devolución bancaria. |
| P17–P18 | Plantillas, conversaciones, mensajes, outbox y consumidores idempotentes. Un enlace/intento no afirma entrega o lectura. |
| P19–P20 | Versiones de plan, ciclos, cargos y pagos SaaS separados; restricciones con rutas permitidas explícitas. |
| P21 | Vista de KPIs por tenant y trabajos de exportación privados. No calcula utilidad sin costos verificables. |
| P22 | Auditoría ampliada con motivo, recurso, operación y diff redactado. |
| P23 | Manifest, icono, service worker, shell sin conexión y bloqueo conceptual de operaciones definitivas offline. |
| P24 | Eventos de seguridad, rate limit transaccional, revocación sensible, RLS y funciones cerradas a la API. |
| P25 | Matriz y suites existentes preparadas para la regresión final; su ejecución se difirió hasta terminar implementación. |
| P26 | Cola de trabajo del Asesor sin autoridad financiera implícita. |
| P27 | Estados globales de carga/error/offline y recibos de operación para resultados ambiguos. |
| P28 | Comprobantes privados A4 y 80 mm; abrir/imprimir no registra éxito físico. |
| P29 | Este registro enlaza prompts, contratos, migraciones, pantallas y condición de aceptación. |
| P30 | Adaptadores modelados y desactivados. D10 sigue sin aprobación; no se transmiten datos a terceros. |
| P31 | Paquete de piloto local preparado con veredicto NO-GO mientras existan decisiones y validaciones externas abiertas. |

## Migraciones P06–P31

- `20260917024829_resumable_onboarding.sql`
- `20260917025107_public_microsite_catalog.sql`
- `20260917041927_customers_equipment_registry.sql`
- `20260917042031_order_evidence_and_equipment.sql`
- `20260917042129_diagnostics_and_quotes.sql`
- `20260917050000_operations_quality_documents.sql`
- `20260917050100_finance_inventory_sales.sql`
- `20260917050200_communications_billing_governance.sql`
- `20260917050300_security_advisor_resilience.sql`

## Condiciones que no se inventaron

D01–D14 conservan su estado en `docs/11-decisions.md`. No hay precio, gracia, pasarela, dominio, retención, región, SLA, proveedor de WhatsApp, credenciales Google ni autorización de datos reales aprobados. Por eso el producto permanece local, los adaptadores están desactivados y el piloto no puede declararse GO.

## Superficies nuevas

- `/master/onboarding/[draftId]`: onboarding reanudable.
- `/[slug]` y `/[slug]/[section]`: micrositio público.
- `/{portal}/t/[tenantId]/operations`: centro operativo consolidado.
- `/{portal}/t/[tenantId]/site`: editor del sitio público.
- `/offline`: recuperación PWA sin presentar datos en caché como confirmación actual.

La existencia de una superficie o contrato significa implementación local. La aceptación integral de las 118 pantallas y 363 acciones requiere la regresión P25 y la comparación visual final.
