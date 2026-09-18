# Análisis del kit NAOSIQ V6 y los cuatro frentes de cierre

Fecha: 2026-09-17  
Fuentes principales: `D:/NAOSIQ/NAOSIQ_KIT_V6/NAOSIQ_FLUJO_NAVEGABLE_V6.html`, `START_HERE.md`, `SPEC_INDEX.md`, contratos JSON/OpenAPI, SVG de diseño y estado observable de `crm-techi-foundation`.

## Conclusión ejecutiva

El núcleo local tiene una base técnica funcional y una regresión aprobada, pero el propio kit no permite afirmar que el producto visual y contractual completo esté terminado. El HTML es un visor/prototipo autocontenido de 7.66 MB con la especificación embebida; simula resultados y declara expresamente que no ejecuta transacciones reales. La autoridad de implementación está repartida entre los contratos JSON, OpenAPI, 118 SVG y 32 recorridos.

Inventario contractual confirmado:

- 118 pantallas: 36 AD, 12 AS, 6 AU, 26 CL, 20 SU, 14 TE y 4 VR.
- 363 acciones.
- 32 recorridos F01–F32.
- 77 referencias de escritorio y 41 móviles.
- Cinco roles principales, más superficies públicas, documentales y estados comunes.
- 22 operaciones de API núcleo especificadas como `SPECIFIED_NOT_IMPLEMENTED` en el catálogo original y 16 dominios de expansión.

La matriz local existente está desactualizada respecto de las últimas migraciones, pero conserva la última evidencia visual formal: 38 pantallas con superficie parcial y 80 sin implementación visual acreditada. `docs/naosiq-v6-coverage.json` todavía marca las 118 pantallas, 363 acciones y 32 recorridos como pendientes. Debe regenerarse después de mapear cada superficie nueva; una ruta genérica o una tabla de base no acredita por sí sola una pantalla o acción.

## 1. Validación visual y navegable

La identidad base está bien encaminada: colores, Inter, alturas táctiles, foco, radios, estados semánticos y co-branding están reflejados en CSS. El SVG oficial de marca no existe en el paquete; el JPG suministrado es provisional, por lo que el wordmark textual actual es correcto para local y no para publicación final.

Falta una validación pantalla por pantalla contra los 118 SVG. La aplicación tiene 47 archivos de ruta, muchos de ellos son wrappers compartidos o rutas dinámicas; esa cifra no equivale a 118 superficies. Las mayores brechas visibles están en:

- Administrador AD01–AD36: existen dashboard, órdenes y un centro consolidado, pero no las 36 vistas diferenciadas con sus acciones.
- Asesor AS01–AS12: existe acceso compartido y cola contractual, pero no el workspace completo representado por 12 pantallas.
- Técnico TE01–TE14: comparte vistas de órdenes; faltan superficies móviles específicas como QR, diagnóstico, repuestos, QA, offline, evidencias e historial.
- Cliente CL01–CL26: hay micrositio, acceso, listado, detalle y vouchers, pero faltan varios pasos diferenciados de solicitud, cotización, pagos, mensajes, perfil y entrega.
- Maestro SU01–SU20: tiene la mayor cobertura funcional relativa, aunque varias secciones continúan como superficies resumidas o controles deshabilitados.
- AU01–AU06 y VR01–VR04: existen estados globales, seguridad y PDFs, pero falta equivalencia visual individual y pruebas de todas las variantes.

También hay una diferencia de nomenclatura de rutas que debe resolverse mediante una matriz de compatibilidad, no mediante reemplazo global. El contrato usa prefijos `/staff`, `/advisor`, `/tech`, `/customer` y `/master`; la aplicación usa principalmente `/comercio`, `/cliente`, `/app` y `/master`. El kit prohíbe inferir cambios de rutas, así que hay que decidir si esos nombres son rutas conceptuales, aliases requeridos o rutas finales.

Trabajo necesario:

1. Regenerar la cobertura usando el código actual.
2. Mapear cada ID a ruta, componente, acción RPC, permiso y prueba.
3. Capturar las 118 vistas con el viewport indicado en `design/screen-layouts.json`.
4. Comparar estructura, textos, jerarquía, responsive, estados, foco y overflow.
5. Ejecutar los 32 recorridos y registrar ramas de éxito, permiso, error, timeout y offline.

