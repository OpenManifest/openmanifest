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
