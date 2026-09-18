import { spawnSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, openSync, closeSync, readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const local = resolve(root, '.local');
const credentialsFile = resolve(local, 'credentials.json');
const manifestFile = resolve(local, 'seed.json');
const roles = {
  master: ['super_user', 'Super Usuario local'],
  adminA: ['admin', 'Administrador del comercio A'],
  adminB: ['admin', 'Administrador del comercio B'],
  advisorA: ['advisor', 'Asesor del comercio A'],
  technicianA: ['technician', 'Técnico del comercio A'],
  customerA: ['customer', 'Cliente del comercio A'],
  customerB: ['customer', 'Cliente del comercio B'],
};

function parseJson(source, label) {
  try { return JSON.parse(source); } catch { throw new Error(`No se pudo leer ${label}; no se muestra su contenido para proteger las credenciales.`); }
}

// Deliberately rejects hostnames that could resolve outside the machine.
export function assertLoopback(value, protocols = ['http:', 'https:']) {
  let url;
  try { url = new URL(value); } catch { throw new Error('La dirección local tiene un formato inválido.'); }
  if (!protocols.includes(url.protocol) || !['127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error('Esta herramienta solo permite direcciones IP de loopback (127.0.0.1 o ::1).');
  }
  return url;
}

export function assertLocalDockerHost(value) {
  if (typeof value !== 'string') throw new Error('No se pudo comprobar el destino de Docker.');
  if (value.startsWith('unix:///') || /^npipe:\/\/[/\\]*\.\/pipe\//i.test(value)) return;
  assertLoopback(value, ['tcp:', 'http:', 'https:']);
}

function captured(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root, shell: false, windowsHide: true, encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'], timeout: 60_000, maxBuffer: 8 * 1024 * 1024,
    ...options,
  });
  // CLI status and API errors may contain credentials. Never relay their output.
  if (result.error || result.status !== 0) throw new Error(`Falló ${options.label ?? 'una operación local'}; no se muestra su salida para proteger las credenciales.`);
  return result.stdout.trim();
}

export function readLocalStatus() {
  const packageDir = resolve(root, 'node_modules/supabase');
  const pkg = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8'));
  const entry = resolve(packageDir, typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.supabase);
  const env = { ...process.env };
  delete env.SUPABASE_CLI_BINARY_OVERRIDE;
  const command = entry.endsWith('.js') ? process.execPath : entry;
  const prefix = entry.endsWith('.js') ? [entry] : [];
  const cli = (args) => captured(command, [...prefix, ...args], { env, label: 'Supabase CLI local' });
  // Discover supported flags from this pinned installation, before using them.
  cli(['--help']);
  const help = cli(['status', '--help']);
  if (!help.includes('--output') || !help.includes('json')) throw new Error('La CLI instalada no documenta status JSON.');
  const status = parseJson(cli(['status', '-o', 'json']), 'el estado local de Supabase');
  const apiUrl = assertLoopback(status.API_URL);
  if (apiUrl.username || apiUrl.password || apiUrl.pathname !== '/') throw new Error('El endpoint local de API no es válido.');
  const dbUrl = assertLoopback(status.DB_URL, ['postgres:', 'postgresql:']);
  if (dbUrl.pathname !== '/postgres') throw new Error('La base local debe llamarse postgres.');
  const publicKey = status.PUBLISHABLE_KEY ?? status.ANON_KEY;
  const adminKey = status.SERVICE_ROLE_KEY ?? status.SECRET_KEY;
  if (typeof publicKey !== 'string' || typeof adminKey !== 'string') throw new Error('Faltan claves locales en status.');
  if (publicKey.startsWith('sb_secret_')) throw new Error('Una clave secreta no puede usarse en el navegador.');
  if (publicKey.startsWith('eyJ')) {
    const claims = JSON.parse(Buffer.from(publicKey.split('.')[1], 'base64url').toString('utf8'));
    if (claims.role !== 'anon') throw new Error('La clave pública no tiene el rol anon.');
  }
  return { apiUrl: apiUrl.origin, dbUrl, publicKey, adminKey };
}

function verifyDatabaseContainer(dbUrl) {
  // DOCKER_CONTEXT takes precedence over DOCKER_HOST in the Docker CLI.
  const contextArgs = process.env.DOCKER_CONTEXT ? [process.env.DOCKER_CONTEXT] : [];
  const dockerHost = (!process.env.DOCKER_CONTEXT && process.env.DOCKER_HOST) || JSON.parse(captured('docker', ['context', 'inspect', ...contextArgs, '--format', '{{json .Endpoints.docker.Host}}'], { label: 'la comprobación de Docker' }));
  assertLocalDockerHost(dockerHost);
  const config = readFileSync(resolve(root, 'supabase/config.toml'), 'utf8');
  const projectId = /^project_id\s*=\s*"([A-Za-z0-9_-]+)"/m.exec(config)?.[1];
  if (!projectId) throw new Error('No se encontró un project_id local válido.');
  const container = `supabase_db_${projectId}`;
  const [info] = JSON.parse(captured('docker', ['inspect', container], { label: 'la inspección de PostgreSQL local' }));
  const port = info.NetworkSettings?.Ports?.['5432/tcp'] ?? [];
  if (!info.State?.Running || !info.Config?.Image?.includes('/postgres:') || !port.some((binding) => binding.HostPort === dbUrl.port)) {
    throw new Error('El contenedor PostgreSQL no coincide con la base indicada por Supabase local.');
  }
  return container;
}

function sql(container, source) {
  return captured('docker', ['exec', '-i', container, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'postgres', '-Atq'], {
    input: source, label: 'la carga de datos en PostgreSQL local',
  });
}

function savePrivate(path, value) {
  const temporary = `${path}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporary, path);
}

export function makeCredentials() {
  const installationId = randomUUID();
  return {
    version: 1, installationId, createdAt: new Date().toISOString(),
    accounts: Object.fromEntries(Object.entries(roles).map(([key, [role, label]]) => [key, {
      id: null, email: `${key.toLowerCase()}.${installationId.slice(0, 8)}@techi.example.test`,
      password: `${randomBytes(24).toString('base64url')}aA7!`, role, label,
    }])),
  };
}

export function validateCredentials(credentials) {
  if (credentials.version !== 1 || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(credentials.installationId ?? '')) {
    throw new Error('El archivo de credenciales local necesita revisión.');
  }
  if (Object.keys(credentials.accounts ?? {}).length !== Object.keys(roles).length || Object.keys(roles).some((key) => {
    const account = credentials.accounts?.[key];
    return typeof account?.password !== 'string' || account.password.length < 32 || account.role !== roles[key][0]
      || account.email !== `${key.toLowerCase()}.${credentials.installationId.slice(0, 8)}@techi.example.test`;
  })) throw new Error('El archivo de credenciales no coincide con las siete cuentas sintéticas de esta instalación.');
}

export function makeManifest(credentials) {
  const ids = (names) => Object.fromEntries(names.map((name) => [name, randomUUID()]));
  return {
    version: 1, installationId: credentials.installationId, createdAt: credentials.createdAt,
    periodEnd: new Date(Date.now() + 365 * 86_400_000).toISOString(),
    tenants: ids(['a', 'b']), customers: ids(['aPortal', 'aWalkIn', 'aOther', 'bPortal', 'bWalkIn']),
    repairs: ids(['aPhone', 'aLaptop', 'aTablet', 'aConsole', 'bPhone', 'bLaptop']),
    vouchers: ids(['aPhone', 'aLaptop', 'aTablet', 'aConsole', 'bPhone', 'bLaptop']),
    payments: ids(['aPending']),
  };
}

async function provisionAccounts(credentials, status) {
  const auth = createClient(status.apiUrl, status.adminKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => {
      assertLoopback(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
      return fetch(input, { ...init, redirect: 'error', signal: AbortSignal.timeout(15_000) });
    } },
  }).auth;
  const existing = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error('No se pudieron consultar las cuentas de Auth local.');
    existing.push(...data.users);
    if (data.users.length < 100) break;
  }
  for (const account of Object.values(credentials.accounts)) {
    let user = existing.find((candidate) => candidate.email === account.email);
    if (user && (user.app_metadata?.local_seed_installation !== credentials.installationId || !user.email_confirmed_at)) {
      throw new Error('Una cuenta existente no pertenece a esta instalación sintética. No se modificó.');
    }
    if (user && account.id && user.id !== account.id) throw new Error('El UUID de una cuenta local cambió. Se requiere revisión manual.');
    if (!user) {
      const { data, error } = await auth.admin.createUser({
        email: account.email, password: account.password, email_confirm: true,
        app_metadata: { local_seed_installation: credentials.installationId },
        user_metadata: { display_name: account.label },
      });
      if (error || !data.user) throw new Error('No se pudo crear una cuenta sintética en Auth local.');
      user = data.user;
    }
    account.id = user.id;
    // Persist after every identity, so a later database failure is recoverable.
    savePrivate(credentialsFile, credentials);
  }
}

const literal = (value) => value === null ? 'null' : `'${String(value).replaceAll("'", "''")}'`;
const uuid = (value) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value ?? '')) throw new Error('UUID inválido en los datos sintéticos.');
  return `${literal(value)}::uuid`;
};

