import type { Page } from '@playwright/test';
import { openDrawer } from './support/press';
import { expect, gotoRoute, test } from './support/test';

// Visual baselines (checkpoint tasks only: tier 3). They are created and updated with `--update-snapshots` in checkpoint
// and verify tasks, for the routes the batch changed, never in other tasks. One image per `full` project; the text200
// and generic variants are not compared.
//
// The seeded board grows with every run (the live specs create loads) and shows clocks and dates, so the board is
// compared above its list of loads, and times and dates are masked.
const OPTIONS = { animations: 'disabled', maxDiffPixelRatio: 0.05, caret: 'hide' } as const;

const dynamicText = (page: Page) => [page.getByText(/\b\d{1,2}:\d{2}\b|\b20\d{2}\b|\bLive \d+/)];

test.beforeEach(async ({}, testInfo) => {
  const { group, variant } = testInfo.project.metadata;
  testInfo.skip(
    group !== 'full' || !!variant,
    'visual baselines are compared by the full projects only'
  );
});

test.describe('visual baselines @visual', () => {
  test.describe('logged out', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('login', async ({ page }) => {
      await gotoRoute(page, '/login');
      await expect(page).toHaveScreenshot('login.png', OPTIONS);
    });
  });

  test('board', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    await page.waitForTimeout(1500);
    const { width } = page.viewportSize() ?? { width: 390 };
    await expect(page).toHaveScreenshot('board.png', {
      ...OPTIONS,
      clip: { x: 0, y: 0, width, height: 360 },
      mask: dynamicText(page),
    });
  });

  test('load', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    await page
      .getByText(/Load #1\b/)
      .first()
      .click({ force: true });
    await page.waitForURL(/\/loads\/\d+/);
    await page.waitForTimeout(3000);
    await expect(page).toHaveScreenshot('load.png', { ...OPTIONS, mask: dynamicText(page) });
  });

  test('profile', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    await openDrawer(page);
    await page.getByText('Profile', { exact: true }).last().click({ force: true });
    await page.waitForTimeout(4000);
    await expect(page).toHaveScreenshot('profile.png', { ...OPTIONS, mask: dynamicText(page) });
  });

  test('settings', async ({ page }) => {
    await gotoRoute(page, '/configuration');
    await page.waitForTimeout(2500);
    await expect(page).toHaveScreenshot('settings.png', OPTIONS);
  });
});
