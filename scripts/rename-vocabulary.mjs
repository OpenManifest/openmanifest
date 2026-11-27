#!/usr/bin/env node
// Applies the renames of a group of config/vocabulary.yml to the tracked files (contents and file names, outside the
// allowed paths). Review the diff afterwards: visible copy, grammar and ambiguous words need a human.
// Usage: node scripts/rename-vocabulary.mjs --group tenant [--group vehicle]... [--dry-run]
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const vocabulary = require('./lib/vocabulary');
const { Tree } = require('./lib/vocabulary-tree');

const args = process.argv.slice(2);
const groups = args.flatMap((arg, i) => (arg === '--group' ? [args[i + 1]] : []));
const dryRun = args.includes('--dry-run');
if (groups.length === 0) {
  console.error(
    `Pass at least one --group (${Object.keys(vocabulary.loadConfig().groups).join(', ')})`
  );
  process.exit(1);
}

const list = vocabulary.entries(groups);
const tree = new Tree();
const changed = [];
const moved = [];

for (const file of tree.paths) {
  if (tree.allowed(file)) continue;
  if (tree.isText(file)) {
    const before = tree.read(file);
    const after = vocabulary.rewriteKeepingProse(before, list, '', file);
    if (after !== before) {
      if (!dryRun) writeFileSync(join(tree.root, file), after);
      changed.push(file);
    }
  }
  const renamed = file
    .split('/')
    .map((segment) => vocabulary.rewrite(segment, list))
    .join('/');
  if (renamed !== file) moved.push([file, renamed]);
}

for (const [from, to] of moved) {
  if (dryRun) continue;
  mkdirSync(dirname(join(tree.root, to)), { recursive: true });
  execFileSync('git', ['-C', tree.root, 'mv', from, to]);
}

console.log(
  `${dryRun ? 'Would change' : 'Changed'} ${changed.length} files and move ${moved.length}:`
);
changed.forEach((file) => console.log(`  M ${file}`));
moved.forEach(([from, to]) => console.log(`  R ${from} -> ${to}`));