export function buildSeedSql(credentials, m) {
  const accounts = credentials.accounts;
  const actor = uuid(accounts.master.id);
  const tenant = (key) => uuid(m.tenants[key]);
  const a = tenant('a');
  const b = tenant('b');
  const user = (key) => uuid(accounts[key].id);
  const suffix = credentials.installationId.slice(0, 8);
  const customers = [
    ['aPortal', 'a', 'customerA', 'Cliente portal A · sintético'],
    ['aWalkIn', 'a', null, 'Cliente mostrador A · sintético'],
    ['aOther', 'a', null, 'Cliente adicional A · sintético'],
    ['bPortal', 'b', 'customerB', 'Cliente portal B · sintético'],
    ['bWalkIn', 'b', null, 'Cliente mostrador B · sintético'],
  ];
  const repairs = [
    ['aPhone', 'a', 'aPortal', 'Teléfono de prueba A', 'La pantalla no responde al tacto. Equipo sintético.', 'in_repair', 'technicianA'],
    ['aLaptop', 'a', 'aWalkIn', 'Portátil de prueba A', 'El equipo no enciende. Recepción de demostración.', 'created', null],
    ['aTablet', 'a', 'aPortal', 'Tableta de prueba A', 'El conector de carga presenta falla. Esperando repuesto.', 'waiting_parts', 'technicianA'],
    ['aConsole', 'a', 'aOther', 'Consola de prueba A', 'Mantenimiento de prueba completado; sin pago confirmado.', 'completed', 'technicianA'],
    ['bPhone', 'b', 'bPortal', 'Teléfono de prueba B', 'El audio del altavoz falla. Dato sintético de comercio B.', 'created', null],
    ['bLaptop', 'b', 'bWalkIn', 'Portátil de prueba B', 'Falla de teclado. Equipo sintético del comercio B.', 'created', null],
  ];
  const lines = [
    'begin;',
    `select pg_advisory_xact_lock(hashtext('crm-techi-local-seed'));`,
    `insert into private.platform_admins(user_id) values(${actor}) on conflict do nothing;`,
  ];
  for (const key of ['a', 'b']) {
    lines.push(`with inserted as (insert into public.tenants(id,name,slug) values(${tenant(key)},${literal(`Taller ${key.toUpperCase()} · prueba local`)},${literal(`taller-local-${key}-${suffix}`)}) on conflict do nothing returning id) insert into public.audit_events(tenant_id,actor_id,action,record_id,metadata) select id,${actor},'local_seed.tenant_created',id,'{"synthetic":true}'::jsonb from inserted;`);
    lines.push(`insert into public.subscriptions(tenant_id,plan_code,status,current_period_end) values(${tenant(key)},'basic','trialing',${literal(m.periodEnd)}::timestamptz) on conflict do nothing;`);
    lines.push(`insert into public.tenant_settings(tenant_id) values(${tenant(key)}) on conflict do nothing;`);
  }
  for (const [key, scope] of [['adminA', 'a'], ['adminB', 'b'], ['advisorA', 'a'], ['technicianA', 'a'], ['customerA', 'a'], ['customerB', 'b']]) {
    lines.push(`insert into public.memberships(tenant_id,user_id,role) values(${tenant(scope)},${user(key)},${literal(accounts[key].role)}) on conflict do nothing;`);
  }
  for (const [key, scope, accountKey, name] of customers) {
    lines.push(`insert into public.customers(id,tenant_id,user_id,name,phone) values(${uuid(m.customers[key])},${tenant(scope)},${accountKey ? user(accountKey) : 'null'},${literal(name)},'') on conflict do nothing;`);
  }
  for (const [key, scope, customerKey, device, issue, status, assignee] of repairs) {
    const repairId = uuid(m.repairs[key]);
    const creator = user(scope === 'a' ? 'adminA' : 'adminB');
    const history = [['created', 0]];
    if (status !== 'created') history.push(['in_repair', 1]);
    if (!['created', 'in_repair'].includes(status)) history.push([status, 2]);
    // Side effects run only for newly inserted orders. A rerun does not rewrite history,
    // statuses, receipt snapshots, assignments or edits made through the application.
    lines.push(`with inserted as (
  insert into public.repairs(id,tenant_id,customer_id,assigned_to,device,issue,status,version,created_by,request_id)
  values(${repairId},${tenant(scope)},${uuid(m.customers[customerKey])},${assignee ? user(assignee) : 'null'},${literal(device)},${literal(issue)},${literal(status)},${history.length},${creator},${repairId})
  on conflict do nothing returning *
), events as (
  insert into public.repair_events(tenant_id,repair_id,status,actor_id,created_at)
  select r.tenant_id,r.id,h.status,r.created_by,r.created_at + h.step * interval '1 millisecond'
  from inserted r cross join (values ${history.map(([event, step]) => `(${literal(event)},${step})`).join(',')}) as h(status,step)
  returning repair_id
), receipt as (
  insert into public.vouchers(id,tenant_id,repair_id,kind,snapshot)
  select ${uuid(m.vouchers[key])},r.tenant_id,r.id,'intake',jsonb_build_object('business',t.name,'customer',c.name,'device',r.device,'issue',r.issue,'repair_id',r.id,'issued_at',r.created_at)
  from inserted r join public.tenants t on t.id=r.tenant_id join public.customers c on c.tenant_id=r.tenant_id and c.id=r.customer_id
  returning repair_id
)
insert into public.audit_events(tenant_id,actor_id,action,record_id,metadata)
select tenant_id,${actor},'local_seed.repair_created',id,'{"synthetic":true}'::jsonb from inserted;`);
  }
  lines.push(`with inserted as (insert into public.payments(id,tenant_id,repair_id,amount_minor,method,idempotency_key,created_by) values(${uuid(m.payments.aPending)},${a},${uuid(m.repairs.aPhone)},5000000,'cash',${literal(`local_seed_${m.payments.aPending.replaceAll('-', '')}`)},${user('adminA')}) on conflict do nothing returning id) insert into public.audit_events(tenant_id,actor_id,action,record_id,metadata) select ${a},${actor},'local_seed.payment_pending',id,'{"synthetic":true}'::jsonb from inserted;`);
  lines.push(`select json_build_object('tenants',(select count(*) from public.tenants where id in (${a},${b})),'customers',(select count(*) from public.customers where id in (${Object.values(m.customers).map(uuid).join(',')})),'repairs',(select count(*) from public.repairs where id in (${Object.values(m.repairs).map(uuid).join(',')})),'vouchers',(select count(*) from public.vouchers where id in (${Object.values(m.vouchers).map(uuid).join(',')})));`);
  lines.push('commit;');
  return lines.join('\n');
}

