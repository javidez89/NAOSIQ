import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const env = { ...process.env, SUPABASE_TELEMETRY_DISABLED: '1', DO_NOT_TRACK: '1', NEXT_TELEMETRY_DISABLED: '1' };
const cli = resolve('node_modules/supabase/dist/supabase.js');
try {
  if (!existsSync(cli)) throw new Error('Faltan dependencias. Ejecuta npm ci y vuelve a iniciar.');
  const docker = spawnSync('docker', ['info', '--format', '{{.ServerVersion}}'], { encoding: 'utf8', windowsHide: true });
  if (docker.error || docker.status !== 0) throw new Error('Abre Docker Desktop, espera a que esté listo y vuelve a iniciar CRM TECHI.');
  mkdirSync('.local', { recursive: true });
  console.log('Iniciando la base de datos local y conservando tus registros...');
  const db = spawnSync(process.execPath, [cli, 'start', '-x', 'realtime,storage-api,imgproxy,edge-runtime,logflare,vector,supavisor'], { env, encoding: 'utf8', windowsHide: true, maxBuffer: 20 * 1024 * 1024 });
  // CLI status contains local keys; keep it out of console and source control.
  writeFileSync('.local/start.log', `${db.stdout ?? ''}\n${db.stderr ?? ''}`);
  if (db.error || db.status !== 0) throw new Error('No se pudo iniciar Supabase. Consulta el registro privado .local/start.log.');
  const migrations = spawnSync(process.execPath, [cli, 'migration', 'up', '--local'], { env, encoding: 'utf8', windowsHide: true });
  writeFileSync('.local/migrations.log', `${migrations.stdout ?? ''}\n${migrations.stderr ?? ''}`);
  if (migrations.error || migrations.status !== 0) throw new Error('No se pudieron aplicar las migraciones locales. Consulta .local/migrations.log.');
  if (!existsSync('.env.local') || !existsSync('.local/credentials.json')) {
    const seed = spawnSync(process.execPath, ['scripts/local-seed.mjs'], { env, stdio: 'inherit', windowsHide: true });
    if (seed.status !== 0) throw new Error('No se pudo preparar la configuración local.');
  }
  const config = readFileSync('.env.local', 'utf8');
  const read = name => config.match(new RegExp(`^${name}=(.*)$`, 'm'))?.[1]?.trim();
  if (read('APP_ORIGIN') !== 'http://127.0.0.1:3000') throw new Error('El inicio local requiere APP_ORIGIN=http://127.0.0.1:3000.');
  if (new URL(read('NEXT_PUBLIC_SUPABASE_URL')).hostname !== '127.0.0.1') throw new Error('El inicio local solo permite Supabase en 127.0.0.1.');
  console.log('CRM TECHI: http://127.0.0.1:3000 · Accesos en .local/credentials.json');
  const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', '3000'], { env, stdio: 'inherit', windowsHide: true });
  app.on('error', () => { console.error('No se pudo iniciar la aplicación.'); process.exitCode = 1; });
  app.on('exit', code => { process.exitCode = code ?? 0; });
} catch (error) { console.error(error.message); process.exitCode = 1; }
