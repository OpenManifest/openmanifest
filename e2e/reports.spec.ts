import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
import { pressUntil } from './support/press';
import { expect, gotoRoute, test } from './support/test';

// Reports and Money on app/ui (U5.8). Platform needs a moderator, which the seed has not: its parts are covered in Jest.
test.describe('reports and money @reports', () => {
  test('reports show the figures, the bar lists and what happened, by period', async ({ page }) => {
    await gotoRoute(page, '/dashboard');
    await expect(page.getByRole('heading', { name: 'Turnaround', exact: true })).toBeVisible({
      timeout: 20_000,
    });
    // The seed has flown no loads: the counts are zero and the revenue is money, not cents with a dollar sign
    await expect(page.getByTestId('reports-turnaround-revenue-value')).toHaveText(/^\$\d+\.\d\d$/);
    for (const section of [
      'reports-roles',
      'reports-members',
      'reports-loads',
      'reports-activities',
    ]) {
      await expect(page.getByTestId(section)).toBeVisible();
    }
    await expect(page.getByRole('heading', { name: 'What happened', exact: true })).toBeVisible();
    await expectLayout(page, '/dashboard');
    await expectAccessible(page, '/dashboard');

    const months = page.getByRole('radio', { name: '3 months', exact: true });
    await pressUntil(page, months, () =>
      expect(months).toHaveAttribute('aria-checked', 'true', { timeout: 3000 })
    );
    await expect(page.getByTestId('reports-turnaround')).toBeVisible();
  });

  test('the navigation offers reports', async ({ page }) => {
    await gotoRoute(page, '/more');
    const reports = page
      .getByRole('link', { name: 'Reports', exact: true })
      .or(page.getByRole('button', { name: 'Reports', exact: true }));
    await expect(reports.first()).toBeVisible({ timeout: 20_000 });
  });

  test('money lists the operator’s orders', async ({ page }) => {
    await gotoRoute(page, '/transactions');
    // The seed's members topped up their balance: the operator sold them credit
    const orders = page.getByTestId(/^money-order-\d+$/);
    await expect(orders.first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('money-sums')).toBeVisible();
    await expectLayout(page, '/transactions');
    await expectAccessible(page, '/transactions');
  });
});

test.describe('money for a member @reports', () => {
  test.use({ role: 'jumper' });

  test('a member without transaction rights does not see the operator’s money', async ({
    page,
  }) => {
    await gotoRoute(page, '/transactions');
    await expect(page.getByTestId(/^money-order-/)).toHaveCount(0);
  });
});
