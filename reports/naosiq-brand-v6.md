# NAOSIQ — identidad aplicada a la base local

Fecha: 12 de septiembre de 2026. Alcance BR01 y presentación compartida de BR02.

## Resultado

Nombre NAOSIQ, slogan del manual, navegación azul noche, controles violetas,
superficies claras y estados semánticos del paquete V6. Se reutilizan los componentes
y rutas de la aplicación existente. Se retiró el símbolo T provisional; no se inventó
un logo sustituto. El maestro oficial sigue pendiente.

`src/config/naosiq-tokens.json` conserva los tokens fuente. El generador
`scripts/sync-brand-tokens.mjs` produce `src/app/naosiq-tokens.css`; `--check` comprueba
sin modificar que coinciden. Inter se distribuye localmente con su licencia original;
Next.js no necesita descargarla en el build ni el navegador al visitar la aplicación.
Montserrat permanece declarada en la especificación, sin afirmar que esté cargada.

Cambios de presentación: configuración de marca, layout, login, estilos globales,
nombre visible de futuros factores MFA y firma secundaria “Gestionado con NAOSIQ”
en PDFs. No se renombraron factores existentes, tablas, variables, rutas ni dominios.
Los snapshots de documentos siguen intactos; la nueva firma pertenece a su render.

## Verificación real

- TypeScript y ESLint de los archivos modificados: aprobados.
- Build Next.js: aprobado, `reports/local/brand-build.log`.
- 9 pruebas E2E: aprobadas en Chrome contra desarrollo local,
  `reports/local/brand-e2e.log`. Incluyen MFA real, recepción física, confirmación
  concurrente, descarga de PDF, roles y separación A/B.
- Vista de acceso, comercios, bandeja y detalle revisadas en escritorio; bandeja y
  acceso en móvil. Capturas en `reports/local/brand/`. No hubo desbordamiento global
  en las vistas comprobadas ni errores `pageerror` durante la revisión inicial.
- Controles móviles: campos y botón de login de 48 px, foco de 3 px, Inter cargada,
  navegación `#0B0F1A`, botón `#7C3AED`; preferencias del sistema clara y oscura
  comprobadas. `reports/local/brand/controls-check.json`.
- Se usa el tema claro del contrato; no se presenta un tema oscuro como implementado.
- Sin solicitudes de fuentes externas. El entorno inyectó solicitudes de Kaspersky,
  registradas por separado; no se modificó el antivirus. La primera comprobación de
  “cero solicitudes externas” falló por esa inyección y se corrigió para verificar
  específicamente la carga de fuentes.
- Edge se cerró durante el arranque de automatización; se verificó con Chrome
  instalado. `LOCAL_TEST_BROWSER=chrome` permite repetir esta selección sin cambiar
  el destino local ni guardar sesiones o capturas con secretos.
- Inventario NAOSIQ y sincronización de tokens: aprobados. Esto no equivale a la
  aceptación integral de 118 pantallas y 363 acciones.

## Cierre de BR01 — 13 de septiembre de 2026

BR01 queda verificado sobre la aplicación real. El generador ahora proyecta también
tipografía, escala, espaciado, radios, altura táctil y foco desde el JSON aprobado.
El formulario compartido expone estado ocupado, anuncio accesible de carga y estados
semánticos de éxito/error. Se comprobaron en Chrome los valores de color, Inter local,
escala 32–48 px, controles de 48 px, radios, foco de 3 px, disabled e invalidación.

La revisión visual nueva cubrió selector, los tres accesos y el área del cliente en
escritorio y móvil: siete capturas sin desbordamiento ni overlay, en
`reports/local/portals/`. Preferencias clara y oscura mantienen deliberadamente el
tema claro aprobado; no hay tokens oscuros autorizados. Las 111 pruebas unitarias,
11 E2E y el build Next.js terminaron correctamente. El logo continúa textual porque
el kit declara que no existe un maestro vectorial oficial suministrado.

## Límites y continuidad

BR02 continúa parcial: falta la comparación integral de vistas y recorridos y la
maquetación completa de vouchers Carta/A4/80 mm. Los módulos funcionales pendientes
no se cubren con BR01. Ver `reports/naosiq-v6-compliance.md`.

Servidor dejado abierto en modo desarrollo: http://127.0.0.1:3000/.
Lanzador: `scripts/local-start.mjs`; logs privados `.local/dev.log` y
`.local/dev-error.log`. La preferencia de conservarlo abierto queda en AGENTS.md.
Si se apaga el equipo, `npm run local` vuelve a iniciar el entorno conservando datos.

## Avance BR02 — 13 de septiembre de 2026

El co-branding ahora identifica al comercio como emisor principal dentro del portal
Cliente, el detalle de la orden, los medios de pago y los PDF. “Gestionado con
NAOSIQ” aparece como respaldo secundario. Los comprobantes A4 incorporan jerarquía
visual, metadata del emisor y textos que separan recepción física, movimiento
confirmado, entrega, saldo y validez fiscal. El render continúa usando snapshots
inmutables; no consulta datos actuales para reescribir documentos históricos.

Se contrastó todo el inventario mediante `scripts/check-br02.mjs`. La matriz conserva
118 pantallas, 363 acciones y 32 recorridos: 38 IDs tienen una superficie parcial
real y 80 no están implementados. Una ruta compartida no acepta automáticamente sus
acciones. La evidencia está en `reports/local/br02/coverage-matrix.json`.

Cuatro vistas autenticadas de Comercio y Cliente se capturaron en escritorio y móvil
sin errores de página ni desbordamiento. Los títulos visibles distinguen CRM maestro,
Comercio y Cliente. Dos PDF sintéticos se descargaron por el flujo autorizado,
renderizaron a PNG y revisaron visualmente; ambos tienen una página A4 legible, emisor,
respaldo, pie y numeración. Estructura, lint, tipos, 111 pruebas unitarias, build y 11
E2E aprobaron; los E2E cubren sesiones independientes, roles, recepción, MFA, pago,
PDF y aislamiento entre comercios. La maquetación Carta/80 mm, la impresión física y las 80
pantallas ausentes siguen pendientes. BR02 permanece parcial.

Fuente tipográfica: [Inter oficial](https://rsms.me/inter/) y
[licencia original](https://github.com/rsms/inter/blob/master/LICENSE.txt).
