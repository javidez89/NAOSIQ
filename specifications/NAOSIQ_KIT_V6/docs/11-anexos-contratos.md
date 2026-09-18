> Base funcional heredada de v5. Presentación NAOSIQ v6. Para identidad visual prevalecen BRAND_MIGRATION.md y el manual recibido.

# Anexos técnicos de contratos

**Diseño lógico propuesto. No son migraciones ejecutadas ni endpoints disponibles.**

## Diccionario de datos

| Entidad | Campos mínimos | Regla / restricción |
| --- | --- | --- |
| organizations | id, name, status, settings_version | Tenant root; unique(id) |
| users | id, auth_subject, display_name | Identity only, not global customer list; unique(auth_subject) |
| organization_members | organization_id, user_id, role, status, version | No client-controlled roles; tenant FK; unique active membership policy |
| permission_grants | organization_id, user_id, permission, scope, granted_by, expires_at | Delegation auditable; foreign key membership |
| customers | id, organization_id, linked_user_id, name, contact | Business-specific relationship; unique(id,organization_id) |
| devices | id, organization_id, customer_id, type, brand, model, identifier | No global disclosure via serial search; composite customer FK |
| service_orders | id, organization_id, customer_id, device_id, number, repair_status, custody_status, version | No boolean paid; unique(org,number); tenant FKs |
| intake_events | id, organization_id, order_id, received_at, actor_id, condition, accessories, operation_id | Physical custody source; unique(org,operation_id) |
| order_history | id, organization_id, order_id, event_id, previous, current, actor_id | Append-only audit of domain; unique(event_id) |
| assignments | id, organization_id, order_id, member_id, scope, active | Assignment narrows visibility; tenant member FK |
| diagnostics | id, organization_id, order_id, findings, proposed_solution, version | Technician evidence; tenant order FK |
| quotes | id, organization_id, order_id, version, status, expires_at, total_minor, currency | Published version immutable; unique(org,order_id,version) |
| quote_items | id, organization_id, quote_id, description, quantity, unit_price_minor | Amount exact; tenant quote FK |
| quote_responses | id, organization_id, quote_id, quote_version, response, actor_id, responded_at | Customer action evidence; one final response per quote version |
| qa_runs | id, organization_id, order_id, checklist_version, result, actor_id | Required items before pass; tenant order FK |
| qa_answers | id, organization_id, qa_run_id, item_id, answer, reason | No applicable needs reason; unique(run,item) |
| delivery_events | id, organization_id, order_id, receiver, actor_id, delivered_at, operation_id | Not derived from payment; unique(org,operation_id) |
| obligations | id, organization_id, source_type, source_id, total_minor, currency, version | Repair or sale debt; one obligation per source/version policy |
| payments | id, organization_id, obligation_id, method, amount_minor, currency, state, reference, confirmed_by | No SaaS rows; unique(org,idempotent_source) |
| payment_allocations | id, organization_id, payment_id, obligation_id, amount_minor | Confirmed money allocation; unique(payment,obligation) |
| adjustments | id, organization_id, original_payment_id, amount_minor, kind, reason, actor_id | No overwrite/delete historical money; reference original confirmed payment |
| receipts | id, organization_id, payment_id, number, snapshot | Logical receipt reused by voucher; unique(org,payment_id) |
| products | id, organization_id, sku, name, price_minor, cost_minor, active | Stock is movement projection; unique(org,sku) |
| stock_movements | id, organization_id, product_id, quantity_delta, source_type, source_id, operation_id | Append-only stock effect; unique(org,source_type,source_id,event_kind) |
| reservations | id, organization_id, product_id, source_id, quantity, expires_at, state | Atomic available stock; tenant source/product FKs |
| sales | id, organization_id, customer_id, status, total_minor, version | Confirmation distinct from payment; tenant customer optional |
| sale_items | id, organization_id, sale_id, product_id, quantity, unit_price_minor | Snapshot current price at commitment; tenant sale/product FKs |
| plans | id, version, name, status, price_minor, limits | Draft/null prices until approval; unique(id,version) |
| subscriptions | id, organization_id, plan_id, state, period_start, period_end, grace_end, version | Own SaaS access domain; unique active per organization policy |
| subscription_cycles | id, subscription_id, organization_id, starts_at, ends_at | Calendar policy approved; unique(subscription,starts_at) |
| subscription_charges | id, organization_id, cycle_id, amount_minor, currency, status | Not legal electronic invoice by default; unique(cycle_id) |
| subscription_payments | id, organization_id, charge_id, method, amount_minor, status | Platform payee only; unique(provider_or_manual_operation_ref) |
| documents | id, organization_id, document_type, source_event_id, version, snapshot, template_version, status | Snapshot excludes secrets; unique(org,type,source_event_id,version) |
| document_renders | id, organization_id, document_id, version, format, path, checksum, status | Private representation; unique(document_id,version,format) |
| document_jobs | id, organization_id, render_id, status, retry_count, last_error | No business effect on retry; unique active render job policy |
| operations | id, organization_id, actor_id, key, request_hash, status, resource_id, result | Recovery of write result; unique(org,actor_id,key) |
| outbox | event_id, organization_id, aggregate_id, type, payload, sent_at | Same business transaction; unique(event_id) |
| jobs | id, organization_id, kind, idempotency_ref, status | Nonblocking work; unique(kind,idempotency_ref) |
| drafts | id, organization_id, actor_id, resource_id, base_version, body, expires_at | ACK confirms persistence; optional local separate; tenant and actor scope |
| attachments | id, organization_id, owner_type, owner_id, path, mime, size, scan_state | Private signed access; tenant owner FK |
| messages | id, organization_id, conversation_id, audience, client_message_id, body, sender_id | Internal/customer audience explicit; unique(conversation,client_message_id) |
| notifications | id, organization_id, user_id, event_id, channel, state | No cross-tenant recipient leak; unique(user,event,channel) |
| tasks | id, organization_id, assigned_to, due_at, status, subject | Advisor scope; tenant member FK |
| support_cases | id, organization_id, creator_id, severity, status | Support context restricted; tenant or audited super scope |
| business_domains | id, organization_id, slug, host, canonical, verified | Central URL manager; unique(host,slug_or_domain) |
| organization_settings | organization_id, version, public_content, payment_instructions, print_profile | No raw secrets in public_content; unique(org,version) |
| audit_logs | id, organization_id, actor_id, action, resource_id, before_redacted, after_redacted, reason, at | Application append-only; no client update/delete grants |

