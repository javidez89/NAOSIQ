# 13. Preparación de cuentas e integraciones

## GitHub

Crear una organización o repositorio privado bajo una cuenta del propietario.
Activar MFA, definir propietarios de emergencia, permisos mínimos, protección de
main y entorno production con revisores. Sustituir CODEOWNERS.example por dueños
reales antes de exigir su aprobación. Configurar Actions y límites de gasto.

```bash
# Después de bootstrap, migraciones y revisión de archivos
# Ejecutar dentro del repositorio, no en una carpeta con otros proyectos.
git init -b main
git add .
git diff --cached --name-only
git status --short
# Confirmar que no se incluyeron .env, claves, datos reales ni node_modules.
git commit -m "chore: initialize CRM TECHI foundation"
# Crear el repositorio privado en GitHub y copiar su URL real.
git remote add origin URL_REAL_DEL_REPOSITORIO_PRIVADO
git push -u origin main
```

El marcador de URL no es un repositorio existente. Esta entrega no ejecutó esos
comandos sobre una cuenta conectada ni creó repositorios remotos.

## Supabase

Primero local. Después crear proyectos separados staging/production en una
organización controlada. Seleccionar región y plan a partir de latencia, coste,
retención y recuperación. Revisar red, esquemas expuestos, Auth, contraseñas,
URLs permitidas, SMTP, MFA y asesores de seguridad. La clave publicable puede
estar en el navegador; las claves secretas no. El JWT del usuario sigue siendo
necesario y no sustituye las reglas de autorización.

No guardar credenciales de distintos comercios en un JSON público. Las
integraciones necesitan secretos custodiados y un servicio que los use sin
devolverlos al frontend. Rotación y revocación deben quedar documentadas.

## Google

Crear proyecto OAuth del propietario, pantalla de consentimiento y cliente web.
Configurar la URI de callback que exige el proveedor Supabase y las URLs de
retorno de la aplicación por entorno. Solicitar solo identidad básica necesaria;
no pedir Gmail, contactos, calendario, Drive o Maps para iniciar sesión.
Probar primero con usuarios de prueba. El secreto OAuth reside en la
configuración del proveedor, no en NEXT_PUBLIC. No se ha configurado una cuenta.

## Vercel

Importar el repo, separar variables de Preview/Production, no incluir datos
productivos en PRs, revisar protección de despliegues y permisos del equipo.
APP_ORIGIN es el origen exacto del entorno, sin comodines ni ruta.
APP_ENV identifica desarrollo/staging/production; RELEASE_APPROVED mantiene
cerrado el uso productivo hasta completar la puerta. No olvidar los callbacks
OAuth y el efecto build-time de NEXT_PUBLIC al promover.

## WhatsApp

Decidir la titularidad de la cuenta/número de cada comercio y su onboarding.
Implementar adaptador, opt-in, plantillas necesarias, estados del mensaje,
webhooks verificados, idempotencia, reintentos, DLQ y panel de incidencias. La
capacidad en el plan Básico no significa mensajería ilimitada sin coste del
proveedor. Definir límites comerciales sin eliminar el requisito acordado.
El adaptador deshabilitado lanza un error, nunca devuelve un envío ficticio.

## Pasarelas

Evaluar proveedor y modalidad por país/comercio. No dirigir automáticamente el
dinero de todos los talleres a una sola cuenta del SaaS. Para el webhook futuro:
validar firma/checksum sobre el cuerpo original según proveedor, tolerancia de
replay, identidad de la cuenta, referencia, moneda e importe; deduplicar evento;
confirmar mediante transacción; conciliar con consulta al proveedor cuando aplique.
Un retorno exitoso del navegador no acredita aprobación bancaria.

## Secretos: inventario inicial

| Configuración | Sensibilidad | Dónde |
|---|---|---|
| URL y clave publicable Supabase | Pública, protegida por RLS y sesión | Variables NEXT_PUBLIC |
| APP_ORIGIN / APP_ENV | No secreta | Variables por entorno |
| Secreto OAuth Google | Secreto | Proveedor Auth / gestor autorizado |
| Token de despliegue | Secreto, si se usa CLI | Secret del entorno CI, no PR |
| Credencial/URL DB privilegiada | Secreto | Operación/migración autorizada |
| Tokens WhatsApp/pasarela | Secretos por integración | Custodia del backend, nunca ajustes públicos |
| Claves de backup | Secretos | Gestor independiente y acceso restringido |

No se adjunta ningún secreto real. El documento no implica que esas
integraciones ya estén contratadas o disponibles en la cuenta del usuario.
