> Base funcional heredada de v5. Presentación NAOSIQ v6. Para identidad visual prevalecen BRAND_MIGRATION.md y el manual recibido.

# Arquitectura, datos y contratos de implementación

**Arquitectura base: F2 pp. 3-4, 7-8 y 14; F4; extensiones F7 p. 38 y F9 p. 10. Los contratos concretos V5 son propuestas para construir, no una base ya desplegada.**

## Decisión arquitectónica

Monolito modular antes que microservicios. Experiencias diferenciadas comparten un backend por casos de uso, una capa de autorización y contratos de dominio. Next.js, React y TypeScript son la base propuesta; PostgreSQL almacena datos transaccionales; object storage privado almacena archivos. Supabase y Vercel se conservan como opciones iniciales, sujetas a confirmar repositorio, entornos, región, planes y costos (D13).

No comenzar con exportación estática si se requieren mutaciones de servidor. No llamar integración a una pantalla que solo abre una aplicación externa. No ejecutar generación extensa de PDFs dentro de un render de React. Consultar documentación actual al elegir versiones y fijar un lockfile en P01.

## Capas y responsabilidades

| Capa | Responsabilidad | No debe hacer |
| --- | --- | --- |
| Presentación | Navegación por rol, formularios, estados, vista de impresión | Decidir roles o confirmar dinero sola. |
| API / Server Actions | Validar entrada, sesión, permiso y contrato; devolver ID de operación | Duplicar lógica financiera por cada portal. |
| Aplicación | Casos de uso y transacciones; guardas de estado | Confiar en importe o tenant aportados sin verificar. |
| Dominio | Estados, saldo, versionado, numeración, elegibilidad documental | Acoplarse al botón de una pantalla. |
| Persistencia | PostgreSQL, constraints, RLS/permisos, storage | Exponer secretos o datos privados por URLs públicas. |
| Workers | PDF, exportaciones, notificación, conciliación | Crear de nuevo el hecho al reintentar una representación. |
| Adaptadores | Google, WhatsApp, pagos opcionales | Mezclar cuentas SaaS y cuentas del comercio. |

La documentación oficial de Supabase distingue privilegios SQL y políticas RLS; los dos deben revisarse. Las claves secretas con capacidad de omitir RLS se mantienen exclusivamente en servidor [W4]. El rol Super Usuario de la aplicación no equivale a entregar una clave privilegiada al navegador.

## Estructura propuesta del repositorio

```text
AGENTS.md
START_HERE.md
SPEC_INDEX.md
docs/                 # Requisitos y decisiones vigentes
contracts/            # Modelos legibles por herramientas
design/               # Tokens y contratos visuales
prompts/              # Una tarea revisable por archivo
backlog/              # Historias y dependencias
tests/acceptance/     # Escenarios especificados, aun no automatizados
scripts/              # Validador documental del paquete
src/app/              # Rutas y layouts, a crear en P01
src/modules/          # Casos de uso por dominio, a crear
src/shared/           # Errores, operaciones, logging y auth, a crear
supabase/migrations/  # Si se adopta Supabase; migraciones futuras
```

`src/` y las migraciones no se entregan como producto simulado. Codex debe inspeccionar el repositorio real, respetar la estructura existente cuando sea compatible y justificar cualquier cambio. Si ya hay `AGENTS.md`, se fusionan sus instrucciones en lugar de reemplazarlas sin revisar.

## Modelo lógico de datos

