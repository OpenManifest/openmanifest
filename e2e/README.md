# UI tests (Playwright Test)

Browser tests of the web build against the real API and the offline seed. They replace `scripts/web-smoke.mjs`.

| Project name                 | Sizes                                | Scheme         | Run by                                                 |
| ---------------------------- | ------------------------------------ | -------------- | ------------------------------------------------------ |
| `smoke-<w>x<h>-light`        | 390×844, 1440×900                    | light          | `yarn test:ui:smoke` (tier 2; every pull request)      |
| `full-<w>x<h>-<light\|dark>` | 360×640, 390×844, 820×1180, 1440×900 | light and dark | `yarn test:ui:full` (tier 3; checkpoint tasks, weekly) |
| `full-<w>x<h>-light-text200` | 390×844, 1440×900                    | light          | `yarn test:ui:full`; text scaled to 200 %              |
| `full-390x844-light-generic` | 390×844                              | light          | skipped until U0.6 adds `?industry=generic`            |

Specs carry area tags in their titles: `@login`, `@manifest`, `@nav`, `@profile`, `@setup`, `@visual`, `@account`, `@forms`, `@overlay`, `@gallery`. Run one area with
`yarn test:ui:smoke --grep @manifest`.

## Run locally

```bash
# 1. backend (openmanifest-server), seeded
bin/rails db:create db:schema:load db:seed db:seed:dev_baseline
bin/rails s -b 0.0.0.0 -p 5000          # needs 127.0.0.1 local.openmanifest.org in /etc/hosts

# 2. web export of this client, served with SPA fallback
EXPO_ENV=local npx expo export --platform web
python3 scripts/serve-web-build.py dist 19006 &

# 3. tests (PW_CHROMIUM only where the pinned Playwright's Chromium is not installed, e.g. the cloud VM)
PW_CHROMIUM=/opt/pw-browsers/chromium yarn test:ui:smoke
yarn test:ui:report                      # open the HTML report
```

Environment: `UI_BASE_URL` (default `http://localhost:19006`), `UI_API_URL` (default
`http://local.openmanifest.org:5000/graphql`), `PW_CHROMIUM`.

## Layout

- `global-setup.ts` logs in once per seed user (`support/roles.ts`) and stores the browser state in `.auth/` (git-ignored).
  Specs pick a user with `test.use({ role: 'manager' })` (default `owner`). A test that logs out must log in itself
  (`test.use({ storageState: { cookies: [], origins: [] } })`): logging out invalidates the stored session.
- `support/test.ts` is the `test` to import: it adds the role, fails a test on uncaught page errors and skips the
  `generic` project.
- `support/press.ts`: `press()` is a real pointer down and up. A plain `click()` does not trigger
  react-native-gesture-handler touchables on web.
- `support/layout.ts`: `expectLayout(page, route)` (no horizontal scroll, every visible `*-primary-action` is inside the
  viewport and receives a click), `expectLastSlotRowReachable`, `expectNoClippedRows`, `scaleText`.
- `support/a11y.ts`: `expectAccessible(page, name)` runs axe (WCAG 2.0/2.1/2.2 A and AA). Serious and critical
  violations not listed for `name` in `axe-baseline.json` fail the test.

## Axe baseline

`axe-baseline.json` lists the known serious and critical violations per route (rule ids). To record it after adding a
route: `UPDATE_AXE_BASELINE=1 yarn test:ui:smoke --workers=1` (record only; it merges and never removes). Delete entries
as the findings are fixed so the baseline only shrinks.

## CI

- `web-ui-smoke` (job in `.github/workflows/ci.yml`) runs `yarn test:ui:smoke` on every pull request that touches
  `app/**`, `e2e/**`, `package.json`, `yarn.lock`, `playwright.config.ts` or the CI files. It boots the API of
  `openmanifest-server@staging` with the dev seed and a local web export through the composite action
  `.github/actions/ui-env`. On failure the HTML report and traces are uploaded as the artifact `ui-smoke-report`.
- `ui-full` (`.github/workflows/ui-full.yml`) runs `yarn test:ui:full`, weekly (Monday 03:00 Australia/Brisbane) and by
  hand. Inputs: `backend-ref` (default `staging`; use the matching branch for a cross-repo task) and `grep`.
  Trigger it on a branch with `gh workflow run ui-full.yml --ref <branch> -f grep=@login`, or with the GitHub MCP tool
  `actions_run_trigger` (`workflow_id: ui-full.yml`, `ref: <branch>`, `inputs`). Read the result with
  `gh run list --workflow ui-full.yml` / `gh run view <id> --log-failed`, or `actions_list` and `get_job_logs`; the
  report and the screenshot diffs are in the artifact `ui-full-report`.

## UI debt

`yarn ui:debt` (`scripts/ui-debt.mjs`) counts, per directory, what the UI rules of the design plan §3.5 forbid in converted
code: Paper imports, colour literals (hex, `rgb(`, `rgba(`, `'white'`, `'black'`), raw `Pressable`/`Touchable*` with
`onPress`, numeric `fontSize` and literal JSX strings (text children and `label`, `title`, `placeholder`, … props). It
prints a table, writes `ui-debt.json` (git-ignored) and never fails; CI prints it in the `checks` job summary. Directories
listed in `eslint/ui-converted.js` are held at zero by ESLint errors instead and are not counted. Every task that converts
a directory adds it to that list and puts the new total in its pull request body.

| Date              | Paper imports | Colour literals | Raw touchables | Numeric font sizes | Literal JSX strings |
| ----------------- | ------------: | --------------: | -------------: | -----------------: | ------------------: |
| 2026-10-12 (U0.5) |           161 |             262 |             21 |                 93 |                 474 |
