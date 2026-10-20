import type { Locator, Page } from '@playwright/test';
import { createLoadViaApi, giveMaxALastSlotViaApi, joinBlockedMemberViaApi } from './support/api';
import { expectAccessible } from './support/a11y';
import { press } from './support/press';
import { expect, gotoRoute, test } from './support/test';

/** Presses an element the way a person does, and counts it: the task's budget is three of these to add a member */
function interactions(page: Page) {
  let count = 0;
  return {
    get count() {
      return count;
    },
    async tap(locator: Locator) {
      count += 1;
      await locator.scrollIntoViewIfNeeded();
      await press(page, locator);
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

    await user.tap(free);
    const picker = page.getByTestId('member-picker');
    await expect(picker).toBeVisible();
    await expectAccessible(page, 'picker');

    await user.tap(picker.getByRole('button', { name: 'Max Manifest', exact: true }));
    // What they flew last time is filled in, and the button names who is added to what
    const defaults = picker.getByTestId('picker-defaults');
    await expect(defaults).toBeVisible();
    await expect(defaults).toContainText('Flat');
    const add = picker.getByTestId('member-picker-add');
    await expect(add).toBeEnabled({ timeout: 15_000 });

    await user.tap(add);
    await expect(picker).toBeHidden({ timeout: 15_000 });
    await expect(page.getByTestId('slot-row').filter({ hasText: 'Max Manifest' })).toBeVisible();
    expect(user.count).toBeLessThanOrEqual(3);
  });

  test('shows why a member is not ready, and does not add them', async ({ page }) => {
    const name = await joinBlockedMemberViaApi();
    expect(name, 'could not add a member who is not ready').toBeTruthy();
    const free = await openPicker(page, `Blocked ${test.info().project.name} ${Date.now()}`);
    await expect(free).toBeVisible({ timeout: 20_000 });
    await press(page, free);

    const picker = page.getByTestId('member-picker');
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
