# 05. Entornos, CI y despliegue

## Separación de entornos

| Entorno | Datos | Accesos | Uso |
|---|---|---|---|
| Local | Sintéticos, Supabase CLI | Desarrollador | Desarrollo y reset reproducible |
| Preview PR | Sin credenciales de datos por defecto | Equipo autorizado | Revisión de UI/código; no producción |
| Staging | Proyecto Supabase separado, datos sintéticos | QA/producto/pentest autorizado | Integración, migraciones, ensayo de release |
| Producción | Datos reales autorizados | Mínimos privilegios | Operación aprobada y monitorizada |

No apuntar un preview a la base real. Una base de staging compartida no sirve
para probar a la vez migraciones incompatibles de varios PR; serializar el
candidato o usar una rama/base efímera con coste controlado. Diferenciar
credenciales, Google OAuth, webhooks, dominios y cuentas de pago de prueba/real.

## Pipeline preparado

`tools/workflow-templates/ci.yml.in` define instalación limpia, puerta de bootstrap,
lint, tipos, unitarias, build, smoke E2E, audit de dependencias y SBOM. Otro job
inicia Supabase local, aplica migración, ejecuta pgTAP y verifica el diff del
contrato generado. Los artefactos se conservan como evidencia, sin datos reales.

`pin-actions.mjs` obtiene el commit real de las etiquetas oficiales fijadas y
genera `.github/workflows/ci.yml` y `release.yml`. Sin ese paso no hay workflows
activos en el paquete. Las plantillas no contienen SHA inventados. Habilitar
Actions y configurar reglas de rama sigue siendo responsabilidad del propietario.

El workflow de release **registra una aprobación y SHA; no despliega ni migra
producción**. Esto evita simular una conexión o publicar con secretos inexistentes.
SAST, secret scanning, DAST autenticado y pentest se incorporan como checks reales
antes del piloto; todavía no corren en la plantilla base.

## Configuración propuesta de Vercel

Importar el repo privado como proyecto Next.js, raíz `/`, Node 24 compatible con
el runtime disponible y build `npm run build`. El runtime administrado no siempre
permite fijar un patch exacto; registrar la versión efectiva del proveedor.
Usar previews inicialmente. Mantener el dominio productivo desconectado hasta
aprobar la salida. Seleccionar una región de funciones cercana a la base luego
de medir, no asumir que la CDN evita la latencia entre servidor y PostgreSQL.

Elegir **un solo mecanismo** de publicación productiva: integración Git con una
rama de release protegida o un pipeline CLI controlado. No activar ambos de
forma que se despliegue dos veces. Para este bootstrap se propone integración
Git para previews y promoción controlada del candidato correcto.

La configuración NEXT_PUBLIC se inserta en el build. Nunca promover a producción
un preview que fue construido con las claves/URL de staging. Un candidato a
producción debe construirse con sus variables productivas, probarse sin escrituras
reales no autorizadas y promoverse como ese artefacto. Rehacer un build con otras
variables no es promover exactamente el mismo binario.

## Secuencia de una liberación

Congelar SHA y changelog; confirmar checks; aprobar privacidad y riesgos;
verificar backup y restauración; aplicar solo migraciones aditivas compatibles;
validar esquema y permisos; construir candidato con entorno correcto; ejecutar
smoke autorizados; obtener aprobación humana; asignar dominio; observar errores,
latencia y movimientos financieros; registrar evidencia. Contraer el esquema
solo en un release posterior después de retirar lectores antiguos.

La CLI de Vercel, si se introduce, se fija a una versión verificada y se conserva
en el lockfile. Revisar `vercel --help` y comandos actuales antes de automatizar.
`--prebuilt` permite separar construcción y publicación. OIDC de runtime no
sustituye por sí mismo el token requerido por el CLI de despliegue.

## Rollback

Revertir el alias o release de la web solo si el esquema sigue siendo compatible.
Para errores de datos, detener escrituras afectadas, preservar evidencias y
usar recuperación o corrección transaccional revisada. No ejecutar migraciones
DOWN destructivas automáticas. No repetir un pago externo para reparar una UI.
Un backup sin restauración probada no acredita recuperabilidad.

## Docker opcional

`docker compose --env-file .env.local up --build` sirve para probar la web
standalone contra Supabase NO productivo alojado. No levanta toda la plataforma.
Supabase local se gestiona con la CLI, no con una copia antigua de su Compose.
El contenedor usa usuario no root y sistema de archivos de solo lectura; validar
caches/imagen y fijar digest antes de usar este camino productivamente.
No se construyó la imagen en este entorno.
