# NAOSIQ - Instrucciones de proyecto

## Antes de actuar
Lee START_HERE.md, SPEC_INDEX.md y docs/BRAND_MIGRATION.md. Inspecciona el repositorio real, identifica su stack y componentes. Esta entrega es documental; no asumas que un modulo esta implementado.

## Producto
SaaS multiempresa con CRM Maestro y Super Usuario. Cada comercio dispone de su CRM; los roles son SUPER_USER, ADMIN, ADVISOR, TECHNICIAN y CUSTOMER. Mantener aislamiento, propiedad de recursos, permisos y auditoria.

## Branding
NAOSIQ es el nombre visible. Paleta y tipografia en design/tokens.json. Inter para UI; Montserrat para usos de marca cuando este disponible. Publico/cliente/voucher: negocio principal, 'Gestionado con NAOSIQ' secundario. Logo de referencia no apto como maestro final.

## No negociable
No mezclar pagos del cliente con suscripciones del SaaS. No aprobar pagos a partir de comprobantes reportados. No emitir voucher de recepcion por crear una solicitud. No repetir operaciones por timeout sin consultar su resultado. No confirmar dinero, stock, QA o custodia offline. No conceder permisos financieros por defecto al Asesor. No reescribir ledger ni auditoria.

## Entrega
Una tarea por cambio revisable. Pruebas segun el stack real: tipos, lint, unitarias, integracion, rutas/roles, E2E y visuales cuando apliquen. Reporta comandos ejecutados, resultados, riesgos y decisiones no resueltas. Nunca digas que una prueba paso si no se ejecuto.
