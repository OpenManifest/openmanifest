import { expectAccessible } from './support/a11y';
import { expect, gotoRoute, test } from './support/test';

test.describe('screen header @nav @manifest', () => {
  test('a load names itself, the document follows, and back returns to the board', async ({
    page,
  }) => {
    await gotoRoute(page, '/manifest');
    await expect(page.getByRole('heading', { name: 'Board', level: 1 })).toBeVisible();
    await expect(page).toHaveTitle(/^Board · Demo Dropzone$/);

    await page
      .getByText(/Load #1\b/)
      .first()
      .click({ force: true });
    await page.waitForURL(/\/loads\/\d+/);

    await expect(page.getByRole('heading', { name: /^Load #\d+$/, level: 1 })).toBeVisible();
    await expect(page).toHaveTitle(/^Load #\d+ · Demo Dropzone$/);
    await expectAccessible(page, 'load');

    // The back button is named after the screen it returns to
    await page.getByRole('button', { name: 'Back to Board' }).click();
    await expect(page).toHaveURL(/\/manifest$/);
    await expect(page.getByRole('heading', { name: 'Board', level: 1 })).toBeVisible();
  });

  test('the header is the banner landmark of the screen', async ({ page }) => {
    await gotoRoute(page, '/manifest');

    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('banner').getByRole('heading', { name: 'Board' })).toBeVisible();
  });
});
