import test from 'node:test';
import assert from 'node:assert/strict';
import { assertLoopback, assertLocalDockerHost, makeCredentials, validateCredentials, makeManifest, buildSeedSql } from './local-seed.mjs';
import { randomUUID } from 'node:crypto';

test('rejects remote, deceptive and non-IP endpoints before privileged operations', () => {
  for (const value of ['https://project.supabase.co', 'https://127.0.0.1.example.com', 'http://localhost', 'file:///tmp/database', 'https://127.0.0.1@evil.example', 'http://192.168.1.1']) {
    assert.throws(() => assertLoopback(value));
  }
  assert.equal(assertLoopback('http://127.0.0.1:54321').hostname, '127.0.0.1');
  assert.equal(assertLoopback('http://[::1]:54321').hostname, '[::1]');
  assert.throws(() => assertLocalDockerHost('ssh://remote.example'));
  assert.throws(() => assertLocalDockerHost('tcp://10.0.0.2:2375'));
  assert.doesNotThrow(() => assertLocalDockerHost('npipe:////./pipe/dockerDesktopLinuxEngine'));
  assert.doesNotThrow(() => assertLocalDockerHost('unix:///var/run/docker.sock'));
});

test('each installation has independent credentials and persistent data contracts', () => {
  const first = makeCredentials();
  assert.doesNotThrow(() => validateCredentials(first));
  const second = makeCredentials();
  assert.notEqual(first.installationId, second.installationId);
  assert.equal(new Set(Object.values(first.accounts).map((account) => account.role)).size, 5);
  assert.equal(new Set(Object.values(first.accounts).map((account) => account.password)).size, 7);
  for (const key of Object.keys(first.accounts)) {
    assert.notEqual(first.accounts[key].password, second.accounts[key].password);
    assert.ok(first.accounts[key].password.length >= 32);
    first.accounts[key].id = randomUUID();
  }
  const manifest = makeManifest(first);
  const query = buildSeedSql(first, manifest);
  for (const account of Object.values(first.accounts)) assert.ok(!query.includes(account.password));
  assert.ok(!/\b(update|delete|truncate|alter)\b/i.test(query));
  assert.ok(!query.includes('request.jwt'));
  assert.ok(!query.includes("'aal2'"));
  assert.ok(!query.includes("'confirmed'"));
  assert.equal(buildSeedSql(first, manifest), query);
});

test('rejects altered synthetic accounts before Auth provisioning', () => {
  const credentials = makeCredentials();
  credentials.accounts.adminA.email = 'person@example.com';
  assert.throws(() => validateCredentials(credentials));
  const extra = makeCredentials();
  extra.accounts.unexpected = { ...extra.accounts.adminA };
  assert.throws(() => validateCredentials(extra));
  const modifiedRole = makeCredentials();
  modifiedRole.accounts.advisorA.role = 'admin';
  assert.throws(() => validateCredentials(modifiedRole));
});
