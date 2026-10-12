import { expect, test as base } from '@playwright/test';
import { deleteCreatedLoads } from './api';
import { authFile, type Role } from './roles';

type Options = { role: Role };

/**
 * `test` with a logged-in user: `test.use({ role: 'manager' })` picks the seed user (default `owner`). Page errors fail
 * the test; the `generic` project is skipped until U0.6 implements `?industry=generic`.
 */
export const test = base.extend<Options & { pageErrors: string[]; cleanup: void }>({
  role: ['owner', { option: true }],
  storageState: async ({ role }, use) => {
    await use(authFile(role));
  },
  // Loads a test created through the API are removed when it ends
  cleanup: [
    async ({}, use) => {
      await use();
      await deleteCreatedLoads();
    },
    { auto: true },
  ],
  pageErrors: [
    async ({ page }, use, testInfo) => {
      testInfo.skip(
        testInfo.project.metadata.variant === 'generic',
        'needs U0.6 (?industry=generic)'
      );
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
      await use(errors);
      expect(errors, 'uncaught page errors').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Opens a route and waits for the network to settle */
export async function gotoRoute(page: import('@playwright/test').Page, route: string) {
  await page.goto(route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
}
