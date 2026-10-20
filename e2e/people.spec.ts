import type { Locator, Page } from '@playwright/test';
import { createLoadViaApi, giveMaxALastSlotViaApi, joinBlockedMemberViaApi } from './support/api';
import { expectAccessible } from './support/a11y';
import { claim } from './support/claims';
import { expectLayout } from './support/layout';
import { press, pressUntil } from './support/press';
import { expect, gotoRoute, test } from './support/test';

const WIDE = 1024;
const widthOf = (page: Page) => page.viewportSize()?.width ?? 0;

const rows = (page: Page) => page.getByTestId('people-row');
const rowOf = (page: Page, name: string) => rows(page).filter({ hasText: name });

/** Opens People and waits for the first rows */
async function openPeople(page: Page) {
  await gotoRoute(page, '/users');
  await expect(rows(page).first()).toBeVisible({ timeout: 20_000 });
}

/** Types into the search box and waits for the list to hold only who matches */
async function searchFor(page: Page, name: string) {
  await page.getByTestId('people-search').fill(name);
  await expect(rowOf(page, name)).toHaveCount(1, { timeout: 15_000 });
}

/** Chooses an option of a select (the web one is a listbox in a portal) */
async function choose(page: Page, select: Locator, option: string) {
  await select.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.getByRole('option', { name: option, exact: true }).click();
  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(select).toContainText(option);
}

/** Opens the menu of a person's row and waits for the item */
async function openRowMenu(page: Page, name: string, item: string) {
  const menuItem = page.getByRole('menuitem', { name: item });
  await pressUntil(page, page.getByRole('button', { name: `Actions for ${name}` }), () =>
    expect(menuItem).toBeVisible({ timeout: 4000 })
  );
  return menuItem;
}

