import type { Locator, Page } from '@playwright/test';
import { expectAccessible } from './support/a11y';
import { openAccount } from './support/account';
import { createGenericOperatorViaApi } from './support/api';
import { submitLogin } from './support/auth';
import { expectLayout } from './support/layout';
import { press } from './support/press';
import { expect, gotoRoute, test } from './support/test';

// P7.22: an operator of the generic template sees only what its modules provide, in its own words, with no aeroplane

/** The aeroplane glyphs of MaterialCommunityIcons (airplane, -takeoff, -landing, -off, -plus) and the parachute */
const SKYDIVING_GLYPHS: Record<string, string> = {
  airplane: '\u{F001D}',
  'airplane-takeoff': '\u{F05D5}',
  'airplane-landing': '\u{F05D4}',
  'airplane-off': '\u{F001E}',
  'airplane-plus': '\u{F1881}',
  parachute: '\u{F0CB4}',
};

/** Words of the skydiving template; the public seed operator's name ("Demo Dropzone") is not one of the screen's words */
const SKYDIVING_WORDS = [
  /jump/,
  /skydiv/,
  /canopy/,
  /parachute/,
  /aircraft/,
  /exit weight/,
  /\brigs?\b/,
  /altitude/,
  /wing ?load/,
  /licen[cs]e/,
  /master log/,
  /\bweather\b/,
];

/** Fails on a skydiving glyph or word in `within` (the page), leaving out the rows of other operators (`others`) */
async function expectNoSkydiving(page: Page, where: string, within?: Locator, others?: Locator) {
  let text = await (within ?? page.locator('body')).innerText();
  for (const other of others ? await others.allInnerTexts() : [])
    text = text.split(other).join(' ');
  // The seed's public dropzone, and the email the new user got from the API helper ("newjumper+…"), are not the screen's words
  text = text.split('Demo Dropzone').join(' ').replace(/newjumper\+\d+@example\.com/g, ' ');
  for (const [name, glyph] of Object.entries(SKYDIVING_GLYPHS)) {
    expect(text.includes(glyph), `${where} shows the ${name} icon`).toBe(false);
  }
  const words = text.toLowerCase();
  for (const word of SKYDIVING_WORDS) {
    expect(words, `${where} says ${word}`).not.toMatch(word);
  }
}

test.describe('a generic operator @generic', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.describe.configure({ timeout: 240_000 });

  test('shows no equipment, certifications, weather, daily log, skydiving words or aeroplanes', async ({
    page,
  }) => {
    const made = await createGenericOperatorViaApi(`Harbour ${test.info().project.name}`);
    expect(made, 'could not create a generic operator').toBeTruthy();
    if (!made) return;

    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.locator('input').nth(1).waitFor();
    await submitLogin(page, made.email);
    const row = page.getByRole('button', { name: made.name, exact: true });
    await row.waitFor({ timeout: 30_000 });
    // The operator selector shows the template's icon (the public seed dropzone's parachute is its own), not an aeroplane
    await expectNoSkydiving(page, 'the operator row', row);
    await press(page, row);
    await page.waitForURL(/\/(manifest|today)$/, { timeout: 30_000 });

    for (const route of ['/today', '/manifest', `/loads/${made.loadId}`, '/users']) {
      await gotoRoute(page, route);
      await expect(page.getByTestId('not-available')).toHaveCount(0);
      await expectNoSkydiving(page, route);
    }
    await expectLayout(page, 'generic people');

    // Setup lists no equipment, inspection form, certification bodies, conditions or daily log
    await gotoRoute(page, '/configuration');
    await expect(page.getByTestId('setup-vehicles')).toBeVisible();
    for (const entry of [
      'equipment',
      'inspection',
      'certificationBodies',
      'conditions',
      'dailyLog',
    ]) {
      await expect(page.getByTestId(`setup-${entry}`), `setup lists ${entry}`).toHaveCount(0);
    }
    await expectNoSkydiving(page, '/configuration');
    await expectAccessible(page, 'generic setup');

    await gotoRoute(page, '/configuration/vehicles');
    await expect(page.getByText('Shuttle 1')).toBeVisible();
    await expectNoSkydiving(page, '/configuration/vehicles');

    // Their deep links say the screen is not available here
    for (const route of [
      '/configuration/equipment',
      '/configuration/equipment-inspection',
      '/configuration/certification-bodies',
      '/daily-log',
      `/user/${made.membershipId}/equipment`,
    ]) {
      await gotoRoute(page, route);
      await expect(page.getByTestId('not-available'), route).toBeVisible();
    }

    // The profile has no certifications or equipment, the account no equipment
    await gotoRoute(page, `/user/${made.membershipId}`);
    await expect(page.getByTestId('profile-loads')).toBeVisible();
    await expect(page.getByTestId('profile-certifications')).toHaveCount(0);
    await expect(page.getByTestId('profile-equipment')).toHaveCount(0);
    await expectNoSkydiving(page, 'the profile');

    await gotoRoute(page, '/today');
    await openAccount(page);
    await expect(page.getByTestId('account-equipment')).toHaveCount(0);
    // The operators to switch to show their templates' icons: the seed's dropzone keeps its parachute
    const mine = page.getByTestId(/^operator-\d+$/).filter({ hasText: made.name });
    await expect(mine).toHaveCount(1);
    await expectNoSkydiving(
      page,
      'the account',
      undefined,
      page.getByTestId(/^operator-\d+$/).filter({ hasNotText: made.name })
    );
  });
});
