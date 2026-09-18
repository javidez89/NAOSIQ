# Registro de trabajo NAOSIQ

## 2026-09-10 — Adopción V6 y separación de recepción

Solicitud: cumplir todos los PDF y prompts de NAOSIQ_KIT_V6 manteniendo ejecución local.
La inspección P00/BR00 identificó diferencias con la base CRM TECHI. El inventario de
36 prompts, 118 vistas, 363 acciones y 32 recorridos queda registrado, con estado
explícito, en `docs/naosiq-v6-coverage.json`. No se consideran implementados por existir
en un PDF. Ver detalle y secuencia en `reports/naosiq-v6-compliance.md`.

Cambio acotado P09: una orden nueva no emite voucher de recepción. La confirmación
física autorizada registra condición, accesorios, actor, instante, evento y voucher
una sola vez. Los snapshots antiguos se conservan y se identifican como flujo anterior.
No se reconstruyen hechos físicos a partir de documentos históricos.

Validación: migración aplicada localmente; 120 pgTAP aprobados (25 nuevos), 111 pruebas
de dominio, tipos y lint aprobados; build aprobado. 9 pruebas E2E aprobadas, incluida concurrencia de recepción; servidor local reiniciado.
Evidencia en el informe. El resto de P09 y los otros prompts conservan estado parcial/pendiente.

Siguiente cambio: completar recuperación de operaciones y base visual NAOSIQ, seguido
de los módulos pendientes según dependencias. No aprobar D01–D14 por inferencia.

## 2026-09-12 — Identidad NAOSIQ y preview persistente

Tokens generados desde V6, Inter local con licencia, shell azul noche, controles violetas y firma secundaria en PDFs. Build, tipos, lint y 9 E2E Chrome aprobados; verificaciones móviles de foco/altura/fuentes aprobadas. Servidor en desarrollo dejado abierto por solicitud expresa. Ver `reports/naosiq-brand-v6.md`; BR01/BR02 parciales, resto del alcance preservado.

## 2026-09-13 — BR01 verificado

La escala completa de tokens V6 quedó conectada al CSS generado: color, tipografía,
espaciado, radios, controles y foco. El formulario compartido anuncia carga y separa
éxito/error. Verificación real: sincronización de tokens, estructura, lint, tipos y
111 unitarias aprobadas; 11 E2E Chrome aprobadas; build Next.js aprobado. Siete vistas
de Maestro, Comercio y Cliente revisadas en escritorio/móvil sin overflow ni overlay.
El tema contractual sigue siendo claro y el logo se mantiene textual porque no se
suministró maestro vectorial oficial. BR01 verificado; BR02 permanece parcial.

## 2026-09-13 — BR02 aplicado a superficies reales

El comercio pasó a ser el emisor visible en Cliente, documentos, pagos y comprobantes;
NAOSIQ queda como respaldo. Se mejoraron los PDF A4 sin reescribir snapshots ni
inventar saldos, entregas, envíos o impresiones. La revisión produjo cuatro capturas
autenticadas y dos PDF sintéticos renderizados e inspeccionados.

La matriz BR02 conserva 118 pantallas, 363 acciones y 32 recorridos: 38 pantallas y
16 recorridos cuentan con evidencia parcial; 80 pantallas y 16 recorridos aún no están
implementados. BR02 sigue parcial. Evidencia en `reports/local/br02/` y `output/pdf/`.
Validación final: estructura, lint, tipos, 111 unitarias, build y 11 E2E aprobados.

## 2026-09-14 — BR03, P00 y P01

BR03 incorporó cierre de sesión compartido, estados reales de interfaz y una prueba de
reimpresión sin mutaciones. Diez áreas quedaron verificadas, dos parciales y dos
pendientes; por ello BR03 conserva estado parcial y la publicación sigue bloqueada.

P00 auditó en modo de solo lectura el repositorio, decisiones, RBAC, stack, scripts y
cobertura V6. P01 completó la base del repositorio con CI fijada por SHA, logging
estructurado y acotado, contratos de operación/job/outbox y recuperación. Verificación:
`check:p01`, estructura, lint, tipos, 116 unitarias y build Next.js aprobados. El
workflow remoto no se ejecutó. El servidor quedó pendiente de recuperación porque el
motor local de Docker no está disponible.

## 2026-09-16 — P02 verificado localmente

Se añadió una migración nueva para delegaciones no financieras, administración de
membresías por el Administrador dentro de su propio comercio, auditoría del actor y
aislamiento por tenant de metadatos de archivos y trabajos. Super Usuario continúa
separado de las membresías; el cliente no decide rol ni organización por el body y
las delegaciones financieras de D01 permanecen desactivadas.

