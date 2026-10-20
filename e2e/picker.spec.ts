import type { Locator, Page } from '@playwright/test';
import { createLoadViaApi, giveMaxALastSlotViaApi, joinBlockedMemberViaApi } from './support/api';
import { expectAccessible } from './support/a11y';
import { press } from './support/press';
import { expect, gotoRoute, test } from './support/test';

/**
 * Presses and types the way a person does, and counts it: the budget is three of these to add a member (search, pick,
 * confirm; the press that opens the picker from the load screen is the way in, and is not counted). A press
 * that lands before the screen is ready (the handler arrives with the permissions) is pressed again until `done` holds;
 * only the first counts, as the person would have pressed once.
 */
function interactions(page: Page) {
  let count = 0;
  return {
    get count() {
      return count;
    },
    async fill(locator: Locator, text: string) {
      count += 1;
      await locator.fill(text);
    },
    async open(locator: Locator, done: () => Promise<void>) {
      await this.tap(locator, done, false);
    },
    async tap(locator: Locator, done: () => Promise<void>, counted = true) {
      if (counted) count += 1;
      await locator.scrollIntoViewIfNeeded();
      for (let attempt = 0; ; attempt++) {
        await press(page, locator);
        try {
          await done();
          return;
        } catch (error) {
          if (attempt >= 3) throw error;
        }
      }
    },
  };
}

async function openPicker(page: Page, name: string) {
  const id = await createLoadViaApi(name);
  expect(id, 'could not create a load through the API').toBeTruthy();
  await gotoRoute(page, `/loads/${id}`);
  return page.getByTestId('free-places').last();
}

// The member picker (U3.7): the free places of a load open it; the `newBoard` preference is on for every spec's browser
test.describe('the member picker @picker', () => {
  test('adds a returning member in three interactions', async ({ page }) => {
    expect(await giveMaxALastSlotViaApi(), 'could not give Max a last slot').toBe(true);
    const free = await openPicker(page, `Picker ${test.info().project.name} ${Date.now()}`);
    await expect(free).toBeVisible({ timeout: 20_000 });
    const user = interactions(page);

    const picker = page.getByTestId('member-picker');
    await user.open(free, () => expect(picker).toBeVisible({ timeout: 4000 }));
    await expectAccessible(page, 'picker');

    await user.fill(picker.getByTestId('member-picker-search'), 'Max Manifest');
    const max = picker.getByRole('button', { name: 'Max Manifest', exact: true });
    await expect(max).toBeVisible({ timeout: 15_000 });
    // What they flew last time is filled in, and the button names who is added to what
    const defaults = picker.getByTestId('picker-defaults');
    await user.tap(max, () => expect(defaults).toBeVisible({ timeout: 4000 }));
    await expect(defaults).toContainText('Flat');
    const add = picker.getByTestId('member-picker-add');
    await expect(add).toBeEnabled({ timeout: 15_000 });

    await user.tap(add, () => expect(picker).toBeHidden({ timeout: 8000 }));
    await expect(page.getByTestId('slot-row').filter({ hasText: 'Max Manifest' })).toBeVisible();
    expect(user.count).toBeLessThanOrEqual(3);
  });

  test('shows why a member is not ready, and does not add them', async ({ page }) => {
    const name = await joinBlockedMemberViaApi();
    expect(name, 'could not add a member who is not ready').toBeTruthy();
    const free = await openPicker(page, `Blocked ${test.info().project.name} ${Date.now()}`);
    await expect(free).toBeVisible({ timeout: 20_000 });
    const picker = page.getByTestId('member-picker');
    await interactions(page).open(free, () => expect(picker).toBeVisible({ timeout: 4000 }));
    await picker.getByTestId('member-picker-search').fill(name as string);
    const row = picker.getByTestId('picker-row').filter({ hasText: name as string });
    await expect(row).toHaveCount(1, { timeout: 15_000 });
    // The reason is in words, with a way to put it right
    await expect(row.getByTestId('picker-row-fix')).toBeVisible();

    await press(page, row.getByTestId('picker-row-select'));
    await expect(picker.getByTestId('member-picker-add')).toBeDisabled();
    await expect(page.getByTestId('slot-row').filter({ hasText: name as string })).toHaveCount(0);
  });
});
