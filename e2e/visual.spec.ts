import { openFirstLoad } from './support/board';
import type { Page } from '@playwright/test';
import { openAccount } from './support/account';
import { press } from './support/press';
import { expect, gotoRoute, test } from './support/test';

// Visual baselines (checkpoint tasks only: tier 3). They are created and updated with `--update-snapshots` in checkpoint
// and verify tasks, for the routes the batch changed, never in other tasks. One image per `full` project; the text200
// and generic variants are not compared.
//
// The seeded board grows with every run (the live specs create loads) and shows clocks and dates, so the board is
// compared above its list of loads, and times and dates are masked.
const OPTIONS = { animations: 'disabled', maxDiffPixelRatio: 0.05, caret: 'hide' } as const;

const dynamicText = (page: Page) => [page.getByText(/\b\d{1,2}:\d{2}\b|\b20\d{2}\b|\bLive \d+/)];

// Money changes with every booking the specs make and take back
const money = (page: Page) => [page.getByText(/\$[\d,]+\.\d{2}/)];

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
    await openFirstLoad(page);
    await page.waitForTimeout(3000);
    await expect(page).toHaveScreenshot('load.png', { ...OPTIONS, mask: dynamicText(page) });
  });

  test('picker', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    await openFirstLoad(page);
    const free = page.getByTestId('free-places').last();
    await expect(free).toHaveAttribute('role', 'button', { timeout: 20_000 });
    await free.scrollIntoViewIfNeeded();
    const picker = page.getByTestId('member-picker');
    for (let attempt = 0; attempt < 4 && !(await picker.isVisible()); attempt++) {
      await press(page, free);
      await picker.waitFor({ timeout: 5000 }).catch(() => undefined);
    }
    // One person, so the list does not change with the people the other specs add
    await picker.getByTestId('member-picker-search').fill('Pat Pilot');
    await expect(picker.getByTestId('picker-row')).toHaveCount(1, { timeout: 15_000 });
    await page.waitForTimeout(500);
    await expect(picker).toHaveScreenshot('picker.png', {
      ...OPTIONS,
      mask: [...dynamicText(page), ...money(page)],
    });
  });

  test('profile', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    await openAccount(page);
    await page.getByTestId('account-profile').click();
    await page.waitForTimeout(4000);
    await expect(page).toHaveScreenshot('profile.png', { ...OPTIONS, mask: dynamicText(page) });
  });

  test('settings', async ({ page }) => {
    await gotoRoute(page, '/configuration');
    await page.waitForTimeout(2500);
    await expect(page).toHaveScreenshot('settings.png', OPTIONS);
  });
});
