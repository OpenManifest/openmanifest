import { openFirstLoad } from './support/board';
import type { Page } from '@playwright/test';
import { openAccount } from './support/account';
import { press, pressUntil } from './support/press';
import { expect, gotoRoute, test } from './support/test';

// Visual baselines (checkpoint tasks only: tier 3). They are created and updated with `--update-snapshots` in checkpoint
// and verify tasks, for the routes the batch changed, never in other tasks. One image per `full` project; the text200
// and generic variants are not compared.
//
// The seeded board grows with every run (the live specs create loads) and shows clocks and dates, so the board is
// compared above its list of loads, and times and dates are masked.
const OPTIONS = { animations: 'disabled', maxDiffPixelRatio: 0.05, caret: 'hide' } as const;

const dynamicText = (page: Page) => [
  page.getByText(/\b\d{1,2}:\d{2}\b|\b20\d{2}\b|\bLive \d+/),
  // The day of the board's date pager ("Today, Friday 23 October")
  page.getByText(/^Today, \w+ \d{1,2} \w+$/),
];

// Money changes with every booking the specs make and take back
const money = (page: Page) => [page.getByText(/\$[\d,]+\.\d{2}/)];

// Counts and figures that grow with every run (loads, places, people)
const figures = (page: Page) => [page.getByText(/^[\d,.]+\s*%?$/), page.getByText(/^\d+ \w+$/)];

