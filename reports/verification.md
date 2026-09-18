# Informe de verificación - CRM TECHI 0.1.0

**Resultado de entrega: base de código preparada; NO aprobada para producción.**
Corte documental: 8 de septiembre de 2026. No se crearon proyectos remotos,
cuentas, dominios, cargos, despliegues ni mensajes externos.

## Evidencia ejecutada

| Control | Resultado | Alcance exacto |
|---|---|---|
| Compilación del dominio y Node Test Runner | 111 aprobadas, 0 fallidas, 0 omitidas | Reglas puras de identidad, estados, importes, pagos, validación y suscripciones |
| Sintaxis TypeScript y referencias de importación local | 34 archivos, sin hallazgos del comprobador | Transpilación sintáctica; NO typecheck integral |
| Validación JSON/YAML/JavaScript/shell | 22 comprobaciones aprobadas | Parsers de configuración y chequeos de sintaxis |
| Estructura de repositorio | Aprobada con pendientes explícitos | 13 tablas declaradas y RLS presente en fuente; NO ejecución SQL |
| Puerta de inicialización `check:ready` | Bloqueada, código de salida 1, como corresponde | Faltan artefactos reales dependientes de red/CLI/base |
| Maqueta HTML, escritorio 1440 y móvil 390 | Contenido, 5 roles sintéticos, filtros y estado vacío verificados | Render DOM offline con Chromium; sin desbordamiento horizontal del documento |
| Errores JS de la maqueta | Ninguno observado en las comprobaciones | No constituye prueba del frontend Next.js |
| Servidor local exclusivo de maqueta | Rutas ajenas 404; POST 405 | Lista permitida de archivos; no servidor productivo |

El dominio se ejecutó con **Node 22.16.0 y TypeScript 5.8.3**, disponibles en
este entorno. La estación objetivo fija Node 24.21.0 y TypeScript 5.9.3: ejecutar
nuevamente todos los controles con esas versiones tras instalar dependencias.
Los 111 casos no representan un porcentaje medido de cobertura.

## Limitaciones de ejecución

La red del contenedor no permitió resolver e instalar las dependencias del
proyecto. No hubo daemon Docker ni motor PostgreSQL disponibles. El navegador
bloqueó la navegación a localhost por política del entorno; no se alteró esa
política. La verificación visual cargó el HTML, CSS y JavaScript locales en el
DOM y ejecutó las interacciones de la maqueta, no de Next.js. La herramienta
agent-browser no estaba instalada; se usó Playwright con Chromium del sistema.

**No ejecutado:** `npm ci`, ESLint del proyecto, typecheck completo, `next build`,
login real, MFA integrado, OAuth Google, rutas de negocio contra Supabase,
render/impresión PDF, migraciones, pgTAP, smoke Playwright de Next.js, Docker,
workflows remotos, carga, accesibilidad integral, escaneo de dependencias instalado,
análisis SAST completo, escaneo de secretos especializado, DAST o pentest.

Existen **40 aserciones pgTAP escritas**, no ejecutadas. Existen cuatro definiciones
de smoke test para dos proyectos Chromium, equivalentes a ocho ejecuciones
previstas. Los E2E autenticados y las pruebas de concurrencia real están pendientes.
No se ha realizado una auditoría independiente ni se certifica ASVS, WCAG o cumplimiento legal.

## Artefactos que deben generarse realmente

1. `package-lock.json`: resolver con red y revisar; no se fabricó un lockfile.
2. `supabase/config.toml` y migración: generados por la CLI fijada con `db:init`.
3. `.github/workflows/*.yml`: resolver SHA reales de Actions con el script incluido.
4. `src/types/database.generated.ts`: generar desde la base y enlazar al cliente.
5. Evidencia de build, permisos A/B, restauración y revisión de seguridad.

La comprobación `check:ready` solo cubre inicialización del repositorio. Aunque
pase después, no sustituye `docs/12-release.md` ni autoriza el uso de datos reales.

## Evidencia conservada

- `unit-tests.tap`: salida real del runner.
- `source-syntax.json`: alcance y resultados sintácticos.
- `static-validation.json`: configuraciones verificadas y tablas inspeccionadas.
- `structural-check.txt` y `readiness-check.txt`: resultado y bloqueos.
- `preview-verification.json`: interacciones, tamaños, limitaciones y HTTP local.
- `preview-1440.png` y `preview-390.png`: capturas de la maqueta sintética.

## Próximo hito verificable

En un entorno local con red y Docker: generar los artefactos anteriores; crear
usuarios sintéticos y dos comercios; aprobar pgTAP; enlazar los tipos; ejecutar
lint, typecheck y build; probar el flujo recepción -> asignación -> estado -> pago
pendiente -> confirmación con MFA -> comprobante, con intentos cruzados entre
comercios. Solo después preparar una preview aislada sin datos reales.
