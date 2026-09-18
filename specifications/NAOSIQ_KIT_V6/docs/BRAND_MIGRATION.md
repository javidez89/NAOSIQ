# NAOSIQ - Migracion de identidad v6

## Autoridad
El manual NAOSIQ v1.0 es la fuente de nombre, slogan, paleta, tipografias, voz, nomenclatura y co-branding. Los contratos v5/v5.1 conservan el modelo funcional. Los valores derivados de contraste y layouts son propuestas de esta entrega.

## Invariantes
- Conservar 118 IDs de pantalla, 363 IDs de accion, 32 recorridos y 5 roles.
- El Super Usuario controla el CRM Maestro y cualquier comercio con actor real y auditoria.
- Mantener organization_id y todas las comprobaciones server-side.
- No conceder permisos financieros al Asesor por el rebranding.
- Basico: WhatsApp, Bre-B, Nequi, transferencia y efectivo.
- Separar pagos cliente-comercio y suscripciones comercio-plataforma.
- Voucher de recepcion tras custodia confirmada; voucher de pago tras dinero confirmado.
- Reportar no es confirmar; reimprimir no es repetir una transaccion.
- Un timeout no acredita fallo. Consultar el resultado original antes de repetir.

## Cambio visible
Usar NAOSIQ, CONECTA / OPTIMIZA / CRECE y la firma 'Gestionado con NAOSIQ'. La plataforma lidera el CRM; el comercio lidera su pagina, su portal y sus documentos. Se conservan las etiquetas funcionales en espanol.

## Limites tecnicos
No renombrar rutas, tablas, variables de entorno, callbacks OAuth, claves de almacenamiento ni dominios mediante un find/replace global. Separar cualquier migracion tecnica en una tarea aprobada con plan de compatibilidad.

## Activos
El lockup incluido es una referencia raster extraida del manual, no el logo maestro. Reemplazar por SVG oficial antes de publicacion. Las fuentes no estan incluidas. Inter es la familia renderizada; Montserrat se declara para usos comerciales.

## Trabajo
Ejecutar BR00 primero; luego BR01, BR02 y BR03 con revision de cada entrega. No ejecutar todos los prompts de una vez ni considerar pruebas documentales como pruebas de la aplicacion.
