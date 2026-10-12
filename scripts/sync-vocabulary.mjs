#!/usr/bin/env node
// Copies the backend's config/vocabulary.yml into this repo.
// Usage: node scripts/sync-vocabulary.mjs [path-to-backend/config/vocabulary.yml]   (default ../openmanifest-server/config/vocabulary.yml)
import { copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, process.argv[2] ?? '../openmanifest-server/config/vocabulary.yml');

if (!existsSync(source)) {
  console.error(`Backend vocabulary not found at ${source}. Pass its path as the first argument.`);
  process.exit(1);
}

copyFileSync(source, resolve(root, 'config/vocabulary.yml'));
console.log(`Copied ${source} to config/vocabulary.yml`);
