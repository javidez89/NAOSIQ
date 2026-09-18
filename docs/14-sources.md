# 14. Referencias oficiales y decisiones de versión

Consulta de documentación: 8 de septiembre de 2026. Las versiones son una base
fijada, no una promesa de que toda dependencia permanecerá actualizada. Revalidar
antes de la primera instalación y de cada release. La instalación completa no
pudo ejecutarse aquí por falta de acceso a los registros desde el contenedor.

## Plataformas y librerías

- Next.js 16 / async APIs, proxy y CLI de lint:
  https://nextjs.org/docs/app/guides/upgrading/version-16
- Node LTS y soporte:
  https://nodejs.org/en/about/previous-releases
- Supabase SSR y propagación de cookies/cabeceras:
  https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Changelog Supabase: privilegios Data API, runtimes y stack local:
  https://supabase.com/changelog
- Versiones SSR / cliente:
  https://github.com/supabase/ssr/releases
- Supabase CLI:
  https://github.com/supabase/cli/releases
- RLS:
  https://supabase.com/docs/guides/database/postgres/row-level-security
- pgTAP:
  https://supabase.com/docs/guides/database/testing
- Google con Supabase:
  https://supabase.com/docs/guides/auth/social-login/auth-google
- MFA:
  https://supabase.com/docs/guides/auth/auth-mfa/totp
- Backups y límites con Storage:
  https://supabase.com/docs/guides/platform/backups
- Vercel y condiciones Hobby:
  https://vercel.com/docs/plans/hobby
- Despliegues Vercel:
  https://vercel.com/docs/deployments
- GitHub Actions y seguridad:
  https://docs.github.com/en/actions/reference/security/secure-use
- Actions oficiales; el script resuelve sus SHA reales:
  https://github.com/actions/checkout
  https://github.com/actions/setup-node
- Playwright:
  https://github.com/microsoft/playwright/releases
- Docker Windows/WSL:
  https://docs.docker.com/desktop/setup/install/windows-install/
- Google OAuth servidor:
  https://developers.google.com/identity/protocols/oauth2/web-server

## Seguridad, accesibilidad y privacidad

- OWASP ASVS:
  https://owasp.org/www-project-application-security-verification-standard/
- ZAP baseline (pasivo):
  https://www.zaproxy.org/docs/docker/baseline-scan/
- WCAG 2.2:
  https://www.w3.org/TR/WCAG22/
- Ley 1581 de 2012, texto oficial:
  https://www.secretariasenado.gov.co/senado/basedoc/ley_1581_2012.html
- SIC, protección de datos:
  https://www.sic.gov.co/que-es-la-delegatura-datos-personales
- Wompi eventos, referencia para una futura evaluación, no integración elegida:
  https://docs.wompi.co/docs/colombia/eventos/

## Baseline técnico

Node 24.21.0 para la estación objetivo; Next 16.3.4; React 19.2.8; SSR 0.12.7;
supabase-js 2.114.0; CLI Supabase 2.117.0; Playwright 1.63.0. Se fijan versiones
exactas en package.json. TypeScript 5.9.3 es una elección inicial de compatibilidad,
no se presenta como el compilador más nuevo; su validación con el build completo
sigue pendiente. El dominio se comprobó aquí con Node 22.16.0 y TypeScript 5.8.3.

Las referencias guían decisiones; no prueban que el código implementado cumpla
cada control. La evidencia ejecutable está separada en reports/verification.md.
