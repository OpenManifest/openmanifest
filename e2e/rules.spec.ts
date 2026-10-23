import { keepOnFirstLoadViaApi, ownerCall, setSelfManifestViaApi } from './support/api';
import { expectAccessible } from './support/a11y';
import { claim } from './support/claims';
import { expectLayout } from './support/layout';
import { press, pressUntil } from './support/press';
import { authFile } from './support/roles';
import type { Page } from '@playwright/test';
import { expect, gotoRoute, test } from './support/test';

const SELF_MANIFEST = 'Members can book themselves on loads';

async function selfManifestInApi(): Promise<boolean> {
  const { json } = await ownerCall(
    '{ operators { edges { node { settings { allowSelfManifest } } } } }'
  );
  return json.data.operators.edges[0].node.settings.allowSelfManifest;
}

/** Flips the self-manifesting switch of the Rules page and saves */
async function switchSelfManifest(page: Page, to: boolean) {
  const toggle = page.getByRole('switch', { name: SELF_MANIFEST });
  await expect(toggle).toHaveAttribute('aria-checked', String(!to), { timeout: 20_000 });
  await pressUntil(page, toggle, () =>
    expect(toggle).toHaveAttribute('aria-checked', String(to), { timeout: 3000 })
  );
  const save = page.getByTestId('rules-save-primary-action');
  await press(page, save);
  // Saved: the operator now has the value, so nothing is left to save
  await expect(save).toHaveCount(0, { timeout: 15_000 });
  await expect.poll(selfManifestInApi, { timeout: 10_000 }).toBe(to);
}

// Setup in three groups and the Rules page (U5.3)
test.describe('setup and rules @setup', () => {
  test('setup lists its three groups and opens the rules', async ({ page }) => {
    await gotoRoute(page, '/configuration');
    for (const group of ['Operations', 'People and access', 'Business']) {
      await expect(page.getByRole('heading', { name: group, exact: true })).toBeVisible();
    }
    // Business is below the fold on a phone
    const rules = page.getByRole('button', { name: 'Rules', exact: true });
    await rules.scrollIntoViewIfNeeded();
    await pressUntil(page, rules, () =>
      expect(page).toHaveURL(/\/configuration\/rules$/, { timeout: 5000 })
    );
    await expect(page.getByRole('switch', { name: SELF_MANIFEST })).toBeVisible({
      timeout: 20_000,
    });
    // On a wide window the list stays beside the page, with Rules as the current entry
    if ((page.viewportSize()?.width ?? 0) >= 1024) {
      const sidebar = page.getByTestId('setup-sidebar');
      await expect(sidebar).toBeVisible();
      await expect(sidebar.getByTestId('setup-rules')).toHaveAttribute('aria-current', 'true');
    }
  });

  test('the rules page lays out with its sections', async ({ page }) => {
    await gotoRoute(page, '/configuration/rules');
    await expect(page.getByTestId('rules-modules')).toBeVisible({ timeout: 20_000 });
    for (const section of [
      'Booking',
      'Who can fly',
      'Boarding calls',
      'Units and money',
      'Modules',
    ]) {
      await expect(page.getByRole('heading', { name: section, exact: true })).toBeVisible();
    }
    await expect(page.getByTestId('call-schedule-call-20')).toBeVisible();
    await expect(page.getByRole('switch', { name: 'Destinations', exact: true })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expectLayout(page, '/configuration/rules');
    await expectAccessible(page, '/configuration/rules');
  });

  test('with self-manifesting off, a member is sent to the manifest desk', async ({
    page,
    browser,
    baseURL,
  }) => {
    // The operator is shared with every spec: the switch goes back on in the `finally`, whatever happens
    await claim('Jo Jumper');
    expect(await keepOnFirstLoadViaApi('Jo Jumper')).toBe(true);
    try {
      await gotoRoute(page, '/configuration/rules');
      await switchSelfManifest(page, false);

      const context = await browser.newContext({
        baseURL,
        storageState: authFile('jumper'),
        viewport: page.viewportSize() ?? undefined,
        timezoneId: 'Australia/Brisbane',
      });
      try {
        const jumper = await context.newPage();
        await gotoRoute(jumper, '/today');
        await expect(jumper.getByTestId('today-next-load')).toBeVisible({ timeout: 20_000 });
        await expect(jumper.getByTestId('today-next-load-desk')).toBeVisible();
        await expect(jumper.getByTestId('today-next-load-take-off')).toHaveCount(0);
        await expect(jumper.getByTestId('today-book')).toHaveCount(0);
      } finally {
        await context.close();
      }

      // And back on through the page
      await gotoRoute(page, '/configuration/rules');
      await switchSelfManifest(page, true);
    } finally {
      expect(await setSelfManifestViaApi(true)).toBe(true);
    }
  });
});
