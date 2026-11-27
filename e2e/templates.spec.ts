import type { Page } from '@playwright/test';
import { expectAccessible } from './support/a11y';
import { registerNewUser } from './support/api';
import { submitLogin } from './support/auth';
import { expectLayout } from './support/layout';
import { press, pressUntil } from './support/press';
import {
  clearOpenLoads,
  createTripViaApi,
  deleteSlotViaApi,
  demoOperator,
  manifestViaApi,
  signIn,
  templateEmail,
} from './support/templates';
import { expect, gotoRoute, test } from './support/test';

// P7.27 adds tandem paragliding (three passengers fly with three rated pilots on one shuttle run; a fourth has no pilot
// left: the driver holds no rating and a pilot takes one passenger) and parasailing (a triple flight over its combined
// body mass is kept off and the three fly as a tandem and a solo).
// P7.26 adds scenic flights (a passenger over the helicopter's payload is kept off; the flight's times are in the flight
// log) and balloons (a flight with its chase vehicle and chase crew, called, in flight and landed, with its times and
// both vehicles' crew in the flight log).
// P7.25 adds whale watching (a trip with adults and a child, completed, the passenger list exported as CSV) and the
// fishing charter (an angler without a licence is kept off the adult ticket and taken on the licence-included one).
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
async function callDepartComplete(
  page: Page,
  loadId: string,
  firstCall: RegExp,
  states: { departed: RegExp; completed: RegExp } = {
    departed: /at sea|departed/i,
    completed: /back|completed/i,
  }
) {
  await gotoRoute(page, `/loads/${loadId}`);
  const primary = page.getByTestId('load-actions-primary');
  const state = page.getByTestId('load-header-state');
  await expect(primary).toBeVisible({ timeout: 20_000 });
  const call = page.getByRole('radio', { name: firstCall });
  await pressUntil(page, primary, () => expect(call).toBeVisible({ timeout: 4000 }));
  await press(page, call);
  await expect(state).toContainText(/boarding/i, { timeout: 15_000 });
  await pressUntil(page, primary, () =>
    expect(state).toContainText(states.departed, { timeout: 5_000 })
  );
  await pressUntil(page, primary, () =>
    expect(state).toContainText(states.completed, { timeout: 5_000 })
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

test.describe('the whale-watching and fishing-charter templates @templates', () => {
  test.describe.configure({ timeout: 240_000 });
  // The passenger list is of the operator's day: the browser is where the demo operators are
  test.use({ timezoneId: 'Australia/Brisbane' });

  test('a whale-watching trip with adults and a child, completed, its passenger list exported @whale', async ({
    page,
  }) => {
    const owner = await signIn(templateEmail('whale_watching', 'owner'));
    const whales = await demoOperator(owner, 'Humpback Bay Whale Watch');
    await clearOpenLoads(owner, whales.id);
    try {
      const trip = await createTripViaApi(
        owner,
        whales.vehicle.id,
        `Humpbacks ${test.info().project.name}`,
        [
          { crewRoleId: whales.crew.skipper, membershipId: whales.members['Skye Skipper'] },
          { crewRoleId: whales.crew.naturalist, membershipId: whales.members['Nina Naturalist'] },
        ],
        [whales.destinations['Bay run'].id]
      );
      const adult = await manifestViaApi(owner, {
        load: trip,
        membership: whales.members['Wren Watcher'],
        ticketType: whales.tickets.Adult.id,
      });
      expect(adult.errors).toEqual([]);
      const family = await manifestViaApi(owner, {
        load: trip,
        membership: whales.members['Morgan Parent'],
        ticketType: whales.tickets['Adult with child'].id,
        guests: [{ name: 'Charlie Child', dateOfBirth: '2018-04-04', bodyMassKg: 22 }],
      });
      expect(family.errors).toEqual([]);

      await openAs(page, templateEmail('whale_watching', 'owner'), 'Humpback Bay Whale Watch');
      await gotoRoute(page, `/loads/${trip}`);
      for (const person of ['Wren Watcher', 'Morgan Parent', 'Charlie Child']) {
        await expect(page.getByText(person).first()).toBeVisible({ timeout: 20_000 });
      }
      await callDepartComplete(page, trip, /30 minute/i);

      // The passenger list: the trip's crew, everyone on it with whom to call, and the day as CSV
      await gotoRoute(page, '/daily-log');
      const section = page.getByTestId(`daily-log-load-${trip}`);
      await expect(section).toBeVisible({ timeout: 20_000 });
      await expect(section).toContainText('Nina Naturalist');
      await expect(section).toContainText('Emergency contact: Rob Watcher 0400 111 222');
      // The child has the adult's
      await expect(section).toContainText('With adult Morgan Parent');
      await expectLayout(page, 'passenger list');
      await expectAccessible(page, 'passenger list');
      const exportButton = page.getByRole('button', { name: 'Export the passenger list as CSV' });
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 20_000 }),
        press(page, exportButton),
      ]);
      expect(download.suggestedFilename()).toMatch(/^passenger-list-\d{4}-\d{2}-\d{2}\.csv$/);
      const csv = await (await download.createReadStream()).toArray();
      const text = Buffer.concat(csv).toString('utf8');
      expect(text).toContain(
        'Trip,Departure,Name,Phone,Email,Emergency contact,Ticket,With (adult)'
      );
      expect(text).toMatch(
        /Charlie Child,.*Morgan Parent 0400000000,Adult with child,Morgan Parent/
      );
      expect(text).toContain('Wren Watcher');
    } finally {
      await clearOpenLoads(owner, whales.id);
    }
  });

  test('a fishing charter keeps an angler without a licence off the adult ticket @fishing', async ({
    page,
  }) => {
    const owner = await signIn(templateEmail('fishing_charter', 'owner'));
    const charter = await demoOperator(owner, 'Reef & Reel Charters');
    await clearOpenLoads(owner, charter.id);
    try {
      const trip = await createTripViaApi(
        owner,
        charter.vehicle.id,
        `Reef run ${test.info().project.name}`,
        [{ crewRoleId: charter.crew.skipper, membershipId: charter.members['Cody Skipper'] }],
        [charter.destinations['Offshore grounds'].id]
      );
      const rod = charter.extras['Rod and reel hire'].id;
      const licensed = await manifestViaApi(owner, {
        load: trip,
        membership: charter.members['Lee Licensed'],
        ticketType: charter.tickets.Adult.id,
        extras: [rod],
      });
      expect(licensed.errors).toEqual([]);

      const blocked = await manifestViaApi(owner, {
        load: trip,
        membership: charter.members['Nico Nolicence'],
        ticketType: charter.tickets.Adult.id,
      });
      expect(blocked.id).toBeUndefined();
      expect(blocked.errors.join(' ')).toMatch(/missing a certification: qualification/);

      const included = await manifestViaApi(owner, {
        load: trip,
        membership: charter.members['Nico Nolicence'],
        ticketType: charter.tickets['Adult, licence included'].id,
        extras: [rod],
      });
      expect(included.errors).toEqual([]);

      await openAs(page, templateEmail('fishing_charter', 'owner'), 'Reef & Reel Charters');
      await gotoRoute(page, `/loads/${trip}`);
      for (const person of ['Lee Licensed', 'Nico Nolicence']) {
        await expect(page.getByText(person).first()).toBeVisible({ timeout: 20_000 });
      }
      await expectLayout(page, 'fishing charter');
      await expectAccessible(page, 'fishing charter');
      await callDepartComplete(page, trip, /30 minute/i);
    } finally {
      await clearOpenLoads(owner, charter.id);
    }
  });
});

