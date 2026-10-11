import { expect, test as base } from '@playwright/test';
import { authFile, type Role } from './roles';

type Options = { role: Role };

/**
 * `test` with a logged-in user: `test.use({ role: 'manager' })` picks the seed user (default `owner`). Page errors fail
 * the test; the `generic` project is skipped until U0.6 implements `?industry=generic`.
 */
export const test = base.extend<Options & { pageErrors: string[] }>({
  role: ['owner', { option: true }],
  storageState: async ({ role }, use) => {
    await use(authFile(role));
  },
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
