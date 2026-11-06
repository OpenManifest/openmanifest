import type { Locator, Page } from '@playwright/test';

/**
 * react-native-gesture-handler touchables on web ignore a plain `click()`: they need a real pointer down / up with a
 * short hold. Pass `at` to press a fixed point instead of an element.
 */
export async function press(page: Page, locator: Locator | null, at?: { x: number; y: number }) {
  const box = at ? { x: at.x, y: at.y, width: 0, height: 0 } : await locator?.boundingBox();
  if (!box) throw new Error('press: element has no bounding box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(150);
  await page.mouse.up();
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
    await press(page, locator);
    try {
      await done();
      return;
    } catch (error) {
      if (attempt >= attempts) throw error;
    }
  }
}