| Grupo | Entidades | Invariantes |
| --- | --- | --- |
| Identidad | users, organizations, organization_members, permission_grants | Membresía activa y scope; SUPER_USER es privilegio global separado. |
| Clientes | customers, devices | Cliente contextual al comercio; no fusionar personas por coincidencia de teléfono. |
| Trabajo | service_orders, intake_events, order_history, assignments | Recepción real, responsable, versiones y pertenencia coherente. |
| Presupuesto | diagnostics, quotes, quote_items, quote_responses | Versión aprobada inmutable; no aceptar expiradas. |
| Calidad | qa_runs, qa_answers, delivery_events | Resultado verificable; entrega separada del pago. |
| Dinero comercio | obligations, payments, payment_allocations, adjustments, receipts | Saldo derivado, asignaciones únicas, reversas vinculadas. |
| Inventario | products, stock_movements, reservations, sales, sale_items | Nunca decrementar dos veces por el mismo consumo. |
| Dinero SaaS | plans, subscriptions, subscription_cycles, subscription_charges, subscription_payments | Sin referencias intercambiables con payments del comercio. |
| Documentos | documents, document_renders, document_jobs | Un documento lógico por hecho/tipo/versión; varios formatos. |
| Infraestructura | operations, outbox, jobs, drafts, attachments | Recuperación observable e idempotencia. |
| Relación | messages, notifications, tasks, support_cases | Audiencia y destinatarios autorizados; separar notas internas. |
| Gobierno | business_domains, organization_settings, audit_logs | URL única; actor real; cambios con trazabilidad. |

Los nombres de entidades que no existían en F2 son extensiones propuestas, detalladas en `contracts/data-dictionary.json`. No se incluyen migraciones peligrosamente incompletas. P02 debe crear las migraciones revisadas, los constraints y las pruebas con dos tenants antes de exponer endpoints.

## Claves, unicidad y relaciones

Cada entidad de negocio contiene `organization_id`. Las referencias entre entidades del comercio deben comprobar también el tenant: por ejemplo, no basta que exista `customer_id`; debe pertenecer al mismo negocio de la OT. Proponer claves foráneas compuestas cuando resulte apropiado.

Unicidades mínimas: slug canónico; membresía según diseño aprobado; número de documento por organización/tipo; recepción/evento único; documento por organización/tipo/evento/versión; render por documento/versión/formato; operación idempotente por alcance/actor/clave; mensaje por conversación/client_message_id.

Un serial o IMEI coincidente es señal para revisar, no autorización automática para revelar el dueño previo ni una unicidad global obligatoria. El índice de búsqueda no cambia la política de acceso.

## Convención de dinero y tiempo propuesta

API usa `currency: COP` y `amount_minor` como cadena de entero decimal no negativo, con escala 2. Ejemplo: COP 350.000 se representa como `35000000`. PostgreSQL usa entero de capacidad suficiente o decimal exacto según migración revisada; nunca suma dinero con coma flotante. UI muestra importes locales y no concatena cadenas para calcular saldos. Los números de la maqueta son ejemplos, no tarifas.

Guardar instantes en UTC y mostrar zona del comercio, inicialmente America/Bogota como propuesta regional. El ciclo mensual se calcula en la zona/configuración aprobada; los finales de mes, años bisiestos y pagos tardíos necesitan pruebas. No usar el reloj del navegador como autoridad de suscripción.

## Autorización por capas

Autenticación del servidor, contexto de organización, membresía/rol, permiso de acción, estado del servicio, pertenencia del recurso y política de base de datos. Aplicar estas validaciones en lecturas, mutaciones, trabajos, realtime y descargas. Elegir una ruta no concede acceso.

Super Usuario: entrada explícita a comercio, actor original, motivo en acciones sensibles y elevación cuando corresponda. Sus cambios respetan invariantes de contabilidad y custodia; puede autorizar excepciones soportadas y auditadas, no reescribir evidencia histórica.

## Contrato HTTP

Se entrega `contracts/openapi.yaml` como contrato propuesto 3.1. Los endpoints del recorrido crítico tienen modelos tipados; el catálogo complementario `api-catalog.json` identifica los demás casos de uso que Codex debe expandir durante cada fase. La existencia del contrato no implica que el servicio esté disponible.

| Convención | Comportamiento |
| --- | --- |
| Identidad | Sesión segura o token según adaptador validado; no confiar en un header de rol. |
| Mutación | `Idempotency-Key` estable y `expected_version` cuando exista entidad versionada. |
| Éxito | Recurso, versión y `operation_id`; 202 si se acepta un trabajo asíncrono. |
| Error | `code`, `message`, `correlation_id`, campos afectados y recuperación sin datos sensibles. |
| Conflicto | 409 para versión/clave incompatible; no sobrescribir. |
| Datos inválidos | 422 con validación localizada. |
| Denegación | 401 o 403; usar respuesta que no revele recursos de terceros. |
| Rate limit | 429 con espera e intención conservada. |

