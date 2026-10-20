import type { Page } from '@playwright/test';
import { callLoadViaApi, createLoadViaApi, manifestMemberViaApi } from './support/api';
import { claim } from './support/claims';
import { press } from './support/press';
import { expect, gotoRoute, test } from './support/test';

const WIDE = 1024;
const widthOf = (page: Page) => page.viewportSize()?.width ?? 0;

/** Two loads of the day, with Pat Pilot on the first */
async function twoLoads(name: string) {
  await claim('Pat Pilot');
  const from = await createLoadViaApi(`${name} from ${Date.now()}`);
  const to = await createLoadViaApi(`${name} to ${Date.now()}`);
  expect(from && to, 'could not create the loads through the API').toBeTruthy();
  const slot = await manifestMemberViaApi(from as string, 'Pat Pilot');
  expect(slot, 'could not put Pat Pilot on the load').toBeTruthy();
  return { from: from as string, to: to as string, slot: slot as string };
}

/** The ids of the columns of the board, left to right */
const columnIds = (page: Page) =>
  page
    .locator('[data-testid^="board-column-"]')
    .evaluateAll((columns) => columns.map((column) => column.getAttribute('data-testid')));

// Moving people between loads (U3.9): "Move to…" everywhere, and drag and drop between the columns of the wide board
test.describe('moving a place @move', () => {
  test('moves a place to another load with "Move to…"', async ({ page }) => {
    const { from, to } = await twoLoads('Move');
    await gotoRoute(page, `/loads/${from}`);
    const row = page.getByTestId('slot-row').filter({ hasText: 'Pat Pilot' });
    await expect(row).toBeVisible({ timeout: 20_000 });

    await press(page, row.getByRole('button', { name: 'Actions for Pat Pilot' }));
    await page.getByRole('menuitem', { name: 'Move to…' }).click();
    const target = page.getByTestId(`move-to-${to}-`);
    await expect(target).toBeVisible();
    await expect(target).toContainText('free places');
    await press(page, target);

    await expect(page.getByTestId('move-to')).toBeHidden({ timeout: 15_000 });
    await expect(page.getByTestId('slot-row').filter({ hasText: 'Pat Pilot' })).toHaveCount(0, {
      timeout: 15_000,
    });
    await gotoRoute(page, `/loads/${to}`);
    await expect(page.getByTestId('slot-row').filter({ hasText: 'Pat Pilot' })).toBeVisible({
      timeout: 20_000,
    });
  });

  test('drags a place from one column to another', async ({ page }) => {
    test.skip(widthOf(page) < WIDE, 'the columns are the widest layout');
    const { from, to, slot } = await twoLoads('Drag');
    await gotoRoute(page, '/manifest');
    const place = page.getByTestId(`board-places-${slot}`);
    await expect(place).toBeVisible({ timeout: 20_000 });
    const target = page.getByTestId(`board-column-${to}`);
    await target.scrollIntoViewIfNeeded();

    const a = (await place.boundingBox())!;
    const b = (await target.boundingBox())!;
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await page.mouse.down();
    await page.mouse.move(a.x + a.width / 2 + 20, a.y + a.height / 2 + 10, { steps: 4 });
    await page.mouse.move(b.x + b.width / 2, b.y + 60, { steps: 12 });
    await page.mouse.up();

    await expect(page.getByTestId(`board-column-${to}`).getByText('Pat Pilot')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId(`board-column-${from}`).getByText('Pat Pilot')).toHaveCount(0);
  });

  test('moves with the keyboard: Space picks up, an arrow chooses the column, Space drops', async ({
    page,
  }) => {
    test.skip(widthOf(page) < WIDE, 'the columns are the widest layout');
    const { from, to, slot } = await twoLoads('Keys');
    await gotoRoute(page, '/manifest');
    const place = page.getByTestId(`board-places-${slot}`);
    await expect(place).toBeVisible({ timeout: 20_000 });
    await page.getByTestId(`board-column-${to}`).scrollIntoViewIfNeeded();

    await place.focus();
    await page.keyboard.press('Space');
    await expect(page.getByTestId('board-drag-overlay')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId(`board-column-${to}`)).toHaveAttribute('data-over', 'true');
    await page.keyboard.press('Space');

    await expect(page.getByTestId(`board-column-${to}`).getByText('Pat Pilot')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId(`board-column-${from}`).getByText('Pat Pilot')).toHaveCount(0);
  });

  test('a load that changes while a place is held does not move under the pointer', async ({
    page,
  }) => {
    test.skip(widthOf(page) < WIDE, 'the columns are the widest layout');
    const { from, to, slot } = await twoLoads('Hold');
    await gotoRoute(page, '/manifest');
    const place = page.getByTestId(`board-places-${slot}`);
    await expect(place).toBeVisible({ timeout: 20_000 });
    const before = await columnIds(page);
    expect(before.indexOf(`board-column-${from}`)).toBeLessThan(
      before.indexOf(`board-column-${to}`)
    );

    const a = (await place.boundingBox())!;
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await page.mouse.down();
    await page.mouse.move(a.x + a.width / 2 + 30, a.y + a.height / 2 + 20, { steps: 5 });
    await expect(page.getByTestId('board-drag-overlay')).toBeVisible();

    // The load being dragged from goes on call: unheld, the board would put it after the one still open
    expect(await callLoadViaApi(from), 'could not put the load on call').toBe(true);
    await page.waitForTimeout(3000);
    await expect(page.getByTestId(`board-column-${from}`)).toContainText('boarding', {
      ignoreCase: true,
      timeout: 10_000,
    });
    expect(await columnIds(page)).toEqual(before);

    await page.keyboard.press('Escape');
    await page.mouse.up();
    await expect
      .poll(
        async () => {
          const after = await columnIds(page);
          return after.indexOf(`board-column-${from}`) > after.indexOf(`board-column-${to}`);
        },
        { timeout: 10_000 }
      )
      .toBe(true);
  });
});
