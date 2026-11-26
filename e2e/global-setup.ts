import { chromium, type FullConfig } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { loginViaUi } from './support/auth';
import { authFile, ROLES, type Role } from './support/roles';

/** Logs in once per role and stores the browser state in e2e/.auth/<role>.json (git-ignored) */
export default async function globalSetup(config: FullConfig) {
  const { baseURL, launchOptions } = config.projects[0].use;
  const browser = await chromium.launch(launchOptions);
  try {
    for (const role of Object.keys(ROLES) as Role[]) {
      const context = await browser.newContext({
        baseURL,
        viewport: { width: 1440, height: 900 },
        timezoneId: 'Australia/Brisbane',
      });
      const page = await context.newPage();
      await loginViaUi(page, ROLES[role]);
      mkdirSync(dirname(authFile(role)), { recursive: true });
      await context.storageState({ path: authFile(role) });
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
