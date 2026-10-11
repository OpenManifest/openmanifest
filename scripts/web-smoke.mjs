#!/usr/bin/env node
// Web smoke test: login -> dropzone -> manifest board -> load, at desktop and 360x640.
// Needs the backend dev server with the dev_baseline seed and a served EXPO_ENV=local web export.
// Usage: node scripts/web-smoke.mjs [--base http://localhost:19006] [--out ./smoke-output]
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? '/opt/node-tools/node_modules/playwright');

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const base = arg('base', 'http://localhost:19006').replace(/\/$/, '');
const out = arg('out', './smoke-output');
const viewports = { desktop: { width: 1280, height: 800 }, phone360: { width: 360, height: 640 } };

async function pressAt(page, locator) {
  // A plain click() does not trigger react-native-gesture-handler touchables on web.
  const box = await locator.boundingBox();
  if (!box) throw new Error('element has no bounding box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(150);
  await page.mouse.up();
}

async function run(browser, name, viewport) {
  const failures = [];
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.on('pageerror', (e) => failures.push(`pageerror: ${e.message.slice(0, 200)}`));
  try {
    await page.goto(`${base}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.locator('input').nth(0).click({ force: true });
    await page.keyboard.type('owner@example.com');
    await page.locator('input').nth(1).click({ force: true });
    await page.keyboard.type('Password1!');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(6000);

    await pressAt(page, page.getByText('Dropzone', { exact: true }).first());
    await page.waitForTimeout(8000);
    if (!new URL(page.url()).pathname.endsWith('/dropzone/manifest')) {
      failures.push(`expected /dropzone/manifest, got ${page.url()}`);
    }
    await page.screenshot({ path: join(out, `${name}-manifest.png`) });

    await page.getByText(/Load #1\b/).first().click({ force: true });
    await page.waitForTimeout(6000);
    if (!/\/dropzone\/load\/\d+/.test(new URL(page.url()).pathname)) {
      failures.push(`expected /dropzone/load/<id>, got ${page.url()}`);
    }
    await page.screenshot({ path: join(out, `${name}-load.png`) });
  } catch (e) {
    failures.push(`step failed: ${e.message.split('\n')[0]}`);
  } finally {
    await context.close();
  }
  console.log(`${name} ${viewport.width}x${viewport.height}: ${failures.length ? `FAIL (${failures.join('; ')})` : 'ok'}`);
  return failures.length === 0;
}

mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--proxy-bypass-list=local.openmanifest.org,localhost'] });
let ok = true;
for (const [name, viewport] of Object.entries(viewports)) {
  ok = (await run(browser, name, viewport)) && ok;
}
await browser.close();
process.exitCode = ok ? 0 : 1;
