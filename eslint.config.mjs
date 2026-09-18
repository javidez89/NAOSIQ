import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([
  ...nextVitals, ...nextTs,
  globalIgnores(['.next/**', '.build-domain/**', '.npm-cache/**', '.local/**', 'test-results/**', 'playwright-report/**', 'next-env.d.ts', 'preview/**', 'reports/**']),
  { rules: { '@typescript-eslint/no-explicit-any': 'error', '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] } },
]);
