#!/usr/bin/env node
// Writes the permissions of the skydiving template's roles to app/test-utils/fixtures/roles.json, from the backend's
// config/industries/skydiving/presets.yml (`permissions: all` is every permission of config/seed/access.yml). The test
// utility `renderWithProviders({ role })` signs a test in as one of them.
// Usage: node scripts/sync-role-fixtures.mjs [path-to-backend]   (default ../openmanifest-server)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const YAML = require('yaml');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backend = resolve(root, process.argv[2] ?? '../openmanifest-server');
const presets = join(backend, 'config/industries/skydiving/presets.yml');
const access = join(backend, 'config/seed/access.yml');
const ROLES = ['owner', 'manifest', 'fun_jumper', 'student'];

if (!existsSync(presets) || !existsSync(access)) {
  console.error(`Backend templates not found in ${backend}. Pass the backend path as the first argument.`);
  process.exit(1);
}

const all = [
  ...YAML.parse(readFileSync(access, 'utf8'), { merge: true }).permissions.acting,
  ...Object.values(YAML.parse(readFileSync(access, 'utf8'), { merge: true }).permissions.crud).flat(),
];
const roles = YAML.parse(readFileSync(presets, 'utf8')).roles;
const fixtures = Object.fromEntries(
  ROLES.map((name) => {
    const permissions = roles[name].permissions === 'all' ? all : roles[name].permissions;
    return [name, [...new Set(permissions)]];
  })
);

const target = join(root, 'app/test-utils/fixtures');
mkdirSync(target, { recursive: true });
writeFileSync(join(target, 'roles.json'), `${JSON.stringify(fixtures, null, 2)}\n`);
console.log(`Wrote app/test-utils/fixtures/roles.json (${ROLES.map((r) => `${r}: ${fixtures[r].length}`).join(', ')})`);