## Endpoints nucleares tipados

| Operación | Método y ruta | Permiso |
| --- | --- | --- |
| getContext | GET /api/v1/context | session.self |
| createOrganization | POST /api/v1/master/organizations | platform.manage |
| createOrder | POST /api/v1/t/{organization_id}/orders | orders.create |
| getOrder | GET /api/v1/t/{organization_id}/orders/{order_id} | orders.read |
| confirmIntake | POST /api/v1/t/{organization_id}/orders/{order_id}/intake | orders.intake.confirm |
| respondQuote | POST /api/v1/t/{organization_id}/quotes/{quote_id}/response | quotes.respond.own |
| reportPayment | POST /api/v1/t/{organization_id}/payments/reports | payments.report |
| confirmCash | POST /api/v1/t/{organization_id}/payments/cash | payments.cash.confirm |
| getPayment | GET /api/v1/t/{organization_id}/payments/{payment_id} | payments.report |
| approvePayment | POST /api/v1/t/{organization_id}/payments/{payment_id}/approve | payments.confirm |
| rejectPayment | POST /api/v1/t/{organization_id}/payments/{payment_id}/reject | payments.confirm |
| getOperation | GET /api/v1/t/{organization_id}/operations/{operation_id} | session.self |
| requestDocument | POST /api/v1/t/{organization_id}/documents/requests | documents.request |
| getDocument | GET /api/v1/t/{organization_id}/documents/{document_id} | documents.read |
| requestDocumentRender | POST /api/v1/t/{organization_id}/documents/{document_id}/renders | documents.request |
| getDocumentJob | GET /api/v1/t/{organization_id}/document-jobs/{job_id} | documents.read |
| createDocumentLink | POST /api/v1/t/{organization_id}/documents/{document_id}/download-link | documents.read |
| recordPrintIntent | POST /api/v1/t/{organization_id}/documents/{document_id}/print-intents | documents.read |
| listOwnDocuments | GET /api/v1/t/{organization_id}/customer/documents | documents.read |
| confirmDelivery | POST /api/v1/t/{organization_id}/orders/{order_id}/delivery | orders.delivery.confirm |
| controlSubscription | POST /api/v1/master/subscriptions/{subscription_id}/actions | platform.manage |
| approveSaasPayment | POST /api/v1/master/saas-payments/{saas_payment_id}/approve | platform.manage |

