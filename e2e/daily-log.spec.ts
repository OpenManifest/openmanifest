import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
import { press, pressUntil } from './support/press';
import { expect, gotoRoute, test } from './support/test';

// The daily log on app/ui (U5.8)
test.describe('daily log @setup', () => {
  test('shows the day with its loads, and edits its notes', async ({ page }) => {
    await gotoRoute(page, '/daily-log');
    const day = page.getByTestId('daily-log-day');
    await expect(day).toBeVisible({ timeout: 20_000 });
    // The log lists the loads that flew: the seed's have not, so the day says so (a day with loads lists them)
    await expect(
      page
        .getByTestId('daily-log-empty')
        .or(page.getByTestId(/^daily-log-load-\d+$/))
        .first()
    ).toBeVisible({ timeout: 20_000 });
    await expectLayout(page, '/daily-log');
    await expectAccessible(page, '/daily-log');

    const edit = page.getByTestId('daily-log-edit');
    await pressUntil(page, edit, () =>
      expect(page.getByTestId('daily-log-save-primary-action')).toBeVisible({ timeout: 3000 })
    );
    await expectAccessible(page, '/daily-log editing');
    // Nothing changed yet: nothing to save; cancel leaves the day as it was
    await expect(page.getByTestId('daily-log-save-primary-action')).toBeDisabled();
    await press(page, page.getByRole('button', { name: 'Cancel', exact: true }));
    await expect(page.getByTestId('daily-log-edit')).toBeVisible();
  });
});
