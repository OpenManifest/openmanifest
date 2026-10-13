import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
import { expect, gotoRoute, test } from './support/test';

// Configuration screens: floating action buttons stay reachable and nothing overflows
const CONFIGURATION_ROUTES = [
  '/configuration',
  '/configuration/vehicles',
  '/configuration/destinations',
  '/configuration/ticket-types',
  '/ticket-types/extra',
  '/configuration/equipment',
  '/configuration/equipment-inspection',
  '/configuration/permissions',
  '/configuration/basic',
  '/transactions',
  '/daily-log',
  // Weather: the wizard, then its winds and jump run screens
  '/weather',
  '/weather/winds',
  '/weather/jumprun',
];

test.describe('settings @setup', () => {
  for (const route of CONFIGURATION_ROUTES) {
    test(`${route} lays out`, async ({ page }) => {
      await gotoRoute(page, route);
      await page.waitForTimeout(2500);
      expect(new URL(page.url()).pathname).toBe(route);
      await expectLayout(page, route);
      await expectAccessible(page, route);
    });
  }

  test('the destinations are listed, and an altitude reads as thousands of feet', async ({
    page,
  }) => {
    await gotoRoute(page, '/configuration/destinations');
    const list = page.getByTestId('destinations-list');

    await expect(list).toBeVisible();
    await expect(list.getByText('Full altitude')).toBeVisible();
    await expect(list.getByText('14k · 14,000 ft')).toBeVisible();
    await expect(list.getByText('Hop n Pop')).toBeVisible();
    await expect(list.getByText('4k · 4,000 ft')).toBeVisible();
  });

  test('the ticket types show where they go', async ({ page }) => {
    await gotoRoute(page, '/configuration/ticket-types');

    await expect(page.getByText('Altitude', { exact: true })).toBeVisible();
    await expect(page.getByText('14k').first()).toBeVisible();
  });

  test('ticket types follow the dark theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await gotoRoute(page, '/configuration/ticket-types');
    await page.waitForTimeout(2500);
    await expectLayout(page, 'ticket types (dark)');
    await test.info().attach('ticket-types-dark', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
  });

  // The operator setup wizard (reachable for any logged in user)
  test('the setup wizard shows its next button', async ({ page }) => {
    await gotoRoute(page, '/setup');
    await page.waitForTimeout(2500);
    await expectLayout(page, '/setup');
    await expect(page.getByTestId('wizard-next-primary-action')).toBeVisible();
    await expectAccessible(page, '/setup');
  });
});
