# 01. Herramientas y razones

## Decisión recomendada: pocas piezas, responsabilidades claras

| Herramienta | Papel | Razón de la elección | Límite / precaución |
|---|---|---|---|
| Next.js + React + TypeScript | Web responsive, servidor de aplicación, rutas y formularios | Un producto web y un lenguaje principal; lógica de negocio separada | No convierte el frontend en frontera de autorización |
| Supabase PostgreSQL | Datos, restricciones, RLS y transacciones | Modelo relacional para reparaciones, comercios y pagos | Diseñar privilegios explícitos; no confiar solo en tenant_id |
| Supabase Auth | Identidad, sesiones y MFA | Evita construir autenticación casera | Google login no asigna roles; revocación de sesiones debe probarse |
| Supabase Storage | Futuras fotos/documentos privados | Integración con permisos y almacenamiento de objetos | Todavía no habilitado; falta cuarentena y antivirus |
| Git + GitHub | Fuente, revisión, issues y evidencia | Historial y control de cambios | Un repo privado no es una protección de rama automática |
| GitHub Actions | CI, controles y evidencia de aprobación | Mismo proceso en cada cambio | Los workflows se generan con SHA reales y necesitan activación |
| Vercel | Alojamiento principal de Next.js | Ruta administrada para publicar la web | No aloja nuestro PostgreSQL y no ejecuta Docker Compose |
| Google Cloud / OAuth | Proveedor de acceso Google | Solicitud disponible del proyecto | Sin Firebase paralelo ni permisos de Drive/Gmail/Maps innecesarios |
| Docker | Supabase local y salida opcional de hosting | Entornos repetibles y portabilidad de la web | No necesario para desplegar la web en Vercel |
| npm + lockfile | Gestión de dependencias | Menos complejidad para este tamaño inicial | Resolución real y npm ci; no regenerar lockfile en cada CI |
| Node Test Runner | Pruebas unitarias del dominio | Ejecutable sin un framework adicional de tests | No sustituye integración o navegador |
| pgTAP | Pruebas SQL y RLS | Evalúa restricciones bajo roles reales de PostgreSQL | Requiere la base local funcionando |
| Playwright | Flujos de navegador | Base para escritorio, móvil y regresión E2E | Esta entrega solo incluye smoke tests |
| ESLint + TypeScript | Coherencia y errores estáticos | Detectar fallos antes de ejecutar | No son un pentest ni un SAST completo |
| OWASP ZAP | Análisis dinámico autorizado | Baseline y futura exploración autenticada | Baseline es pasivo y no demuestra ausencia de vulnerabilidades |

## Complementos por necesidad, no compras automáticas

Figma se propone para biblioteca visual y flujos de los cinco roles; todavía no
se creó un archivo ni se conectó el repositorio a Figma. Un servicio de errores
como Sentry puede incorporarse con limpieza de datos personales y muestreo; antes
se debe definir presupuesto, retención y responsable de alertas. Un proveedor SMTP
transaccional será necesario para invitaciones y recuperación operativa; Gmail
personal no será el motor de envíos masivos de la plataforma.

Para WhatsApp se preparará un adaptador oficial/proveedor autorizado con
credenciales por negocio y flujo de consentimiento. Para pagos se evaluará Wompi,
Bold u otro proveedor según el país, cuenta del comercio y alcance contratado.
No se ha elegido una pasarela ni se ha contratado ningún servicio externo.

SAST (por ejemplo CodeQL), detección de secretos y análisis de contenedores deben
activarse antes del piloto; disponibilidad y coste dependen del plan y del
servicio elegido. No están instalados como si ya hubieran escaneado la entrega.

## Qué no incorporar ahora

No Kubernetes, microservicios, Kafka, Elasticsearch, Redis, NestJS, Firebase Auth,
un segundo CRM, una segunda base principal ni un monorepo con herramientas
adicionales por costumbre. Tampoco un ORM que obligue a saltarse RLS con una
conexión privilegiada. Añadir una pieza requiere problema medido, ADR, coste,
responsable y pruebas. Un worker duradero puede introducirse cuando se implemente
WhatsApp; no necesita convertirse en una plataforma de microservicios.

## Coste y sostenibilidad

No se fija una cotización no verificada. Calcular:

`coste = hosting + base/auth + almacenamiento + egreso + backups + mensajes + correo + observabilidad + herramientas + comisiones por pago + soporte + impuestos`.

Medir comercios activos, usuarios, reparaciones/mes, fotos por orden, peso medio,
retención, PDFs, mensajes y picos de concurrencia. Separar el coste de la
suscripción SaaS de las comisiones del dinero cobrado por cada comercio.
El plan Hobby de Vercel se documenta como uso personal no comercial: para operar
este CRM comercial hay que escoger un plan compatible. No asumir que los niveles
gratuitos tienen el respaldo, SLA o capacidad del producto pagado.

## Alternativas y salida

Una web standalone puede moverse a otro alojamiento de contenedores, manteniendo
PostgreSQL. Migrar también Supabase Auth, Storage y sus funciones de identidad no
es una operación gratuita: hay que sustituir adaptadores, políticas, sesiones y
backup de objetos. Por eso se mantienen reglas puras fuera del SDK y SQL
versionado. No se promete ausencia total de dependencia del proveedor.

Fuentes técnicas: [14-sources](14-sources.md).
