import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
import { expect, gotoRoute, test } from './support/test';

const isWide = (page: import('@playwright/test').Page) => (page.viewportSize()?.width ?? 0) >= 1024;

test.describe('navigation @nav', () => {
  // The shell is made from the destinations table: tabs on a phone, a sidebar on a desktop
  test('the shell lays out, is a navigation landmark and marks the current item', async ({
    page,
  }) => {
    await gotoRoute(page, '/manifest');

    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Board' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await expect(nav.getByRole('button', { name: 'People' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Inbox' })).toBeVisible();
    await expectLayout(page, 'navigation');
    await expectAccessible(page, '/manifest');
  });

  test('the bar is tabs on a phone, a rail on a tablet and a sidebar with the operator on a desktop', async ({
    page,
  }) => {
    await gotoRoute(page, '/manifest');
    const nav = page.getByRole('navigation', { name: 'Main' });
    const box = await nav.boundingBox();
    const viewport = page.viewportSize() as { width: number; height: number };

    if (isWide(page)) {
      expect(box?.x).toBe(0);
      expect(box?.width).toBe(240);
      await expect(nav.getByRole('button', { name: 'Switch operator' })).toContainText(
        'Demo Dropzone'
      );
      await expect(nav.getByRole('button', { name: 'Account menu' })).toBeVisible();
    } else if (viewport.width >= 600) {
      expect(box?.x).toBe(0);
      expect(box?.width).toBe(80);
    } else {
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBe(viewport.height);
      expect(box?.width).toBe(viewport.width);
      await expect(nav.getByRole('button', { name: 'Switch operator' })).toHaveCount(0);
    }
  });

  test('the keyboard reaches every item, in order, and opens one with Enter', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    // Two workers drive two windows: focus goes to the one in front
    await page.bringToFront();
    const nav = page.getByRole('navigation', { name: 'Main' });
    const tabs = nav.locator('[data-testid^="nav-"]');
    // The items arrive with the permissions: wait for them before counting
    await expect.poll(() => tabs.count()).toBeGreaterThanOrEqual(3);
    const count = await tabs.count();

    // Tab from the skip link (wide windows) or the first item through the list
    await tabs.first().focus();
    for (let i = 0; i < count; i += 1) {
      await expect(tabs.nth(i)).toBeFocused();
      await page.keyboard.press('Tab');
    }

    await nav.getByRole('button', { name: 'People' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/users/);
    await expect(nav.getByRole('button', { name: 'People' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  test('the skip link jumps to the content', async ({ page }) => {
    await gotoRoute(page, '/manifest');

    const skip = page.getByRole('button', { name: 'Skip to content' });
    await skip.focus();
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('MAIN');
  });

  // ?industry=<slug> swaps the words of the app on non-production builds
  test('the board renders with ?industry=generic', async ({ page }) => {
    await gotoRoute(page, '/manifest?industry=generic');

    await expect(page.getByText(/Load #1\b/).first()).toBeVisible();
  });

  // BUG-100: the Users tab used to be registered only after the permissions had loaded, so a full page load of /users
  // ended on /
  test('a cold load of the people route stays on it', async ({ page }) => {
    await gotoRoute(page, '/users');
    await page.waitForTimeout(2500);

    expect(new URL(page.url()).pathname).toBe('/users');
    await expect(page.getByTestId('no-access')).toHaveCount(0);
  });
});

// A jumper's shell has no dashboard; a cold load of a route they may not use says so instead of ending on the board
test.describe('navigation as a student @nav', () => {
  test.use({ role: 'student' });

  test('the bar has today, the board, the inbox and the wallet only', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    const nav = page.getByRole('navigation', { name: 'Main' });

    await expect(nav.getByRole('button', { name: 'Today' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Board' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Inbox' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Wallet' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'People' })).toHaveCount(0);
  });

  test('a cold load of the people route says there is no access', async ({ page }) => {
    await gotoRoute(page, '/users');
    await page.waitForTimeout(2500);

    await expect(page.getByTestId('no-access')).toBeVisible();
  });
});
