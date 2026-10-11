#!/usr/bin/env node
// Validates every GraphQL document under app/api against schema.graphql, offline.
// Usage: node scripts/validate-graphql.mjs        (refresh the schema first with `yarn sync:schema`)
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { buildSchema, parse, concatAST, validate, Kind } = require('graphql');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const schema = buildSchema(readFileSync(join(root, 'schema.graphql'), 'utf8'));
const files = walk(join(root, 'app/api')).filter((file) => file.endsWith('.gql'));

const documents = [];
let failed = false;
for (const file of files) {
  try {
    documents.push({ file, document: parse(readFileSync(file, 'utf8')) });
  } catch (error) {
    failed = true;
    console.error(`${relative(root, file)}: ${error.message}`);
  }
}

const combined = concatAST(documents.map(({ document }) => document));
for (const error of validate(schema, combined)) {
  failed = true;
  const location = error.locations?.[0];
  // Attribute the error to the document that contains the offending node
  const owner = documents.find(({ document }) =>
    document.definitions.some((definition) => definition.loc && location && definition.loc.source === error.source)
  );
  console.error(`${owner ? relative(root, owner.file) : 'unknown file'}${location ? `:${location.line}` : ''}: ${error.message}`);
}

const operations = combined.definitions.filter((definition) => definition.kind === Kind.OPERATION_DEFINITION).length;
const fragments = combined.definitions.filter((definition) => definition.kind === Kind.FRAGMENT_DEFINITION).length;
console.log(`${failed ? 'FAILED' : 'OK'}: ${files.length} files, ${operations} operations, ${fragments} fragments checked against schema.graphql`);
process.exit(failed ? 1 : 0);
