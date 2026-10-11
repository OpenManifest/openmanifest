#!/usr/bin/env node
// Counts the old terms of config/vocabulary.yml (GENERALISATION.md §3) per term and per top-level directory.
// Usage: node scripts/check-vocabulary.mjs [--group tenant]... [--enforce] [--markdown]   (yarn check:vocabulary)
//   --enforce   exit 1 when an old term appears outside the allowed paths (CI enforces from P7.20)
//   --markdown  print GitHub-flavoured tables (for the job summary)
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const vocabulary = require('./lib/vocabulary');
const { Tree } = require('./lib/vocabulary-tree');

const args = process.argv.slice(2);
const groups = args.flatMap((arg, i) => (arg === '--group' ? [args[i + 1]] : []));
const enforce = args.includes('--enforce');
const markdown = args.includes('--markdown');

const list = vocabulary.entries(groups);
const { pending, allowed, byDirectory } = new Tree().count(list);
const rows = list.map((e) => [e.group, e.old, e.new, pending[e.old] || 0, allowed[e.old] || 0]);
const total = rows.reduce((sum, row) => sum + row[3], 0);
const directories = Object.entries(byDirectory).sort((a, b) => b[1] - a[1]);

if (markdown) {
  console.log('### Vocabulary check (client)\n');
  console.log('| Group | Old | New | Hits | Allowed hits |\n|---|---|---|---:|---:|');
  rows.forEach((row) => console.log(`| ${row.join(' | ')} |`));
  console.log('\n| Directory | Hits |\n|---|---:|');
  directories.forEach(([dir, n]) => console.log(`| ${dir} | ${n} |`));
} else {
  const width = Math.max(4, ...rows.map((row) => row[1].length));
  console.log(`${'term'.padEnd(width)}  group           hits  allowed`);
  rows.forEach(([group, old, , hits, ok]) =>
    console.log(`${old.padEnd(width)}  ${group.padEnd(14)}  ${String(hits).padStart(4)}  ${String(ok).padStart(7)}`)
  );
  console.log('\nby directory:');
  directories.forEach(([dir, n]) => console.log(`  ${dir.padEnd(24)} ${n}`));
}
console.log(`\n${total} old-term hits outside the allowed paths.`);
process.exitCode = enforce && total > 0 ? 1 : 0;
