import { expectLayout } from './support/layout';
import { expect, gotoRoute, test } from './support/test';

test.describe('navigation @nav', () => {
  // The tab labels come from the i18n `common` namespace (U0.6)
  test('the tab bar is named from the translations', async ({ page }) => {
    await gotoRoute(page, '/manifest');

    // A tab on a phone, a drawer button where the drawer is open
    for (const name of ['Overview', 'Manifest', 'Notifications']) {
      const entry = page
        .getByRole('tab', { name, exact: true })
        .or(page.getByRole('button', { name, exact: true }));
      await expect(entry.first()).toBeAttached();
    }
    await expectLayout(page, 'navigation');
  });

  // ?industry=<slug> swaps the words of the app on non-production builds; the board has no such words yet, so this
  // only proves the app still renders with it
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
