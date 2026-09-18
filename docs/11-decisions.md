# D01–D14: registro canónico y propuesta de aprobación

Fuente de IDs: `D:/NAOSIQ/NAOSIQ_KIT_V6/contracts/decisions.json`. Este archivo reemplaza la numeración local anterior, que asignaba asuntos distintos a los mismos IDs. Ninguna propuesta está aprobada hasta que el usuario la acepte explícitamente.

| ID | Decisión canónica | Recomendación para el piloto | Consecuencia principal | Estado |
| --- | --- | --- | --- | --- |
| D01 | Permisos financieros del Asesor y Técnico | Mantenerlos sin conciliación, reversas, caja ni descuentos; delegación temporal por operación sólo después del piloto | El Administrador conserva el control del dinero; hay más pasos en mostrador | PENDIENTE_APROBACION |
| D02 | Precios, cupos y usuarios por plan | Un plan Piloto sin cobro, con límites observados y sin publicar tarifas | Permite medir consumo sin prometer precio comercial | PENDIENTE_APROBACION |
| D03 | Gracia, ancla mensual y pago tardío | No suspender automáticamente durante el piloto; registrar `past_due` y exigir revisión Maestro | Reduce bloqueos erróneos; requiere intervención operativa | PENDIENTE_APROBACION |
| D04 | Sesión, elevación y accesibilidad | Sesión máxima 8 h, inactividad 30 min y elevación MFA 15 min; avisar antes de cerrar | Mejora seguridad, obliga a implementar aviso y renovación accesible | PENDIENTE_APROBACION |
| D05 | Borradores, retención y dispositivos compartidos | Borradores privados sólo en servidor; nada sensible persistido offline | Menor capacidad sin conexión, menor exposición en equipos compartidos | PENDIENTE_APROBACION |
| D06 | Voucher por abono y nomenclatura | Emitir “Comprobante de abono” por cada ingreso confirmado y “Estado de cuenta” consolidado; nunca llamarlo factura | Aumenta documentos, mejora trazabilidad financiera | PENDIENTE_APROBACION |
| D07 | Sobrepagos, devoluciones, descuentos y entrega excepcional | Bloquear sobrepago; reversas compensatorias; descuentos y entrega con saldo requieren Administrador+MFA+motivo | Flujo más estricto y auditable | PENDIENTE_APROBACION |
| D08 | Lectura del cliente con comercio suspendido | Permitir sólo órdenes y documentos propios ya emitidos; bloquear solicitudes, pagos e interacción | Conserva acceso a evidencia sin permitir nueva operación | PENDIENTE_APROBACION |
| D09 | Límites y conservación de evidencias | JPG/PNG/PDF, 10 MiB por archivo, 10 por orden durante piloto; retención manual, bucket privado y sin borrado automático | Coste y capacidad controlados; política definitiva queda pendiente de revisión especializada | PENDIENTE_APROBACION |
| D10 | WhatsApp y pasarela avanzada | WhatsApp por enlace y pagos manuales durante piloto; adaptadores automáticos permanecen apagados | Evita dependencia y costes antes de validar operación | PENDIENTE_APROBACION |
| D11 | Garantías, consentimiento, datos y entregas | Datos sintéticos primero; textos y plazos legales requieren revisión especializada antes de clientes reales | Impide iniciar piloto real hasta aprobar privacidad y documentos | PENDIENTE_APROBACION |
| D12 | Vouchers, formatos y hardware | A4 y 80 mm; diálogo del navegador, sin impresión silenciosa; 58 mm fuera del piloto | Compatible con hardware común y sin afirmar impresión física | PENDIENTE_APROBACION |
| D13 | Stack, entornos, región y operación | Next.js+Supabase+Vercel candidatos; staging separado; región cercana tras medir; un responsable operativo nombrado antes de producción | Exige presupuesto, propietario y staging antes de aprovisionar producción | PENDIENTE_APROBACION |
| D14 | PWA y dominio propio | Una PWA NAOSIQ; micrositios por slug; dominios propios después del piloto | Menos complejidad de instalación y certificados | PENDIENTE_APROBACION |

## Dependencias de aprobación

- D01, D06 y D07 gobiernan F15–F19 y cualquier acción financiera o de entrega.
- D02, D03 y D08 gobiernan planes, suspensión y continuidad del portal.
- D04 y D05 gobiernan sesión, recuperación, offline y borradores.
- D09 y D11 bloquean evidencias y datos reales.
- D10 bloquea proveedores externos.
- D12 bloquea validación física de impresión.
- D13 y D14 bloquean staging, producción, dominio e instalación final.

## Riesgos conservados

El aislamiento multiempresa, la duplicación de dinero y la repetición de operaciones inciertas son riesgos críticos. Se mantienen claves compuestas, RLS, RPC autorizadas, idempotencia, ledger compensatorio y auditoría. Un backup SQL no cubre objetos; una integración simulada no acredita entrega; una ruta o maqueta no acredita sus acciones.
