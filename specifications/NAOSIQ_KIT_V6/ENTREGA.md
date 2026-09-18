# Entrega NAOSIQ v6

## Leer
- pdf/NAOSIQ_00_FLUJO_UX_COMPLETO_IDENTIDAD_V6.pdf: integral, 303 paginas.
- pdf/NAOSIQ_01_GUIA_IDENTIDAD_APLICADA_V6.pdf: guia, 14 paginas.
- pdf/NAOSIQ_02_RECORRIDOS_CONECTADOS_V6.pdf: indices y 32 recorridos, 35 paginas.
- pdf/NAOSIQ_03_PANTALLAS_Y_ACCIONES_V6.pdf: 118 vistas y resultados de sus 363 acciones, 254 paginas.
- pdf/NAOSIQ_MODELOS_VOUCHER_*_V6.pdf: modelos de recepcion y pago en Carta, A4 y 80 mm.

## Recorrer
Abre NAOSIQ_FLUJO_NAVEGABLE_V6.html. Sus botones simulan resultados: exito, error, demora, sesion, permisos y perdida de conexion. Los campos son ejemplos, no formularios conectados a backend.

## Continuar el diseno
Las 118 vistas en design/screens son SVG con formas y texto. figma contiene el inventario y las conexiones; no es un archivo nativo de Figma, ni tiene componentes, Auto Layout o interacciones nativas creadas.

## Implementar
BR00 revisa la migracion de marca antes de cambiar codigo. BR01, BR02 y BR03 implementan el sistema visual y su verificacion por etapas. Los prompts funcionales P00-P31 conservan sus identificadores. No ejecutar todas las tareas a la vez.

## Precedencia
El manual original rige la marca. Los contratos funcionales v5 y de navegacion v5.1 siguen rigiendo negocio, IDs, permisos y estados. Las decisiones abiertas siguen abiertas. La capa v6 rige la identidad aplicada, el diseno mostrado y los cambios de texto documentados. Los PDF anteriores son antecedentes y no se modificaron en origen.

## Validar
Ejecuta python scripts/validate_delivery.py. El manifiesto SHA256 verifica la integridad de los archivos entregados. Ninguna prueba documental acredita integraciones reales, despliegue, seguridad de produccion o impresion fisica.
