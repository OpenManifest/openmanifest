#!/usr/bin/env node
// Copies the backend's committed schema.graphql into this repo.
// Usage: node scripts/sync-schema.mjs [path-to-backend/schema.graphql]   (default ../openmanifest-server/schema.graphql)
import { copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, process.argv[2] ?? '../openmanifest-server/schema.graphql');

if (!existsSync(source)) {
  console.error(`Backend schema not found at ${source}. Pass its path as the first argument.`);
  process.exit(1);
}

copyFileSync(source, resolve(root, 'schema.graphql'));
console.log(`Copied ${source} to schema.graphql`);
