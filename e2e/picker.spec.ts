import type { Locator, Page } from '@playwright/test';
import {
  createLoadViaApi,
  escortTicketViaApi,
  giveLastSlotViaApi,
  giveMaxALastSlotViaApi,
  joinBlockedMemberViaApi,
} from './support/api';
import { expectAccessible } from './support/a11y';
import { claim } from './support/claims';
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

/**
 * Scrolls the picker's list until the row is rendered: the list renders its rows in batches, and with large text (the
 * text200 projects) a row further down is not in the page until the list is scrolled to it
 */
async function reveal(page: Page, picker: Locator, row: Locator) {
  for (let attempt = 0; attempt < 15 && !(await row.count()); attempt++) {
    const box = await picker.getByTestId('picker-row').last().boundingBox();
    if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(300);
  }
  await row.scrollIntoViewIfNeeded();
}

async function openPicker(page: Page, name: string) {
  const id = await createLoadViaApi(name);
  expect(id, 'could not create a load through the API').toBeTruthy();
  await gotoRoute(page, `/loads/${id}`);
  const free = page.getByTestId('free-places').last();
  // Without the permission to manifest the row is plain text: it is a button once the person may press it
  await expect(free).toHaveAttribute('role', 'button', { timeout: 20_000 });
  return free;
}

// The member picker (U3.7): the free places of a load open it; the `newBoard` preference is on for every spec's browser
test.describe('the member picker @picker', () => {
  test('adds a returning member in three interactions', async ({ page }) => {
    await claim('Max Manifest');
    expect(await giveMaxALastSlotViaApi(), 'could not give Max a last slot').toBe(true);
    const free = await openPicker(page, `Picker ${test.info().project.name} ${Date.now()}`);
    await expect(free).toBeVisible({ timeout: 20_000 });
    const user = interactions(page);

    const picker = page.getByTestId('member-picker');
    await user.open(free, () => expect(picker).toBeVisible({ timeout: 10_000 }));
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
    await interactions(page).open(free, () => expect(picker).toBeVisible({ timeout: 10_000 }));
    await picker.getByTestId('member-picker-search').fill(name as string);
    const row = picker.getByTestId('picker-row').filter({ hasText: name as string });
    await expect(row).toHaveCount(1, { timeout: 15_000 });
    // The reason is in words, with a way to put it right
    await expect(row.getByTestId('picker-row-fix')).toBeVisible();

    // The list can load again under the pointer (the row is rebuilt): bring the row up and press until it holds
    await expect(async () => {
      const select = row.getByTestId('picker-row-select');
      await select.scrollIntoViewIfNeeded({ timeout: 4000 });
      await press(page, select);
      await expect(picker.getByTestId('member-picker-add')).toBeDisabled({ timeout: 4000 });
    }).toPass({ timeout: 40_000 });
    await expect(page.getByTestId('slot-row').filter({ hasText: name as string })).toHaveCount(0);
  });

  test('adds a group of four in six interactions', async ({ page }) => {
    const names = ['Pat Pilot', 'Stu Student', 'Olive Owner', 'Max Manifest'];
    await claim(...names);
    for (const name of names)
      expect(await giveLastSlotViaApi(name), `${name} has no last slot`).toBe(true);
    const free = await openPicker(page, `Group ${test.info().project.name} ${Date.now()}`);
    await expect(free).toBeVisible({ timeout: 20_000 });
    const user = interactions(page);

    const picker = page.getByTestId('member-picker');
    await user.open(free, () => expect(picker).toBeVisible({ timeout: 10_000 }));
    const group = picker.getByTestId('member-picker-group');
    await user.tap(group, () =>
      expect(group).toHaveAttribute('aria-checked', 'true', { timeout: 4000 })
    );
    for (const name of names) {
      const row = picker.getByRole('button', { name, exact: true });
      await reveal(page, picker, row);
      await user.tap(row, () =>
        expect(row).toHaveAttribute('aria-pressed', 'true', { timeout: 4000 })
      );
    }
    await expect(picker.getByTestId('picker-group')).toContainText('4');
    const add = picker.getByTestId('member-picker-add');
    await expect(add).toBeEnabled({ timeout: 20_000 });

    await user.tap(add, () => expect(picker).toBeHidden({ timeout: 8000 }));
    for (const name of names) {
      await expect(page.getByTestId('slot-row').filter({ hasText: name })).toBeVisible();
    }
    expect(user.count).toBeLessThanOrEqual(6);
  });

  for (const { title, ticket, escort, guests } of [
    {
      title: 'a tandem takes one guest with its escort',
      ticket: 'Tandem',
      escort: 'Pat Pilot',
      guests: ['Gus Guest'],
    },
    {
      title: 'a try dive takes three guests with its escort',
      ticket: 'Try dive',
      escort: 'Stu Student',
      guests: ['Gia Guest', 'Gil Guest', 'Gwen Guest'],
    },
  ]) {
    test(title, async ({ page }) => {
      await claim(escort);
      await escortTicketViaApi('Try dive', 3);
      expect(await giveLastSlotViaApi(escort), `${escort} has no last slot`).toBe(true);
      const free = await openPicker(page, `Escort ${test.info().project.name} ${Date.now()}`);
      await expect(free).toBeVisible({ timeout: 20_000 });
      const picker = page.getByTestId('member-picker');
      await interactions(page).open(free, () => expect(picker).toBeVisible({ timeout: 10_000 }));

      const row = picker.getByRole('button', { name: escort, exact: true });
      // On a short phone the row can sit under the bottom edge, and the list can load again under the pointer: bring
      // the row up and press until the choices show
      await expect(async () => {
        await reveal(page, picker, row);
        await press(page, row);
        await expect(picker.getByTestId('picker-choice-ticket')).toBeVisible({ timeout: 4000 });
      }).toPass({ timeout: 40_000 });
      // The ticket is the one the escort last flew; a tandem or a try dive is picked from the list
      await picker.getByTestId('picker-choice-ticket').focus();
      await page.keyboard.press('Enter');
      // The options are Full altitude (chosen), Tandem and Try dive: type the one wanted (an arrow press can be lost
      // while the list opens), then Enter
      await expect(page.getByRole('listbox')).toBeVisible();
      await page.keyboard.type(ticket);
      // An option's name carries its price ("Try dive · $60.00")
      await expect(page.getByRole('option', { name: new RegExp(`^${ticket}\\b`) })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('listbox')).toBeHidden();
      await expect(picker.getByTestId('picker-choice-ticket')).toContainText(ticket);
      await expect(picker.getByTestId('picker-guests')).toBeVisible();
      // A ticket without a destination of its own asks where the slot goes
      const destination = picker.getByTestId('picker-choice-destination');
      if ((await destination.innerText()).includes('Choose where')) {
        await destination.focus();
        await page.keyboard.press('Enter');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await expect(destination).not.toContainText('Choose where');
      }

      for (const [index, name] of guests.entries()) {
        if (index > 0) {
          const more = picker.getByTestId('picker-guests-add');
          await more.scrollIntoViewIfNeeded();
          await press(page, more);
        }
        await picker.getByTestId(`picker-guests-${index}-name`).fill(name);
        await picker.getByTestId(`picker-guests-${index}-mass`).fill('70');
      }
      const add = picker.getByTestId('member-picker-add');
      await expect(add).toBeEnabled({ timeout: 20_000 });
      await press(page, add);
      await expect(picker).toBeHidden({ timeout: 15_000 });

      await expect(page.getByTestId('slot-row').filter({ hasText: escort })).toBeVisible();
      for (const name of guests) await expect(page.getByText(name).first()).toBeVisible();
    });
  }
});
