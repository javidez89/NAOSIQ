# Cumplimiento NAOSIQ V6 — estado local

La solicitud del usuario incorpora todos los PDF y prompts de `D:/NAOSIQ/NAOSIQ_KIT_V6` como requisitos del producto local. No equivale a aprobar valores comerciales que el propio paquete deja pendientes. La guía original CRM TECHI ya no basta para aceptar el producto completo.

Inventario: 7 PDF (el integral reúne guía, recorridos y atlas), 36 prompts (P00–P31, BR00–BR03), 118 pantallas, 363 acciones y 32 recorridos. Se conservan todos sus IDs en `docs/naosiq-v6-coverage.json`. Estado pendiente por acción significa que NO se ha acreditado aceptación completa; una ruta existente no cuenta automáticamente como pantalla del contrato.

## Hallazgos y orden de trabajo

1. P09: separar creación de solicitud de recepción física; mantener originales, actor, instante, condición y accesorios. Corrección implementada y comprobada en esta entrega.
2. P01/P02/P03/P27 y BR01: completar base, sesiones, recuperación de operaciones y componentes NAOSIQ. Se conserva el stack local real y los nombres técnicos existentes.
3. P04–P08: completar Maestro, URLs, onboarding, configuración, micrositio, clientes y equipos.
4. P09–P12/P26: evidencias, cotización, respuesta del cliente, diagnóstico, QA, derivación y entrega. No inferir dinero ni custodia de un estado técnico.
5. P13/P14/P28: obligaciones, libro de movimientos, saldo, pago final elegible y representaciones Carta/A4/80 mm. El comprobante actual por cada ingreso aún difiere de D06.
6. P15–P18: inventario, ventas/devoluciones, WhatsApp por enlace y chat/outbox.
7. P19/P20: ciclos SaaS separados, suspensión y reactivación con reglas configurables. Sin tarifas/gracia inventadas.
8. P21–P25/P29/BR02/BR03: indicadores, auditoría, PWA, regresión de cada rol/acción/recorrido y comparación visual.
9. P30/P31: adaptadores opcionales y preparación de piloto. Proveedores, impresión física, políticas y publicación conservan sus condiciones explícitas y no se declaran probados localmente.

## Diferencias importantes aún abiertas

- Identidad NAOSIQ aplicada a las superficies existentes. Los 118 diseños todavía no están implementados/verificados integralmente.
- No hay eventos de entrega ni QA obligatorio; el estado técnico simplificado no cubre todas las máquinas del contrato.
- Sin obligaciones ni saldo, la aplicación no puede certificar pago final, impedir sobrepago o habilitar entrega por saldo.
- Se conservan comprobantes antiguos; no se inventan recepciones históricas al migrar.
- Google, evidencia privada, consentimientos, impresoras y proveedores externos no están validados.
- D01–D14 siguen abiertos donde no hay una decisión explícita del usuario. No activar capacidades bloqueadas por inferencia.

## Estado de los prompts

| ID | Alcance | Estado |
| --- | --- | --- |
| BR00 | Inspeccion y plan de marca | Parcial |
| BR01 | Tokens, tipografia y componentes | Verificado |
| BR02 | Vistas, co-branding y documentos | Parcial |
| BR03 | Regresion y publicacion controlada | Parcial |
| P00 | Auditoría y plan de arranque | Verificado |
| P01 | Foundation del repositorio | Verificado localmente |
| P02 | Modelo multiempresa y permisos | Verificado localmente |
| P03 | Google y ciclo de sesión | Parcial |
| P04 | CRM Maestro y control total | Parcial |
| P05 | URL Manager central | Pendiente |
| P06 | Onboarding reanudable | Pendiente |
| P07 | Micrositio y catálogo | Pendiente |
| P08 | Clientes y equipos | Parcial |
| P09 | Órdenes y recepción | Parcial |
| P10 | Diagnóstico y cotización | Pendiente |
| P11 | Reparación y QA | Parcial |
| P12 | Motor documental PDF y QR | Parcial |
| P13 | Motor de pagos y abonos | Parcial |
| P14 | Reportar, verificar y cobrar | Parcial |
| P15 | Inventario transaccional | Pendiente |
| P16 | Venta y devolución vinculada | Pendiente |
| P17 | WhatsApp básico | Pendiente |
| P18 | Eventos, chat y notificaciones | Pendiente |
| P19 | Ciclos de suscripción | Pendiente |
| P20 | Suspensión y reactivación | Parcial |
| P21 | Estadísticas y exportaciones | Parcial |
| P22 | Auditoría y trazabilidad integral | Parcial |
| P23 | PWA e instalación segura | Pendiente |
| P24 | Endurecimiento de seguridad | Parcial |
| P25 | Regresión E2E de release | Verificado localmente |
| P26 | Workspace completo del Asesor | Parcial |
| P27 | Resiliencia y estados UX | Parcial |
| P28 | Vouchers imprimibles integrados | Parcial |
| P29 | Trazabilidad y pruebas de contratos | Parcial |
| P30 | Integraciones avanzadas opcionales | Pendiente |
| P31 | Preparación del piloto | Pendiente |

