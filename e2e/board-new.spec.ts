import { callLoadViaApi, createLoadViaApi } from './support/api';
import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
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
    const cards = page.getByTestId('load-card');
    await expect(cards.first()).toBeVisible();
    const before = await cards.count();

    const id = await createLoadViaApi();
    expect(id, 'could not create a load through the API').toBeTruthy();
    await expect.poll(() => cards.count(), { timeout: 15_000 }).toBeGreaterThan(before);

    expect(await callLoadViaApi(id as string), 'could not put the load on call').toBe(true);
    const countdown = page.getByTestId('load-card-countdown-clock');
    await expect(countdown.first()).toBeVisible({ timeout: 15_000 });
    await expect(countdown.first()).toHaveText(/^(09|10):\d\d$/);
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
