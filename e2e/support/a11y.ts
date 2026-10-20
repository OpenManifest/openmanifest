import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASELINE_FILE = join(__dirname, '..', 'axe-baseline.json');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];

type Baseline = Record<string, string[]>;

const readBaseline = (): Baseline =>
  existsSync(BASELINE_FILE) ? JSON.parse(readFileSync(BASELINE_FILE, 'utf8')) : {};

/**
 * Runs axe (WCAG 2.0/2.1/2.2 A and AA) on the current page. Serious and critical violations that are not listed for
 * `name` in e2e/axe-baseline.json fail the test; the ones that are listed are attached to the report. Re-record the
 * baseline with `UPDATE_AXE_BASELINE=1 yarn test:ui:smoke --workers=1` (record only; never to hide a new finding).
 */
export async function expectAccessible(page: Page, name: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const blocking = [
    ...new Set(
      violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')).map((v) => v.id)
    ),
  ];

  if (process.env.UPDATE_AXE_BASELINE) {
    const baseline = readBaseline();
    baseline[name] = [...new Set([...(baseline[name] ?? []), ...blocking])].sort();
    writeFileSync(
      BASELINE_FILE,
      `${JSON.stringify(Object.fromEntries(Object.entries(baseline).sort()), null, 2)}\n`
    );
    return;
  }

  const known = readBaseline()[name] ?? [];
  const fresh = blocking.filter((id) => !known.includes(id));
  // Where each new one is, so a failure says which element to look at
  const where = violations
    .filter((v) => fresh.includes(v.id))
    .map((v) => `${v.id}: ${v.nodes.map((node) => node.html.slice(0, 200)).join(' | ')}`)
    .join('\n');
  expect(
    fresh,
    `${name}: new serious or critical accessibility violations (baseline: ${known.join(', ') || 'none'})\n${where}`
  ).toEqual([]);
}