## Evidencia de la corrección de recepción

Nueva migración CLI `20260911010353_separate_intake_confirmation.sql`: aplicada sin reset. `create_repair` ya no emite voucher; `confirm_intake` exige autorización, versión, condición y accesorios y crea evento, documento y auditoría en una transacción. Dos intentos iguales reutilizan el documento; una carga distinta entra en conflicto. Los documentos anteriores conservan snapshot y se identifican como flujo anterior.

25 nuevas comprobaciones pgTAP de recepción; suite completa: 120 comprobaciones aprobadas. Tipos regenerados desde PostgreSQL local. Build, ESLint y TypeScript aprobados; 111 pruebas de dominio y 9 E2E aprobadas. La E2E concurrente confirma que dos solicitudes simultáneas producen un solo evento y voucher. El flujo de navegador comprueba cero vouchers antes de recepción y uno después, descarga PDF, asignación, pago con MFA y aislamiento A/B. Registro: `reports/local/intake-e2e.log` y `reports/local/intake-build.log`.

`supabase db advisors --local --type security --level warn --fail-on error`: sin hallazgos; no equivale a una certificación de seguridad. Revisión visual local: sin errores de página ni desbordamiento general en las vistas capturadas de escritorio y la bandeja móvil. La comparación visual completa de las 118 pantallas sigue pendiente.

`npm run check:naosiq`: inventario e integridad de fuentes comprobados. `node scripts/check-naosiq.mjs --complete` se mantiene como control de pendientes, no como sustituto de pruebas reales.

## Evidencia BR02 — 2026-09-13

El comercio lidera visualmente el portal Cliente y figura como emisor en la vista de
documentos, los medios de pago y los PDF. NAOSIQ conserva una firma secundaria. Los
comprobantes distinguen recepción física, movimiento confirmado, entrega, saldo y
validez fiscal; no convierten el cierre del diálogo de impresión en un hecho observado.

`npm run check:br02` recorrió los 118 IDs, preservó las 363 acciones y los 32
recorridos. Resultado: 38 pantallas con superficie parcial y 80 no implementadas; 16
recorridos con evidencia parcial y 16 no implementados. La matriz no cambia el estado
de aceptación de ninguna acción: `reports/local/br02/coverage-matrix.json`.

Se generaron cuatro capturas autenticadas sin desbordamiento ni errores de página y
se comprobaron títulos independientes para Maestro, Comercio y Cliente. Dos PDF A4
descargados por una sesión autorizada se validaron con `pdfinfo`, se extrajeron con
`pypdf`, se renderizaron con Poppler y se inspeccionaron visualmente. Carta, 80 mm,
impresión física, mensajería y las superficies restantes siguen pendientes. BR02 se
mantiene parcial y el prototipo no se presenta como backend completo.

Regresión BR02 aprobada: estructura, ESLint, TypeScript, 111 pruebas unitarias, build
Next.js y 11 E2E Chrome. Los E2E validaron recepción, concurrencia, comprobantes,
pagos con MFA, cinco roles, tres portales independientes y aislamiento A/B.