## Casos de uso a expandir por fase

No se presentan como API ya implementada. Cada tarea concreta su schema y pruebas antes de publicar endpoints.

| Dominio | Casos de uso |
| --- | --- |
| organizations | list, get, update, assignUrl, verifyDomain |
| memberships | invite, changeRole, revoke, grantScopedPermission |
| orders | list, assign, transition, resolve, warrantyReentry |
| diagnostics | get, save, complete |
| quotes | create, publish, expire, list |
| qa | saveRun, confirmRun, rejectRun |
| inventory | createProduct, updateProduct, reserve, consume, release, adjust, listMovements |
| sales | createDraft, confirm, cancel, list, get |
| payments | list, requestAdjustment, recordReversal |
| messages | list, send, markRead |
| notifications | list, markRead, channelPreference |
| drafts | save, load, compare, discard |
| uploads | requestSignedUpload, finalize, authorizeDownload |
| saas | listPlans, createCycle, createCharge, listCharges, reportPayment, cancelAtPeriodEnd |
| reports | businessDashboard, masterDashboard, requestExport |
| support | create, reply, close |

## Eventos

| Evento | Dominio | Consecuencia |
| --- | --- | --- |
| ORGANIZATION_CREATED | organizations | organizational defaults/invitation pending |
| ORDER_CREATED | orders | initial document, no physical custody |
| ORDER_INTAKE_CONFIRMED | orders | intake voucher document |
| QUOTE_PUBLISHED | quotes | customer notice |
| QUOTE_APPROVED | quotes | enable authorized work |
| QUOTE_REJECTED | quotes | followup resolution |
| ORDER_COMPLETED | orders | payment due notice, not delivery |
| PAYMENT_REPORTED | payments | verification task; balance unchanged |
| PAYMENT_APPROVED | payments | allocation, receipt, voucher request |
| PAYMENT_ADJUSTED | payments | linked adjustment and updated balance |
| ORDER_DELIVERED | orders | delivery document |
| STOCK_MOVEMENT_CONFIRMED | inventory | stock projection |
| SALE_CONFIRMED | sales | sale document, stock consumption once |
| SUBSCRIPTION_SUSPENDED | saas | restrict mutations |
| SUBSCRIPTION_REACTIVATED | saas | restore permitted access |
| DOCUMENT_ISSUED | documents | render job |
| DOCUMENT_RENDER_FAILED | documents | retry UI and operations alert |
| DOCUMENT_PRINT_REQUESTED | documents | audit only; not printer success |
| MESSAGE_ACCEPTED | messages | channel adapter and delivery status |

## Errores canónicos

