import { expect, type Locator, type Page } from '@playwright/test';
import { test } from './test';

type Viewport = { width: number; height: number };

const viewportOf = (page: Page): Viewport => page.viewportSize() ?? { width: 1280, height: 800 };

/** The element can be scrolled into view, lies inside the viewport and is what a click there would hit */
export async function expectReachable(page: Page, locator: Locator, label: string) {
  const viewport = viewportOf(page);
  await locator.scrollIntoViewIfNeeded({ timeout: 5000 });
  const box = await locator.boundingBox();
  const reachable =
    !!box &&
    box.x >= 0 &&
    box.x + box.width <= viewport.width &&
    box.y >= 0 &&
    box.y + box.height <= viewport.height &&
    (await locator.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return !!hit && el.contains(hit);
    }));
  expect(reachable, `${label} is not reachable at ${viewport.width}x${viewport.height}`).toBe(true);
}

/** The last row of the slots list can be scrolled to and is reachable (the list virtualises its rows) */
export async function expectLastSlotRowReachable(page: Page) {
  const rows = page.locator('[data-testid="slot-row"]');
  expect(await rows.count(), 'no slot rows').toBeGreaterThan(0);
  await page.evaluate(() => {
    // The last one: on a tablet the board stays mounted below the load screen with a list of its own
    const list = [...document.querySelectorAll('[data-testid="slots"]')].pop();
    if (list) list.scrollTop = list.scrollHeight;
  });
  await page.waitForTimeout(1000);
  await expectReachable(page, rows.last(), 'the last slot row');
}

/**
 * Emulates a large system font size: react-native-web writes font sizes in px, so `html { font-size: 200% }` would not
 * change them. Scales the font size and line height of every element that has text of its own.
 */
export async function scaleText(page: Page, factor: number) {
  await page.evaluate((f) => {
    for (const el of document.querySelectorAll('body *')) {
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim());
      if (!hasText && !['INPUT', 'TEXTAREA'].includes(el.tagName)) continue;
      const cs = getComputedStyle(el);
      (el as HTMLElement).style.fontSize = `${parseFloat(cs.fontSize) * f}px`;
      const lineHeight = parseFloat(cs.lineHeight);
      if (Number.isFinite(lineHeight)) (el as HTMLElement).style.lineHeight = `${lineHeight * f}px`;
    }
  }, factor);
}

/** Rows whose text no longer fits their height: a fixed row height that text outgrew */
export async function expectNoClippedRows(page: Page, route: string) {
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll('[data-testid="slot-row"], [data-testid="load-card"]')]
      .filter(
        (el) => (el as HTMLElement).offsetParent !== null && el.scrollHeight > el.clientHeight + 1
      )
      .map((el) => `${el.getAttribute('data-testid')} ${el.scrollHeight}>${el.clientHeight}`)
  );
  expect(clipped, `${route}: clipped rows`).toEqual([]);
}

/**
 * Layout invariants for the current route: nothing overflows the viewport horizontally, and every visible primary
 * action (`data-testid$="-primary-action"`) can be scrolled into view and is the element that receives a click there.
 * In the `text200` project the text is scaled first.
 */
export async function expectLayout(page: Page, route: string) {
  if (test.info().project.metadata.variant === 'text200') {
    await scaleText(page, 2);
    await page.waitForTimeout(500);
  }
  const viewport = viewportOf(page);
  const scrollWidth = await page.evaluate(() => document.scrollingElement?.scrollWidth ?? 0);
  expect(scrollWidth, `${route}: horizontal scroll`).toBeLessThanOrEqual(viewport.width);

  const actions = page.locator('[data-testid$="-primary-action"]');
  const count = await actions.count();
  for (let i = 0; i < count; i += 1) {
    const action = actions.nth(i);
    // Screens below the current one, and the other tabs, stay mounted but hidden (display, visibility, opacity or inert)
    if (!(await action.isVisible())) continue;
    const shown = await action.evaluate(
      (el) =>
        !el.closest('[inert]') &&
        el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
    );
    if (!shown) continue;
    await expectReachable(page, action, `${route}: ${await action.getAttribute('data-testid')}`);
  }
}
