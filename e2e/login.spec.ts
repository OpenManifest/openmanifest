import { loginViaUi, selectOperator, submitLogin } from './support/auth';
import { expectAccessible } from './support/a11y';
import { expectLayout, expectReachable } from './support/layout';
import { openAccount } from './support/account';
import { registerNewUser } from './support/api';
import { ROLES } from './support/roles';
import { expect, gotoRoute, test } from './support/test';

// These tests log in themselves: no stored session
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('login @login', () => {
  test('login screen lays out, is accessible and offers sign up', async ({ page }) => {
    await gotoRoute(page, '/login');
    await expectLayout(page, '/login');
    await expectAccessible(page, '/login');
    await expectReachable(page, page.getByText('Sign up', { exact: true }), '/login: Sign up');
  });

  test('sign up wizard shows its next button', async ({ page }) => {
    await gotoRoute(page, '/signup');
    await expectLayout(page, '/signup');
    await expect(page.getByTestId('wizard-next-primary-action')).toBeVisible();
    await expectAccessible(page, '/signup');
  });

  test('owner logs in, picks the dropzone and reaches the board', async ({ page }) => {
    await gotoRoute(page, '/login');
    await submitLogin(page, ROLES.owner);
    await page.getByText('Dropzone', { exact: true }).first().waitFor({ timeout: 30_000 });
    await expectLayout(page, 'dropzone selection');
    await selectOperator(page);
    await expectLayout(page, '/manifest');
  });

  // The requests of a second login must still go out (they used to be aborted for good after a logout) and nothing of
  // the first user may be left behind.
  test('logout then login as somebody else without reloading', async ({ page }) => {
    await loginViaUi(page, ROLES.owner);
    await openAccount(page);
    await page.getByTestId('account-logout').click();
    await expect(page.locator('input').nth(1)).toBeVisible({ timeout: 15_000 });

    await submitLogin(page, ROLES.jumper);
    await selectOperator(page);
    await expect(page.getByText(/Load #1\b/).first()).toBeVisible({ timeout: 30_000 });
    await openAccount(page);
    await expect(page.getByRole('heading', { name: 'Jo Jumper' })).toBeVisible();
  });

  // Selecting an operator the user has not joined joins them (P6.4)
  test('a brand new user joins the dropzone and reaches their day', async ({ page }) => {
    const email = await registerNewUser();
    await loginViaUi(page, email);
    // Someone who may not manifest others lands on Today, not on the board
    await expect(page).toHaveURL(/\/today$/);
  });
});
