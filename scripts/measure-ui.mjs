#!/usr/bin/env node
/**
 * Measures the web build against a running API (U6.3): how long the board and the people take to show, the frames of
 * the board while its loads are changed through the API (the live updates of a second device), and the frames while the
 * people list is scrolled. Run against the scaled seed (backend `bin/rails db:seed:perf_scale`: 500 members, 6 loads of
 * 14 seats) and a served export:
 *
 *   PW_CHROMIUM=/opt/pw-browsers/chromium [CPU_THROTTLE=4] [UPDATE_MS=1000] node scripts/measure-ui.mjs [width] [height]
 *
 * Prints one JSON object. Frame numbers come from requestAnimationFrame in headless Chromium on the machine it runs on,
 * so compare runs on the same machine only. It signs in as the owner: do not run it while a Playwright run is going.
 */
import { chromium } from 'playwright';

const BASE = process.env.UI_BASE_URL ?? 'http://localhost:19006';
const API = process.env.UI_API_URL ?? 'http://local.openmanifest.org:5000/graphql';
const PASSWORD = 'Password1!';
// CPU_THROTTLE=4 slows the page's CPU fourfold (Chrome DevTools' "4x slowdown"), nearer a mid-range phone
const [width = 1440, height = 900] = process.argv.slice(2).map(Number);
const THROTTLE = Number(process.env.CPU_THROTTLE ?? 1);
const UPDATES = 40;
// One load changed every UPDATE_MS (250: four a second, far more than a busy desk makes)
const UPDATE_MS = Number(process.env.UPDATE_MS ?? 250);

async function api(query, headers = {}) {
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ query }),
  });
  return { json: await response.json(), headers: response.headers };
}

async function ownerHeaders() {
  const login = await api(
    `mutation { userLogin(email: "owner@example.com", password: "${PASSWORD}") { authenticatable { id } } }`
  );
  return Object.fromEntries(
    ['access-token', 'client', 'uid'].map((k) => [k, login.headers.get(k)])
  );
}

/** Starts recording frame lengths and long tasks in the page */
const startFrames = (page) =>
  page.evaluate(() => {
    const w = window;
    w.__frames = [];
    w.__long = [];
    w.__recording = true;
    let last = performance.now();
    const tick = (now) => {
      if (!w.__recording) return;
      w.__frames.push(now - last);
      last = now;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    w.__observer = new PerformanceObserver((list) =>
      list.getEntries().forEach((entry) => w.__long.push(entry.duration))
    );
    w.__observer.observe({ type: 'longtask' });
  });

const stopFrames = (page) =>
  page.evaluate(() => {
    const w = window;
    w.__recording = false;
    w.__observer.disconnect();
    const frames = w.__frames.slice(1);
    const total = frames.reduce((a, b) => a + b, 0);
    const sorted = [...frames].sort((a, b) => a - b);
    const round = (n) => Math.round(n * 10) / 10;
    return {
      frames: frames.length,
      fps: round((frames.length / total) * 1000),
      p95Ms: round(sorted[Math.floor(sorted.length * 0.95)] ?? 0),
      maxMs: round(sorted[sorted.length - 1] ?? 0),
      over33Ms: frames.filter((f) => f > 33.4).length,
      longTasks: w.__long.length,
      longTaskMs: round(w.__long.reduce((a, b) => a + b, 0)),
    };
  });

// As playwright.config.ts: Chromium takes the environment's proxy for WebSockets, so the local backend bypasses it
const proxy = process.env.HTTPS_PROXY ?? process.env.https_proxy;
const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || undefined,
  args: [
    ...(proxy ? [`--proxy-server=${proxy}`] : []),
    '--proxy-bypass-list=local.openmanifest.org;localhost;127.0.0.1',
  ],
});
const page = await browser.newPage({ viewport: { width, height } });
const result = { viewport: `${width}x${height}`, cpuThrottle: THROTTLE };
if (THROTTLE > 1) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
}

// Sign in and pick the operator
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.locator('input').nth(1).waitFor();
await page.locator('input').nth(0).click({ force: true });
await page.keyboard.type('owner@example.com');
await page.locator('input').nth(1).click({ force: true });
await page.keyboard.type(PASSWORD);
await page.keyboard.press('Enter');
const operator = page.getByRole('button', { name: /^(Demo )?Dropzone$/ }).first();
await operator.waitFor({ timeout: 30_000 });
await operator.click();
await page.waitForURL(/\/(manifest|today)$/, { timeout: 30_000 });

// The board, from a fresh page load until its cards show
let start = Date.now();
await page.goto(`${BASE}/manifest`);
await page.getByTestId('load-card').nth(5).waitFor({ timeout: 60_000 });
result.boardShownMs = Date.now() - start;
result.loadCards = await page.getByTestId('load-card').count();
await page.waitForTimeout(2000);