/** The top of the page (above a list that grows with the specs) */
const top = (page: Page, height: number) => {
  const { width } = page.viewportSize() ?? { width: 390 };
  return { x: 0, y: 0, width, height };
};

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

    // The wizard frame (U5.8b): the first page of the password reset
    test('recover password', async ({ page }) => {
      await gotoRoute(page, '/recover-password');
      await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('recover-password.png', OPTIONS);
    });
  });

  // The operator setup wizard's first page (U5.8b)
  test('setup wizard', async ({ page }) => {
    await gotoRoute(page, '/setup');
    await expect(page.getByRole('heading', { name: 'Name' })).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('setup-wizard.png', OPTIONS);
  });

  // The batch U5.5 to U5.8: compared above their lists and with the figures masked, which grow with every run
  test('reports', async ({ page }) => {
    await gotoRoute(page, '/dashboard');
    await expect(page.getByRole('heading', { name: 'Turnaround', exact: true })).toBeVisible({
      timeout: 20_000,
    });
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('reports.png', {
      ...OPTIONS,
      clip: top(page, 420),
      mask: [...dynamicText(page), ...money(page), ...figures(page)],
    });
  });

  test('money', async ({ page }) => {
    await gotoRoute(page, '/transactions');
    await expect(page.getByTestId('money-sums')).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('money.png', {
      ...OPTIONS,
      clip: top(page, 240),
      mask: [...dynamicText(page), ...money(page), ...figures(page)],
    });
  });

  test('vehicles', async ({ page }) => {
    await gotoRoute(page, '/configuration/vehicles');
    await expect(page.getByTestId('new-vehicle-primary-action')).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('vehicles.png', { ...OPTIONS, clip: top(page, 240) });
  });

  test('permissions', async ({ page }) => {
    await gotoRoute(page, '/configuration/permissions');
    const wide = (page.viewportSize()?.width ?? 0) >= 1024;
    await expect(
      page.getByTestId(wide ? 'permissions-matrix-mode' : 'permissions-list-mode')
    ).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('permissions.png', { ...OPTIONS, clip: top(page, 480) });
  });

  test('conditions panel', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    const strip = page.getByTestId('board-conditions');
    await expect(strip).toBeVisible({ timeout: 20_000 });
    const panel = page.getByTestId('conditions-panel');
    await pressUntil(page, strip.getByRole('button', { name: 'Update' }), () =>
      expect(panel).toBeVisible({ timeout: 3000 })
    );
    await page.waitForTimeout(1500);
    // The @conditions spec changes the values and puts them back
    await expect(panel).toHaveScreenshot('conditions-panel.png', {
      ...OPTIONS,
      mask: [panel.getByRole('spinbutton'), ...dynamicText(page)],
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
    const picker = page.getByTestId('member-picker');
    // The load screen can render again under the pointer: press until the picker is open
    await expect(async () => {
      if (!(await picker.isVisible())) {
        await free.scrollIntoViewIfNeeded({ timeout: 4000 });
        await press(page, free);
      }
      await expect(picker).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout: 60_000 });
    // One person, so the list does not change with the people the other specs add
    await picker.getByTestId('member-picker-search').fill('Pat Pilot');
    await expect(picker.getByTestId('picker-row')).toHaveCount(1, { timeout: 15_000 });
    await page.waitForTimeout(500);
    await expect(picker).toHaveScreenshot('picker.png', {
      ...OPTIONS,
      mask: [...dynamicText(page), ...money(page)],
    });
  });

  // The member's screens (U4): compared above their lists, which grow with every spec; counts, money and times are masked
  test.describe('as a fun jumper', () => {
    test.use({ role: 'jumper' });

    test('today', async ({ page }) => {
      await gotoRoute(page, '/today');
      await expect(page.getByTestId('today-next-load')).toBeVisible({ timeout: 20_000 });
      await page.waitForTimeout(1500);
      const { width } = page.viewportSize() ?? { width: 390 };
      await expect(page).toHaveScreenshot('today.png', {
        ...OPTIONS,
        clip: { x: 0, y: 0, width, height: 420 },
        mask: [...dynamicText(page), ...money(page), page.getByText(/places taken/)],
      });
    });

    test('wallet', async ({ page }) => {
      await gotoRoute(page, '/wallet');
      await expect(page.getByTestId('wallet-balance')).toBeVisible({ timeout: 20_000 });
      await page.waitForTimeout(1500);
      const { width } = page.viewportSize() ?? { width: 390 };
      await expect(page).toHaveScreenshot('wallet.png', {
        ...OPTIONS,
        clip: { x: 0, y: 0, width, height: 420 },
        mask: [...dynamicText(page), ...money(page), page.getByText(/^(Held|Nothing is held)/)],
      });
    });

    test('inbox', async ({ page }) => {
      await gotoRoute(page, '/notifications');
      await expect(page.getByTestId('inbox')).toBeVisible({ timeout: 20_000 });
      await page.waitForTimeout(1500);
      const { width } = page.viewportSize() ?? { width: 390 };
      await expect(page).toHaveScreenshot('inbox.png', {
        ...OPTIONS,
        clip: { x: 0, y: 0, width, height: 200 },
        mask: [...dynamicText(page), page.getByText(/\d+ unread/)],
      });
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

  // People and the Rules page (U5): the list grows with the walk-ins the specs add, so it is searched down to one person;
  // the count, money, the last jump and the reason (dates relative to today) are masked
  test('people', async ({ page }) => {
    await gotoRoute(page, '/users');
    const rows = page.getByTestId('people-row');
    await expect(rows.first()).toBeVisible({ timeout: 20_000 });
    await page.getByTestId('people-search').fill('Pat Pilot');
    await expect(rows).toHaveCount(1, { timeout: 15_000 });
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('people.png', {
      ...OPTIONS,
      mask: [
        ...dynamicText(page),
        ...money(page),
        page.getByTestId('people-count'),
        page.locator('[data-testid$="-last"]'),
        page.locator('[data-testid$="-reason"]'),
      ],
    });
  });

  test('rules', async ({ page }) => {
    await gotoRoute(page, '/configuration/rules');
    await expect(page.getByTestId('rules-modules')).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(1500);
    // The @setup spec switches self-manifesting off and back on while it runs
    await expect(page).toHaveScreenshot('rules.png', {
      ...OPTIONS,
      mask: [page.getByRole('switch', { name: 'Members can book themselves on loads' })],
    });
  });
});
