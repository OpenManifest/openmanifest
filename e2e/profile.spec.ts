import type { Locator, Page } from '@playwright/test';
import { ownerCall } from './support/api';
import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
import { openAccount } from './support/account';
import { pressUntil } from './support/press';
import { expect, gotoRoute, test } from './support/test';

const WIDE = 1024;
const widthOf = (page: Page) => page.viewportSize()?.width ?? 0;

/** The id of a seed member's membership at the seeded operator */
async function membershipOf(name: string): Promise<string> {
  const found = await ownerCall('{ operators { edges { node { id } } } }');
  const operatorId = Number(found.json.data.operators.edges[0].node.id);
  const members = await ownerCall(
    `{ memberships(operator: ${operatorId}, first: 5, search: "${name}") { edges { node { id } } } }`
  );
  return members.json.data.memberships.edges[0].node.id;
}

/** Brings a control of the profile into view (the sections run below the fold on a phone) and presses it until `done` */
async function pressInView(page: Page, locator: Locator, done: () => Promise<unknown>) {
  await locator.scrollIntoViewIfNeeded();
  await pressUntil(page, locator, done);
}

/** Opens a profile and waits for its sections */
async function openProfile(page: Page, id: string) {
  await gotoRoute(page, `/user/${id}`);
  await expect(page.getByTestId('profile-summary')).toBeVisible({ timeout: 20_000 });
}

/** Every section of the profile is there, in one column on a phone and two on a wide window */
async function expectSections(page: Page) {
  for (const section of [
    'profile-summary',
    'profile-ready',
    'profile-loads',
    'profile-funds',
    'profile-certifications',
    'profile-equipment',
    'profile-membership',
  ]) {
    await expect(page.getByTestId(section), `${section} is missing`).toBeVisible();
  }
  if (widthOf(page) >= WIDE) {
    await expect(page.getByTestId('profile-column-main')).toBeVisible();
    await expect(page.getByTestId('profile-column-side')).toBeVisible();
    // Side by side: the loads start beside the summary, not under it
    const summary = await page.getByTestId('profile-summary').boundingBox();
    const loads = await page.getByTestId('profile-loads').boundingBox();
    expect(loads!.x).toBeGreaterThan(summary!.x + summary!.width - 1);
  } else {
    await expect(page.getByTestId('profile-column-main')).toHaveCount(0);
  }
}

// The member profile (U5.2): summary and readiness with fixes, loads, funds, certifications, equipment and membership
test.describe('profile @profile', () => {
  // The signed in user's own profile, through the account screen
  test('own profile opens from the account screen', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    await openAccount(page);
    await page.getByTestId('account-profile').click();
    await expect(page.getByTestId('profile-summary')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Olive Owner').locator('visible=true').first()).toBeVisible();
    await expectLayout(page, 'profile');
    await expectAccessible(page, 'profile');
  });
});

