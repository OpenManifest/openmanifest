import { createLoadViaApi } from './support/api';
import { expectAccessible } from './support/a11y';
import {
  expectLastSlotRowReachable,
  expectLayout,
  expectNoClippedRows,
  scaleText,
} from './support/layout';
import { press } from './support/press';
import { expect, gotoRoute, test } from './support/test';

const BOARD = '/manifest';

test.describe('manifest board @manifest', () => {
  test('board lays out and is accessible', async ({ page }) => {
    await gotoRoute(page, BOARD);
    await expect(page).toHaveURL(/\/manifest$/);
    await expect(page.getByText(/Load #1\b/).first()).toBeVisible();
    await expectLayout(page, BOARD);
    await expectAccessible(page, BOARD);
  });

  // Live updates (P6.9): a load created by somebody else appears on the open board without a reload, which only works
  // when the cable connection is authenticated with this session's credentials.
  test('a load created elsewhere appears on the open board', async ({ page }) => {
    await gotoRoute(page, BOARD);
    const loads = page.getByText(/Load #\d+/);
    await expect(loads.first()).toBeVisible();
    const before = await loads.count();
    expect(await createLoadViaApi(), 'could not create a load through the API').toBeTruthy();
    await expect.poll(() => loads.count(), { timeout: 15_000 }).toBeGreaterThan(before);
  });

  // Load states (P6.12, U3.4): a boarding call, then departing and landing, from the actions of the load screen
  test('a boarding call and landing show the next actions', async ({ page }) => {
    const id = await createLoadViaApi();
    expect(id, 'could not create a load through the API').toBeTruthy();
    await gotoRoute(page, `/loads/${id}`);
    const primary = page.getByTestId('load-actions-primary');
    const state = page.getByTestId('load-header-state');

    await expect(primary).toBeVisible({ timeout: 20_000 });
    await press(page, primary);
    await page.waitForTimeout(500);
    await press(page, page.getByRole('radio', { name: /10 minute/i }));
    await expect(state).toContainText(/boarding/i, { timeout: 15_000 });

    await press(page, primary);
    await expect(state).toContainText(/in flight|departed/i, { timeout: 15_000 });
    await press(page, primary);
    await expect(state).toContainText(/landed|completed/i, { timeout: 15_000 });
    await expect(primary).toHaveText(/re-open/i);
  });

  test('a load opens, lays out and shows its last slot', async ({ page }) => {
    await gotoRoute(page, BOARD);
    await page
      .getByText(/Load #1\b/)
      .first()
      .click({ force: true });
    await page.waitForURL(/\/loads\/\d+/);
    await page.waitForTimeout(3000);
    await expectLayout(page, 'load');
    await expectLastSlotRowReachable(page);
    await expectAccessible(page, 'load');
  });

  // The manifest context mounts the group sheet once: open it from the free places of the load
  test('the group sheet opens from the load screen', async ({ page }) => {
    await gotoRoute(page, BOARD);
    await page
      .getByText(/Load #1\b/)
      .first()
      .click({ force: true });
    await page.waitForURL(/\/loads\/\d+/);
    await page.waitForTimeout(3000);
    await press(page, page.getByTestId('free-places').first());
    await expect(page.getByTestId('manifest-group-sheet')).toBeVisible();
  });

  // A full page load of each URL must open the right screen (needs the persisted login)
  test('deep links open the board and a load', async ({ page }) => {
    await gotoRoute(page, BOARD);
    await expect(page.getByText(/Load #1\b/).first()).toBeVisible();
    await page
      .getByText(/Load #1\b/)
      .first()
      .click({ force: true });
    await page.waitForURL(/\/loads\/\d+/);
    const loadPath = new URL(page.url()).pathname;

    await gotoRoute(page, loadPath);
    expect(new URL(page.url()).pathname).toBe(loadPath);
    await expect(page.getByText(/Load #1\b/).first()).toBeVisible();
  });

  // A large font size: the board and a load still lay out, and no row clips its text
  test('board and load at 200% text', async ({ page }) => {
    await gotoRoute(page, BOARD);
    await page
      .getByText(/Load #1\b/)
      .first()
      .click({ force: true });
    await page.waitForURL(/\/loads\/\d+/);
    const loadPath = new URL(page.url()).pathname;

    for (const route of [BOARD, loadPath]) {
      await gotoRoute(page, route);
      await page.waitForTimeout(3500);
      await scaleText(page, 2);
      await page.waitForTimeout(500);
      await expectLayout(page, `${route} at 200% text`);
      await expectNoClippedRows(page, `${route} at 200% text`);
      if (route === loadPath) await expectLastSlotRowReachable(page);
    }
  });
});