## BR03, P00 y P01 — 2026-09-14

BR03 añadió cierre de sesión común a Maestro, Comercio y Cliente, una prueba real de
los estados de carga, vacío, éxito y error, y una regresión de reimpresión que abre y
descarga cuatro veces el mismo voucher sin alterar pagos, custodia ni documentos. La
matriz `reports/local/br03/regression-matrix.json` conserva BR03 como parcial: timeout
y offline no están implementados; cierre operativo, grafo de reparación y cobertura
visual integral siguen incompletos. No hubo publicación ni migración de dominios.

P00 se ejecutó como auditoría de solo lectura. Confirmó el monolito modular Next.js,
TypeScript y Supabase local, los cinco roles contractuales y el inventario V6. También
identificó los faltantes reales: CI, contratos explícitos de trabajos/recuperación y
observabilidad eran incompletos antes de P01; los módulos posteriores del producto
continúan gobernados por su propia cobertura.

P01 completó la base local con dependencias exactas y lockfile, workflows CI fijados
por SHA, shells independientes, errores base, logging acotado y contratos para jobs,
outbox, timeout y recuperación. `npm run check:p01`, estructura, ESLint, TypeScript,
116 pruebas unitarias y el build Next.js aprobaron. El workflow no se ejecutó en un
repositorio remoto y los adaptadores externos permanecen desactivados. Evidencia:
`reports/local/p01/foundation.json`, `.github/workflows/ci.yml` y
`tools/action-pins.json`.

## P02 — verificado localmente

P02 incorpora una migración independiente con delegaciones no financieras acotadas
por tenant, rol, recurso, tiempo, versión e idempotencia. El Administrador puede
gestionar membresías únicamente en su comercio; Super Usuario sigue respaldado por
el registro privado de plataforma y toda mutación conserva el actor en auditoría.
Los contratos de archivos y jobs exigen tenant y membresía y no conceden escritura
directa a la API. Las delegaciones financieras de D01 continúan desactivadas.

La migración se aplicó localmente sin reset. Sus 20 pruebas nuevas y la suite completa
de 148 comprobaciones pgTAP aprobaron. Los asesores de seguridad no reportaron
hallazgos; el linter DB solo conserva dos advertencias anteriores en `create_repair`.
El contrato TypeScript fue regenerado desde PostgreSQL. `npm run check:p02`, ESLint,
TypeScript y 123 pruebas unitarias aprobaron. Evidencia en
`reports/local/p02/multi-tenant.json`. La revisión local no es una certificación de
seguridad independiente.

## P03 — identidad e invitaciones locales verificadas

Google quedó seleccionado mediante Supabase Auth y PKCE. El adaptador se mantiene
desactivado porque no existen un cliente y un secreto Google de ensayo; no se
inventaron credenciales ni se declaró probado el proveedor externo. El callback local
distingue cancelación, código inválido o tardío y usuario sin acceso, valida el portal
y acepta sólo retornos internos del mismo portal. Las rutas de reautenticación vuelven
a validar la sesión y la membresía. D04 permanece pendiente y sus duraciones siguen
sin valor operativo.

Las invitaciones, su aceptación por identidad verificada, la activación del rol y la
revocación son hechos distintos. Crear o aceptar no concede una membresía. Una
invitación pendiente vencida se materializa como `expired`, incrementa su versión,
audita al actor y permite emitir otra sin borrar el registro anterior. La outbox sólo
registra la intención de entrega; el worker real continúa pendiente.

Las migraciones P03 se aplicaron localmente sin reset. Aprobaron 26 pruebas pgTAP del
módulo y 174 en la suite completa, 132 unitarias y 15 E2E. ESLint, TypeScript, build,
el control `check:p03` y los asesores de seguridad aprobaron. El linter de base conserva
únicamente dos advertencias anteriores en `private.create_repair`. Evidencia:
`reports/local/p03/identity-session.json`, `docs/13-identity-session.md` y
`supabase/tests/database/identity_invitations.test.sql`. P03 se mantiene parcial por
Google E2E, D04 y la entrega real de invitaciones.

## P04 — control Maestro explícito y auditable