const AVIATION_STATES = { departed: /in flight/i, completed: /landed/i };

test.describe('the scenic-flight and hot-air-balloon templates @templates', () => {
  test.describe.configure({ timeout: 240_000 });
  // The flight log is of the operator's day: the browser is where the demo operators are
  test.use({ timezoneId: 'Australia/Brisbane' });

  test('a scenic flight keeps a passenger over the payload off and logs its times @scenic', async ({
    page,
  }) => {
    const owner = await signIn(templateEmail('scenic_flights', 'owner'));
    const scenic = await demoOperator(owner, 'Harbour Scenic Flights');
    await clearOpenLoads(owner, scenic.id);
    try {
      const helicopter = scenic.vehicles.Kestrel.id;
      const flight = await createTripViaApi(
        owner,
        helicopter,
        `Coast ${test.info().project.name}`,
        [
          {
            crewRoleId: scenic.crew.pilot,
            membershipId: scenic.members['Hollis Pilot'],
            vehicleId: helicopter,
          },
        ],
        [scenic.destinations['Coastal loop'].id]
      );
      const adult = scenic.tickets.Adult.id;
      // The helicopter carries 300 kg: the pilot (75) and two passengers (110, 100) leave 15
      for (const [name, bodyMassKg] of [
        ['Tara Tourist', 110],
        ['Vic Visitor', 100],
      ] as const) {
        const seated = await manifestViaApi(owner, {
          load: flight,
          membership: scenic.members[name],
          ticketType: adult,
          bodyMassKg,
        });
        expect(seated.errors).toEqual([]);
      }
      const over = await manifestViaApi(owner, {
        load: flight,
        membership: scenic.members['Quinn Sightseer'],
        ticketType: adult,
        bodyMassKg: 60,
      });
      expect(over.id).toBeUndefined();
      expect(over.errors.join(' ')).toMatch(/can carry at most 300/);

      await openAs(page, templateEmail('scenic_flights', 'owner'), 'Harbour Scenic Flights');
      // The operator flies two kinds of aircraft: each vehicle says which
      await gotoRoute(page, '/configuration/vehicles');
      await expect(page.getByText('Helicopter').first()).toBeVisible({ timeout: 20_000 });
      await expect(page.getByText('Aeroplane').first()).toBeVisible();

      await gotoRoute(page, `/loads/${flight}`);
      for (const person of ['Tara Tourist', 'Vic Visitor']) {
        await expect(page.getByText(person).first()).toBeVisible({ timeout: 20_000 });
      }
      await expect(page.getByText('Quinn Sightseer')).toHaveCount(0);
      await expectLayout(page, 'scenic flight');
      await expectAccessible(page, 'scenic flight');
      await callDepartComplete(page, flight, /30 minute/i, AVIATION_STATES);

      await gotoRoute(page, '/daily-log');
      const section = page.getByTestId(`daily-log-load-${flight}`);
      await expect(section).toBeVisible({ timeout: 20_000 });
      await expect(page.getByTestId(`daily-log-load-${flight}-departed-value`)).toHaveText(
        /^\d{2}:\d{2}$/
      );
      await expect(page.getByTestId(`daily-log-load-${flight}-duration-value`)).toHaveText(
        /\d+ minutes?/
      );
      await expect(section).toContainText('Hollis Pilot');
      await expect(section).toContainText('Kestrel SF-101');
    } finally {
      await clearOpenLoads(owner, scenic.id);
    }
  });

  test('a balloon flight with its chase vehicle and crew, in flight and landed, in the flight log @balloon', async ({
    page,
  }) => {
    const owner = await signIn(templateEmail('hot_air_balloon', 'owner'));
    const balloons = await demoOperator(owner, 'Valley Dawn Balloons');
    await clearOpenLoads(owner, balloons.id);
    try {
      const balloon = balloons.vehicles.Sunrise.id;
      const chase = balloons.vehicles['Chase One'].id;
      const flight = await createTripViaApi(
        owner,
        balloon,
        `Dawn ${test.info().project.name}`,
        [
          {
            crewRoleId: balloons.crew.pilot,
            membershipId: balloons.members['Aria Pilot'],
            vehicleId: balloon,
          },
          {
            crewRoleId: balloons.crew.chase_crew,
            membershipId: balloons.members['Cole Chaser'],
            vehicleId: chase,
          },
        ],
        [balloons.destinations['Valley field'].id],
        [chase]
      );
      // A child under the template's minimum age stays on the ground; one over it flies with the adult
      const young = await manifestViaApi(owner, {
        load: flight,
        membership: balloons.members['Fay Flyer'],
        ticketType: balloons.tickets['Adult with child'].id,
        guests: [{ name: 'Tiny Tot', dateOfBirth: '2022-01-01', bodyMassKg: 18 }],
      });
      expect(young.errors.join(' ')).toMatch(/at least 8 years old/);
      const family = await manifestViaApi(owner, {
        load: flight,
        membership: balloons.members['Fay Flyer'],
        ticketType: balloons.tickets['Adult with child'].id,
        guests: [{ name: 'Ivy Young', dateOfBirth: '2015-06-21', bodyMassKg: 34 }],
      });
      expect(family.errors).toEqual([]);
      const adult = await manifestViaApi(owner, {
        load: flight,
        membership: balloons.members['Hugo Highfield'],
        ticketType: balloons.tickets.Adult.id,
      });
      expect(adult.errors).toEqual([]);

      await openAs(page, templateEmail('hot_air_balloon', 'owner'), 'Valley Dawn Balloons');
      await gotoRoute(page, `/loads/${flight}`);
      for (const person of ['Fay Flyer', 'Ivy Young', 'Hugo Highfield', 'Cole Chaser']) {
        await expect(page.getByText(person).first()).toBeVisible({ timeout: 20_000 });
      }
      await expectLayout(page, 'balloon flight');
      await expectAccessible(page, 'balloon flight');
      await callDepartComplete(page, flight, /60 minute/i, AVIATION_STATES);

      await gotoRoute(page, '/daily-log');
      const section = page.getByTestId(`daily-log-load-${flight}`);
      await expect(section).toBeVisible({ timeout: 20_000 });
      await expect(page.getByTestId(`daily-log-load-${flight}-departed-value`)).toHaveText(
        /^\d{2}:\d{2}$/
      );
      await expect(page.getByTestId(`daily-log-load-${flight}-back-value`)).toHaveText(
        /^\d{2}:\d{2}$/
      );
      await expect(section).toContainText('Sunrise HB-201');
      await expect(section).toContainText('Chase One HB-202');
      await expect(section).toContainText('Chase crew · Chase One');
      await expect(section).toContainText('Cole Chaser');
      await expect(page.getByTestId(`daily-log-load-${flight}-count-value`)).toHaveText('3');
      await expectLayout(page, 'flight log');
      await expectAccessible(page, 'flight log');
    } finally {
      await clearOpenLoads(owner, balloons.id);
    }
  });
});

