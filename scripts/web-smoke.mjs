#!/usr/bin/env node
// Web smoke test: layout check of /login, then login -> dropzone -> manifest board -> load and the two deep links, at
// desktop and 360x640.
// Needs the backend dev server with the dev_baseline seed and a served EXPO_ENV=local web export.
// Usage: node scripts/web-smoke.mjs [--base http://localhost:19006] [--out ./smoke-output]
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.PLAYWRIGHT_PATH ?? '/opt/node-tools/node_modules/playwright'
);

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const base = arg('base', 'http://localhost:19006').replace(/\/$/, '');
const out = arg('out', './smoke-output');
const viewports = { desktop: { width: 1280, height: 800 }, phone360: { width: 360, height: 640 } };

async function pressAt(page, locator, at) {
  // A plain click() does not trigger react-native-gesture-handler touchables on web.
  const box = at ? { x: at.x, y: at.y, width: 0, height: 0 } : await locator.boundingBox();
  if (!box) throw new Error('element has no bounding box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(150);
  await page.mouse.up();
}

/**
 * Layout check for the current route: nothing overflows the viewport horizontally, and every primary action
 * (`data-testid$="-primary-action"`) can be scrolled into view and is the element that receives a click there.
 */
async function checkLayout(page, route, viewport, failures) {
  const scrollWidth = await page.evaluate(() => document.scrollingElement?.scrollWidth ?? 0);
  if (scrollWidth > viewport.width) {
    failures.push(`layout ${route}: scrollWidth ${scrollWidth} > ${viewport.width}`);
  }
  const actions = page.locator('[data-testid$="-primary-action"]');
  const count = await actions.count();
  for (let i = 0; i < count; i += 1) {
    const action = actions.nth(i);
    const testId = await action.getAttribute('data-testid');
    try {
      await action.scrollIntoViewIfNeeded({ timeout: 5000 });
      const box = await action.boundingBox();
      const reachable =
        !!box &&
        box.x >= 0 &&
        box.x + box.width <= viewport.width &&
        box.y >= 0 &&
        box.y + box.height <= viewport.height &&
        (await action.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          return !!hit && el.contains(hit);
        }));
      if (!reachable) {
        failures.push(
          `layout ${route}: ${testId} is not reachable at ${viewport.width}x${viewport.height}`
        );
      }
    } catch (e) {
      failures.push(`layout ${route}: ${testId}: ${String(e.message).slice(0, 120)}`);
    }
  }
}