## 2. Decisiones D01–D14

Las 14 decisiones canónicas del kit siguen en `PENDIENTE_APROBACION`. Existe además una divergencia crítica: `docs/11-decisions.md` del proyecto asigna asuntos diferentes a varios IDs. Por ejemplo, el kit define D01 como permisos financieros del Asesor/Técnico, mientras el documento local usa D01 para marca. Antes de aprobar decisiones se debe alinear el registro local con `contracts/decisions.json`, preservando historial y sin reasignar silenciosamente los IDs.

Las decisiones que bloquean primero el producto son:

- D01: facultades financieras del Asesor y Técnico.
- D02–D03: precios, cupos, usuarios, gracia y calendario SaaS.
- D04–D05: sesión, elevación, borradores, retención y dispositivos compartidos.
- D06–D07: vouchers parciales, sobrepagos, devoluciones, descuentos y entrega excepcional.
- D08–D09: lectura durante suspensión y reglas de evidencias/archivos.
- D10: proveedor WhatsApp y pasarela avanzada.
- D11–D12: garantías, consentimiento, entregas, formatos y hardware.
- D13–D14: infraestructura, región, responsable operativo, PWA y dominio propio.

El comportamiento conservador actual es adecuado para local: no concede dinero al Asesor, bloquea sobrepago, no activa proveedores, no inventa precios ni periodos y no usa datos reales.

## 3. Integraciones reales

Estado observado:

- Google OAuth: adaptador seleccionado pero desactivado; faltan cliente, secreto, URLs y prueba con cuentas de ensayo.
- WhatsApp: enlace/intención únicamente; no existe proveedor que confirme envío, entrega o lectura.
- Pagos: registro y conciliación manual; no hay Wompi, Bold u otra pasarela habilitada.
- Correo: Supabase local/Mailpit para ensayo; no hay SMTP transaccional productivo.
- Archivos: existen contratos de evidencia y rutas privadas; falta proveedor productivo, cuarentena, antivirus, retención y restore de objetos.
- Impresión: PDF A4/80 mm generado; falta prueba física, impresora, drivers y política sobre 58 mm/impresión silenciosa.
- Observabilidad: logging local y documentos operativos; falta proveedor de errores, métricas, alertas y responsable.

No se debe activar ninguna integración con datos reales antes de resolver D09–D13, separar secretos por entorno y ejecutar pruebas de fallo, reintento, idempotencia y costes.

## 4. Preparación para producción

La aplicación tiene defensas útiles: build standalone, cabeceras, CSP con nonce, RLS, RPC, MFA, control de origen, migraciones, `RELEASE_APPROVED=false`, pruebas de aislamiento y análisis local de seguridad. Esto no constituye un entorno productivo.

Faltan como mínimo:

- Repositorio remoto y ramas protegidas con CI real y artefactos de evidencia.
- Staging separado con datos sintéticos y secretos propios.
- Proyecto productivo de base/auth/storage, región y presupuesto aprobados.
- Dominio, DNS, TLS y callbacks OAuth finales.
- Gestor de secretos y rotación; separación total entre preview, staging y producción.
- Backup de DB y objetos, restauración ensayada y RPO/RTO medidos.
- SAST, SCA, secret scanning, DAST autenticado y pentest independiente.
- Monitoreo, alertas, runbooks, responsables de incidentes y soporte.
- Privacidad, consentimiento, retención, exportación y términos aprobados.
- SBOM, changelog, SHA de release, migración revisada y rollback compatible.
- Piloto acotado con uno o dos comercios antes de cualquier apertura general.

## Orden recomendado

1. Corregir la trazabilidad: decisiones canónicas y matriz 118/363/32 actualizada.
2. Completar las pantallas por recorrido, empezando F01–F05 y F08–F19.
3. Ejecutar comparación visual automatizada y revisión humana de las 41 vistas móviles y 77 de escritorio.
4. Someter D01–D14 a aprobación con una opción recomendada y consecuencias concretas.
5. Configurar staging y sólo las integraciones aprobadas con credenciales de ensayo.
6. Ensayar backup/restore, observabilidad, seguridad y operación.
7. Ejecutar piloto sintético; después decidir si se autoriza información real.

El estado correcto hoy es: núcleo local funcional, cobertura visual contractual incompleta, decisiones e integraciones pendientes y producción bloqueada.