// Live updates: one load renamed every UPDATE_MS, round the loads of the day
const headers = await ownerHeaders();
const loads = await api('{ operators { edges { node { id } } } }', headers);
const operatorId = loads.json.data.operators.edges[0].node.id;
const day = await api(`{ loads(operator: ${operatorId}) { edges { node { id name } } } }`, headers);
// The names without the mark of an earlier run that stopped half way
const ids = day.json.data.loads.edges.map(({ node }) => ({
  ...node,
  name: node.name.replace(/( \*)+$/, ''),
}));
const rename = (id, name) =>
  api(
    `mutation { updateLoad(input: { id: ${id}, attributes: { name: "${name}" } }) { errors } }`,
    headers
  );
for (const { id, name } of ids) await rename(id, name);
await page.waitForTimeout(5000);
// Every load name the page shows from now on, with the time it showed
await page.evaluate(() => {
  const w = window;
  w.__names = [];
  const note = (node) => {
    const text = node?.textContent ?? '';
    if (/^Load \d+( \*)?$/.test(text)) w.__names.push([Date.now(), text]);
  };
  w.__names_observer = new MutationObserver((mutations) =>
    mutations.forEach((mutation) => {
      if (mutation.type === 'characterData') note(mutation.target);
      mutation.addedNodes.forEach((node) => {
        note(node);
        node.querySelectorAll?.('*').forEach(note);
      });
    })
  );
  w.__names_observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
  });
});
await startFrames(page);
start = Date.now();
const sent = [];
for (let i = 0; i < UPDATES; i++) {
  const { id, name } = ids[i % ids.length];
  // One round marks every load, the next takes the marks off again: every update changes a load
  const next = Math.floor(i / ids.length) % 2 ? name : `${name} *`;
  sent.push([Date.now(), next]);
  await rename(id, next);
  const wait = start + (i + 1) * UPDATE_MS - Date.now();
  if (wait > 0) await page.waitForTimeout(wait);
}
await page.waitForTimeout(3000);
result.boardLive = { updates: UPDATES, everyMs: UPDATE_MS, ...(await stopFrames(page)) };
// Which pushes reached the board, and how long after the change was sent
const names = await page.evaluate(() => window.__names);
const latencies = sent
  .map(([at, text], i) => {
    const until = sent.slice(i + 1).find(([, other]) => other === text)?.[0] ?? Infinity;
    const shown = names.find(([t, seen]) => seen === text && t >= at && t < until);
    return shown ? shown[0] - at : null;
  })
  .filter((latency) => latency !== null)
  .sort((a, b) => a - b);
result.boardLive.pushesShown = `${latencies.length}/${UPDATES}`;
result.boardLive.pushMedianMs = latencies[Math.floor(latencies.length / 2)] ?? null;
// Leave the names as they were
for (const { id, name } of ids) await rename(id, name);

// The people: the first page, then all of them, then scrolling
start = Date.now();
await page.goto(`${BASE}/users`);
await page
  .getByTestId('people-count')
  .filter({ hasText: /people/ })
  .waitFor({ timeout: 60_000 });
result.peopleShownMs = Date.now() - start;
// Every page through "Show more", each until the list shows it
start = Date.now();
result.peopleBlankMs = 0;
for (;;) {
  const more = page.getByTestId('people-more');
  if (!(await more.isVisible().catch(() => false))) break;
  const shown = parseInt(await page.getByTestId('people-count').innerText(), 10);
  await more.scrollIntoViewIfNeeded();
  await more.click();
  // How long the list is gone (skeletons) while the next page loads
  const blank = Date.now();
  const gone = await page
    .getByTestId('people-loading')
    .waitFor({ timeout: 300 })
    .then(() => true)
    .catch(() => false);
  await page
    .getByTestId('people-count')
    .filter({ hasText: new RegExp(`^(?!${shown} )\\d+ people`) })
    .waitFor({ timeout: 30_000 });
  if (gone) result.peopleBlankMs += Date.now() - blank;
}
result.peopleAllShownMs = Date.now() - start;
result.peopleCount = await page.getByTestId('people-count').innerText();
await page.mouse.move(width / 2, height / 2);
await startFrames(page);
for (let i = 0; i < 60; i++) {
  await page.mouse.wheel(0, i < 30 ? 400 : -400);
  await page.waitForTimeout(50);
}
await page.waitForTimeout(500);
result.peopleScroll = await stopFrames(page);
// A search: from the last key until the list shows one person (the search waits 250 ms for the typing to stop)
start = Date.now();
await page.getByTestId('people-search').fill('Perf Member 123');
await page
  .getByTestId('people-count')
  .filter({ hasText: /^1 person/ })
  .waitFor({ timeout: 30_000 });
result.peopleSearchMs = Date.now() - start;

console.log(JSON.stringify(result));
await browser.close();