## Transacción de pago aprobada

1. Autorizar actor/negocio y comprobar si la clave ya tiene resultado.
2. Bloquear la obligación y validar versión, importe y estado del reporte.
3. Registrar aprobación y asignación; actualizar/proyectar saldo sin doble aplicación.
4. Crear recibo/documento lógico elegible y evento outbox dentro de la misma transacción.
5. Confirmar transacción; persistir resultado de operación.
6. Worker prepara PDF; su error no revierte el ingreso ya registrado.

La representación de voucher por abono depende de D06, pero el movimiento parcial confirmado nunca se omite del libro. La emisión final reutiliza el recibo asociado y no genera un segundo pago.

## Idempotencia, operaciones y jobs

La clave no es solo un botón desactivado: el servidor persiste scope, actor, clave, hash de solicitud y resultado. Misma clave y carga devuelve resultado; distinta carga con la misma clave produce conflicto. Las mutaciones inciertas se consultan con su identificador original y con el mismo alcance autorizado.

`operations` rastrea resultados de negocio; `jobs` rastrea representaciones/tareas. Un `job_id` fallido de PDF no quiere decir que `operation_id` de recepción falló. Outbox en la transacción evita perder la notificación tras un commit. Consumers deduplican por `event_id` y no presuponen orden perfecto ni entrega única.

La cancelación de espera del navegador no cancela necesariamente la transacción. Antes de repetir una acción financiera, reconciliar su resultado. Los TTL de claves y registros de auditoría se definen antes de activar limpieza automática.

## Storage y seguridad de documentos

Archivos privados, validación de tipo/tamaño, nombre seguro y asociación por tenant y recurso. Entregar enlace temporal solo después de autorizar usuario y documento. El QR no imprime tokens persistentes ni secretos. No guardar PIN, contraseñas del dispositivo ni notas internas en un voucher.

La URL pública del negocio puede cambiar; los documentos enlazan por identificador estable a un recurso autorizado. La vista pública consume una proyección explícita de datos publicables, nunca un SELECT completo al objeto del negocio/cliente.

## Integraciones

Google: validar flujo del proveedor y destino de retorno permitido; una invitación no es autenticación. WhatsApp básico: construir texto con variables permitidas y registrar apertura. Adaptador automático: enviar, deduplicar y observar entrega según capacidades contratadas. Pasarelas: firma/autenticidad del webhook, cuenta del comercio, moneda, importe, referencia y replay; no marcar aprobado por la página de regreso.

Los pagos básicos usan instrucciones y verificación del comercio; no se promete que leer un QR Bre-B o un comprobante Nequi permita conciliar automáticamente. Wompi/Bold, recurrencia y funcionalidades concretas requieren revisión actual del proveedor antes de P30. No almacenar PAN/CVV ni credenciales de terceros en el cliente.

## PWA y operación

Manifest, HTTPS, shell, instalación y permisos progresivos; compatibilidad se prueba en el navegador objetivo [W3]. El caché no mezcla organizaciones ni sesiones. Datos privados no se guardan persistentemente por defecto. Nota/QA offline son borradores con estado local explícito. Stock, pagos, aprobación, entrega y roles se confirman online.

Ambientes local, preview, pruebas y producción aislados. Logs con correlation ID y sin datos sensibles innecesarios. Backups de base y archivos, ensayo real de restauración, monitoreo de jobs y cola fallida. Deploy requiere migración revisada, compatibilidad temporal y plan de rollback o corrección; no ordenar resetear datos productivos para resolver un conflicto.

## Mapeo de solicitudes del cliente a la API propuesta

En v5, `orders.create` y `orders.read` cubren también al cliente, pero exclusivamente sus propias solicitudes dentro del comercio. El servidor deriva o verifica `customer_id` contra la identidad autenticada; nunca acepta que el cliente seleccione otra persona. La respuesta del portal del cliente excluye notas internas, costos del taller y datos de terceros. Este es un mapeo técnico propuesto para implementar el autoservicio ya descrito en F2, no una autorización de acceso general a las OT.
