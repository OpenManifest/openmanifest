import type { Locator, Page } from '@playwright/test';
import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
import { pressUntil } from './support/press';
import { expect, gotoRoute, test } from './support/test';
import { SEED } from './support/seed';

// The setup lists (U5.5): one pattern for every list of Setup → Operations and the accepted bodies. A row opens the
// item's form (a sheet on a phone, a side panel on a wide window); each spec creates an item, edits it and archives it
// again, so the seed is left as it was.

/**
 * Opens a form with `trigger` and returns it. The form is named by its title; its content (`form-dialog`) is what shows
 * (the element with the dialog role on the web has no box of its own).
 */
async function openForm(page: Page, trigger: Locator, title: string | RegExp) {
  const form = page.getByTestId('form-dialog');
  await trigger.scrollIntoViewIfNeeded();
  await pressUntil(page, trigger, () => expect(form).toBeVisible({ timeout: 5000 }));
  await expect(page.getByRole('dialog', { name: title })).toHaveCount(1);
  return form;
}

/** Opens the form of the row named `name` */
function openRow(page: Page, name: string, title: string | RegExp) {
  return openForm(page, page.getByRole('button', { name, exact: true }), title);
}

async function save(form: Locator) {
  await form.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(form).toBeHidden({ timeout: 10000 });
}

async function archive(page: Page, form: Locator, name: string) {
  await form.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(form).toBeHidden({ timeout: 10000 });
  await expect(page.getByRole('button', { name, exact: true })).toHaveCount(0);
}

const stamp = () => String(Date.now()).slice(-6);