Docker Desktop se recuperó eliminando dos sockets temporales dañados sin borrar
volúmenes. Academiamas y NAOSIQ volvieron a estado saludable. La migración P02 se
aplicó sin reset; 20 pruebas nuevas y 148 pgTAP totales aprobaron. Los asesores de
seguridad no encontraron problemas y el contrato TypeScript se regeneró desde la
base. El control P02, lint, tipos y 123 pruebas unitarias aprobaron. P02 queda
verificado localmente; no equivale a certificación independiente.

## 2026-09-16 — P03 verificado en alcance local, integración Google pendiente

Se seleccionó Supabase Auth con Google y PKCE, dejando el adaptador desactivado hasta
contar con un cliente y secreto de ensayo externos. El callback distingue cancelación,
código inválido o tardío y falta de acceso, limita el retorno al portal de origen y no
crea una cuenta ni un rol por cancelar. Maestro, Comercio y Cliente incorporan rutas
de reautenticación; D04 conserva sus tiempos en `null` porque sigue sin aprobación.

La base separa invitación, aceptación por correo verificado, activación de membresía y
revocación. Las invitaciones vencidas se materializan como `expired` al reintentar,
con versión y actor auditados, y permiten una nueva invitación sin borrar historia.
Las dos migraciones P03 se aplicaron localmente sin reset. Aprobaron 26 pruebas P03,
174 pgTAP totales, 132 unitarias, 15 E2E, ESLint, TypeScript y el build Next.js. Los
asesores de seguridad no hallaron problemas; el lint DB conserva dos advertencias
anteriores en `private.create_repair`. P03 continúa parcial hasta probar Google real,
aprobar D04 e implementar el worker de entrega.

## 2026-09-16 — P04 aplicado parcialmente con control Maestro verificable

CRM Maestro se reorganizó alrededor de SU01–SU20. Dashboard, directorio, ficha del
comercio y control explícito usan datos reales. El Super Usuario mantiene su identidad,
confirma MFA y motivo, recibe un contexto opaco ligado a actor y tenant y ve una banda
de control; cerrar el contexto incrementa versión y audita la salida. Un contexto no
sirve para otro comercio y nunca crea una membresía ni suplanta al Administrador.

El alta de comercio usa `provision_tenant_v2`: una clave de solicitud recupera el
mismo resultado y una carga distinta entra en conflicto. El RPC anterior sin
idempotencia dejó de ser ejecutable por la API. Planes, suscripciones, URLs,
identidades y auditoría tienen lectura real; SU10 permite invitaciones y membresías.
El resto de acciones conserva su ID y aparece deshabilitado cuando depende de P05 o de
módulos posteriores.

Las dos migraciones P04 se aplicaron sin reset. Aprobaron 19 pruebas P04, 193 pgTAP
totales, 132 unitarias y 15 E2E; también ESLint, TypeScript, build y `check:p04`.
Los asesores de seguridad no hallaron problemas. P04 sigue parcial: 4 pantallas
verificadas, 9 parciales y 7 pendientes según
`reports/local/p04/master-control.json`.

## 2026-09-16 — P05 URL Manager aplicado para rutas locales

Se añadió un registro central de rutas con una primaria por comercio, slugs reservados,
historial y redirecciones lógicas. La asignación exige Super Usuario con MFA, versión y
clave idempotente. Primero reserva el slug global y luego cambia la primaria en la
misma transacción: si dos comercios compiten, uno gana y el otro conserva su ruta y
borrador. El Administrador no puede cambiar la URL estructural.

SU09 permite comprobar disponibilidad y guardar la ruta. Los comprobantes continúan
enlazados por tenant y voucher UUID, no por slug. La verificación DNS y los dominios
propios siguen deshabilitados; la redirección HTTP pública corresponde al micrositio
de P07. Aprobaron 15 pruebas P05 y 208 pgTAP totales, el recorrido Maestro dirigido,
build, lint, tipos, `check:p05` y asesores de seguridad. P05 queda parcial.

## 2026-09-17 — P06–P31
Implementación local terminada y migraciones aplicadas. Validación final: 208 pgTAP, 132 unitarias, TypeScript, ESLint, build y 15 E2E aprobados; advisors de seguridad sin hallazgos. Servidor compilado abierto en http://127.0.0.1:3000/. P31 conserva NO-GO externo por D01–D14 y validaciones de proveedores/datos reales.
