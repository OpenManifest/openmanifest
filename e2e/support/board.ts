import type { Page } from '@playwright/test';

/**
 * Opens the first load of the board on any window: a card opens the load screen, except on a tablet, where it selects the
 * load beside the list and the "Open" button opens it.
 */
export async function openFirstLoad(page: Page) {
  await page.getByTestId('load-card-open').first().click({ force: true });
  const width = page.viewportSize()?.width ?? 0;
  if (width >= 600 && width < 1024) {
    await page.getByTestId('board-open-load').click({ force: true });
  }
  await page.waitForURL(/\/loads\/\d+/);
}
