import { createLoadViaApi, createTwoVehicleLoadViaApi } from './support/api';
import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
import { expect, gotoRoute, test } from './support/test';

// The new load screen (U3.5): the `newBoard` preference is on for a browser without stored preferences, which is every spec's
test.describe('the new load screen @load', () => {
  test('shows the call card and the first places without scrolling', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    await page.getByTestId('load-card-open').first().click({ force: true });
    await page.waitForURL(/\/loads\/\d+/);
    await expect(page.getByTestId('load-header')).toBeVisible({ timeout: 20_000 });

    await expect(page.getByTestId('load-header')).toBeInViewport();
    await expect(page.getByTestId('slot-row').first()).toBeInViewport();
    await expectLayout(page, 'load');
    await expectAccessible(page, 'load');
  });

  test('has the actions in reach: sticky on a phone, in the header elsewhere', async ({ page }) => {
    const id = await createLoadViaApi(`Reach ${test.info().project.name} ${Date.now()}`);
    expect(id, 'could not create a load through the API').toBeTruthy();
    await gotoRoute(page, `/loads/${id}`);
    const width = page.viewportSize()?.width ?? 0;

    await expect(page.getByTestId('load-actions-primary')).toBeInViewport({ timeout: 20_000 });
    if (width < 600) await expect(page.getByTestId('load-sticky-actions')).toBeVisible();
    else await expect(page.getByTestId('load-sticky-actions')).toHaveCount(0);
  });

  test('a load with two vehicles has a heading and its own free places for each', async ({
    page,
  }) => {
    const id = await createTwoVehicleLoadViaApi(`Two ${test.info().project.name} ${Date.now()}`);
    expect(id, 'could not create a load with two vehicles').toBeTruthy();
    await gotoRoute(page, `/loads/${id}?industry=generic`);

    await expect(page.getByTestId('vehicle-header')).toHaveCount(2, { timeout: 20_000 });
    await expect(page.getByTestId('free-places')).toHaveCount(2);
    await expectLayout(page, 'load');
    await expectAccessible(page, 'load');
  });
});
