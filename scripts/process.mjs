import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
export function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: false, ...options });
  if (result.error || result.status !== 0) throw new Error(`${command} failed: ${result.error?.message ?? result.status}`);
  return result;
}
export function npm(args, options = {}) {
  // npm.cmd needs cmd.exe on Windows; all call sites use fixed/validated arguments.
  return run(process.platform === 'win32' ? 'cmd.exe' : 'npm', process.platform === 'win32' ? ['/d', '/s', '/c', 'npm', ...args] : args, options);
}
export function supabase(args, options = {}) {
  const wrapper = resolve('node_modules/supabase/dist/supabase.js');
  return run(process.execPath, [wrapper, ...args], options);
}
