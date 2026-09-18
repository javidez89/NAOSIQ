> Base funcional heredada de v5. Presentación NAOSIQ v6. Para identidad visual prevalecen BRAND_MIGRATION.md y el manual recibido.

# UX/UI, acciones y recuperación

**Origen: F5 pp. 4-6; F7 pp. 20-39; F8 completo; F9 pp. 3-6. Los valores de tiempo siguen siendo hipótesis por aprobar, no límites del proveedor.**

## Referencia visual y cobertura

Se conserva el atlas v4 de 233 páginas con sus 114 vistas y paneles de resultado. Se integra la extensión de vouchers VR01-VR04 de v4.1 y se añaden acciones sin renumerar las existentes. El inventario de ejecución es `contracts/screens-actions.json`: **118 vistas, 363 acciones**. `screen-changes-v5.json` hace explícitas las adiciones; `coverage-v1-v4.json` conserva la trazabilidad de las 87 entradas iniciales.

Codex no debe convertir todos los destinos de maqueta en enlaces de ruta literal. Un Asesor puede reutilizar el componente de verificación con el permiso correspondiente, sin entrar a un panel de Administrador o al Maestro. Los destinos lógicos se resuelven según actor, contexto y retorno seguro.

## Colores y tipografía

| Token | Valor | Uso |
| --- | --- | --- |
| Azul noche | #0B0F1A | Navegación, cabeceras y estructura. |
| Violeta primario | #7C3AED | Acción principal y foco contextual. |
| Cian | #06B6D4 | Acento; no usar texto cian pequeño sobre blanco sin comprobar contraste. |
| Fondo | #F7F8FC | Superficie general. |
| Texto | #0B0F1A | Contenido principal. |
| Secundario | #526071 | Ayuda y datos secundarios. |
| Borde | #E5E7EB | Separación suave. |
| Éxito / aviso / error | #16A34A / #F59E0B / #DC2626 | Icono + texto; no depender solo del color. |
| Proceso | #7C3AED | Trabajo en curso. |

Inter para interfaces, incluidos encabezados de producto, navegacion, botones, formularios y tablas. Montserrat para titulares de marca y usos comerciales cuando este disponible. Esta exportacion utiliza Inter; no se distribuyen archivos de fuente.

Escala heredada: H1 32 px, H2 26 px, H3 22 px, texto 14 px y etiqueta 13 px. Espaciado 4/8/12/16/24/32/48 px. Objetivo de control táctil del sistema: 48 px. Radios: tarjeta 14 px, input 8 px, botón 10 px según tokens v4. Probar zoom, reflow y legibilidad; la densidad no justifica recortar etiquetas o reducir importes ilegibles.

## Componentes y estados obligatorios

Botón primario/secundario/peligro, input, selector, tabla paginada, tarjeta, badge, modal, drawer, tabs, stepper, timeline, uploader, visor QR/PDF, chat, alerta, skeleton y banner de red. Por componente documentar foco, disabled, loading, validación, vacío, éxito y recuperación. Un control disabled explica por qué y qué puede hacer el usuario.

En formularios: etiqueta persistente; errores junto al campo y resumen enfocable; preservar lo digitado cuando se conoce su persistencia. En confirmaciones sensibles: recurso, importe, efecto y botones inequívocos. No usar "Aceptar" para acciones diferentes como pagar, recibir equipo o anular un movimiento.

## Experiencias por rol

| Experiencia | Foco | Navegación |
| --- | --- | --- |
| Maestro | Control de comercios, suscripciones y auditoría | Sidebar desktop, tabla, filtros y banda de control de comercio. |
| Administrador | Operación y configuración | Responsive, accesos por dominio y ficha de OT central. |
| Asesor | Atención, recepción, seguimiento y mostrador | Cola diaria, búsqueda rápida, formularios guiados. |
| Técnico | Evidencia y ejecución | Mobile-first, QR, pocos pasos, estado de sincronización. |
| Cliente | Confianza y autoservicio | Mobile-first, seguimiento, pagos, documentos y ayuda. |

## Contrato de pantalla

Cada vista tiene ID, origen, objetivo, ruta propuesta, contenido, roles, regla principal, perfil de tiempo y acciones identificadas. Cada acción tiene etiqueta, destino lógico, permiso, condición de entrada, éxito, error, recuperación y estado de implementación. Las pruebas conectan historia, acción y resultado.

Ejemplo: `AS03.A3` confirma recepción; `AS03.A4` abre su voucher. La primera cambia custodia; la segunda consulta/prepara representación. Si el PDF falla, `AS03.A3` no se reproduce. `CL19.A4` abre impresión, no confirma un pago.

## Perfiles de espera y timeout

| Perfil | Propuesta de comportamiento | Recuperación |
| --- | --- | --- |
| READ | Aviso a 8 s; a 20 s ofrecer dejar de esperar | Reintentar lectura, conservar filtros y fecha del dato. |
| WRITE | Aviso a 8 s; a 20 s resultado por consultar | Consultar operación original, no inferir rollback. |
| AUTH | A 20 s mostrar demora/ayuda | Validar callback tardío y destino; evitar intentos paralelos sin control. |
| DRAFT | Propuesta: guardar tras 2 s sin escribir y al avanzar | Mostrar ACK real; sin ACK no declarar guardado. |
| FIN | A 20 s estado financiero incierto | No pagar ni cobrar otra vez; verificar/reconciliar. |
| UPLOAD | Barra por archivo; 90 s sin progreso, no duración total | Reintentar solo pendientes, mantener los confirmados. |
| MSG | A 8 s enviando; a 20 s consultar | Mismo client_message_id y texto conservado. |
| DOC / JOB | A 8 s mostrar trabajo en preparación | job_id consultable al volver, aunque se cierre la pestaña. |
| EXTERNAL | Sin SLA inventado del proveedor | Registrar apertura y verificar fuente real al regresar. |

