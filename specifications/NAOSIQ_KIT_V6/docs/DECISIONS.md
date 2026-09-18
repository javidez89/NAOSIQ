> Base funcional heredada de v5. Presentación NAOSIQ v6. Para identidad visual prevalecen BRAND_MIGRATION.md y el manual recibido.

# Registro de decisiones

**Version 5.0.** Ninguna decision de esta lista queda aprobada por generar el paquete. D01-D11 provienen de F7 p. 59; D12 recoge F9 p. 12; D13-D14 son explicitaciones de arranque V5.

| ID | Decision | Responsable | Mientras se resuelve | Bloquea |
| --- | --- | --- | --- | --- |
| D01 | Permisos y limites financieros del Asesor y Tecnico | Propietario + comercio piloto | Asesor y Tecnico sin conciliacion, caja, reversas ni descuentos por defecto. Disenar escenarios delegados sin activarlos. | P14/P26; confirmar dinero delegado |
| D02 | Precios, cupos y numero de usuarios por plan | Propietario NAOSIQ | Precios null, no publicar tarifas inventadas. Plan de desarrollo sin cobro real. | P19; alta comercial productiva |
| D03 | Dias de gracia, ancla mensual y tratamiento de pago tardio | Propietario + operacion SaaS | Configurar reglas como propuestas; no ejecutar suspension real hasta aprobar calendario. | P19/P20; job de cobro real |
| D04 | Sesion, elevacion y extension accesible | Seguridad + UX | 25/30 minutos y 8 horas son hipotesis F7; elevacion 15 min. No presentar como politica aprobada. | P03/P27; paso a produccion |
| D05 | Borradores locales, retencion y dispositivos compartidos | Seguridad + producto | Desactivar persistencia privada local por defecto; borrador servidor autenticado. | P23/P27; modo offline persistente |
| D06 | Voucher por cada abono y nomenclatura del comprobante | Propietario + operacion financiera | Ledger admite abonos. Voucher final requerido; voucher parcial como opcion propuesta, pendiente de aprobacion. No presentarlo como factura electronica. | P12/P13/P28; habilitar recibo parcial |
| D07 | Sobrepagos, devoluciones, descuentos y entrega excepcional | Propietario + negocio | Bloquear sobrepago, no descontar sin permiso, no entregar con saldo salvo excepcion aprobada y auditada. | P13/P16; activar excepciones |
| D08 | Lectura del cliente durante suspension del comercio | Propietario NAOSIQ | Definir whitelist explicita. Documentos ya emitidos en solo lectura es propuesta, no hecho aprobado. | P20; portal durante suspension |
| D09 | Limites de archivos y conservacion de evidencias | Arquitectura + privacidad | No aceptar tipos arbitrarios; limites de ensayo etiquetados, sin retencion automatica irreversible. | P09/P23; captura productiva |
| D10 | Proveedor de WhatsApp automatico y pasarela avanzada | Propietario + desarrollo | WhatsApp por enlace para todos. Wompi/Bold como adaptadores opcionales; sin credenciales ni activacion real. | P30; integraciones externas |
| D11 | Garantias, consentimiento, datos y entregas | Comercio + revision especializada | Textos de demostracion; no inventar plazos ni exclusiones legales. | P09/P31; piloto con datos reales |
| D12 | Plan de vouchers, formatos y hardware | Propietario + negocio piloto | Propuesto incluido en Basico; Carta/A4/80 mm de referencia. 58 mm e impresion silenciosa fuera del arranque. | P28/P31; activar impresora en local |
| D13 | Stack, repositorio, entornos, region y responsable de operacion | Propietario + desarrollo | Next.js/TypeScript/PostgreSQL; Supabase/Vercel candidatos. Inspeccionar repo antes de fijar versiones o contratar. | P01/P31; provisionamiento |
| D14 | PWA por plataforma o por comercio y dominio propio | Producto + UX + desarrollo | Una PWA de plataforma y micrositios por ruta como propuesta inicial. No prometer instalacion separada por negocio. | P23; identidad de instalacion |

## Como aprobar

Registrar ID, valor acordado, alcance, aprobador, fecha y evidencia. Actualizar contracts/decisions.json y la historia afectada. Si cambia una regla confirmada del usuario, solicitar confirmacion expresa.

## Inicio permitido

P00 (auditoria sin cambios), foundation local, contratos, diseno de componentes y pruebas con datos ficticios no requieren contratar servicios ni resolver todas las tarifas. Los bloqueos aplican a la capacidad concreta y a su activacion productiva, no a todo el proyecto.
