#!/usr/bin/env node
// Counts the UI debt per directory (design plan §3.5): Paper imports, colour literals, raw touchables with onPress,
// numeric font sizes and literal JSX strings. Converted directories (eslint/ui-converted.js) are not counted: the lint
// rules keep them at zero. Prints a table and writes ui-debt.json; never fails.
// Usage: node scripts/ui-debt.mjs [--markdown]   (yarn ui:debt)
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { METRICS, LABELS, countTree } = require('./lib/ui-debt');
const converted = require('../eslint/ui-converted');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const markdown = process.argv.includes('--markdown');

// `app/ui/**/*.{ts,tsx}` → `app/ui/`
const skip = converted.converted.map((glob) => glob.split('**')[0]);
const { directories, total } = countTree(root, { skip });
const rows = Object.entries(directories)
  .map(([directory, counts]) => [directory, ...METRICS.map((metric) => counts[metric])])
  .filter((row) => row.slice(1).some((n) => n > 0))
  .sort((a, b) => b.slice(1).reduce((x, y) => x + y, 0) - a.slice(1).reduce((x, y) => x + y, 0));
const totalRow = ['total', ...METRICS.map((metric) => total[metric])];

writeFileSync(
  path.join(root, 'ui-debt.json'),
  `${JSON.stringify({ total, directories }, null, 2)}\n`
);

if (markdown) {
  console.log('### UI debt (client)\n');
  console.log(`| Directory | ${METRICS.map((m) => LABELS[m]).join(' | ')} |`);
  console.log(`|---|${METRICS.map(() => '---:').join('|')}|`);
  [...rows, totalRow].forEach((row) => console.log(`| ${row.join(' | ')} |`));
} else {
  const width = Math.max(...[...rows, totalRow].map((row) => row[0].length));
  console.log(
    `${'directory'.padEnd(width)}  ${METRICS.map((m) => LABELS[m].padStart(19)).join(' ')}`
  );
  [...rows, totalRow].forEach(([directory, ...counts]) =>
    console.log(
      `${directory.padEnd(width)}  ${counts.map((n) => String(n).padStart(19)).join(' ')}`
    )
  );
}