Estos tiempos se evalúan con pruebas y accesibilidad. Una pantalla READ puede contener un botón FIN: manda el contrato de la acción. Un timeout de fetch, una sesión expirada y un error de validación son estados diferentes.

El perfil `LOCAL` identifica navegación, apertura de ayuda o un cambio local de interfaz. No tiene timeout HTTP propio; si dispara una consulta o mutación, esa operación aplica el perfil READ, WRITE o FIN correspondiente. No equivale a guardar en servidor.

## Sesión y reautenticación

F7 propone para personal aviso a los 25 min, vencimiento a 30 min, límite absoluto de 8 h y elevación del Super Usuario de 15 min. D04 debe aprobar estos valores y definir cliente. Actividad de polling no se toma automáticamente como interacción humana.

Aviso con foco accesible: "Tu sesión está por vencer. Guarda tus cambios o continúa trabajando". Acciones: Continuar sesión / Guardar y salir. No cerrar mientras se ofrece una extensión incoherente; implementar el mecanismo de tiempo ajustable/extensible aplicable [W6]. Al volver: revalidar identidad, tenant, permiso, recurso, versión y operación anterior. Nunca reenviar automáticamente el último pago.

## Cerrar, recargar o perder el navegador

Mostrar el último guardado confirmado, diferenciado de copia local. Para navegación interna con cambios: Guardar y salir / Salir sin guardar / Continuar editando. El cierre forzado, energía o almacenamiento lleno pueden perder cambios no persistidos; no prometer recuperación total.

Al reabrir: detectar borrador autorizado, comparar versión y recuperar con confirmación. Un archivo seleccionado pero nunca subido puede necesitar seleccionarse otra vez. Cambiar cuenta o comercio limpia datos temporales que no deben compartirse. Si no hay borrador, reconocerlo sin mensaje positivo falso.

## Errores de carga y página

Usar estados diferenciados para no encontrado, sin permisos, sesión vencida, mantenimiento, error recuperable y datos parciales. Una tarjeta fallida no debe borrar el resto del dashboard. La página blanca se reemplaza por un límite de error con retorno y correlation ID seguro. El usuario no ve stack traces ni claves internas.

Empty state: explicar si no hay registros, si no coinciden filtros o si faltan permisos. No mostrar "No tienes reparaciones" cuando falló la API. Una cifra del caché muestra su fecha y no se presenta como estado vigente para autorizar dinero o entrega.

## Mensajes y escenarios de recuperación

| Situación | Texto propuesto | Acción |
| --- | --- | --- |
| Solicitud creada | Tu solicitud quedó registrada. El taller confirmará la recepción del equipo. | Ver seguimiento. |
| Equipo recibido | Recibimos tu equipo. Puedes obtener el voucher de recepción. | Obtener voucher. |
| Pago reportado | Recibimos tu reporte. El pago sigue pendiente de verificación. | Ver estado. |
| Pago confirmado | El pago fue confirmado. Tu comprobante está disponible o en preparación. | Ver documento. |
| Resultado incierto | Estamos verificando el resultado. No pagues de nuevo. | Consultar operación. |
| Versión cambió | Otra persona actualizó este registro. Revisa los cambios antes de guardar. | Comparar versiones. |
| Local solamente | Guardado solo en este dispositivo; pendiente de sincronización. | Sincronizar al volver. |
| No guardado | No pudimos guardar estos cambios. | Reintentar / conservar copia permitida. |
| PDF fallido | El registro está confirmado; no pudimos preparar el voucher. | Reintentar archivo. |
| Impresión cerrada | La vista de impresión se cerró. El voucher sigue disponible. | Volver / descargar. |

## Offline y PWA

Consentimiento y dispositivo confiable antes de datos privados persistentes. Borradores técnicos/recepción pueden prepararse si la política lo habilita; no se confirman como custodia, QA, stock, dinero ni entrega. Al reconectar: autenticación, contexto, versión y permiso; conflicto requiere comparación. No "última escritura gana" para pagos o aprobaciones.

Las actualizaciones de PWA muestran aviso y esperan una salida segura cuando hay trabajo pendiente. Instalar no garantiza soporte offline ni notificación en todos los dispositivos. Probar navegadores reales y ofrecer alternativa web [W3].

## Accesibilidad y criterio de entrega visual

Contraste de texto y controles, foco visible, navegación por teclado, lectura de mensajes por tecnología de asistencia y zoom/reflow. No solo toasts fugaces para errores. No exclusivamente color para estados. Validar mobile 390 px como referencia del proyecto y otros anchos reales. Las capturas y pruebas deben asociarse al ID de pantalla y acción; un mockup estático no prueba cumplimiento de la aplicación.
