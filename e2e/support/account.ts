import type { Page } from '@playwright/test';

/**
 * Opens the account screen: the account button of the sidebar and the rail, or More and then Account on a phone.
 * Resolves when the screen shows (its log out row is there).
 */
export async function openAccount(page: Page) {
  // The bar shows once the operator and the permissions are known
  await page.locator('[data-testid="nav-account"], [data-testid="nav-more"]').first().waitFor();
  const account = page.getByTestId('nav-account');
  if (await account.isVisible()) {
    await account.click();
  } else {
    await page.getByTestId('nav-more').click();
    await page.getByTestId('more-account').click();
  }
  await page.getByTestId('account-logout').waitFor();
}
