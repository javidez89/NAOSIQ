# 10. Producto y gestión del proyecto

## Resultado buscado

Que un comercio reciba un equipo, conozca quién lo atiende, mantenga al cliente
informado y registre dinero de forma trazable, mientras el propietario del SaaS
controla comercios y suscripciones. El MVP no es "todas las pantallas posibles";
es un flujo completo, seguro y medible con alcance aprobado.

## Backlog priorizado

| Épica | Entregable | Prioridad | Dependencia / criterio de aceptación |
|---|---|---|---|
| E00 | Bootstrap verificable y requisitos | P0 | Lock, migración real, build y pruebas; decisiones abiertas visibles |
| E01 | Identidad, aislamiento y MFA | P0 | A/B, revocación, recuperación e invitaciones verificadas |
| E02 | CRM maestro completo del MVP | P0 | Alta, suspensión, plan/vigencia, auditoría; sin SQL manual diario |
| E03 | Recepción y reparación | P0 | CRUD autorizado, asignación, historial y voucher correcto |
| E04 | Presupuesto, abonos y conciliación | P0 | Saldo correcto, doble envío, moneda, caja, pruebas concurrentes |
| E05 | Portal del cliente | P0 | Alta consentida, seguimiento propio y ambos vouchers |
| E06 | WhatsApp operativo | P1 | Consentimiento, templates, eventos, worker, deduplicación y estados |
| E07 | Archivos y evidencias | P1 | Cuarentena, AV, permisos, límites, borrado y backups |
| E08 | Inventario y ventas | P1 | Movimientos, reservas y devoluciones; nunca stock negativo accidental |
| E09 | Cobro SaaS y pasarela | P1 | Cuenta por comercio, webhooks verificados y separación financiera |
| E10 | Páginas, URLs y PWA | P1 | Identidad correcta, publicación segura, instalación y revocación |
| E11 | Calidad, seguridad y operación | Transversal P0 | CI, pentest, observabilidad, backup/restore y soporte |

P0/P1 son propuestas de ejecución, no nuevas aprobaciones comerciales. Las
capacidades comprometidas, por ejemplo WhatsApp en el plan Básico, no se eliminan
por posponer su implementación a otra fase. El MVP comercial debe cumplir la
promesa del plan que realmente se ofrezca.

## Historias iniciales con aceptación

TECHI-001, aislamiento: dado un usuario A, al cambiar tenant/ID en una solicitud,
no obtiene ni modifica datos B. Evidencia: API directa, SQL y UI.
TECHI-002, recepción: dado un Asesor autorizado, al recibir el equipo se crea una
sola orden y un voucher incluso ante reintento del mismo intento.
TECHI-003, seguimiento: dado un técnico asignado, al actualizar un estado permitido
con versión vigente se registra el evento; uno no asignado no puede hacerlo.
TECHI-004, dinero: dado un administrador con MFA y transferencia conciliada, la
confirmación produce exactamente un voucher del pago; una imagen subida sola no
lo confirma. TECHI-005, cliente: obtiene exclusivamente sus comprobantes.
TECHI-006, vencimiento: un comercio vencido no crea operaciones nuevas aunque
conserve una sesión válida. El comportamiento de lectura debe estar aprobado.

## Fases con puertas de salida

Fase 0: cerrar bootstrap y decisiones de producto; instalar, compilar, migrar,
probar y corregir la base. Fase 1: cerrar flujo vertical con UX de recepción,
técnico y cliente. Fase 2: presupuesto/pagos/abonos/conciliación y soporte.
Fase 3: WhatsApp, archivos, inventario y requisitos comerciales restantes.
Fase 4: hardening, integración, accesibilidad, pentest y restauración.
Fase 5: piloto limitado, observación y despliegue gradual.

No se asignan fechas ficticias ni se promete una entrega futura de trabajo
asíncrono. Estimar esfuerzo después de medir capacidad y cerrar alcance. Separar
tiempo de programación de aprobaciones OAuth/WhatsApp, contratos, revisión de marca
y disponibilidad de comercios piloto.

## Responsabilidades propuestas

Javier: propietario de decisiones de producto y priorización, con su experiencia
QA como apoyo. Arquitectura/desarrollo: diseño, implementación y mantenimiento.
QA: diseño de pruebas, evidencia y criterio de salida. UX: flujos, accesibilidad
y usabilidad. Seguridad independiente: pentest, revisión y riesgo residual.
Operación: cuentas, backups, secretos, alertas y respuesta.

Una persona puede cubrir varias funciones en la fase inicial, pero el autor no
se convierte en auditor independiente por cambiar de sombrero. La aceptación de
riesgos y producción debe tener un responsable humano. El asistente produce código,
propuestas y revisiones, no sustituye contratos ni una auditoría externa.

## Definition of Ready / Done

Ready: historia, rol, datos, escenario principal, errores, permiso, requisito
no funcional y dependencia definidos. Done: código revisado, tests ejecutados,
contratos/migraciones actualizados, UX revisada, logs sin PII, rollback probado
cuando aplique y evidencia asociada al SHA. "Funciona en mi equipo" no es Done.

Controlar cambios con issue, impacto, aprobación, implementación y retest. Medir
lead time, defectos escapados, recuperación y cumplimiento del flujo principal,
no solo cantidad de commits o pantallas.
