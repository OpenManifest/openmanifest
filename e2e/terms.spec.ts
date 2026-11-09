import type { Page } from '@playwright/test';
import { createGenericOperatorViaApi } from './support/api';
import { submitLogin } from './support/auth';
import { press } from './support/press';
import { expect, gotoRoute, test } from './support/test';

// P7.20: an operator of the generic template sees none of the skydiving vocabulary on its main routes. The words come from
// the rename map (config/vocabulary.yml, GENERALISATION §3) and the skydiving template's copy.
const SKYDIVING_VOCABULARY = [
  /jump/,
  /skydiv/,
  /dropzone/,
  /\bdz\b/,
  /dzso/,
  /aircraft/,
  /aero?plane/,
  /\bplanes?\b/,
  /altitude/,
  /\brigs?\b/,
  /canopy/,
  /parachute/,
  /reserve repack/,
  /wing ?load/,
  /exit weight/,
  /licen[cs]e/,
  /federation/,
  /passenger/,
  /master log/,
  /\blanded\b/,
  /in flight/,
  /take-?off/,
  /\bweather\b/,
  /tandem/,
];

/** The main routes of every destination (app/navigation/linking.ts), with the ids of the operator's own records */
const routes = (made: { loadId: string; membershipId: string }) => [
  '/today',
  '/manifest',
  `/loads/${made.loadId}`,
  '/users',
  `/user/${made.membershipId}`,
  '/notifications',
  '/wallet',
  '/transactions',
  '/dashboard',
  '/configuration',
  '/configuration/vehicles',
  '/configuration/destinations',
  '/configuration/crew-roles',
  '/configuration/ticket-types',
  '/ticket-types/extra',
  '/configuration/basic',
  '/configuration/rules',
  '/configuration/permissions',
];

/** Fails on any word of the skydiving vocabulary in the page (every one is reported), leaving out the user's own email */
async function expectNoSkydivingWords(page: Page, where: string) {
  const text = (await page.locator('body').innerText())
    .replace(/newjumper\+\d+@example\.com/g, ' ')
    .toLowerCase();
  for (const word of SKYDIVING_VOCABULARY) {
    expect.soft(text, `${where} says ${word}`).not.toMatch(word);
  }
}

test.describe('the words of a generic operator @terms', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.describe.configure({ timeout: 300_000 });

  test('no main route shows a word of the skydiving vocabulary', async ({ page }, testInfo) => {
    const { group, variant, colorScheme } = testInfo.project.metadata;
    // The full project only, once: the words do not change with the size, scheme or text scale
    test.skip(
      group !== 'full' || variant !== undefined || colorScheme !== 'light',
      'runs in the full project, light, at each width'
    );

    const made = await createGenericOperatorViaApi(`Harbour Terms ${testInfo.project.name}`);
    expect(made, 'could not create a generic operator').toBeTruthy();
    if (!made) return;

    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.locator('input').nth(1).waitFor();
    await submitLogin(page, made.email);
    const row = page.getByRole('button', { name: made.name, exact: true });
    await row.waitFor({ timeout: 30_000 });
    await press(page, row);
    await page.waitForURL(/\/(manifest|today)$/, { timeout: 30_000 });

    for (const route of routes(made)) {
      await gotoRoute(page, route);
      await expect(page.getByTestId('not-available'), route).toHaveCount(0);
      await expectNoSkydivingWords(page, route);
    }
  });
});
