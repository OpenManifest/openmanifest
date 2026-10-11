import type { Page } from '@playwright/test';
import { press } from './press';
import { PASSWORD } from './roles';

/** Types the credentials into the login form and submits it (Enter) */
export async function submitLogin(page: Page, email: string, password = PASSWORD) {
  await page.locator('input').nth(0).click({ force: true });
  await page.keyboard.type(email);
  await page.locator('input').nth(1).click({ force: true });
  await page.keyboard.type(password);
  await page.keyboard.press('Enter');
}

/** On the dropzone selection screen, opens the (only) dropzone; joins it when the user is not yet a member (P6.4) */
export async function selectDropzone(page: Page) {
  const row = page.getByText('Dropzone', { exact: true }).first();
  await row.waitFor({ timeout: 30_000 });
  await press(page, row);
  await page.waitForURL(/\/dropzone\/manifest$/, { timeout: 30_000 });
}

/** Logs in through the UI from the login screen and opens the dropzone's manifest board */
export async function loginViaUi(page: Page, email: string, password = PASSWORD) {
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.locator('input').nth(1).waitFor();
  await submitLogin(page, email, password);
  await selectDropzone(page);
}