test.describe('profile as a jumper @profile', () => {
  test.use({ role: 'jumper' });

  test('a fun jumper reaches their own profile', async ({ page }) => {
    await gotoRoute(page, '/manifest');
    await openAccount(page);
    await page.getByTestId('account-profile').click();
    await expect(page.getByTestId('profile-summary')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Jo Jumper').locator('visible=true').first()).toBeVisible();
    await expectLayout(page, 'profile (jumper)');
  });

  test('shows their sections, their own actions and none of the office', async ({ page }) => {
    await openProfile(page, await membershipOf('Jo Jumper'));

    await expectSections(page);
    await expect(page.getByTestId('profile-summary-name')).toHaveText('Jo Jumper');
    await expect(page.getByTestId('profile-summary-role')).toContainText('Fun Jumper');
    await expect(page.getByTestId('profile-summary-status')).toBeVisible();
    await expect(page.getByTestId('profile-funds-amount')).toContainText('$');
    // Membership dates are words, never 01/02/27
    await expect(page.getByTestId('profile-membership-expires-value')).toHaveText(
      /^(\d{1,2} [A-Z][a-z]{2} \d{4}|Not a member)$/
    );
    // Their own: details and equipment; the office's: none
    await expect(page.getByTestId('profile-summary-edit')).toBeVisible();
    await expect(page.getByTestId('profile-add-equipment')).toBeVisible();
    await expect(page.getByTestId('profile-funds-add')).toHaveCount(0);
    await expect(page.getByTestId('profile-funds-transactions')).toHaveCount(0);
    await expect(page.getByTestId('profile-membership-edit')).toHaveCount(0);
    await expectLayout(page, 'profile (jumper)');
    await expectAccessible(page, 'profile (jumper)');

    // Their credit is in their wallet
    await pressInView(page, page.getByTestId('profile-funds-wallet'), () =>
      expect(page).toHaveURL(/\/wallet$/, { timeout: 5000 })
    );
    await expect(page.getByTestId('wallet-balance')).toBeVisible({ timeout: 20_000 });
  });

  test('edits their own details in the form, and closes it', async ({ page }) => {
    await openProfile(page, await membershipOf('Jo Jumper'));

    const dialog = page.getByTestId('form-dialog');
    await pressInView(page, page.getByTestId('profile-summary-edit'), () =>
      expect(dialog).toBeVisible({ timeout: 5000 })
    );
    await expect(dialog.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue(
      'Jo Jumper'
    );
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});

// A member's own profile is theirs even without the right to read people (U4.5)
test.describe('profile as a student @profile', () => {
  test.use({ role: 'student' });

  test('opens their own profile with their readiness, loads and wallet', async ({ page }) => {
    await openProfile(page, await membershipOf('Stu Student'));

    await expect(page.getByTestId('no-access')).toHaveCount(0);
    await expectSections(page);
    await expect(page.getByTestId('profile-summary-name')).toHaveText('Stu Student');
    await expect(page.getByTestId('profile-ready')).toContainText('Ready to fly?');
    await expect(page.getByTestId('profile-funds-wallet')).toBeVisible();
    // A student may not add equipment or touch the office's parts
    await expect(page.getByTestId('profile-add-equipment')).toHaveCount(0);
    await expect(page.getByTestId('profile-funds-add')).toHaveCount(0);
    await expect(page.getByTestId('profile-membership-edit')).toHaveCount(0);
    await expect(page.getByTestId('profile-summary-edit')).toBeVisible();
    await expectLayout(page, 'profile (student)');
    await expectAccessible(page, 'profile (student)');
  });
});

test.describe('a member’s profile as the manifest desk @profile', () => {
  test.use({ role: 'manager' });

  test('opens from People and shows the member with the office’s actions', async ({ page }) => {
    await gotoRoute(page, '/users');
    await page.getByTestId('people-search').fill('Jo Jumper');
    const row = page.getByTestId('people-row').filter({ hasText: 'Jo Jumper' });
    await expect(row).toHaveCount(1, { timeout: 15_000 });
    const open = page.getByRole('menuitem', { name: 'Open profile' });
    await pressUntil(page, page.getByRole('button', { name: 'Actions for Jo Jumper' }), () =>
      expect(open).toBeVisible({ timeout: 4000 })
    );
    await open.click();

    await expect(page).toHaveURL(/\/user\/\d+$/, { timeout: 20_000 });
    await expect(page.getByTestId('profile-summary-name')).toHaveText('Jo Jumper', {
      timeout: 20_000,
    });
    await expectSections(page);
    await expect(page.getByTestId('profile-ready')).toContainText('Is Jo Jumper ready?');
    for (const action of [
      'profile-funds-add',
      'profile-funds-transactions',
      'profile-membership-edit',
      'profile-add-equipment',
      'profile-summary-edit',
    ]) {
      await expect(page.getByTestId(action), `${action} is missing`).toBeVisible();
    }
    // The wallet is the member's own: the desk has Money
    await expect(page.getByTestId('profile-funds-wallet')).toHaveCount(0);
    await expectLayout(page, 'profile (desk)');
    await expectAccessible(page, 'profile (desk)');
  });

  test('adds credit with the credits sheet', async ({ page }) => {
    await openProfile(page, await membershipOf('Jo Jumper'));

    const sheet = page.getByTestId('credits-sheet');
    await pressInView(page, page.getByTestId('profile-funds-add'), () =>
      expect(sheet).toBeVisible({ timeout: 5000 })
    );
    await expect(page.getByRole('dialog', { name: 'Funds' })).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
  });

  test('edits the membership with the acting permissions, and adds equipment (UB.2)', async ({
    page,
  }) => {
    await openProfile(page, await membershipOf('Jo Jumper'));

    // The dialog element itself has no box on the web (its content is fixed): look at what is in it
    const membership = page.getByRole('dialog', { name: 'Edit dropzone user' });
    const pilot = membership.getByRole('checkbox', { name: 'Pilot' });
    await pressInView(page, page.getByTestId('profile-membership-edit'), () =>
      expect(pilot).toBeVisible({ timeout: 5000 })
    );
    // The desk may grant and revoke: one switch each, none on for a fun jumper
    await expect(pilot).toHaveAttribute('aria-checked', 'false');
    await page.keyboard.press('Escape');
    await expect(membership).toHaveCount(0);

    const form = page.getByTestId('form-dialog');
    await pressInView(page, page.getByTestId('profile-add-equipment'), () =>
      expect(form).toBeVisible({ timeout: 5000 })
    );
    await expect(page.getByRole('dialog', { name: /^New / })).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(form).toBeHidden();
  });

  test('the old equipment page of a member is the profile’s section', async ({ page }) => {
    await gotoRoute(page, `/user/${await membershipOf('Jo Jumper')}/equipment`);

    await expect(page.getByTestId('profile-equipment')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('profile-add-equipment')).toBeVisible();
    await expectAccessible(page, 'profile equipment');
  });
});
