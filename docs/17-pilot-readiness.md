# P31 — preparación del piloto

## Veredicto

**NO-GO para datos reales o publicación externa.** El piloto sintético local completó solicitud, diagnóstico, presupuesto, aceptación, QA y entrega; esto no autoriza información real.

## Listo para validación local

- Portales independientes Maestro, Comercio y Cliente.
- Cinco roles y contexto de control Maestro explícito.
- Flujos transaccionales P06–P24 y P26–P30 aplicados en Supabase local.
- PWA, estados resilientes y comprobantes A4/80 mm.
- Servidor en `http://127.0.0.1:3000/`.

## Bloqueos de salida

- Comparación automatizada e inspección humana ejecutadas sobre 77 vistas de escritorio y 41 móviles. Ninguna está aceptada todavía: 85 difieren del contrato y 33 carecen de superficie propia.
- Resolver D01–D14 según sus responsables; en especial D02, D03, D04, D08, D10–D14.
- La base se respaldó y restauró correctamente en un destino desechable. Falta respaldo/restauración de objetos, worker/alertas para 80 eventos pendientes y validación de proveedores con credenciales de ensayo.
- Aprobar privacidad, retención, exportación y uso de datos reales.

Ningún estado de este documento equivale a despliegue, certificación fiscal, entrega de mensajería, pago bancario o impresión física confirmada.
