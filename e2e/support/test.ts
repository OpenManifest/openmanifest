import { expect, test as base } from '@playwright/test';
import { deleteCreatedLoads } from './api';
import { releaseClaims } from './claims';
import { authFile, type Role } from './roles';

type Options = { role: Role };

/**
 * `test` with a logged-in user: `test.use({ role: 'manager' })` picks the seed user (default `owner`). Page errors fail
 * the test; the `generic` project runs the gallery (with `?industry=generic`) and skips the specs of the skydiving screens,
 * whose texts and seed are the skydiving template's.
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
      // The members a spec claimed are free again once its loads (and so their places) are gone
      try {
        await deleteCreatedLoads();
      } finally {
        releaseClaims();
      }
    },
    { auto: true },
  ],
  pageErrors: [
    async ({ page }, use, testInfo) => {
      testInfo.skip(
        testInfo.project.metadata.variant === 'generic' &&
          !testInfo.titlePath.some((title) => title.includes('@gallery')),
        'the generic project runs the gallery only'
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
