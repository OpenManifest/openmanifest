import { expectAccessible } from './support/a11y';
import { press } from './support/press';
import { expect, gotoRoute, test } from './support/test';

// The forms of the setup screens open in an overlay (a dialog or a side panel on the web) with the save button pinned
test.describe('form dialogs @setup', () => {
  test('a new aircraft is entered in a dialog named by its title, validated and closed with Escape', async ({
    page,
  }) => {
    await gotoRoute(page, '/configuration/vehicles');
    await press(page, page.getByTestId('new-vehicle-primary-action'));

    const card = page.getByTestId('form-dialog');
    await expect(page.getByRole('dialog', { name: 'New aircraft' })).toHaveCount(1);
    await expect(card).toBeVisible();
    await expect(card.getByRole('textbox', { name: 'Name' })).toBeVisible();
    await expect(card.getByRole('textbox', { name: 'Registration' })).toBeVisible();
    await expect(card.getByRole('spinbutton', { name: 'Max slots' })).toBeVisible();
    await expectAccessible(page, 'form dialog');

    // Saving an empty form shows the messages of the fields, announced
    await card.getByRole('button', { name: 'Save' }).click();
    await expect(card.getByRole('alert').first()).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(card).toBeHidden();
  });

  test('the save button stays in view while the form scrolls', async ({ page }) => {
    await gotoRoute(page, '/configuration/equipment');
    await press(page, page.getByTestId('new-equipment-primary-action'));

    const card = page.getByTestId('form-dialog');
    await expect(card).toBeVisible();
    await expect(card.getByRole('button', { name: 'Save' })).toBeInViewport();
    await card.getByRole('textbox', { name: 'Serial' }).focus();
    await expect(card.getByRole('button', { name: 'Save' })).toBeInViewport();
  });
});
