import { expectAccessible } from './support/a11y';
import { expect, gotoRoute, test } from './support/test';

const FORMS = '/__forms';

test.describe('form components @forms', () => {
  test('the labels name the inputs, and the page is accessible', async ({ page }) => {
    await gotoRoute(page, FORMS);

    await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('spinbutton', { name: 'Exit weight' })).toHaveValue('80');
    await expect(page.getByRole('combobox', { name: 'Aircraft' })).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: 'Theme' })).toBeVisible();
    await expect(page.getByRole('switch', { name: 'Load alerts' })).not.toBeChecked();
    await expectAccessible(page, 'forms');
  });

  test('the text field takes typing and shows its helper text', async ({ page }) => {
    await gotoRoute(page, FORMS);
    const name = page.getByRole('textbox', { name: 'Name' });

    await expect(page.getByText('As on your licence')).toBeVisible();
    await name.fill('x');
    await expect(page.getByRole('alert')).toHaveText('Too short');
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await name.fill('Olive');
    await expect(page.getByTestId('forms-summary')).toContainText('Olive|');
  });

  test('the number field steps with the keys and the buttons, within its limits', async ({
    page,
  }) => {
    await gotoRoute(page, FORMS);
    const weight = page.getByRole('spinbutton', { name: 'Exit weight' });

    await weight.focus();
    await page.keyboard.press('ArrowUp');
    await expect(weight).toHaveValue('80.5');
    await page.getByRole('button', { name: 'Decrease Exit weight' }).click();
    await page.getByRole('button', { name: 'Decrease Exit weight' }).click();
    await expect(weight).toHaveValue('79.5');

    await weight.fill('500');
    await weight.blur();
    await expect(weight).toHaveValue('200');
    await expect(page.getByRole('button', { name: 'Increase Exit weight' })).toBeDisabled();
  });

  test('the select opens with the keyboard, chooses with Enter and returns focus', async ({
    page,
  }) => {
    await gotoRoute(page, FORMS);
    const trigger = page.getByRole('combobox', { name: 'Aircraft' });

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(page.getByRole('option')).toHaveCount(3);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(trigger).toContainText('Otter');
    await expect(trigger).toBeFocused();
    await expect(page.getByTestId('forms-summary')).toContainText('|otter|');
  });

  test('the segmented control moves with the arrows, one segment in the tab order', async ({
    page,
  }) => {
    await gotoRoute(page, FORMS);
    const system = page.getByRole('radio', { name: 'System' });

    await expect(system).toBeChecked();
    await expect(system).toHaveAttribute('tabindex', '0');
    await expect(page.getByRole('radio', { name: 'Light' })).toHaveAttribute('tabindex', '-1');

    await system.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('radio', { name: 'Dark' })).toBeChecked();
    await expect(page.getByTestId('forms-summary')).toContainText('|dark|');
  });

  test('the switch toggles with Space and the chips with the keyboard', async ({ page }) => {
    await gotoRoute(page, FORMS);
    const alerts = page.getByRole('switch', { name: 'Load alerts' });

    await alerts.focus();
    await page.keyboard.press('Space');
    await expect(alerts).toBeChecked();

    const student = page.getByRole('checkbox', { name: 'student' });
    await student.focus();
    await page.keyboard.press('Space');
    await expect(student).toBeChecked();

    await page.getByRole('button', { name: 'Remove Jo Jumper' }).click();
    await expect(page.getByText('Jo Jumper')).toHaveCount(0);
  });
});