async function run(browser, name, viewport) {
  const failures = [];
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.on('pageerror', (e) => failures.push(`pageerror: ${e.message.slice(0, 200)}`));
  try {
    await page.goto(`${base}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    await checkLayout(page, '/login', viewport, failures);
    await page.goto(`${base}/signup`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    await checkLayout(page, '/signup', viewport, failures);
    if (
      !(await page
        .getByTestId('wizard-next-primary-action')
        .isVisible()
        .catch(() => false))
    ) {
      failures.push('/signup: the wizard next button is not visible');
    }
    await page.screenshot({ path: join(out, `${name}-signup.png`) });
    await page.goto(`${base}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    // TODO P5.3: dropzone selection. P5.5: the board and a load (last slot row
    // reachable with 10 jumpers). P5.6: the configuration routes. P5.7: weather, wind and jump run. P5.8: board and
    // load again at `html { font-size: 200% }`.
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

    await page
      .getByText(/Load #1\b/)
      .first()
      .click({ force: true });
    await page.waitForTimeout(6000);
    if (!/\/dropzone\/load\/\d+/.test(new URL(page.url()).pathname)) {
      failures.push(`expected /dropzone/load/<id>, got ${page.url()}`);
    }
    await page.screenshot({ path: join(out, `${name}-load.png`) });
    const loadUrl = page.url();

    // The manifest context mounts the group sheet once: open it from the load's actions (the button is the speed dial
    // in the bottom right corner)
    await pressAt(page, page.locator('body'), { x: viewport.width - 44, y: viewport.height - 128 });
    await page.waitForTimeout(1000);
    await page.getByText('Manifest group', { exact: true }).last().click({ force: true });
    await page.waitForTimeout(3000);
    if (
      !(await page
        .getByTestId('manifest-group-sheet')
        .isVisible()
        .catch(() => false))
    ) {
      failures.push('the manifest group sheet did not open from the load screen');
    }
    await page.screenshot({ path: join(out, `${name}-group-sheet.png`) });

    // Deep links: a full page load of each URL must open the right screen (needs the persisted login).
    await page.goto(`${base}/dropzone/manifest`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(6000);
    if (!new URL(page.url()).pathname.endsWith('/dropzone/manifest')) {
      failures.push(`deep link /dropzone/manifest ended on ${page.url()}`);
    } else if (
      !(await page
        .getByText(/Load #1\b/)
        .first()
        .isVisible()
        .catch(() => false))
    ) {
      failures.push('deep link /dropzone/manifest did not show the load board');
    }
    await page.screenshot({ path: join(out, `${name}-deeplink-manifest.png`) });

    await page.goto(loadUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(6000);
    if (new URL(page.url()).pathname !== new URL(loadUrl).pathname) {
      failures.push(`deep link ${loadUrl} ended on ${page.url()}`);
    } else if (
      !(await page
        .getByText(/Load #1\b/)
        .first()
        .isVisible()
        .catch(() => false))
    ) {
      failures.push(`deep link ${loadUrl} did not show the load`);
    }
    await page.screenshot({ path: join(out, `${name}-deeplink-load.png`) });

    // The dropzone setup wizard (reachable for any logged in user)
    await page.goto(`${base}/setup`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(4000);
    await checkLayout(page, '/setup', viewport, failures);
    if (
      !(await page
        .getByTestId('wizard-next-primary-action')
        .isVisible()
        .catch(() => false))
    ) {
      failures.push('/setup: the wizard next button is not visible');
    }
    await page.screenshot({ path: join(out, `${name}-setup.png`) });

    // Log out and log in as somebody else without reloading the page: requests must still go out (they used to be
    // aborted for good after a logout) and nothing of the first user may be left behind.
    await page.goto(`${base}/dropzone/manifest`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(4000);
    await pressAt(page, page.locator('body'), { x: 35, y: 28 });
    await page.waitForTimeout(1000);
    await page.getByText('Log out', { exact: true }).last().click({ force: true });
    await page.waitForTimeout(3000);
    if (
      !/\/login/.test(new URL(page.url()).pathname) &&
      (await page.locator('input').count()) < 2
    ) {
      failures.push(`logging out did not show the login screen, got ${page.url()}`);
    }
    await page.locator('input').nth(0).click({ force: true });
    await page.keyboard.type('jumper1@example.com');
    await page.locator('input').nth(1).click({ force: true });
    await page.keyboard.type('Password1!');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(6000);
    await pressAt(page, page.getByText('Dropzone', { exact: true }).first());
    await page.waitForTimeout(8000);
    if (!new URL(page.url()).pathname.endsWith('/dropzone/manifest')) {
      failures.push(`second login: expected /dropzone/manifest, got ${page.url()}`);
    } else if (
      !(await page
        .getByText(/Load #1\b/)
        .first()
        .isVisible()
        .catch(() => false))
    ) {
      failures.push('second login did not show the load board');
    }
    await pressAt(page, page.locator('body'), { x: 35, y: 28 });
    await page.waitForTimeout(1500);
    if (
      !(await page
        .getByText('Jo Jumper')
        .first()
        .isVisible()
        .catch(() => false))
    ) {
      failures.push('second login: the drawer does not show the second user');
    }
    await page.screenshot({ path: join(out, `${name}-second-login.png`) });
  } catch (e) {
    failures.push(`step failed: ${e.message.split('\n')[0]}`);
  } finally {
    await context.close();
  }
  console.log(
    `${name} ${viewport.width}x${viewport.height}: ${failures.length ? `FAIL (${failures.join('; ')})` : 'ok'}`
  );
  return failures.length === 0;
}

mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  args: ['--proxy-bypass-list=local.openmanifest.org,localhost'],
});
let ok = true;
for (const [name, viewport] of Object.entries(viewports)) {
  ok = (await run(browser, name, viewport)) && ok;
}
await browser.close();
process.exitCode = ok ? 0 : 1;
