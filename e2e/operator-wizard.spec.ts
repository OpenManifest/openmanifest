import type { Page } from '@playwright/test';
import { expectAccessible } from './support/a11y';
import { registerNewUser } from './support/api';
import { submitLogin } from './support/auth';
import { expectLayout } from './support/layout';
import { press, pressUntil } from './support/press';
import { expect, gotoRoute, test } from './support/test';

// P7.23: a new owner creates an operator through the wizard, starting with the industry ("Other" is the generic template)

test.use({ storageState: { cookies: [], origins: [] } });

const next = (page: Page) => page.getByTestId('wizard-next-primary-action');

/** Presses Next until the heading of the next step shows */
async function nextTo(page: Page, heading: string) {
  await pressUntil(page, next(page), () =>
    expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible({
      timeout: 5_000,
    })
  );
}

test.describe('operator wizard @wizard', () => {
  test.describe.configure({ timeout: 240_000 });

  test('a new owner creates a generic operator with its first vehicle', async ({ page }) => {
    const name = `Harbour ${test.info().project.name} ${Date.now()}`;
    const email = await registerNewUser('Wendy Wizard');
    await gotoRoute(page, '/login');
    await submitLogin(page, email);
    const create = page.getByTestId('create-operator-primary-action');
    await create.waitFor({ timeout: 30_000 });
    await pressUntil(page, create, () =>
      expect(page.getByRole('heading', { name: 'What do you run?' })).toBeVisible({
        timeout: 5_000,
      })
    );

    // Industry: the templates in groups, the one picked previews its presets
    await expect(page.getByText('Air', { exact: true })).toBeVisible();
    await expect(page.getByText('Other', { exact: true }).first()).toBeVisible();
    const other = page.getByTestId('industry-generic');
    await other.scrollIntoViewIfNeeded();
    await pressUntil(page, other, () =>
      expect(page.getByTestId('industry-preview')).toBeVisible({ timeout: 3_000 })
    );
    await expect(page.getByText('Crew roles: none')).toBeVisible();
    await expectLayout(page, 'wizard industry');
    await expectAccessible(page, 'wizard industry');
    await nextTo(page, 'Name');

    // Name: required
    await pressUntil(page, next(page), () =>
      expect(page.getByText('Your operator must have a name')).toBeVisible({ timeout: 3_000 })
    );
    await page.getByTestId('wizard-name').fill(name);
    await nextTo(page, 'Location and time zone');

    // Location and time zone: the device's zone is filled in
    const zone = page.getByTestId('wizard-time-zone');
    await expect(zone).not.toHaveValue('');
    await zone.fill('Pacific/Auckland');
    await nextTo(page, 'Currency and units');

    // Currency and units: the template's units; no certification bodies step for the generic template
    await expect(page.getByTestId('wizard-unit-mass')).toBeVisible();
    await expect(page.getByRole('progressbar', { name: 'Step 4 of 7' })).toBeVisible();
    await expectLayout(page, 'wizard money');
    await nextTo(page, 'Branding');

    // Branding: Next creates the operator
    await expectAccessible(page, 'wizard branding');
    await pressUntil(page, next(page), () =>
      expect(page.getByRole('heading', { name: 'Review presets' })).toBeVisible({
        timeout: 15_000,
      })
    );

    // Review presets: what the template made, the first vehicle, the link to Setup → Rules
    await expect(page.getByTestId('review-presets')).toBeVisible();
    await expect(page.getByTestId('review-open-rules')).toBeVisible();
    await page.getByTestId('review-vehicle-name').fill('Shuttle 1');
    await pressUntil(page, next(page), () =>
      expect(page.getByText('How many seats does it have?')).toBeVisible({ timeout: 3_000 })
    );
    await page.getByTestId('review-vehicle-registration').fill('S1');
    await page.getByTestId('review-vehicle-capacity').fill('12');
    await expectLayout(page, 'wizard review');
    await expectAccessible(page, 'wizard review');
    await nextTo(page, 'Done');
    await expect(page.getByText(`${name} is ready.`, { exact: false })).toBeVisible();

    // Done: the manifest of the new operator, with its vehicle in Setup
    await press(page, next(page));
    await page.waitForURL(/\/(manifest|today)$/, { timeout: 30_000 });
    await gotoRoute(page, '/configuration/vehicles');
    await expect(page.getByText('Shuttle 1').first()).toBeVisible({ timeout: 20_000 });
    await gotoRoute(page, '/configuration/rules');
    await expect(page.getByTestId('rules-currency')).toBeVisible({ timeout: 20_000 });
  });
});