test.describe('the tandem-paragliding and parasailing templates @templates', () => {
  test.describe.configure({ timeout: 240_000 });
  // The flight log and the passenger list are of the operator's day: the browser is where the demo operators are
  test.use({ timezoneId: 'Australia/Brisbane' });

  test('three passengers with three tandem pilots on one run, a fourth without a pilot @paragliding', async ({
    page,
  }) => {
    const owner = await signIn(templateEmail('tandem_paragliding', 'owner'));
    const tandems = await demoOperator(owner, 'Ridge Lift Tandems');
    await clearOpenLoads(owner, tandems.id);
    try {
      const van = tandems.vehicles['Shuttle One'].id;
      const run = await createTripViaApi(
        owner,
        van,
        `Ridge ${test.info().project.name}`,
        [
          {
            crewRoleId: tandems.crew.driver,
            membershipId: tandems.members['Dev Driver'],
            vehicleId: van,
          },
        ],
        [tandems.destinations['North launch'].id]
      );
      const tandem = tandems.tickets['Tandem flight'].id;
      const pairs = [
        ['Rhea Ridge', { name: 'Ana Airborne', dateOfBirth: '1994-03-03', bodyMassKg: 62 }],
        ['Theo Thermal', { name: 'Ben Breeze', dateOfBirth: '1987-12-12', bodyMassKg: 88 }],
        ['Wren Wingover', { name: 'Cam Cloud', dateOfBirth: '2014-08-08', bodyMassKg: 38 }],
      ] as const;
      for (const [pilot, passenger] of pairs) {
        const flown = await manifestViaApi(owner, {
          load: run,
          membership: tandems.members[pilot],
          ticketType: tandem,
          guests: [passenger],
        });
        expect(flown.errors).toEqual([]);
      }
      // The fourth passenger: the driver holds no tandem rating, and a pilot flies one passenger at a time
      const fourth = { name: 'Dot Drift', dateOfBirth: '1999-05-15', bodyMassKg: 70 };
      const withDriver = await manifestViaApi(owner, {
        load: run,
        membership: tandems.members['Dev Driver'],
        ticketType: tandem,
        guests: [fourth],
      });
      expect(withDriver.id).toBeUndefined();
      expect(withDriver.errors.join(' ')).toMatch(
        /Dev Driver cannot escort guests: missing qualification/
      );
      const twoAtOnce = await manifestViaApi(owner, {
        load: run,
        membership: tandems.members['Rhea Ridge'],
        ticketType: tandem,
        guests: [pairs[0][1], fourth],
      });
      expect(twoAtOnce.errors.join(' ')).toMatch(/takes at most 1 guest for each escort/);

      await openAs(page, templateEmail('tandem_paragliding', 'owner'), 'Ridge Lift Tandems');
      await gotoRoute(page, `/loads/${run}`);
      for (const [pilot, passenger] of pairs) {
        await expect(page.getByText(pilot).first()).toBeVisible({ timeout: 20_000 });
        await expect(page.getByText(passenger.name).first()).toBeVisible();
      }
      await expect(page.getByText('Dot Drift')).toHaveCount(0);
      await expectLayout(page, 'shuttle run');
      await expectAccessible(page, 'shuttle run');
      await callDepartComplete(page, run, /30 minute/i, AVIATION_STATES);

      await gotoRoute(page, '/daily-log');
      const section = page.getByTestId(`daily-log-load-${run}`);
      await expect(section).toBeVisible({ timeout: 20_000 });
      await expect(section).toContainText('Shuttle One PG-301');
      await expect(section).toContainText('Dev Driver');
      await expect(page.getByTestId(`daily-log-load-${run}-count-value`)).toHaveText('6');
    } finally {
      await clearOpenLoads(owner, tandems.id);
    }
  });

  test('a triple flight over its weight is kept off and flies as a tandem and a solo @parasailing', async ({
    page,
  }) => {
    const owner = await signIn(templateEmail('parasailing', 'owner'));
    const parasail = await demoOperator(owner, 'Bayside Parasail');
    await clearOpenLoads(owner, parasail.id);
    try {
      const trip = await createTripViaApi(
        owner,
        parasail.vehicle.id,
        `Bay ${test.info().project.name}`,
        [
          { crewRoleId: parasail.crew.captain, membershipId: parasail.members['Cora Captain'] },
          {
            crewRoleId: parasail.crew.winch_operator,
            membershipId: parasail.members['Will Winch'],
          },
        ],
        []
      );
      const flyers = [
        ['Fran Flyer', 85],
        ['Hal Heavy', 95],
        ['Kai Kite', 60],
      ] as const;
      const fly = (index: number, ticket: string, groupNumber: number) =>
        manifestViaApi(owner, {
          load: trip,
          membership: parasail.members[flyers[index][0]],
          ticketType: parasail.tickets[ticket].id,
          bodyMassKg: flyers[index][1],
          groupNumber,
        });

      // 85 + 95 + 60 = 240 kg: over the triple flight's 225
      const first = await fly(0, 'Triple flight', 1);
      const second = await fly(1, 'Triple flight', 1);
      expect([...first.errors, ...second.errors]).toEqual([]);
      const third = await fly(2, 'Triple flight', 1);
      expect(third.id).toBeUndefined();
      expect(third.errors.join(' ')).toMatch(/A flight group can weigh at most 225/);

      // The two heavier flyers go as a tandem, the third alone
      await deleteSlotViaApi(owner, first.id!);
      await deleteSlotViaApi(owner, second.id!);
      for (const [index, ticket, group] of [
        [0, 'Tandem flight', 2],
        [1, 'Tandem flight', 2],
        [2, 'Solo flight', 3],
      ] as const) {
        const flown = await fly(index, ticket, group);
        expect(flown.errors).toEqual([]);
      }

      await openAs(page, templateEmail('parasailing', 'owner'), 'Bayside Parasail');
      await gotoRoute(page, `/loads/${trip}`);
      for (const [name] of flyers) {
        await expect(page.getByText(name).first()).toBeVisible({ timeout: 20_000 });
      }
      await expectLayout(page, 'parasail trip');
      await expectAccessible(page, 'parasail trip');
      await callDepartComplete(page, trip, /30 minute/i);

      await gotoRoute(page, '/daily-log');
      const section = page.getByTestId(`daily-log-load-${trip}`);
      await expect(section).toBeVisible({ timeout: 20_000 });
      await expect(section).toContainText('Will Winch');
      await expect(section).toContainText('Emergency contact: Ida Heavy 0400 343 434');
      await expect(section).toContainText('Solo flight');
    } finally {
      await clearOpenLoads(owner, parasail.id);
    }
  });
});
