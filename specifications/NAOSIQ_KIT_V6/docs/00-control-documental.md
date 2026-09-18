> Base funcional heredada de v5. Presentación NAOSIQ v6. Para identidad visual prevalecen BRAND_MIGRATION.md y el manual recibido.

# Control documental y reglas de lectura

**NAOSIQ | Base 5.0 | 08 de septiembre de 2026 | Preparada para iniciar desarrollo; no es una aplicación implementada.**

## Qué consolida esta entrega

Esta versión integra el plan maestro, el blueprint, la arquitectura, la UX/UI, el rol Asesor y los vouchers de recepción y pago. El cambio no consiste en agregar un PDF al final: se actualizan las responsabilidades, el recorrido de la orden, los contratos de datos, las acciones, el backlog, la estrategia de pruebas y las tareas para Codex.

La versión 4 aportó 114 vistas y 342 acciones. La extensión de vouchers añade cuatro vistas y nueve acciones A4 sobre vistas existentes, además de doce acciones de las nuevas vistas: el inventario consolidado tiene **118 vistas y 363 acciones**. Los identificadores anteriores se conservan. Los dibujos de referencia continúan siendo los del atlas v4 y las cuatro vistas v4.1; esta entrega no los presenta como un rediseño nuevo.

## Autoridad y estado de las reglas

| Nivel | Contenido | Cómo debe tratarlo Codex |
| --- | --- | --- |
| Confirmado por el usuario | CRM Maestro, control total del Super Usuario, cinco roles, pagos básicos, WhatsApp, mensualidad y vouchers solicitados | Implementar sin retirar capacidades; cualquier cambio requiere confirmación. |
| Base documental consolidada | Flujos, inventario visual, arquitectura modular, seguridad y separación de hechos | Usar como base de trabajo; conservar su origen y registrar diferencias. |
| Propuesta de implementación | Esquemas API, nombres de campos, perfiles de timeout, permisos delegados y tecnologías candidatas | Implementar incrementalmente, con revisión y pruebas; no fingir aprobación comercial. |
| Decisión pendiente | Tarifas, límites, gracia, datos locales, formatos/hardware y alcance de abonos | No inventar el valor. Aplicar el bloqueo indicado en DECISIONS.md. |
| Histórico | Documentos v1-v4.1 conservados | Referencia de trazabilidad; sus ejemplos no prevalecen sobre esta consolidación. |

No se convierte una hipótesis en política aprobada por aparecer en una maqueta. En particular, el precio de los planes no se toma de las infografías antiguas, y la facultad del Asesor de confirmar dinero no se deduce de ver un botón en una pantalla.

## Fuentes del proyecto

| Ref. | Documento | Uso principal |
| --- | --- | --- |
| F1 | Maestro original, 74 páginas | Compilación de F2, F3 y F4; no es una fuente adicional independiente. |
| F2 | Blueprint, 15 páginas | Objetivo, arquitectura, fases 0-12 y prompts P00-P25. |
| F3 | UX/UI inicial, 51 páginas | Inventario original de 87 entradas y recorridos. |
| F4 | Arquitectura E2E, 8 páginas | Multiempresa, dos dominios de dinero y operación. |
| F5 | UX v2, 102 páginas | Paleta, tipografía, 64 IDs y excepciones. |
| F6 | UX v3, 56 páginas | Introducción del Asesor; borrador visual superado. |
| F7 | Guía maestra v4, 61 páginas | Precisión de hechos, permisos, resiliencia y decisiones D01-D11. |
| F8 | Atlas v4, 233 páginas | Vistas específicas y resultados visuales por acción. |
| F9 | Vouchers v4.1, 12 páginas | VCH-01, cuatro extensiones de pantalla y modelos imprimibles. |

Los archivos exactos y sus hashes se encuentran en `contracts/source-register.json`. Los documentos visuales se conservan en `references/visual`; los demás, en `references/history`.

## Cambios integrados respecto del blueprint original

| Tema | Antes | Base de desarrollo v5 |
| --- | --- | --- |
| Roles | Cuatro roles | SUPER_USER, ADMIN, ADVISOR, TECHNICIAN y CUSTOMER. |
| Recepción | OT y fotos | Evento de recepción física independiente y voucher imprimible. |
| Pago | Recibo genérico | Voucher del recibo confirmado; reimpresión sin nuevo ingreso. |
| Estado de OT | Secuencia con estados financieros mezclados | Estado técnico, custodia y saldo separados, tal como propone F7 p. 38. |
| Resultado incierto | Reintentar tras timeout | Consultar la misma operación; no asumir fallo ni repetir cobro. |
| Offline | Promesa amplia de continuar | Solo borradores permitidos; dinero, stock, aprobación y entrega requieren servidor. |
| WhatsApp básico | Intención/envío ambiguos | Apertura de enlace, no prueba de envío o lectura. |
| Control total | Modificaciones directas | Control sobre cualquier negocio, con actor real, auditoría y ajustes trazables. |

Estas precisiones provienen de F7 pp. 7-11, 25-26 y 32-38, y F9 pp. 2, 8-10. Los nombres concretos de API y el desglose del backlog son propuestas v5, no transcripciones de los documentos previos.

## Qué NO contiene la entrega

No hay repositorio remoto creado, credenciales configuradas, cobros activos, migraciones ejecutadas, aplicación web desplegada ni integraciones bancarias certificadas. Los escenarios de QA son especificaciones pendientes de ejecución; las comprobaciones documentales no certifican el software futuro. Los PDFs son propuestas estáticas y los modelos de voucher contienen datos ficticios.

## Cambio de una regla durante el desarrollo

Registrar el ID afectado, fuente anterior, decisión solicitada y aprobación. Actualizar primero el documento y el contrato, luego la historia y su prueba. Si una modificación altera permisos, dinero, custodia o suscripciones, no sustituirla silenciosamente en una pantalla.
