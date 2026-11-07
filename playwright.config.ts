import { defineConfig, type Project } from '@playwright/test';

const baseURL = process.env.UI_BASE_URL ?? 'http://localhost:19006';
const proxy = process.env.HTTPS_PROXY ?? process.env.https_proxy;

type Size = { width: number; height: number };
const size = ({ width, height }: Size) => `${width}x${height}`;

// `smoke` runs on every pull request: two widths, light. `full` runs in checkpoint tasks and weekly.
const smokeSizes: Size[] = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
];
const fullSizes: Size[] = [
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 820, height: 1180 },
  { width: 1440, height: 900 },
];

function project(
  group: 'smoke' | 'full',
  viewport: Size,
  colorScheme: 'light' | 'dark',
  variant?: 'text200' | 'generic'
): Project {
  const name = [group, size(viewport), colorScheme, variant].filter(Boolean).join('-');
  return {
    name,
    metadata: { group, variant, colorScheme },
    use: {
      viewport,
      colorScheme,
    },
  };
}

const projects: Project[] = [
  ...smokeSizes.map((s) => project('smoke', s, 'light')),
  ...fullSizes.flatMap((s) => [project('full', s, 'light'), project('full', s, 'dark')]),
  // Text at 200 %: react-native-web writes px font sizes, so `scaleText` in e2e/support scales every text element
  project('full', { width: 390, height: 844 }, 'light', 'text200'),
  project('full', { width: 1440, height: 900 }, 'light', 'text200'),
  // Skipped until U0.6 adds the `industry` switch
  project('full', { width: 390, height: 844 }, 'light', 'generic'),
];

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.results',
  globalSetup: './e2e/global-setup.ts',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: [['list'], ['html', { outputFolder: 'e2e/.report', open: 'never' }]],
  use: {
    baseURL,
    timezoneId: 'Australia/Brisbane',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      executablePath: process.env.PW_CHROMIUM ?? undefined,
      // Chromium takes the environment's proxy for WebSockets but not for plain HTTP: bypass it for the local backend
      args: [
        ...(proxy ? [`--proxy-server=${proxy}`] : []),
        '--proxy-bypass-list=local.openmanifest.org;localhost;127.0.0.1',
      ],
    },
  },
  projects,
});
