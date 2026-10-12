import { expectLayout } from './support/layout';
import { expect, gotoRoute, test } from './support/test';

test.describe('navigation @nav', () => {
  // The tab labels come from the i18n `common` namespace (U0.6)
  test('the tab bar is named from the translations', async ({ page }) => {
    await gotoRoute(page, '/manifest');

    for (const name of ['Overview', 'Manifest', 'Notifications', 'Users']) {
      await expect(
        page.getByRole('tab', { name }).or(page.getByLabel(name)).first()
      ).toBeAttached();
    }
    await expectLayout(page, 'navigation');
  });

  // ?industry=<slug> swaps the words of the app on non-production builds; the board has no such words yet, so this
  // only proves the app still renders with it
  test('the board renders with ?industry=generic', async ({ page }) => {
    await gotoRoute(page, '/manifest?industry=generic');

    await expect(page.getByText(/Load #1\b/).first()).toBeVisible();
  });
});
