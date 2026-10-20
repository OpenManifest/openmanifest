import { openAccount } from './support/account';
import { expect, gotoRoute, test } from './support/test';

test.describe('one path for a member @nav @profile', () => {
  // The User stack was registered under four parents; links and bookmarks from before still work
  test('every old path lands on the profile at /user/:id', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    await openAccount(page);
    await page.getByTestId('account-profile').click();
    await page.waitForURL(/\/user\/\d+$/);
    const id = page.url().match(/\/user\/(\d+)$/)?.[1];
    expect(id, 'the profile has no id in its path').toBeTruthy();

    for (const old of [`/manifest/users/${id}`, `/modal/user/${id}`, `/user/${id}`]) {
      await gotoRoute(page, old);
      await expect(page, `${old} did not reach the canonical path`).toHaveURL(
        new RegExp(`/user/${id}$`)
      );
      await expect(page.getByText('Olive Owner').locator('visible=true').first()).toBeVisible();
    }
  });

  test('the old list and equipment paths land on the canonical ones', async ({ page }) => {
    await gotoRoute(page, '/modal/users');
    await expect(page).toHaveURL(/\/users$/);
    await expect(page.getByRole('heading', { name: 'People', level: 1 })).toBeVisible();

    await gotoRoute(page, '/manifest/users');
    await expect(page).toHaveURL(/\/users$/);
  });
});
