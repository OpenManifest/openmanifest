import type { Page } from '@playwright/test';
import { expectAccessible } from './support/a11y';
import { registerNewUser } from './support/api';
import { submitLogin } from './support/auth';
import { expectLayout } from './support/layout';
import { press, pressUntil } from './support/press';
import {
  clearOpenLoads,
  createTripViaApi,
  demoOperator,
  manifestViaApi,
  signIn,
  templateEmail,
} from './support/templates';
import { expect, gotoRoute, test } from './support/test';

// P7.24: the scuba and snorkel templates. A dive centre made in the wizard adds its boat and two sites; the seed's demo
// dive centre runs a two-site trip with certified divers, nitrox and a try diver; the seed's snorkel operator takes a
// child with an adult. Each trip is called, leaves and comes back from the load screen.

test.use({ storageState: { cookies: [], origins: [] } });

const next = (page: Page) => page.getByTestId('wizard-next-primary-action');

async function nextTo(page: Page, heading: string) {
  await pressUntil(page, next(page), () =>
    expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible({
      timeout: 5_000,
    })
  );
}

/** Signs in as a seed user of a template and opens their operator */
async function openAs(page: Page, email: string, operatorName: string) {
  await gotoRoute(page, '/login');
  await submitLogin(page, email);
  const row = page.getByRole('button', { name: operatorName, exact: true });
  await row.waitFor({ timeout: 30_000 });
  await press(page, row);
  await page.waitForURL(/\/(manifest|today)$/, { timeout: 30_000 });
}

/** Calls the load (the first call of the template's schedule), sends it and brings it back, from the load screen */
async function callDepartComplete(page: Page, loadId: string, firstCall: RegExp) {
  await gotoRoute(page, `/loads/${loadId}`);
  const primary = page.getByTestId('load-actions-primary');
  const state = page.getByTestId('load-header-state');
  await expect(primary).toBeVisible({ timeout: 20_000 });
  const call = page.getByRole('radio', { name: firstCall });
  await pressUntil(page, primary, () => expect(call).toBeVisible({ timeout: 4000 }));
  await press(page, call);
  await expect(state).toContainText(/boarding/i, { timeout: 15_000 });
  await pressUntil(page, primary, () =>
    expect(state).toContainText(/at sea|departed/i, { timeout: 5_000 })
  );
  await pressUntil(page, primary, () =>
    expect(state).toContainText(/back|completed/i, { timeout: 5_000 })
  );
}

