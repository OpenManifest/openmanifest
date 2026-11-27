#!/usr/bin/env node
// Copies the terminology of each backend industry template into app/i18n/fixtures/<slug>.json, resolved the way the
// backend resolves it (`extends` chain, maps deep-merge, lists replace): what `Operator.terminology` returns for an
// operator without its own changes. Used by tests, the gallery and the Playwright `full` project (?industry=<slug>).
// Usage: node scripts/sync-terminology.mjs [path-to-backend/config/industries]   (default ../openmanifest-server/config/industries)
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const YAML = require('yaml');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, process.argv[2] ?? '../openmanifest-server/config/industries');
const target = join(root, 'app/i18n/fixtures');

if (!existsSync(source)) {
  console.error(`Backend templates not found at ${source}. Pass their path as the first argument.`);
  process.exit(1);
}

const read = (slug, file) => {
  const path = join(source, slug, file);
  return existsSync(path) ? YAML.parse(readFileSync(path, 'utf8')) || {} : {};
};
const isMap = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const merge = (base, override) => {
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    result[key] = isMap(result[key]) && isMap(value) ? merge(result[key], value) : value;
  }
  return result;
};

const slugs = readdirSync(source, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(source, entry.name, 'template.yml')))
  .map((entry) => entry.name);

// The slugs from a template up to its root base
const chainOf = (slug) => {
  const chain = [slug];
  for (
    let parent = read(slug, 'template.yml').extends;
    parent;
    parent = read(parent, 'template.yml').extends
  ) {
    if (chain.includes(parent)) throw new Error(`${slug}: extends cycle`);
    chain.push(parent);
  }
  return chain;
};

mkdirSync(target, { recursive: true });
const written = [];
for (const slug of slugs.filter((name) => !name.startsWith('_'))) {
  const terms = chainOf(slug)
    .reverse()
    .reduce((memo, name) => merge(memo, read(name, 'locales/en.yml')), {}).terms;
  writeFileSync(join(target, `${slug}.json`), `${JSON.stringify(terms, null, 2)}\n`);
  written.push(slug);
}
console.log(`Wrote app/i18n/fixtures/{${written.join(',')}}.json from ${source}`);
