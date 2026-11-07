import { loginViaUi, operatorRow, selectOperator, submitLogin } from './support/auth';
import { expectAccessible } from './support/a11y';
import { expectLayout, expectReachable } from './support/layout';
import { openAccount } from './support/account';
import { registerNewUser } from './support/api';
import { ROLES } from './support/roles';
import { pressUntil } from './support/press';
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
    await operatorRow(page).waitFor({ timeout: 30_000 });
    await expectLayout(page, 'dropzone selection');
    await expectAccessible(page, 'dropzone selection');
    await selectOperator(page);
    await expectLayout(page, '/manifest');
  });

  test('password recovery asks for the email first', async ({ page }) => {
    await gotoRoute(page, '/recover-password');
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();
    await expectLayout(page, '/recover-password');
    await expectAccessible(page, '/recover-password');
    await pressUntil(page, page.getByTestId('wizard-next-primary-action'), () =>
      expect(page.getByText('Email is required')).toBeVisible({ timeout: 3_000 })
    );
  });

  test('a new password must be strong enough', async ({ page }) => {
    await gotoRoute(page, '/change-password');
    await expect(page.getByRole('heading', { name: 'New password' })).toBeVisible();
    await expectLayout(page, '/change-password');
    await expectAccessible(page, '/change-password');
    await page.getByLabel('New password', { exact: true }).fill('abc');
    await pressUntil(page, page.getByTestId('wizard-next-primary-action'), () =>
      expect(page.getByText('Password too weak').first()).toBeVisible({ timeout: 3_000 })
    );
  });

  test('a confirmation link without its token says so', async ({ page }) => {
    await gotoRoute(page, '/confirm');
    await expect(
      page.getByRole('heading', { name: 'Your account could not be confirmed' })
    ).toBeVisible();
    await expectLayout(page, '/confirm');
    await expectAccessible(page, '/confirm');
  });

  // The setup wizard from the operator selection: nothing is created, the name step refuses an empty name
  test('a new user opens the setup wizard from the operator selection', async ({ page }) => {
    const email = await registerNewUser();
    await gotoRoute(page, '/login');
    await submitLogin(page, email);
    const create = page.getByTestId('create-operator-primary-action');
    await create.waitFor({ timeout: 30_000 });
    await pressUntil(page, create, () =>
      expect(page.getByRole('heading', { name: 'Name' })).toBeVisible({ timeout: 5_000 })
    );
    await expect(page.getByRole('progressbar', { name: 'Step 1 of 8' })).toBeVisible();
    await expectLayout(page, '/setup');
    await expectAccessible(page, '/setup');
    await pressUntil(page, page.getByTestId('wizard-next-primary-action'), () =>
      expect(page.getByText('Your operator must have a name')).toBeVisible({ timeout: 3_000 })
    );
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