test.describe('setup lists @setup', () => {
  for (const route of ['/configuration/crew-roles', '/configuration/certification-bodies']) {
    test(`${route} lays out`, async ({ page }) => {
      await gotoRoute(page, route);
      await page.waitForTimeout(1000);
      expect(new URL(page.url()).pathname).toBe(route);
      await expectLayout(page, route);
      await expectAccessible(page, route);
    });
  }

  test('a vehicle is added, renamed and archived', async ({ page }) => {
    const name = `E2E Otter ${stamp()}`;
    await gotoRoute(page, '/configuration/vehicles');
    let form = await openForm(
      page,
      page.getByTestId('new-vehicle-primary-action'),
      `New ${SEED.vehicle}`
    );
    await form.getByRole('textbox', { name: 'Name' }).fill(name);
    await form.getByRole('textbox', { name: 'Registration' }).fill(`VH-${stamp()}`);
    await form.getByRole('spinbutton', { name: 'Max slots' }).fill('8');
    await save(form);
    await expect(page.getByRole('button', { name, exact: true })).toBeVisible();

    form = await openRow(page, name, `Edit ${SEED.vehicle}`);
    await expectAccessible(page, 'vehicle form');
    await form.getByRole('textbox', { name: 'Name' }).fill(`${name} II`);
    await save(form);
    await expect(page.getByRole('button', { name: `${name} II`, exact: true })).toBeVisible();

    form = await openRow(page, `${name} II`, `Edit ${SEED.vehicle}`);
    await archive(page, form, `${name} II`);
  });

  test('a destination is added, renamed and archived', async ({ page }) => {
    const name = `E2E Altitude ${stamp()}`;
    await gotoRoute(page, '/configuration/destinations');
    let form = await openForm(
      page,
      page.getByTestId('new-destination-primary-action'),
      'New altitude'
    );
    await form.getByRole('textbox', { name: 'Name' }).fill(name);
    await form.getByRole('spinbutton', { name: /Height/ }).fill('9000');
    await save(form);
    await expect(page.getByTestId('destinations-list').getByText('9k · 9,000 ft')).toBeVisible();

    form = await openRow(page, name, 'Edit altitude');
    await form.getByRole('textbox', { name: 'Name' }).fill(`${name} II`);
    await save(form);

    form = await openRow(page, `${name} II`, 'Edit altitude');
    await archive(page, form, `${name} II`);
  });

  test('a ticket type is added, repriced and archived', async ({ page }) => {
    const name = `E2E Ticket ${stamp()}`;
    await gotoRoute(page, '/configuration/ticket-types');
    let form = await openForm(
      page,
      page.getByTestId('new-ticket-type-primary-action'),
      'New ticket'
    );
    await form.getByRole('textbox', { name: 'Name' }).fill(name);
    await form.getByRole('spinbutton', { name: 'Price' }).fill('25');
    // Where the ticket goes is chosen from the operator's destinations
    await expect(form.getByRole('combobox', { name: /Default altitude/ })).toBeVisible();
    await save(form);
    const row = page.getByRole('button', { name, exact: true });
    await expect(row.getByText('$25.00')).toBeVisible();

    form = await openRow(page, name, 'Edit ticket');
    await form.getByRole('spinbutton', { name: 'Price' }).fill('27');
    await save(form);
    await expect(row.getByText('$27.00')).toBeVisible();

    form = await openRow(page, name, 'Edit ticket');
    await archive(page, form, name);
  });

  test('an add-on is added once and edited', async ({ page }) => {
    // Add-ons cannot be archived, so the spec keeps one of its own and only adds it when it is missing
    const name = 'E2E add-on';
    await gotoRoute(page, '/ticket-types/extra');
    // Two workers can both find it missing and add it: then either of the two is the spec's own
    const row = page.getByRole('button', { name, exact: true }).first();
    const add = page.getByTestId('new-ticket-addon-primary-action');
    await expect(add).toBeVisible({ timeout: 20_000 });
    // The list is there once the add button is; give its rows a moment before deciding it is missing
    await row.waitFor({ timeout: 3000 }).catch(() => undefined);
    if (!(await row.count())) {
      const form = await openForm(page, add, 'New add-on');
      await form.getByRole('textbox', { name: 'Name' }).fill(name);
      await form.getByRole('spinbutton', { name: 'Price' }).fill('15');
      await save(form);
    }
    await expect(row).toBeVisible();

    const price = (await row.getByText(/^\$\d+\.00$/).textContent()) === '$15.00' ? '16' : '15';
    const form = await openForm(page, row, 'Edit add-on');
    await form.getByRole('spinbutton', { name: 'Price' }).fill(price);
    await save(form);
    await expect(row.getByText(`$${price}.00`)).toBeVisible();
  });

  test('a crew role is added, made required and archived', async ({ page }) => {
    const name = `E2E Camera ${stamp()}`;
    await gotoRoute(page, '/configuration/crew-roles');
    await expect(page.getByTestId('crew-role-pilot')).toBeVisible();
    let form = await openForm(
      page,
      page.getByTestId('new-crew-role-primary-action'),
      'New crew role'
    );
    await form.getByRole('textbox', { name: 'Name' }).fill(name);
    await save(form);
    const row = page.getByRole('button', { name, exact: true });
    await expect(row.getByText('Once per load')).toBeVisible();

    form = await openRow(page, name, `Edit ${name}`);
    await expectAccessible(page, 'crew role form');
    await form.getByRole('switch', { name: 'Required' }).click();
    await save(form);
    await expect(row.getByText('Yes')).toBeVisible();

    form = await openRow(page, name, `Edit ${name}`);
    await archive(page, form, name);
  });

  test('an item of equipment is added, edited and archived', async ({ page }) => {
    const serial = `E2E${stamp()}`;
    await gotoRoute(page, '/configuration/equipment');
    let form = await openForm(
      page,
      page.getByTestId('new-equipment-primary-action'),
      `New ${SEED.equipment}`
    );
    await form.getByRole('textbox', { name: 'Make' }).fill('Sun Path');
    await form.getByRole('textbox', { name: 'Model' }).fill('Javelin');
    await form.getByRole('textbox', { name: 'Serial' }).fill(serial);
    // A kind that is serviced needs the date of its next service: none shows until one is chosen (BUG-113)
    const due = form.getByRole('button', { name: 'Reserve repack due' });
    await expect(due).toContainText('No date');
    await due.click();
    await page
      .locator('.DayPicker-Day:not(.DayPicker-Day--outside)', { hasText: /^28$/ })
      .first()
      .click();
    await expect(due).not.toContainText('No date');
    await save(form);
    const name = `Sun Path Javelin #${serial}`;
    await expect(page.getByRole('button', { name, exact: true })).toBeVisible();

    form = await openRow(page, name, `Edit ${SEED.equipment}`);
    await form.getByRole('textbox', { name: 'Model' }).fill('Odyssey');
    await save(form);
    const renamed = `Sun Path Odyssey #${serial}`;
    await expect(page.getByRole('button', { name: renamed, exact: true })).toBeVisible();

    form = await openRow(page, renamed, `Edit ${SEED.equipment}`);
    await archive(page, form, renamed);
  });

  test('an inspection form gets a field and loses it again', async ({ page }) => {
    const label = `E2E check ${stamp()}`;
    await gotoRoute(page, '/configuration/equipment-inspection');
    let form = await openRow(page, SEED.equipmentKind, `${SEED.equipmentKind} inspection form`);
    await form.getByRole('button', { name: 'Add a field' }).click();
    await page.getByRole('menuitem', { name: 'Checkbox' }).click();
    const field = page.getByTestId('field-dialog');
    await field.getByRole('textbox', { name: 'Name' }).fill(label);
    await field.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(field).toBeHidden();
    await save(form);

    form = await openRow(page, SEED.equipmentKind, `${SEED.equipmentKind} inspection form`);
    await expect(form.getByText(label)).toBeVisible();
    await form.getByRole('button', { name: `Remove ${label}` }).click();
    await save(form);

    form = await openRow(page, SEED.equipmentKind, `${SEED.equipmentKind} inspection form`);
    await expect(form.getByText(label)).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(form).toBeHidden();
  });

  test('the accepted body is listed and kept while it is the only one', async ({ page }) => {
    await gotoRoute(page, '/configuration/certification-bodies');
    await expect(page.getByTestId('certification-body-apf')).toBeVisible();
    const form = await openRow(page, 'APF', 'APF');
    await expect(form.getByText(/accept the levels and qualifications of APF/)).toBeVisible();
    await expect(form.getByRole('button', { name: 'Stop accepting' })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(form).toBeHidden();
  });
});
