import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
import { openAccount } from './support/account';
import { expect, gotoRoute, test } from './support/test';

test.describe('profile @profile', () => {
  // The signed in user's own profile, through the account screen
  test('own profile opens from the account screen', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    await openAccount(page);
    await page.getByTestId('account-profile').click();
    await page.waitForTimeout(4000);
    await expect(page.getByText('Olive Owner').locator('visible=true').first()).toBeVisible();
    await expectLayout(page, 'profile');
    await expectAccessible(page, 'profile');
  });
});

test.describe('profile as a jumper @profile', () => {
  test.use({ role: 'jumper' });

  test('a fun jumper reaches their own profile', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    await openAccount(page);
    await page.getByTestId('account-profile').click();
    await page.waitForTimeout(4000);
    await expect(page.getByText('Jo Jumper').locator('visible=true').first()).toBeVisible();
    await expectLayout(page, 'profile (jumper)');
  });
});
