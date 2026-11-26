import type { Locator, Page } from '@playwright/test';

/**
 * react-native-gesture-handler touchables on web ignore a plain `click()`: they need a real pointer down / up with a
 * short hold. Pass `at` to press a fixed point instead of an element.
 */
export async function press(page: Page, locator: Locator | null, at?: { x: number; y: number }) {
  const box = at ? { x: at.x, y: at.y, width: 0, height: 0 } : await settledBox(page, locator);
  if (!box) throw new Error('press: element has no bounding box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(150);
  await page.mouse.up();
}

/**
 * The element's box once it stops moving: a panel or sheet slides in (U6.2), and a box taken while it moves sends the
 * pointer where the element no longer is (or off the page).
 */
async function settledBox(page: Page, locator: Locator | null) {
  let box = (await locator?.boundingBox()) ?? null;
  for (let i = 0; box && i < 20; i++) {
    await page.waitForTimeout(50);
    const next = await locator?.boundingBox();
    if (!next) return null;
    if (
      next.x === box.x &&
      next.y === box.y &&
      next.width === box.width &&
      next.height === box.height
    )
      break;
    box = next;
  }
  return box;
}

/**
 * Presses until what the press does shows: a press that lands while the screen is still settling (the data arrives and
 * rebuilds the row under the pointer) is lost, as it would be for a person, who then presses again. `done` throws until
 * it holds.
 */
export async function pressUntil(
  page: Page,
  locator: Locator,
  done: () => Promise<unknown>,
  attempts = 4
) {
  for (let attempt = 1; ; attempt++) {
    try {
      // A list that renders again can take the element away for a moment (no bounding box): wait until it is back,
      // and count a press that found nothing as a lost one
      await locator.waitFor({ state: 'visible', timeout: 10_000 });
      await press(page, locator);
      await done();
      return;
    } catch (error) {
      if (attempt >= attempts) throw error;
    }
  }
}
