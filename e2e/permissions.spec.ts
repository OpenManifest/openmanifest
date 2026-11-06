import type { Page } from '@playwright/test';
import { expectAccessible } from './support/a11y';
import { ownerCall } from './support/api';
import { expectLayout } from './support/layout';
import { pressUntil } from './support/press';
import { expect, gotoRoute, test } from './support/test';

// Roles and permissions (U5.6): a matrix of roles × permissions on a wide window, one role at a time on a phone. Each
// switch is named "<role>: <permission>". The specs switch a permission the seed's students lack, and put it back.

const ROUTE = '/configuration/permissions';
const ROLE = 'Student';
const PERMISSION = 'readPackjob';
const SWITCH = 'Student: See pack jobs';

const isWide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

async function studentHolds(): Promise<boolean> {
  const { json } = await ownerCall(`query { operator(id: 1) { roles { name permissions } } }`);
  const role = json.data.operator.roles.find((r: { name: string }) => r.name === 'student');
  return role.permissions.includes(PERMISSION);
}

async function setStudent(enabled: boolean) {
  const { json } = await ownerCall(`query { operator(id: 1) { roles { id name } } }`);
  const role = json.data.operator.roles.find((r: { name: string }) => r.name === 'student');
  await ownerCall(
    `mutation($id: Int!, $enabled: Boolean!) { updateRole(input: { id: $id, permission: "${PERMISSION}", enabled: $enabled }) { errors } }`,
    { id: Number(role.id), enabled }
  );
}

/** Opens the screen; on a phone the student role is chosen first */
async function openStudent(page: Page) {
  await gotoRoute(page, ROUTE);
  await expect(
    page.getByTestId(isWide(page) ? 'permissions-matrix-mode' : 'permissions-list-mode')
  ).toBeVisible();
  if (!isWide(page)) {
    const select = page.getByRole('combobox', { name: 'Role' });
    await select.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.type(ROLE);
    await expect(page.getByRole('option', { name: ROLE, exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(select).toContainText(ROLE);
  }
  const toggle = page.getByRole('switch', { name: SWITCH, exact: true });
  await toggle.scrollIntoViewIfNeeded();
  return toggle;
}

test.describe('permissions @permissions', () => {
  test.beforeEach(async () => {
    if (await studentHolds()) await setStudent(false);
  });
  test.afterEach(async () => {
    if (await studentHolds()) await setStudent(false);
  });

  test('lays out, as a matrix on a wide window and one role at a time on a phone', async ({
    page,
  }) => {
    await gotoRoute(page, ROUTE);
    expect(new URL(page.url()).pathname).toBe(ROUTE);
    await expect(
      page.getByTestId(isWide(page) ? 'permissions-matrix-mode' : 'permissions-list-mode')
    ).toBeVisible();
    // Every role's switch for one permission is there in the matrix; one role's on a phone
    await expect(page.getByRole('switch', { name: /: See pack jobs$/ })).toHaveCount(
      isWide(page) ? 11 : 1
    );
    await expectLayout(page, ROUTE);
    await expectAccessible(page, ROUTE);
  });

  test('a permission is granted to a role and revoked again', async ({ page }) => {
    const toggle = await openStudent(page);
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    await pressUntil(page, toggle, () =>
      expect(toggle).toHaveAttribute('aria-checked', 'true', { timeout: 4000 })
    );
    await expect.poll(studentHolds, { timeout: 10000 }).toBe(true);

    await pressUntil(page, toggle, () =>
      expect(toggle).toHaveAttribute('aria-checked', 'false', { timeout: 4000 })
    );
    await expect.poll(studentHolds, { timeout: 10000 }).toBe(false);

    // Still so after a fresh load
    const again = await openStudent(page);
    await expect(again).toHaveAttribute('aria-checked', 'false');
  });

  test('a switch the server refuses goes back, and says why', async ({ page }) => {
    // The client batches its requests: a batch of role updates is answered with a refusal each
    const refusal = {
      data: {
        updateRole: {
          __typename: 'UpdateRolePayload',
          role: null,
          errors: ["You can't modify permission settings"],
          fieldErrors: null,
        },
      },
    };
    await page.route('**/graphql', async (route) => {
      const body = route.request().postDataJSON() as unknown;
      const operations = (Array.isArray(body) ? body : [body]) as { operationName?: string }[];
      if (!operations.every((operation) => operation?.operationName === 'UpdateRole')) {
        return route.fallback();
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(Array.isArray(body) ? operations.map(() => refusal) : refusal),
      });
    });
    const toggle = await openStudent(page);
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await pressUntil(page, toggle, () =>
      expect(page.getByText("You can't modify permission settings").first()).toBeVisible({
        timeout: 4000,
      })
    );
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(await studentHolds()).toBe(false);
  });
});
