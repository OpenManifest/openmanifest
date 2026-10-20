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

/** On the operator selection screen, opens the (only) operator; joins it when the user is not yet a member (P6.4) */
export async function selectOperator(page: Page) {
  const row = page.getByText('Dropzone', { exact: true }).first();
  await row.waitFor({ timeout: 30_000 });
  await press(page, row);
  // The manifest desk lands on the board, everybody else on their day
  await page.waitForURL(/\/(manifest|today)$/, { timeout: 30_000 });
}

/** Logs in through the UI from the login screen and opens the operator's manifest board */
export async function loginViaUi(page: Page, email: string, password = PASSWORD) {
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.locator('input').nth(1).waitFor();
  await submitLogin(page, email, password);
  await selectOperator(page);
}
