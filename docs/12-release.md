# 12. Puerta de producción

**Estado de esta entrega: BLOQUEADA para datos reales.**

`RELEASE_APPROVED=true` es una barrera operacional, no una certificación. Solo se
activa después de esta lista y de la aprobación humana. La infraestructura debe
impedir que una rama no revisada cambie esa configuración y se publique sola.

## Bootstrap y construcción
- [ ] Lockfile real revisado y commit; instalación limpia reproducible.
- [ ] Configuración y migración generadas por la CLI y revisadas.
- [ ] Contrato Database real enlazado al cliente y comandos RPC tipados.
- [ ] Build completo, lint y typecheck sin errores.
- [ ] pgTAP y E2E autenticados de los cinco roles pasan.
- [ ] PDF generado, renderizado, inspeccionado e impreso con textos largos.
- [ ] Rutas y campos incompletos no se muestran como capacidades disponibles.

## Seguridad y privacidad
- [ ] Proyectos y secretos separados; nada real en preview/QA.
- [ ] Rate limit y cuotas verificados en web y Data API/RPC.
- [ ] MFA, revocación de sesión y recuperación seguras.
- [ ] RLS A/B, escalamiento, caché y concurrencia financiera probados.
- [ ] SAST, SCA y secret scanning ejecutados; hallazgos tratados.
- [ ] Pentest autorizado independiente y retest, sin críticos/altos abiertos.
- [ ] Políticas, consentimientos, retención y roles de tratamiento definidos.
- [ ] Upload permanece apagado o tiene cuarentena, validación y AV aprobados.
- [ ] Cabeceras/CSP reales y configuración del proveedor revisadas.

## Producto y operación
- [ ] Permisos Asesor, estados, planes, suspensión y marca aprobados.
- [ ] Ingresos SaaS y del comercio separados en UI, datos y proveedores.
- [ ] Presupuestos/abonos/saldos y conciliación aprobados antes de cobrar.
- [ ] Backups de DB y archivos restaurados; RPO/RTO medidos.
- [ ] Responsable de alertas, incidentes y soporte asignado.
- [ ] Integraciones necesarias del plan vendido funcionan con evidencia.
- [ ] Paginación, selectores y accesibilidad adecuadas para uso real.
- [ ] Presupuesto/plan comercial de proveedores y dominio autorizados.
- [ ] SHA, migraciones, SBOM, changelog y plan de rollback registrados.
- [ ] Aprobación humana documentada y piloto acotado definido.

La ausencia de una evidencia mantiene el control pendiente; no se marca aprobado
por haber añadido un comentario al código o un archivo de test sin ejecutar.
