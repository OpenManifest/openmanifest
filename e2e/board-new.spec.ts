import type { Locator, Page } from '@playwright/test';
import { callLoadViaApi, createLoadViaApi } from './support/api';
import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
import { press } from './support/press';
import { expect, gotoRoute, test } from './support/test';

const BOARD = '/manifest';

// The new board (U3.3): the `newBoard` preference is on for a browser without stored preferences, which is every spec's
test.describe('the new board @board', () => {
  test('lays out for the window', async ({ page }) => {
    await gotoRoute(page, BOARD);
    const width = page.viewportSize()?.width ?? 0;

    await expect(page.getByTestId('board')).toBeVisible();
    await expect(page.getByTestId('load-card').first()).toBeVisible();
    await expect(page.getByTestId('manifest-date-bar')).toBeVisible();

    if (width < 600) {
      // One column: every card is as wide as the next
      await expect(page.getByTestId('board-selected')).toHaveCount(0);
      const boxes = await page
        .getByTestId('load-card')
        .evaluateAll((cards) => cards.map((card) => Math.round(card.getBoundingClientRect().left)));
      expect(new Set(boxes).size).toBe(1);
    } else if (width < 1024) {
      await expect(page.getByTestId('board-selected')).toBeVisible();
    } else {
      // A column for each load: the first cards sit side by side
      await expect(page.getByTestId('board-selected')).toHaveCount(0);
      const tops = await page
        .getByTestId('load-card')
        .evaluateAll((cards) =>
          cards.slice(0, 2).map((card) => Math.round(card.getBoundingClientRect().top))
        );
      expect(tops.length).toBe(2);
      expect(Math.abs(tops[0] - tops[1])).toBeLessThanOrEqual(2);
    }
    await expectLayout(page, BOARD);
    await expectAccessible(page, BOARD);
  });

  test('a load created elsewhere gets a card, and a call shows its countdown', async ({ page }) => {
    await gotoRoute(page, BOARD);
    await expect(page.getByTestId('load-card').first()).toBeVisible();

    const name = `Elsewhere ${test.info().project.name} ${Date.now()}`;
    const id = await createLoadViaApi(name);
    expect(id, 'could not create a load through the API').toBeTruthy();
    const card = page.getByTestId('load-card').filter({ hasText: name });
    await expect(card).toBeVisible({ timeout: 15_000 });

    expect(await callLoadViaApi(id as string), 'could not put the load on call').toBe(true);
    const countdown = card.getByTestId('load-card-countdown-clock');
    await expect(countdown).toBeVisible({ timeout: 15_000 });
    await expect(countdown).toHaveText(/^(09|10):\d\d$/);
  });

  test('a load opens from its card', async ({ page }) => {
    await gotoRoute(page, BOARD);
    const width = page.viewportSize()?.width ?? 0;

    // On a tablet a card selects the load beside the list; elsewhere it opens the load screen
    await page.getByTestId('load-card-open').first().click({ force: true });
    if (width >= 600 && width < 1024) {
      await expect(page.getByTestId('board-selected')).toBeVisible();
    } else {
      await page.waitForURL(/\/loads\/\d+/);
    }
  });

  test('the generic words show no skydiving', async ({ page }) => {
    await gotoRoute(page, `${BOARD}?industry=generic`);
    await expect(page.getByTestId('load-card').first()).toBeVisible();

    const text = (await page.getByTestId('board').innerText()).toLowerCase();
    for (const word of ['jump', 'skydiv', 'canopy']) {
      expect(text, `the generic board says "${word}"`).not.toContain(word);
    }
  });
});

// Load actions (U3.4): a transition is the button of the card and at most one more tap
// The card of the load can be past the edge of the columns: scroll to it before pressing
async function tap(page: Page, locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  // The button that creates a load floats over the bottom of the list: bring the element above it
  const box = await locator.boundingBox();
  const height = page.viewportSize()?.height ?? 0;
  if (box && box.y + box.height > height - 120) {
    await page.mouse.move(box.x + box.width / 2, box.y);
    await page.mouse.wheel(0, box.y + box.height - (height - 120));
    await page.waitForTimeout(300);
  }
  await press(page, locator);
}

// The other project's loads reorder the board while this one is pressing: press again until what it opens is there
async function tapUntil(page: Page, locator: Locator, opened: Locator) {
  await expect(async () => {
    await tap(page, locator);
    await expect(opened).toBeVisible({ timeout: 3_000 });
  }).toPass({ timeout: 30_000 });
}

// A menu or a choice that just opened has settled when its item stops moving
async function choose(page: Page, locator: Locator) {
  await locator.waitFor();
  await page.waitForTimeout(400);
  await press(page, locator);
}

test.describe('the next action of a load @board', () => {
  test('call, cancel the call, call, depart and land, each in two taps or fewer', async ({
    page,
  }) => {
    const name = `Actions ${test.info().project.name} ${Date.now()}`;
    expect(await createLoadViaApi(name), 'could not create a load through the API').toBeTruthy();
    await gotoRoute(page, BOARD);
    const card = page.getByTestId('load-card').filter({ hasText: name });
    await expect(card).toBeVisible({ timeout: 20_000 });
    const primary = card.getByTestId('load-actions-primary');
    const state = card.getByTestId('load-card-state');

    // Open → on call: the button, then the minutes
    await tapUntil(page, primary, page.getByRole('radio', { name: /10 minute/i }));
    await choose(page, page.getByRole('radio', { name: /10 minute/i }));
    await expect(state).toContainText(/boarding/i, { timeout: 15_000 });
    await expect(card.getByTestId('load-card-countdown-clock')).toBeVisible();

    // On call → open again: the menu, then the item
    const cancelCall = page.getByRole('menuitem', { name: /cancel the .*call/i });
    await tapUntil(page, card.getByRole('button', { name: 'More actions' }), cancelCall);
    await choose(page, cancelCall);
    await expect(state).toContainText(/open/i, { timeout: 15_000 });

    await tapUntil(page, primary, page.getByRole('radio', { name: /15 minute/i }));
    await choose(page, page.getByRole('radio', { name: /15 minute/i }));
    await expect(state).toContainText(/boarding/i, { timeout: 15_000 });

    // On call → departed → landed: one tap each
    await tap(page, primary);
    await expect(state).toContainText(/in flight|departed/i, { timeout: 15_000 });
    await tap(page, primary);
    await expect(state).toContainText(/landed|completed/i, { timeout: 15_000 });
    await expect(primary).toHaveText(/re-open/i);
  });

  test('cancelling a load asks first', async ({ page }) => {
    const name = `Cancel ${test.info().project.name} ${Date.now()}`;
    expect(await createLoadViaApi(name), 'could not create a load through the API').toBeTruthy();
    await gotoRoute(page, BOARD);
    const card = page.getByTestId('load-card').filter({ hasText: name });
    await expect(card).toBeVisible({ timeout: 20_000 });

    const cancelLoad = page.getByRole('menuitem', { name: /cancel load/i });
    await tapUntil(page, card.getByRole('button', { name: 'More actions' }), cancelLoad);
    await choose(page, cancelLoad);
    await expect(page.getByText(/Its places are released/)).toBeVisible();
    await choose(page, page.getByTestId('load-actions-confirm-yes'));

    await expect(card.getByTestId('load-card-state')).toContainText(/cancelled/i, {
      timeout: 15_000,
    });
  });
});
