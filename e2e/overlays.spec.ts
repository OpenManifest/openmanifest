import { expectAccessible } from './support/a11y';
import { expect, gotoRoute, test } from './support/test';

const OVERLAYS = '/__overlays';

const wide = (page: import('@playwright/test').Page) => (page.viewportSize()?.width ?? 0) >= 1024;

test.describe('overlays @overlay', () => {
  test('a dialog is named by its title, traps focus, closes on Escape and returns focus', async ({
    page,
  }) => {
    await gotoRoute(page, OVERLAYS);
    const trigger = page.getByTestId('open-dialog');

    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Edit load' });
    await expect(page.getByTestId('overlay-dialog')).toBeVisible();
    await expectAccessible(page, 'overlay dialog');

    // Focus goes in, and Tab never leaves: go round the five stops (the field, close, cancel, save) more than once
    await expect(dialog.locator(':focus')).toHaveCount(1);
    for (let i = 0; i < 9; i += 1) {
      await page.keyboard.press('Tab');
      await expect(dialog.locator(':focus')).toHaveCount(1);
    }
    for (let i = 0; i < 9; i += 1) {
      await page.keyboard.press('Shift+Tab');
      await expect(dialog.locator(':focus')).toHaveCount(1);
    }

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('overlay-dialog')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('a dialog is centred, a panel sits at the right edge, a sheet at the bottom', async ({
    page,
  }) => {
    await gotoRoute(page, OVERLAYS);
    const viewport = page.viewportSize() as { width: number; height: number };
    const boxOf = async (kind: string) => {
      await page.getByTestId(`open-${kind}`).click();
      // The role=dialog element is Radix's wrapper; the card inside it has the size
      await expect(page.getByRole('dialog', { name: 'Edit load' })).toHaveCount(1);
      const card = page.getByTestId(`overlay-${kind}`);
      await expect(card).toBeVisible();
      const box = (await card.boundingBox()) as {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      await page.keyboard.press('Escape');
      await expect(card).toBeHidden();
      return box;
    };

    const dialog = await boxOf('dialog');
    expect(Math.abs(dialog.x + dialog.width / 2 - viewport.width / 2)).toBeLessThan(2);
    expect(dialog.x).toBeGreaterThanOrEqual(0);
    expect(dialog.x + dialog.width).toBeLessThanOrEqual(viewport.width);

    const panel = await boxOf('panel');
    expect(Math.round(panel.x + panel.width)).toBe(viewport.width);
    expect(Math.round(panel.height)).toBe(viewport.height);

    const sheet = await boxOf('sheet');
    expect(Math.round(sheet.y + sheet.height)).toBe(viewport.height);
    expect(sheet.width).toBe(viewport.width);
  });

  test('auto is a side panel on a wide window and a dialog on a narrow one', async ({ page }) => {
    await gotoRoute(page, OVERLAYS);
    const viewport = page.viewportSize() as { width: number; height: number };

    await page.getByTestId('open-auto').click();
    const box = (await page.getByTestId('overlay-auto').boundingBox()) as {
      x: number;
      width: number;
      height: number;
    };

    if (wide(page)) {
      expect(Math.round(box.x + box.width)).toBe(viewport.width);
      expect(Math.round(box.height)).toBe(viewport.height);
    } else {
      expect(Math.round(box.height)).toBeLessThan(viewport.height);
      expect(box.x).toBeGreaterThan(0);
    }
  });

  test('the footer stays pinned while a long form scrolls, and Save closes with a toast', async ({
    page,
  }) => {
    await gotoRoute(page, OVERLAYS);
    await page.getByTestId('open-dialog').click();
    const dialog = page.getByRole('dialog', { name: 'Edit load' });

    await expect(dialog.getByRole('button', { name: 'Save' })).toBeInViewport();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByTestId('overlay-dialog')).toBeHidden();
    await expect(page.getByTestId('toast')).toBeVisible();
    await expect(page.getByTestId('toast')).toHaveAttribute('role', 'status');
    await expect(page.getByTestId('toast')).toContainText('Load saved');
  });

  test('a menu opens with the keyboard, moves with the arrows and chooses with Enter', async ({
    page,
  }) => {
    await gotoRoute(page, OVERLAYS);
    const trigger = page.getByRole('button', { name: 'More actions' });

    await trigger.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu', { name: 'More actions' });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitem')).toHaveCount(4);

    await page.getByRole('menuitem', { name: 'Edit' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toBeFocused();
    // The disabled item is skipped
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(menu).toBeHidden();
    await expect(page.getByTestId('chosen')).toHaveText('chosen: delete');
    await expect(trigger).toBeFocused();
  });

  test('a menu closes on Escape and returns focus to its trigger', async ({ page }) => {
    await gotoRoute(page, OVERLAYS);
    const trigger = page.getByRole('button', { name: 'More actions' });

    await trigger.click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');

    await expect(page.getByRole('menu')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('a popover opens with Enter and closes with its button, then with Escape', async ({
    page,
  }) => {
    await gotoRoute(page, OVERLAYS);
    const trigger = page.getByTestId('popover-trigger');

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Wind 8 kt from the west')).toBeVisible();
    await page.getByRole('button', { name: 'Got it' }).click();
    await expect(page.getByText('Wind 8 kt from the west')).toBeHidden();

    await trigger.click();
    await expect(page.getByText('Wind 8 kt from the west')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('Wind 8 kt from the west')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('a tooltip shows on keyboard focus and Escape hides it', async ({ page }) => {
    await gotoRoute(page, OVERLAYS);

    await page.getByTestId('tooltip-trigger').focus();
    await expect(page.getByRole('tooltip')).toHaveText('Open the settings');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toBeHidden();
  });

  test('banners say how urgent they are, and their actions work', async ({ page }) => {
    await gotoRoute(page, OVERLAYS);

    await expect(page.getByRole('alert').filter({ hasText: 'This load is closed' })).toBeVisible();
    await expect(
      page.getByRole('status').filter({ hasText: 'Winds are above the limit' })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Update' }).click();
    await expect(page.getByTestId('chosen')).toHaveText('chosen: update');
    await page.getByRole('button', { name: 'Dismiss' }).click();
    await expect(page.getByTestId('chosen')).toHaveText('chosen: dismissed');
  });

  test('an error toast is an alert with an action, and goes away on its own', async ({ page }) => {
    await gotoRoute(page, OVERLAYS);

    await page.getByRole('button', { name: 'Error toast' }).click();
    const toast = page.getByTestId('toast');
    await expect(toast).toHaveAttribute('role', 'alert');
    await toast.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByTestId('chosen')).toHaveText('chosen: retry');
    await expect(toast).toBeHidden();

    await page.getByRole('button', { name: 'Success toast' }).click();
    await expect(toast).toBeVisible();
    await expect(toast).toBeHidden({ timeout: 8000 });
  });

  test('the page is accessible', async ({ page }) => {
    await gotoRoute(page, OVERLAYS);
    await expectAccessible(page, 'overlays');
  });
});
