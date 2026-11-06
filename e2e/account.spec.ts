import { loginViaUi } from './support/auth';
import { expectAccessible } from './support/a11y';
import { openAccount } from './support/account';
import { expectLayout } from './support/layout';
import { ROLES } from './support/roles';
import { expect, gotoRoute, test } from './support/test';

test.describe('account @account', () => {
  test('the account screen lays out and offers the places, appearance, density and operators', async ({
    page,
  }) => {
    await gotoRoute(page, '/manifest');
    await openAccount(page);

    await expect(page.getByRole('heading', { name: 'Olive Owner' })).toBeVisible();
    await expect(page.getByTestId('account-profile')).toBeVisible();
    await expect(page.getByRole('radio', { name: 'System' })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Auto' })).toBeChecked();
    await expectLayout(page, '/account');
    await expectAccessible(page, '/account');
  });

  test('a cold load of /account and /more stays on them', async ({ page }) => {
    await gotoRoute(page, '/account');
    await page.waitForTimeout(2000);
    expect(new URL(page.url()).pathname).toBe('/account');
    await expect(page.getByTestId('account-logout')).toBeVisible();

    await gotoRoute(page, '/more');
    await page.waitForTimeout(2000);
    expect(new URL(page.url()).pathname).toBe('/more');
    await expect(page.getByTestId('more-account')).toBeVisible();
  });

  test('the appearance follows the choice', async ({ page }) => {
    await gotoRoute(page, '/account');
    await page.getByRole('radio', { name: 'Dark' }).click();

    await expect(page.getByRole('radio', { name: 'Dark' })).toBeChecked();
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    // Back to the system choice so the stored state of later tests is unchanged
    await page.getByRole('radio', { name: 'System' }).click();
    expect(background).not.toBe('rgb(255, 255, 255)');
  });

  test('switching to the current operator opens its board', async ({ page }) => {
    await gotoRoute(page, '/account');
    await page
      .getByTestId(/operator-\d+/)
      .first()
      .click();

    await expect(page).toHaveURL(/\/manifest/);
    await expect(page.getByText(/Load #1\b/).first()).toBeVisible({ timeout: 30_000 });
  });

  test.describe('logging out', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('leaves the login screen from the account screen', async ({ page }) => {
      await loginViaUi(page, ROLES.owner);
      await openAccount(page);
      await page.getByTestId('account-logout').click();

      await expect(page.locator('input').nth(1)).toBeVisible({ timeout: 15_000 });
    });
  });
});