| Código | HTTP | Mensaje / recuperación |
| --- | --- | --- |
| AUTH_REQUIRED | 401 | Tu sesion finalizo. Inicia sesion para continuar. REAUTHENTICATE |
| ACCESS_DENIED | 403 | No tienes acceso a esta accion o documento. RETURN_SAFE_CONTEXT |
| RESOURCE_NOT_AVAILABLE | 404 | Este recurso no esta disponible. RETURN_TO_LIST |
| SUBSCRIPTION_SUSPENDED | 403 | El servicio del comercio esta suspendido. Revisa el plan o contacta al administrador. OPEN_SUBSCRIPTION_OR_SUPPORT |
| VALIDATION_FAILED | 422 | Revisa los campos resaltados antes de continuar. FIX_FIELDS |
| VERSION_CONFLICT | 409 | El registro cambio. Compara la version actual antes de guardar. COMPARE_VERSIONS |
| IDEMPOTENCY_KEY_REUSED | 409 | Esta referencia corresponde a otra solicitud. Revisa la operacion original. QUERY_ORIGINAL_OPERATION |
| OPERATION_RESULT_UNKNOWN | 202 | Estamos verificando el resultado. No repitas la operacion. POLL_OR_RECONCILE_ORIGINAL |
| PAYMENT_DUPLICATE | 409 | Este pago ya fue registrado o requiere revisar una coincidencia. OPEN_EXISTING_PAYMENT |
| AMOUNT_EXCEEDS_BALANCE | 422 | El valor supera el saldo pendiente. Revisa el importe. REFRESH_BALANCE |
| PAYMENT_NOT_VERIFIED | 409 | Tu pago sigue pendiente de verificacion. OPEN_PAYMENT_STATUS |
| INSUFFICIENT_STOCK | 409 | No hay existencias suficientes. Actualiza los productos. REFRESH_STOCK |
| INVALID_TRANSITION | 409 | La orden no puede pasar a ese estado desde su situacion actual. VIEW_ALLOWED_TRANSITIONS |
| QUOTE_NOT_CURRENT | 409 | Esta cotizacion vencio o fue reemplazada. Revisa la version vigente. OPEN_CURRENT_QUOTE |
| QA_INCOMPLETE | 422 | Completa las pruebas obligatorias antes de finalizar. OPEN_QA |
| SOURCE_FACT_NOT_CONFIRMED | 409 | El taller aun no ha confirmado la recepcion o el pago. OPEN_SOURCE_STATUS |
| DOCUMENT_PENDING | 202 | Estamos preparando el voucher. Puedes consultar su estado. POLL_DOCUMENT_JOB |
| DOCUMENT_RENDER_FAILED | 503 | El registro esta confirmado; no pudimos preparar el voucher. RETRY_RENDER_ONLY |
| DOCUMENT_LINK_EXPIRED | 410 | Inicia sesion o solicita un enlace nuevo para el documento. AUTHORIZE_NEW_LINK |
| DOCUMENT_ADJUSTED | 200 | Este documento tiene un ajuste asociado. OPEN_ADJUSTMENT |
| PRINT_DIALOG_CLOSED | 200 | La vista de impresion se cerro. El voucher sigue disponible. NONE |
| UPLOAD_REJECTED | 422 | El archivo no cumple el tipo o tamano permitido. SELECT_ALLOWED_FILE |
| NETWORK_UNAVAILABLE | 0 | Sin conexion. Consulta el ultimo guardado y retoma cuando vuelva la red. RECONNECT_WITHOUT_REPLAY |
| RATE_LIMITED | 429 | Hay demasiadas solicitudes. Espera antes de intentar de nuevo. WAIT_RETRY_AFTER |
| INTERNAL_ERROR | 500 | No pudimos completar la solicitud. Conserva el codigo de soporte. QUERY_OPERATION_BEFORE_RETRY |

HTTP 0 es un estado local de red, no un status de respuesta. Los códigos 200/202 de cierre de impresión o documento pendiente son estados informativos, no fallos que deban mostrarse en rojo.
