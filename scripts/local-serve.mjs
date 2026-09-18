import { cpSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import nextEnv from '@next/env';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
nextEnv.loadEnvConfig(root);
try {
  if (process.env.APP_ORIGIN !== 'http://127.0.0.1:3000' || new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname !== '127.0.0.1') {
    throw new Error('Este inicio requiere la configuración local de CRM TECHI.');
  }
  const standalone = resolve(root, '.next/standalone');
  if (!existsSync(resolve(standalone, 'server.js'))) throw new Error('Ejecuta npm run build antes de iniciar la versión compilada.');
  cpSync(resolve(root, '.next/static'), resolve(standalone, '.next/static'), { recursive: true });
  if (existsSync(resolve(root, 'public'))) cpSync(resolve(root, 'public'), resolve(standalone, 'public'), { recursive: true });
  const child = spawn(process.execPath, [resolve(standalone, 'server.js')], {
    cwd: root, stdio: 'inherit', windowsHide: true,
    env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: '3000', NEXT_TELEMETRY_DISABLED: '1' },
  });
  child.on('error', () => { console.error('No se pudo iniciar la versión compilada.'); process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code ?? 0; });
} catch (error) { console.error(error.message); process.exitCode = 1; }