// People (U5.1): the people of the operator, searched, filtered and sorted, with the actions of the desk on a row
test.describe('people as the manifest desk @people', () => {
  test.use({ role: 'manager' });

  test('lists the people of the seed with their role, whether they are ready and their credit', async ({
    page,
  }) => {
    await openPeople(page);

    expect(await rows(page).count()).toBeGreaterThanOrEqual(5);
    await expect(page.getByTestId('people-count')).toContainText('people');
    await expect(page.getByTestId('people-search')).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: 'Status' })).toBeVisible();
    // The desk may not register people: the walk-in form is for those who may
    await expect(page.getByTestId('people-add-primary-action')).toHaveCount(0);
    await expectLayout(page, 'people');
    await expectAccessible(page, 'people');

    await searchFor(page, 'Jo Jumper');
    const jo = rowOf(page, 'Jo Jumper');
    await expect(jo).toContainText('Fun Jumper');
    await expect(jo).toContainText('$');
    await expect(jo.locator('[data-testid$="-status"]')).toBeVisible();
  });

  test('search narrows the list, and clearing it brings everyone back', async ({ page }) => {
    await openPeople(page);
    const before = await rows(page).count();

    await searchFor(page, 'Sam Skydiver');
    await expect(rows(page)).toHaveCount(1);

    await page.getByTestId('people-search').fill('');
    await expect(rows(page)).toHaveCount(before, { timeout: 15_000 });
  });

  test('"/" moves to the search box on the web', async ({ page }) => {
    await openPeople(page);

    await page.keyboard.press('/');
    await expect(page.getByTestId('people-search')).toBeFocused();
    await page.keyboard.type('Stu');
    await expect(page.getByTestId('people-search')).toHaveValue('Stu');
  });

  test('filters by whether people are ready and by role', async ({ page }) => {
    const blocked = await joinBlockedMemberViaApi(`Blocked People ${Date.now()}`);
    expect(blocked, 'could not add a member who is not ready').toBeTruthy();
    await openPeople(page);

    // Someone without a licence or credit is blocked, with the reason
    await searchFor(page, blocked as string);
    const row = rowOf(page, blocked as string);
    await expect(row).toContainText('Blocked');
    await press(page, page.getByRole('radio', { name: 'Ready' }));
    await expect(page.getByTestId('people-empty')).toBeVisible();
    await press(page, page.getByRole('radio', { name: 'Blocked' }));
    await expect(row).toBeVisible();
    await press(page, page.getByRole('radio', { name: 'All' }));

    // One role at a time
    await searchFor(page, 'Stu Student');
    const role = page.getByTestId('people-role');
    await choose(page, role, 'Pilot');
    await expect(page.getByTestId('people-empty')).toBeVisible();
    await choose(page, role, 'Student');
    await expect(rowOf(page, 'Stu Student')).toBeVisible();
    await choose(page, role, 'All roles');
  });

  test('sorts the people from the sort menu', async ({ page }) => {
    await openPeople(page);
    const sort = page.getByTestId('people-sort');
    await expect(sort).toContainText('Sort: Name');

    const item = page.getByRole('menuitem', { name: 'Least credit first' });
    await pressUntil(page, sort, () => expect(item).toBeVisible({ timeout: 4000 }));
    await item.click();
    await expect(sort).toContainText('Sort: Least credit first');
  });

  test('"Manifest on…" from the menu of a row puts them on a load with the picker', async ({
    page,
  }) => {
    await claim('Max Manifest');
    expect(await giveMaxALastSlotViaApi(), 'could not give Max a last slot').toBe(true);
    const id = await createLoadViaApi(`People ${test.info().project.name} ${Date.now()}`);
    expect(id, 'could not create a load through the API').toBeTruthy();
    await openPeople(page);
    await searchFor(page, 'Max Manifest');

    const manifest = await openRowMenu(page, 'Max Manifest', 'Manifest on…');
    await expect(page.getByRole('menuitem', { name: 'Add credit' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Open profile' })).toBeVisible();
    await manifest.click();

    const sheet = page.getByTestId('people-manifest-on');
    await expect(sheet).toBeVisible({ timeout: 10_000 });
    await expect(sheet).toContainText('Manifest Max Manifest on…');
    const target = page.getByTestId(`people-manifest-on-${id}`);
    await expect(target).toBeVisible({ timeout: 15_000 });
    await expect(target).toContainText('free place');
    await press(page, target);

    // The picker opens on that load with Max picked and their last slot filled in
    const picker = page.getByTestId('people-picker');
    await expect(picker).toBeVisible({ timeout: 10_000 });
    await expect(picker.getByTestId('picker-defaults')).toBeVisible({ timeout: 15_000 });
    const add = picker.getByTestId('people-picker-add');
    await expect(add).toContainText('Add Max Manifest to Load #');
    await expect(add).toBeEnabled({ timeout: 15_000 });
    await pressUntil(page, add, () => expect(picker).toBeHidden({ timeout: 8000 }));

    await gotoRoute(page, `/loads/${id}`);
    await expect(page.getByTestId('slot-row').filter({ hasText: 'Max Manifest' })).toBeVisible({
      timeout: 20_000,
    });
  });

  test('"Add credit" from the menu of a row opens the funds of that member', async ({ page }) => {
    await openPeople(page);
    await searchFor(page, 'Jo Jumper');

    const credit = await openRowMenu(page, 'Jo Jumper', 'Add credit');
    await credit.click();

    const sheet = page.getByTestId('credits-sheet');
    await expect(sheet).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('dialog', { name: 'Funds' })).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
  });

  test('is a table on a wide window', async ({ page }) => {
    test.skip(widthOf(page) < WIDE, 'the table is the wide layout');
    await openPeople(page);

    const table = page.getByTestId('people-table');
    await expect(table).toBeVisible();
    await expect(page.getByRole('table', { name: 'People' })).toBeVisible();
    for (const column of ['Name', 'Role', 'Licence', 'Status', 'Credit', 'Last Load']) {
      await expect(table.getByRole('columnheader', { name: column })).toBeVisible();
    }
    await expect(page.getByTestId('people-list')).toHaveCount(0);

    await searchFor(page, 'Jo Jumper');
    const jo = rowOf(page, 'Jo Jumper');
    await expect(jo.getByRole('cell').first()).toContainText('Jo Jumper');
    await expect(jo.locator('[data-testid$="-credit"]')).toContainText('$');
    await expect(jo.locator('[data-testid$="-last"]')).not.toBeEmpty();
    await expectAccessible(page, 'people table');
  });

  test('is a list of rows on a narrow window', async ({ page }) => {
    test.skip(widthOf(page) >= WIDE, 'the rows are the narrow layout');
    await openPeople(page);

    await expect(page.getByTestId('people-list')).toBeVisible();
    await expect(page.getByTestId('people-table')).toHaveCount(0);
  });
});

test.describe('people as the owner @people', () => {
  test('adds a walk-in member with the short form, and finds them in the list', async ({
    page,
  }) => {
    const stamp = Date.now();
    const name = `Walk In ${stamp}`;
    await openPeople(page);

    const dialog = page.getByTestId('form-dialog');
    await pressUntil(page, page.getByTestId('people-add-primary-action'), () =>
      expect(dialog).toBeVisible({ timeout: 5000 })
    );
    await expect(page.getByRole('dialog', { name: 'Pre-register user' })).toHaveCount(1);
    await dialog.getByRole('textbox', { name: 'Name' }).fill(name);
    await dialog.getByRole('textbox', { name: 'Email' }).fill(`walkin+${stamp}@example.com`);
    // The certification body is chosen for you when there is one; the first level of it is picked
    const body = dialog.getByRole('combobox').first();
    if (!(await body.innerText()).includes('APF')) await choose(page, body, 'APF');
    await choose(page, dialog.getByRole('combobox', { name: 'Access level' }), 'Fun Jumper');

    await dialog.getByRole('button', { name: 'Create' }).click();
    await expect(dialog).toBeHidden({ timeout: 15_000 });

    await searchFor(page, name);
    await expect(rowOf(page, name)).toContainText('Fun Jumper');
  });
});