test.describe('the scuba and snorkel templates @templates', () => {
  test.describe.configure({ timeout: 240_000 });

  test('a dive centre made in the wizard adds its boat and two dive sites @scuba', async ({
    page,
  }) => {
    const name = `Reef ${test.info().project.name} ${Date.now()}`;
    const email = await registerNewUser('Dee Diver');
    await gotoRoute(page, '/login');
    await submitLogin(page, email);
    const create = page.getByTestId('create-operator-primary-action');
    await create.waitFor({ timeout: 30_000 });
    await pressUntil(page, create, () =>
      expect(page.getByRole('heading', { name: 'What do you run?' })).toBeVisible({
        timeout: 5_000,
      })
    );

    // Industry: the dive centre is on the water, with its crew
    const scuba = page.getByTestId('industry-scuba');
    await scuba.scrollIntoViewIfNeeded();
    await pressUntil(page, scuba, () =>
      expect(page.getByTestId('industry-preview')).toBeVisible({ timeout: 3_000 })
    );
    await expect(page.getByTestId('preset-crewRoles')).toContainText(
      'Skipper, Dive supervisor, Divemaster'
    );
    await nextTo(page, 'Name');
    await page.getByTestId('wizard-name').fill(name);
    await nextTo(page, 'Location and time zone');
    await page.getByTestId('wizard-time-zone').fill('Australia/Brisbane');
    await nextTo(page, 'Currency and units');
    await expect(page.getByTestId('wizard-unit-depth')).toBeVisible();

    // The dive agencies it accepts: PADI and SSI
    await pressUntil(page, next(page), () =>
      expect(page.getByRole('checkbox', { name: 'PADI', exact: true })).toBeVisible({
        timeout: 5_000,
      })
    );
    await expect(page.getByRole('checkbox', { name: 'APF', exact: true })).toHaveCount(0);
    for (const agency of ['PADI', 'SSI']) {
      const chip = page.getByRole('checkbox', { name: agency, exact: true });
      // A chip toggles: press again only once the first press has had time to show (a second press undoes it)
      await pressUntil(page, chip, () =>
        expect(chip).toHaveAttribute('aria-checked', 'true', { timeout: 8_000 })
      );
    }
    await expect(page.getByRole('checkbox', { name: 'PADI', exact: true })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await nextTo(page, 'Branding');
    await pressUntil(page, next(page), () =>
      expect(page.getByRole('heading', { name: 'Review presets' })).toBeVisible({
        timeout: 15_000,
      })
    );

    // The boat
    await page.getByTestId('review-vehicle-name').fill('Reef Rover');
    await page.getByTestId('review-vehicle-registration').fill('RR1');
    await page.getByTestId('review-vehicle-capacity').fill('12');
    await nextTo(page, 'Done');
    await press(page, next(page));
    await page.waitForURL(/\/(manifest|today)$/, { timeout: 30_000 });
    await gotoRoute(page, '/configuration/vehicles');
    await expect(page.getByText('Reef Rover').first()).toBeVisible({ timeout: 20_000 });

    // Two sites: a shallow one for anyone, a deep wreck for advanced divers
    await gotoRoute(page, '/configuration/destinations');
    await expect(page.getByText('The wreck').first()).toBeVisible({ timeout: 20_000 });
    await expectLayout(page, 'dive sites');
    for (const [site, depth, level] of [
      ['Turtle bay', '10', null],
      ['Deep wreck', '30', /Advanced Adventurer/],
    ] as const) {
      const add = page.getByTestId('new-destination-primary-action');
      await pressUntil(page, add, () =>
        expect(page.getByTestId('destination-max-depth')).toBeVisible({ timeout: 5_000 })
      );
      await page.getByRole('dialog').getByRole('textbox').first().fill(site);
      await page.getByTestId('destination-max-depth').fill(depth);
      if (level) {
        await press(page, page.getByTestId('destination-min-rank'));
        await press(page, page.getByRole('option', { name: level }));
      }
      if (site === 'Deep wreck') {
        await expectAccessible(page, 'dive site form');
      }
      await pressUntil(page, page.getByTestId('resource-form-save'), () =>
        expect(page.getByTestId('destination-max-depth')).toHaveCount(0, { timeout: 5_000 })
      );
      await expect(page.getByText(site, { exact: true }).first()).toBeVisible({ timeout: 15_000 });
    }

    // The wreck keeps what was chosen
    const wreck = page.getByText('Deep wreck', { exact: true }).first();
    await pressUntil(page, wreck, () =>
      expect(page.getByTestId('destination-max-depth')).toHaveValue('30', { timeout: 5_000 })
    );
    await expect(page.getByTestId('destination-min-rank')).toContainText('Advanced Adventurer');
  });

  test('a dive trip to two sites with certified divers, nitrox and a try diver @scuba', async ({
    page,
  }) => {
    const owner = await signIn(templateEmail('scuba', 'owner'));
    const centre = await demoOperator(owner, 'Coral Bay Dive Centre');
    await clearOpenLoads(owner, centre.id);
    try {
      const trip = await createTripViaApi(
        owner,
        centre.vehicle.id,
        `Two tanks ${test.info().project.name}`,
        [
          { crewRoleId: centre.crew.skipper, membershipId: centre.members['Sandy Skipper'] },
          {
            crewRoleId: centre.crew.dive_supervisor,
            membershipId: centre.members['Dana Divemaster'],
          },
        ],
        [centre.destinations['Coral garden'].id, centre.destinations['The wreck'].id]
      );
      const boatDive = centre.tickets['Double-tank boat dive'].id;
      const fun = centre.activities['Fun dive'].id;

      // An advanced diver with a nitrox card goes, nitrox included
      const advanced = await manifestViaApi(owner, {
        load: trip,
        membership: centre.members['Avery Advanced'],
        ticketType: boatDive,
        activityType: centre.activities['Wreck dive'].id,
        extras: [centre.extras.Nitrox.id],
      });
      expect(advanced.errors).toEqual([]);

      // An open water diver may not go to the 30 m wreck
      const openWater = await manifestViaApi(owner, {
        load: trip,
        membership: centre.members['Owen Openwater'],
        ticketType: boatDive,
        activityType: fun,
      });
      expect(openWater.id).toBeUndefined();
      expect(openWater.errors.join(' ')).toMatch(/missing a certification for The wreck/);

      // Nitrox needs the nitrox qualification: the open water diver has none
      const noNitrox = await manifestViaApi(owner, {
        load: trip,
        membership: centre.members['Owen Openwater'],
        ticketType: centre.tickets['Single-tank boat dive'].id,
        activityType: fun,
        extras: [centre.extras.Nitrox.id],
      });
      expect(noNitrox.id).toBeUndefined();
      expect(noNitrox.errors.join(' ')).toMatch(/missing a certification: qualification/);

      // A try diver comes with the instructor
      const tryDive = await manifestViaApi(owner, {
        load: trip,
        membership: centre.members['Indi Instructor'],
        ticketType: centre.tickets['Try dive'].id,
        activityType: centre.activities['Training dive'].id,
        guests: [{ name: 'Tess Trydive', dateOfBirth: '2010-02-01', bodyMassKg: 45 }],
      });
      expect(tryDive.errors).toEqual([]);

      await openAs(page, templateEmail('scuba', 'owner'), 'Coral Bay Dive Centre');
      await gotoRoute(page, `/loads/${trip}`);
      for (const person of ['Avery Advanced', 'Indi Instructor', 'Tess Trydive']) {
        await expect(page.getByText(person).first()).toBeVisible({ timeout: 20_000 });
      }
      await expect(page.getByText('Owen Openwater')).toHaveCount(0);
      await expectLayout(page, 'dive trip');
      await expectAccessible(page, 'dive trip');
      await callDepartComplete(page, trip, /60 minute/i);
    } finally {
      await clearOpenLoads(owner, centre.id);
    }
  });

  test('a snorkel trip takes a child with an adult @snorkel', async ({ page }) => {
    const owner = await signIn(templateEmail('snorkel', 'owner'));
    const lagoon = await demoOperator(owner, 'Lagoon Snorkel Trips');
    await clearOpenLoads(owner, lagoon.id);
    try {
      const trip = await createTripViaApi(
        owner,
        lagoon.vehicle.id,
        `Reef run ${test.info().project.name}`,
        [{ crewRoleId: lagoon.crew.skipper, membershipId: lagoon.members['Rory Skipper'] }],
        [lagoon.destinations['Inner reef'].id]
      );
      // A snorkeller on their own, and an adult with a child
      const alone = await manifestViaApi(owner, {
        load: trip,
        membership: lagoon.members['Sasha Snorkeller'],
        ticketType: lagoon.tickets['Snorkel trip'].id,
      });
      expect(alone.errors).toEqual([]);
      const family = await manifestViaApi(owner, {
        load: trip,
        membership: lagoon.members['Alex Adult'],
        ticketType: lagoon.tickets['Adult with children'].id,
        guests: [{ name: 'Kit Child', dateOfBirth: '2017-09-12', bodyMassKg: 25 }],
      });
      expect(family.errors).toEqual([]);

      await openAs(page, templateEmail('snorkel', 'owner'), 'Lagoon Snorkel Trips');
      await gotoRoute(page, `/loads/${trip}`);
      for (const person of ['Alex Adult', 'Kit Child', 'Sasha Snorkeller']) {
        await expect(page.getByText(person).first()).toBeVisible({ timeout: 20_000 });
      }
      // No certifications for snorkellers
      await gotoRoute(page, '/configuration');
      await expect(page.getByTestId('setup-vehicles')).toBeVisible({ timeout: 20_000 });
      await expect(page.getByTestId('setup-certificationBodies')).toHaveCount(0);
      await callDepartComplete(page, trip, /60 minute/i);
    } finally {
      await clearOpenLoads(owner, lagoon.id);
    }
  });
});
