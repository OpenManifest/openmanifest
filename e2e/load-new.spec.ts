import { openFirstLoad } from './support/board';
import { createLoadViaApi, createTwoVehicleLoadViaApi } from './support/api';
import { loginViaUi } from './support/auth';
import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
import { expect, gotoRoute, test } from './support/test';

// The new load screen (U3.5): the `newBoard` preference is on for a browser without stored preferences, which is every spec's
test.describe('the new load screen @load', () => {
  test('shows the call card and the first places without scrolling', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    await openFirstLoad(page);
    // On a tablet the board stays mounted under the load screen with its own pane: the screen on top is the last
    const header = page.getByTestId('load-header').last();
    await expect(header).toBeVisible({ timeout: 20_000 });

    await expect(header).toBeInViewport();
    await expect(page.getByTestId('slot-row').last()).toBeInViewport();
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

  test.describe('as the user of a generic operator', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('a load with two vehicles has a heading and its own free places for each', async ({
      page,
    }) => {
      const made = await createTwoVehicleLoadViaApi(`Two ${test.info().project.name}`);
      expect(made, 'could not create a generic operator with a load of two vehicles').toBeTruthy();
      await loginViaUi(page, made?.email as string);
      await gotoRoute(page, `/loads/${made?.id}?industry=generic`);

      await expect(page.getByTestId('vehicle-header')).toHaveCount(2, { timeout: 20_000 });
      await expect(page.getByTestId('free-places')).toHaveCount(2);
      await expectLayout(page, 'load');
      await expectAccessible(page, 'load');
    });
  });
});
