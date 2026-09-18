# Reglas para agentes y colaboradores

Alcance vigente solicitado por el usuario: este mismo CRM debe cumplir el paquete
`D:/NAOSIQ/NAOSIQ_KIT_V6`, incluidos `pdf/` y `prompts/`, en local. Consultar su
`SPEC_INDEX.md`, `docs/BRAND_MIGRATION.md` y `docs/DECISIONS.md`, y el registro de
cobertura `docs/naosiq-v6-coverage.json` de esta aplicación. La marca aprobada es
NAOSIQ; los nombres técnicos existentes no se migran por un reemplazo global.
Conservar todos los IDs de pantallas, acciones y recorridos. Una capacidad parcial
no acredita cumplimiento completo de un prompt. No inventar valores pendientes.

Preferencia persistente del usuario (2026-09-12): dejar abierto el servidor local
al terminar cada entrega para ver los ajustes. Preferir desarrollo en 127.0.0.1:3000
con actualización automática; si es necesario reiniciarlo, restaurarlo y comprobar
HTTP antes de terminar. No detener servicios de otros proyectos.

1. Trabajar exclusivamente en CRM TECHI; no mezclar otros proyectos.
2. Leer README, docs/00-scope.md, docs/02-architecture.md y docs/12-release.md antes de cambiar código.
3. Una historia por cambio. Registrar criterio de aceptación, impacto y evidencia real.
4. Nunca cambiar roles, permisos financieros del Asesor, precios, marca aprobada,
   garantías, retención o reglas de negocio pendientes como si ya estuvieran autorizados.
5. UI -> comandos -> SQL autorizado. Tenant_id no es una credencial. Probar A y B.
6. No introducir secretos, bypasses, datos reales ni sesiones de producción en pruebas.
7. Dominio puro sin React, Next ni Supabase. Adaptadores externos desacoplados.
8. Crear migraciones con la CLI fijada. No editar una migración aplicada ni hacer db reset remoto.
9. Actualizar estado de implementación y pruebas. Test escrito no es test ejecutado;
   compilar el dominio no equivale a compilar toda la aplicación.
10. No desplegar, contratar servicios, cambiar DNS, enviar mensajes o ejecutar pentest
    externo sin instrucciones y alcance autorizados. No hacer commits con .env.local.
11. Consultar documentación oficial vigente al actualizar versiones. Usar lockfile real,
    números exactos y SHA revisados. No instalar latest silenciosamente en CI.
12. El pentest y la aceptación de riesgos necesitan un revisor independiente; un agente
    que escribió el código no certifica su propia seguridad.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