function configureEnvironment(status) {
  const file = resolve(root, '.env.local');
  if (existsSync(file)) {
    const existing = readFileSync(file, 'utf8');
    const value = /^NEXT_PUBLIC_SUPABASE_URL\s*=\s*["']?([^\s"']+)/m.exec(existing)?.[1];
    if (value && assertLoopback(value).origin !== status.apiUrl) throw new Error('.env.local apunta a otra instancia local; se conservó sin cambios.');
    return;
  }
  writeFileSync(file, `APP_ENV=local\nAPP_ORIGIN=http://127.0.0.1:3000\nNEXT_PUBLIC_SUPABASE_URL=${status.apiUrl}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${status.publicKey}\nENABLE_DEMO=false\nRELEASE_APPROVED=false\n`, { flag: 'wx', mode: 0o600 });
}

export async function main() {
  if (process.argv.length > 2) throw new Error('Este script no acepta destinos, claves ni opciones remotas.');
  const ignore = readFileSync(resolve(root, '.gitignore'), 'utf8');
  if (!/^\/?\.local\/?\s*$/m.test(ignore)) throw new Error('Añada .local/ a .gitignore antes de crear las credenciales.');
  mkdirSync(local, { recursive: true, mode: 0o700 });
  let lock;
  const lockFile = resolve(local, 'seed.lock');
  try { lock = openSync(lockFile, 'wx', 0o600); } catch { throw new Error('Ya existe .local/seed.lock. Compruebe que no hay otra carga activa antes de retirarlo.'); }
  try {
    const status = readLocalStatus();
    const container = verifyDatabaseContainer(status.dbUrl);
    configureEnvironment(status);
    const available = sql(container, "select to_regclass('public.repairs') is not null and to_regclass('private.platform_admins') is not null;");
    if (available !== 't') throw new Error('Aplique primero las migraciones locales de CRM TECHI.');
    const credentials = existsSync(credentialsFile) ? parseJson(readFileSync(credentialsFile, 'utf8'), 'el archivo de credenciales') : makeCredentials();
    validateCredentials(credentials);
    const manifest = existsSync(manifestFile) ? parseJson(readFileSync(manifestFile, 'utf8'), 'el manifiesto local') : makeManifest(credentials);
    if (manifest.version !== 1 || manifest.installationId !== credentials.installationId) throw new Error('Las credenciales y los datos locales pertenecen a instalaciones diferentes.');
    savePrivate(credentialsFile, credentials);
    savePrivate(manifestFile, manifest);
    await provisionAccounts(credentials, status);
    const result = sql(container, buildSeedSql(credentials, manifest));
    const counts = JSON.parse(result.split(/\r?\n/).filter((line) => line.startsWith('{')).at(-1));
    if (counts.tenants !== 2 || counts.customers !== 5 || counts.repairs !== 6 || counts.vouchers !== 6) throw new Error('Los datos locales requieren revisión: el conteo no coincide.');
    console.log('Carga local verificada: 7 cuentas, 5 roles, 2 comercios, 5 clientes, 6 órdenes y 6 comprobantes de recepción.');
    console.log('Credenciales: .local/credentials.json. IDs para pruebas: .local/seed.json. No se muestran contraseñas ni claves.');
    console.log('Acceda a /login; configure TOTP en /app/security para CRM maestro y confirmación de pagos.');
  } finally {
    closeSync(lock);
    unlinkSync(lockFile);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
