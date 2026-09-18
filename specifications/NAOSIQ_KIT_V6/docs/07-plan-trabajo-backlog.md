> Base funcional heredada de v5. Presentación NAOSIQ v6. Para identidad visual prevalecen BRAND_MIGRATION.md y el manual recibido.

# Plan de trabajo, backlog y puertas de calidad

**Se conservan las fases 0-12 y los prompts P00-P25 del blueprint. V5 actualiza sus alcances y añade P26-P31. Los números de prompt no son una orden de ejecución ciega; mandan las dependencias.**

## Roadmap

| Fase | Objetivo | Tareas | Salida verificable |
| --- | --- | --- | --- |
| 0 | Revisión y decisiones | P00 | Base trazable y plan de arranque aprobado. |
| 1 | Foundation técnica y visual | P01 | Shell, tokens, CI, logging y comandos reales. |
| 2 | Identidad, tenant y resiliencia | P02, P03, P27 | Cinco roles, sesión, guardas y aislamiento probados. |
| 3 | CRM Maestro y URLs | P04, P05 | Control total auditado y alta central. |
| 4 | Onboarding y página pública | P06, P07 | Comercio publicable sin filtrar datos privados. |
| 5 | Reparaciones, Asesor y documentos | P08, P09, P10, P11, P12, P26 | Custodia, diagnóstico, aprobación, QA y voucher de recepción. |
| 6 | Pagos, caja y vouchers | P13, P14, P28 | Ingreso confirmado, saldo correcto, voucher y reimpresión segura. |
| 7 | Inventario y ventas | P15, P16 | Movimientos trazables y cobro/stock sin duplicados. |
| 8 | WhatsApp, mensajes y eventos | P17, P18 | Canales aislados y afirmaciones de entrega verificables. |
| 9 | Suscripciones SaaS | P19, P20 | Ciclo aprobado, suspensión y reactivación. |
| 10 | Métricas, calidad y endurecimiento | P21, P22, P23, P24, P25, P29 | Evidencia de pruebas y candidato a release. |
| 11 | Piloto y lanzamiento controlado | P31 | Go/no-go humano, restore y hardware probados. |
| 12 | Evolución opcional | P30 | Proveedor/escala según decisiones y necesidad real. |

## Orden de inicio recomendado

P00 revisa el repositorio sin escribir. Tras aprobar el plan, P01 crea/adapta foundation; P02 protege tenant/roles; P03 integra identidad; P27 agrega recuperación y sesión. Luego P04/P05 construyen control central y URLs. No comenzar por el cobro ni por cientos de pantallas sin autenticación.

Auditoría, errores y contratos son transversales desde foundation. P22 es su revisión integral, no una licencia para omitir audit logs hasta la fase 10. Jobs/documentos usan una abstracción desde P01; P18 expande comunicaciones. P12 puede preparar el motor documental antes de que P13/P14 aporten eventos financieros.

## Dependencias concretas

| Prompt | Objetivo | Depende de |
| --- | --- | --- |
| P00 | Auditoría y plan de arranque | Ninguno |
| P01 | Foundation del repositorio | P00 |
| P02 | Modelo multiempresa y permisos | P01 |
| P03 | Google y ciclo de sesión | P02 |
| P04 | CRM Maestro y control total | P03 |
| P05 | URL Manager central | P04 |
| P06 | Onboarding reanudable | P05 |
| P07 | Micrositio y catálogo | P06 |
| P08 | Clientes y equipos | P03 |
| P09 | Órdenes y recepción | P08 |
| P10 | Diagnóstico y cotización | P09 |
| P11 | Reparación y QA | P10 |
| P12 | Motor documental PDF y QR | P09 |
| P13 | Motor de pagos y abonos | P09 |
| P14 | Reportar, verificar y cobrar | P13 |
| P15 | Inventario transaccional | P09 |
| P16 | Venta y devolución vinculada | P14, P15 |
| P17 | WhatsApp básico | P07, P09 |
| P18 | Eventos, chat y notificaciones | P09 |
| P19 | Ciclos de suscripción | P04 |
| P20 | Suspensión y reactivación | P19 |
| P21 | Estadísticas y exportaciones | P14, P16, P20 |
| P22 | Auditoría y trazabilidad integral | P04, P14, P20, P28 |
| P23 | PWA e instalación segura | P07, P27 |
| P24 | Endurecimiento de seguridad | P22, P23 |
| P25 | Regresión E2E de release | P11, P16, P17, P18, P20, P24, P28, P29 |
| P26 | Workspace completo del Asesor | P03, P09 |
| P27 | Resiliencia y estados UX | P03 |
| P28 | Vouchers imprimibles integrados | P12, P14, P26 |
| P29 | Trazabilidad y pruebas de contratos | P11, P16, P20, P28 |
| P30 | Integraciones avanzadas opcionales | P25 |
| P31 | Preparación del piloto | P25 |

