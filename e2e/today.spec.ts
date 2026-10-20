import { createLoadViaApi, manifestMemberViaApi, ownerCall } from './support/api';
import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
import { claim } from './support/claims';
import { press } from './support/press';
import { expect, gotoRoute, test } from './support/test';

// Today (U4.1): where a member lands, with the load they fly next, whether they are ready, their credit and the day
test.describe('today as a fun jumper @today', () => {
  test.use({ role: 'jumper' });

  test('is where a jumper lands, with their load, whether they are ready and their credit', async ({
    page,
  }) => {
    await gotoRoute(page, '/');
    await expect(page).toHaveURL(/\/today$/, { timeout: 20_000 });

    const next = page.getByTestId('today-next-load');
    await expect(next).toBeVisible({ timeout: 20_000 });
    await expect(next).toContainText('Load #1');
    await expect(page.getByTestId('today-ready')).toBeVisible();
    await expect(page.getByTestId('today-credit')).toBeVisible();
    await expect(page.getByTestId('today-loads')).toBeVisible();
    await expectLayout(page, 'today');
    await expectAccessible(page, 'today');
  });

  test('finds their load and takes themselves off it', async ({ page }) => {
    await claim('Jo Jumper');
    await gotoRoute(page, '/today');
    const next = page.getByTestId('today-next-load');
    await expect(next).toContainText('Load #1', { timeout: 20_000 });

    try {
      await press(page, page.getByTestId('today-next-load-take-off'));
      await expect(page.getByTestId('today-next-load')).toBeHidden({ timeout: 15_000 });
    } finally {
      // The seed has Jo Jumper on the first load: put them back for the specs that follow
      const loads = await ownerCall('{ operators { edges { node { id } } } }');
      const operator = loads.json.data.operators.edges[0].node.id;
      const first = await ownerCall(
        `{ loads(operator: ${operator}, first: 20) { edges { node { id loadNumber } } } }`
      );
      const seeded = first.json.data.loads.edges
        .map((edge: { node: { id: string; loadNumber: number } }) => edge.node)
        .find((load: { loadNumber: number }) => load.loadNumber === 1);
      if (seeded) await manifestMemberViaApi(seeded.id, 'Jo Jumper');
    }
  });
});

test.describe('today as a student @today', () => {
  test.use({ role: 'student' });

  test('asks them to see the manifest desk instead of offering to take them off', async ({
    page,
  }) => {
    await claim('Stu Student');
    const id = await createLoadViaApi(`Today ${test.info().project.name} ${Date.now()}`);
    expect(id, 'could not create a load through the API').toBeTruthy();
    expect(await manifestMemberViaApi(id as string, 'Stu Student')).toBeTruthy();

    await gotoRoute(page, '/today');
    const next = page.getByTestId('today-next-load');
    await expect(next).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('today-next-load-desk')).toBeVisible();
    await expect(page.getByTestId('today-next-load-take-off')).toHaveCount(0);
  });
});
