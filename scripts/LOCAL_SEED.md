# Datos sintéticos de desarrollo local

Una vez iniciado Supabase y aplicadas las migraciones del proyecto, ejecute desde
la raíz del repositorio:

```bash
node scripts/local-seed.mjs
```

Requiere Docker local y la CLI fijada instalada por `npm ci`. No inicia ni reinicia
servicios, no ejecuta `db reset`, no admite un destino remoto y comprueba las IP de
loopback de la API y la base, el contexto Docker y el contenedor PostgreSQL.
`.local/` debe estar en `.gitignore`; el script se detiene si falta esa exclusión.

Crea siete cuentas sintéticas verificadas para representar los cinco roles:
`master`, `adminA`, `adminB`, `advisorA`, `technicianA`, `customerA` y `customerB`.
Cada instalación tiene correos en `techi.example.test` y contraseñas aleatorias.
Los accesos están en `.local/credentials.json`; ábralo en su editor y no lo copie
a chats, capturas, informes ni commits. Nunca se imprimen las claves o contraseñas.
En sistemas POSIX se crean archivos con modo 0600; en Windows heredan los permisos
de su carpeta de usuario/proyecto.

El comercio A incluye asesor, técnico y cliente de portal; el B tiene otro admin
y otro cliente para verificar el aislamiento. Se crean cinco clientes y seis
órdenes con comprobantes de recepción, además de un pago de prueba de COP 50.000
**pendiente**. No se genera ningún comprobante de pago confirmado ni se decide el
precio del plan. La suscripción sintética vence un año después de la instalación.

Los UUID estables están en `.local/seed.json`: `tenants.a/b`,
`customers.aPortal/aWalkIn/aOther/bPortal/bWalkIn`,
`repairs.aPhone/aLaptop/aTablet/aConsole/bPhone/bLaptop`, `vouchers` con las mismas
claves de órdenes y `payments.aPending`. Ambos JSON incluyen `installationId`.
Estos archivos permiten repetir el proceso y escribir E2E sin contraseñas fijas.

La segunda ejecución conserva cuentas, contraseñas, roles existentes, vigencia,
órdenes y modificaciones hechas desde la aplicación. No restablece credenciales
ni reasigna una cuenta por coincidencia de correo. Si encuentra una cuenta ajena
a la instalación se detiene. También rechaza correos ajenos al dominio sintético,
cuentas adicionales y roles alterados en el archivo de credenciales. El historial
y los comprobantes solo se insertan cuando se crea una orden nueva.
Un archivo `seed.lock` impide dos cargas simultáneas;
solo retírelo después de comprobar que no queda otro proceso de carga ejecutándose.

Si falta `.env.local`, se crea con la URL y clave **públicas** de Supabase local,
`APP_ENV=local` y `APP_ORIGIN=http://127.0.0.1:3000`. Si ya existe se conserva; una
URL de Supabase remota o distinta provoca un error. La clave administrativa se
usa solamente en memoria en este script para Auth Admin. Los datos iniciales se
insertan mediante PostgreSQL administrativo dentro del contenedor local y se
registran como `local_seed.*` en la auditoría. No se expone esta operación por HTTP.

Abra `http://127.0.0.1:3000/login` y use una cuenta del archivo privado. El
Super Usuario debe configurar y verificar TOTP en `/app/security` antes de entrar
a `/master`; el admin también necesita TOTP para confirmar ingresos. El script no
enrola ni desactiva MFA y no modifica la autorización o las políticas RLS de la app.

Para verificar las barreras del script sin Docker ni datos:

```bash
node --test scripts/local-seed.test.mjs
```

El bootstrap usa las APIs oficiales de [crear usuario](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
y [listar usuarios](https://supabase.com/docs/reference/javascript/auth-admin-listusers)
y consulta la ayuda de `status` de la CLI instalada antes de ejecutarla.

## Aceptación y evidencia local

El criterio de esta entrega es iniciar dos comercios sintéticos con cuentas de los
cinco roles, obtener IDs estables para E2E y repetir la carga sin duplicar ni
sobrescribir los datos iniciales. El impacto queda limitado a Auth y PostgreSQL
locales y a los archivos privados de desarrollo; no modifica políticas RLS,
permisos de la aplicación ni datos remotos.

Verificación ejecutada con Supabase local y las migraciones `foundation` y
`directory` aplicadas: dos cargas consecutivas terminaron correctamente con
7 cuentas, 2 comercios, 5 clientes, 6 órdenes y 6 comprobantes de recepción.
La comparación SHA-256 de ambos archivos privados antes y después de la segunda
carga confirmó que las credenciales, las contraseñas y los IDs se conservaron.
Las tres pruebas de barreras locales, contratos sintéticos y rechazo de cuentas
alteradas también pasaron. Esto verifica el bootstrap; los flujos autenticados
de la aplicación se evalúan por separado en E2E.
