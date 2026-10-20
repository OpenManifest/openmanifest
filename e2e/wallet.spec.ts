import { ownerCall } from './support/api';
import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
import { press, pressUntil } from './support/press';
import { expect, gotoRoute, test } from './support/test';

// The Wallet (U4.3): a member's balance, what is held for booked jumps, and what they paid with a receipt for each
test.describe('wallet as a fun jumper @wallet', () => {
  test.use({ role: 'jumper' });

  test('shows the balance, what is held, how to top up and what they paid', async ({ page }) => {
    await gotoRoute(page, '/wallet');

    await expect(page.getByTestId('wallet-balance')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('wallet-balance-amount')).toContainText('$');
    await expect(page.getByTestId('wallet-balance-held')).toBeVisible();
    await expect(page.getByTestId('wallet-balance-top-up')).toHaveText(
      'Top up at the manifest desk'
    );
    await expect(page.getByTestId('wallet-history')).toBeVisible();
    await expectLayout(page, 'wallet');
    await expectAccessible(page, 'wallet');
  });

  test('opens the receipt of an order and goes back', async ({ page }) => {
    await gotoRoute(page, '/wallet');
    const first = page.locator('[data-testid^="wallet-history-"][role="button"]').first();
    await expect(first).toBeVisible({ timeout: 20_000 });

    await pressUntil(page, first, () =>
      expect(page.getByTestId('wallet-receipt')).toBeVisible({ timeout: 5000 })
    );
    await expect(page).toHaveURL(/\/wallet\/\d+$/);
    await expect(page.getByTestId('wallet-receipt-state')).toBeVisible();
    await expect(page.getByTestId('wallet-receipt-amount')).toContainText('$');
    await expectAccessible(page, 'wallet receipt');
  });

  test('the old path of their own transactions lands on the wallet', async ({ page }) => {
    const found = await ownerCall('{ operators { edges { node { id } } } }');
    const operatorId = Number(found.json.data.operators.edges[0].node.id);
    const members = await ownerCall(
      `{ memberships(operator: ${operatorId}, first: 5, search: "Jo Jumper") { edges { node { id } } } }`
    );
    const id = members.json.data.memberships.edges[0].node.id;

    await gotoRoute(page, `/user/${id}/transactions`);

    await expect(page).toHaveURL(/\/wallet$/, { timeout: 20_000 });
    await expect(page.getByTestId('wallet-balance')).toBeVisible();
  });

  test('the bar has the wallet', async ({ page }) => {
    await gotoRoute(page, '/today');
    const nav = page.getByRole('navigation', { name: 'Main' });

    await press(page, nav.getByRole('button', { name: 'Wallet' }));
    await expect(page).toHaveURL(/\/wallet$/);
  });
});

test.describe('wallet as the manifest desk @wallet', () => {
  test.use({ role: 'manager' });

  test('is not in their bar: they run the money', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    const nav = page.getByRole('navigation', { name: 'Main' });

    await expect(nav.getByRole('button', { name: 'Board' })).toBeVisible({ timeout: 20_000 });
    await expect(nav.getByRole('button', { name: 'Wallet' })).toHaveCount(0);
  });
});
