import { expectAccessible } from './support/a11y';
import { expect, gotoRoute, test } from './support/test';

// U0.8: the keyboard and screen reader behaviour of @rn-primitives on the web. Dev-only route, not in production builds.
const SPIKE = '/__spike';

const focusedInside = (page: import('@playwright/test').Page, selector: string) =>
  page.evaluate((s) => !!document.activeElement && !!document.activeElement.closest(s), selector);

test.describe('primitives spike @spike', () => {
  test('dialog traps focus, closes on Escape and returns focus to its trigger', async ({
    page,
  }) => {
    await gotoRoute(page, SPIKE);
    const trigger = page.getByTestId('dialog-trigger');
    await trigger.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName('Dialog title');
    await expect(dialog).toHaveAccessibleDescription('Dialog description');
    expect(await focusedInside(page, '[role="dialog"]')).toBe(true);

    // Tabbing round does not leave the dialog
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press('Tab');
      expect(await focusedInside(page, '[role="dialog"]')).toBe(true);
    }
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press('Shift+Tab');
      expect(await focusedInside(page, '[role="dialog"]')).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('select opens with Enter, moves with the arrows and selects with Enter', async ({
    page,
  }) => {
    await gotoRoute(page, SPIKE);
    const trigger = page.getByTestId('select-trigger');
    await expect(trigger).toHaveAttribute('role', 'combobox');
    await trigger.focus();
    await page.keyboard.press('Enter');

    const list = page.getByRole('listbox');
    await expect(list).toBeVisible();
    await expect(page.getByRole('option')).toHaveCount(3);
    // The first option has focus when the list opens; one arrow down is the second
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(list).toBeHidden();
    await expect(trigger).toContainText('Banana');
    await expect(trigger).toBeFocused();

    // Space opens it too, Escape closes without changing the value
    await page.keyboard.press('Space');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(trigger).toContainText('Banana');
  });

  test('tabs expose tablist, tab and tabpanel and move with the arrows', async ({ page }) => {
    await gotoRoute(page, SPIKE);
    await expect(page.getByRole('tablist')).toBeVisible();
    const one = page.getByRole('tab', { name: 'Tab one' });
    const two = page.getByRole('tab', { name: 'Tab two' });
    await expect(one).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText('Panel one');

    await one.focus();
    await page.keyboard.press('ArrowRight');
    await expect(two).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(two).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText('Panel two');
    // Only the selected tab is in the tab order
    await expect(two).toHaveAttribute('tabindex', '0');
  });

  test('popover opens with the keyboard and closes on Escape', async ({ page }) => {
    await gotoRoute(page, SPIKE);
    const trigger = page.getByTestId('popover-trigger');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Popover content')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('Popover content')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('tooltip shows on keyboard focus and is described by its trigger', async ({ page }) => {
    await gotoRoute(page, SPIKE);
    await page.getByTestId('tooltip-trigger').focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await expect(page.getByRole('tooltip')).toHaveText('Tooltip text');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toBeHidden();
  });

  test('the spike page is accessible', async ({ page }) => {
    await gotoRoute(page, SPIKE);
    await expectAccessible(page, 'spike');
  });
});
