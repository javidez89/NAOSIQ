# NAOSIQ — herramienta local

> Alcance vigente: cumplir NAOSIQ V6 en local. Ver [estado completo](reports/naosiq-v6-compliance.md) y `npm run check:naosiq`. La recepción física se confirma desde el detalle; crear una orden ya no emite su voucher. Los números y descripciones de la entrega anterior que siguen abajo son históricos.

Aplicación Next.js con autenticación, PostgreSQL/Supabase local y datos sintéticos
persistentes. El trabajo parte de la base 0.1.0 guardada en este proyecto.

## Abrir en este equipo

1. Abra Docker Desktop y espere a que esté listo.
2. Abra una terminal en `D:\NAOSIQ\crm-techi-foundation` y ejecute:

```powershell
npm run local
```

3. Entre a **http://127.0.0.1:3000**.
4. Abra el archivo privado `.local/credentials.json` en su editor. Use el correo
   y contraseña de `accounts.adminA` para administrar el primer comercio.

También puede ejecutar `INICIAR_CRM.ps1`. El servidor escucha únicamente en
127.0.0.1. Al cerrar la terminal se detiene la web; PostgreSQL conserva sus datos.
Para detener los contenedores de este proyecto sin borrar datos: `npm run db:stop`.

Para probar la versión compilada, con Supabase ya activo: `npm run build` y
`npm run local:serve`. Ambos modos usan el mismo puerto; detenga uno antes de abrir el otro.

Si faltan las dependencias, ejecute primero `npm ci`. No use `db reset` para el
arranque diario: ese comando elimina la base local y sus usuarios.

## Qué está construido

- Inicio de sesión con cuentas locales verificadas y acceso por membresía.
- Comercios con nombres, rol y disponibilidad; directorio de personal autorizado.
- Registro de clientes y recepción de equipos con comprobante PDF.
- Reparaciones con búsqueda, filtros, paginación, asignación y estados en español.
- Historial por orden, pagos pendientes y confirmados por separado.
- Confirmación de ingreso con MFA real y comprobante de pago único.
- Portal del cliente limitado a sus equipos y comprobantes.
- CRM maestro con creación de comercios y selectores de personas para los accesos.
- Bloqueo de escrituras según permisos, estado del comercio y suscripción.

Las decisiones pendientes de la guía se mantienen: no se calcula un saldo sin
presupuesto aprobado ni se conceden permisos financieros al Asesor.

## Cuentas y datos de prueba

La instalación genera contraseñas aleatorias: no hay contraseñas universales.
`.local/credentials.json` y `.local/seed.json` están excluidos de Git.

| Cuenta | Uso |
|---|---|
| `adminA` / `adminB` | Administración de los comercios A y B |
| `advisorA` | Recepción de clientes y equipos del comercio A |
| `technicianA` | Equipos asignados al técnico del comercio A |
| `customerA` / `customerB` | Portal de los clientes A y B |
| `master` | Administración de la plataforma; requiere MFA |

Desde **Seguridad**, configure su aplicación de autenticación y verifique el
código de seis dígitos. El Administrador necesita MFA para confirmar pagos y el
Super Usuario para abrir el CRM maestro. El sistema no confirma transferencias
por una captura ni se conecta al banco.

Hay dos comercios, cinco clientes y seis órdenes iniciales. Las pruebas E2E crean
registros sintéticos adicionales identificados como prueba. `npm run local:seed`
puede repetirse: conserva usuarios, contraseñas y cambios realizados.

## Verificar

```powershell
npm run check
npm run build
npm run test:db
node --test scripts/local-seed.test.mjs
# Con la web y Supabase locales activos:
npm run test:local
```

Las pruebas locales usan Microsoft Edge y cuentas sintéticas de esta instalación.
El test MFA crea y elimina únicamente su factor temporal. Si usted ya configuró
MFA en esas cuentas, la prueba se detiene para no modificar su autenticador.

Evidencia y límites: [verificación local](reports/local-verification.md).
Carga inicial: [semilla local](scripts/LOCAL_SEED.md).

## Arquitectura y alcance

Se conserva Next.js + TypeScript + Supabase, con autorización SQL, RLS y
transacciones. El contrato TypeScript se generó desde PostgreSQL local y está
conectado a los clientes. Las migraciones se crearon con la CLI fijada.

Google OAuth, WhatsApp, carga de fotos, inventario/ventas, cobro de suscripciones,
página pública y PWA siguen pendientes. No se han conectado servicios externos ni
publicado la aplicación. La marca es provisional. Esta entrega es para desarrollo
local con datos de prueba; la puerta de producción sigue cerrada.

Documentos de referencia conservados:
[alcance](docs/00-scope.md), [arquitectura](docs/02-architecture.md),
[datos y permisos](docs/03-database.md), [UX](docs/09-ux.md),
[backlog](docs/10-product.md), [producción](docs/12-release.md),
[informe original 0.1.0](reports/verification.md).

`preview:offline` conserva la maqueta histórica; la herramienta con persistencia
es la aplicación Next.js que se inicia con `npm run local`.

## Cambios visibles en desarrollo

Se deja el servidor en modo desarrollo para ver los ajustes al guardar. URL: http://127.0.0.1:3000/login. Si el equipo se reinicia, ejecute `npm run local`. Consulte `reports/naosiq-brand-v6.md` para la verificación de identidad visual.