## Historias para construir

Cada historia tiene dos criterios principales (éxito y negativo/excepción), fuentes e IDs de pantalla. Los archivos .feature son especificaciones pendientes de automatización; no vienen con step definitions ni certifican el sistema. El detalle machine-readable está en backlog/stories.json.

| ID | Historia | Prompt | Vistas |
| --- | --- | --- | --- |
| HU-001 | Base ejecutable | P01 | AU04 |
| HU-002 | Tenant y membresias | P02 | AU02, AD25 |
| HU-003 | Google y retorno | P03 | AU01, CL02 |
| HU-004 | Revocacion y sesion | P27 | AU03, AU05 |
| HU-005 | Crear comercio | P04 | SU02, SU03, SU04 |
| HU-006 | Control total auditado | P04 | SU05, SU19 |
| HU-007 | URL central | P05 | SU09 |
| HU-008 | Onboarding reanudable | P06 | SU03, AD24 |
| HU-009 | Publicacion y pagina | P07 | CL01, AD19, CL20, CL21, CL22, CL23, CL26 |
| HU-010 | Clientes y equipos | P08 | AD12, AD13, AD27, CL17, AS02 |
| HU-011 | Nueva solicitud | P09 | CL03, CL04, CL05, CL06, AD03 |
| HU-012 | Recepcion con evidencia | P09 | AS03, AD05, TE11 |
| HU-013 | Voucher de recepcion | P28 | VR01, VR02 |
| HU-014 | Derivacion y asignacion | P26 | AS04, AD14, AD09, TE01, TE02 |
| HU-015 | Diagnostico | P10 | AD06, TE04, TE05 |
| HU-016 | Cotizacion versionada | P10 | AD07, AD08, AD26, CL09, AS05 |
| HU-017 | Proceso tecnico | P11 | TE07, TE06, AD09 |
| HU-018 | QA y cierre | P11 | AD10, TE08 |
| HU-019 | Reportar pago | P14 | CL10, CL11, CL25, AS07 |
| HU-020 | Verificacion financiera | P14 | AD31, AD11 |
| HU-021 | Efectivo y cambio | P14 | AS08, TE13 |
| HU-022 | Abonos y saldos | P13 | CL18, AD11 |
| HU-023 | Voucher de pago | P28 | VR03, CL18, CL12 |
| HU-024 | Vista previa y descarga | P28 | VR04, CL19, AD32 |
| HU-025 | Cancelacion de impresion | P28 | VR04 |
| HU-026 | Resultado financiero incierto | P27 | AD31, AS08, CL11 |
| HU-027 | Inventario y reservas | P15 | AD15, AD16, AD28, TE06 |
| HU-028 | Venta asistida | P16 | AD17, AD29, AD30, AS11 |
| HU-029 | Entrega del equipo | P11 | AD35, AS09, CL24 |
| HU-030 | Reingreso y no reparable | P11 | AD36 |
| HU-031 | Mensajes por audiencia | P18 | AD18, AS06, TE09, CL13 |
| HU-032 | WhatsApp para todos | P17 | SU12, AD21, CL23 |
| HU-033 | Agenda y perfil Asesor | P26 | AS01, AS10, AS12 |
| HU-034 | Documentos y plantillas | P12 | AD34, AD32, SU15 |
| HU-035 | Medios de pago negocio | P14 | AD20 |
| HU-036 | Planes y ciclo SaaS | P19 | SU06, SU16, SU07, SU17, SU08, AD23 |
| HU-037 | Suspension y cortesia | P20 | SU18, CL15, AD23 |
| HU-038 | PWA offline y actualizacion | P23 | TE10, AU06 |
| HU-039 | Evidencias y subidas | P09 | TE12, CL04, AD05 |
| HU-040 | Dashboards y exportes | P21 | SU01, SU20, AD01, AD22 |
| HU-041 | Auditoria y soporte | P22 | SU13, SU14, SU11 |
| HU-042 | Privacidad y condiciones | P31 | AD33, CL14 |
| HU-043 | Cobertura de controles UX | P29 | Todas / contrato |
| HU-044 | Piloto operativo e impresora | P31 | VR04 |

## Estimación y seguimiento

No se asignan semanas, dinero ni velocidad ficticia. Estimar después de P00/P01 usando el repositorio, equipo y alcance real. Cada PR debe ser revisable; dividir una fase extensa en historias, no ejecutar un prompt masivo hasta llenar contexto. Las tareas opcionales de proveedores no bloquean el piloto con medios manuales si la política y el alcance del piloto lo permiten.

Una entrega pasa de Planificada a En desarrollo, En revisión, Validada en pruebas y Aprobada para piloto con evidencia. "Documento generado" no equivale a "Historia implementada".