SU01–SU20 están presentes en el CRM Maestro. SU01, SU02, SU04 y SU05 quedaron
verificados localmente; nueve superficies tienen alcance parcial y siete conservan
acciones pendientes. Las lecturas existentes usan PostgreSQL real y los controles sin
backend seguro están deshabilitados con su ID contractual.

El acceso a un workspace de comercio exige MFA, motivo y un contexto opaco ligado al
actor real y a un tenant. No asigna roles ni suplanta al Administrador. Abrir y cerrar
quedan auditados, el cierre incrementa versión y una cookie de un comercio no abre
otro. D04 continúa pendiente, así que la interfaz no muestra una duración inventada.

El alta de comercio pasó a una operación idempotente y recuperable. Repetir la misma
clave devuelve la misma organización; cambiar la carga produce conflicto. El RPC
anterior sin clave dejó de estar disponible para la API. Aprobaron 19 pruebas P04,
193 pgTAP totales, 132 unitarias, 15 E2E, build, lint, tipos y `check:p04`. Los
asesores de seguridad no reportaron hallazgos y el lint DB conserva las dos
advertencias anteriores de `private.create_repair`. Evidencia en
`reports/local/p04/master-control.json` y `docs/14-master-control.md`.

## P05 — gestor central de rutas locales

`tenant_routes` mantiene una ruta primaria por comercio y convierte cada slug anterior
en redirección lógica. Sólo el Super Usuario con MFA puede asignar una ruta. La
operación usa versión y clave idempotente, audita al actor y reserva la colisión antes
de modificar el tenant. Dos aspirantes al mismo slug producen un ganador; el otro
recibe conflicto sin perder su estado.

SU09 consulta disponibilidad, asigna rutas y muestra historial. Los vouchers conservan
URLs por IDs estables. Aprobaron 15 pruebas P05, 208 pgTAP totales, la E2E dirigida de
Maestro, build, lint, tipos, `check:p05` y los asesores de seguridad. Dominio propio,
DNS y la respuesta HTTP del micrositio quedan pendientes de P07/D14, por lo que P05
se mantiene parcial. Evidencia: `reports/local/p05/url-manager.json` y
`docs/15-url-manager.md`.

Aplicación compilada iniciada de nuevo en http://127.0.0.1:3000/login con las mismas cuentas locales.

## Implementación P06–P31 — 2026-09-17

Se incorporaron los contratos locales restantes en orden. P06–P24 y P26–P30 cuentan con modelo persistente y/o superficie local; P25 queda como la fase de regresión final y P31 emite NO-GO para datos reales mientras D01–D14 y las validaciones externas continúen abiertas. La evidencia y las rutas están en `docs/16-p06-p31-implementation.md`; el checklist de piloto está en `docs/17-pilot-readiness.md`.

Este avance reemplaza los faltantes funcionales descritos arriba, pero no convierte automáticamente las 118 pantallas y 363 acciones en verificadas. Ese estado sólo cambia después de ejecutar la regresión integral y actualizar la matriz con evidencia observable.

Fuentes de implementación de RLS revisadas: https://supabase.com/docs/guides/database/postgres/row-level-security

## Actualización 2026-09-12

Identidad y componentes compartidos adaptados a NAOSIQ. Build, tipos, lint y 9 E2E aprobados. Inter local, controles móviles y tema claro verificados. Servidor abierto en desarrollo en 127.0.0.1:3000. Ver `reports/naosiq-brand-v6.md`. El alcance integral continúa pendiente.

## Cierre P25 — 2026-09-17

Aprobaron 208 contratos pgTAP, 132 pruebas unitarias, TypeScript, ESLint, build Next.js y 15 E2E. Los asesores de seguridad de Supabase no reportaron hallazgos. Los E2E cubren cinco roles, tres portales independientes, MFA, aislamiento A/B, concurrencia de recepción, pagos, vouchers, reimpresión y callbacks cerrados. El servidor compilado permanece abierto en http://127.0.0.1:3000/. La comparación visual exhaustiva de las 118 referencias y las validaciones externas continúan como condiciones del piloto, no como fallos de la regresión local.
