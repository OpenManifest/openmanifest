# UI verification: checkpoint U0 (foundations)

Run on the cloud VM on 2026-10-12 against the backend from `modernise/u0-10-checkpoint` (P7.7 schema, dev seed, started with
`MAX_DEVICES_PER_USER=1000`) and a web export (`EXPO_ENV=local`) of the client branch. Tasks U0.1 to U0.9 are in the batch.

## Results

| Check                                                      | Result                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client checks                                              | `check:types` clean; `check:linting` 0 errors (232 warnings); `check:testing` 57 suites, 420 tests; `check:graphql` OK                                                                                                                                                      |
| Backend                                                    | `bundle exec rspec` 1054 examples, 0 failures, 2 pending; rubocop clean                                                                                                                                                                                                     |
| Tier 2 smoke (`yarn test:ui:smoke`)                        | 74 passed                                                                                                                                                                                                                                                                   |
| Tier 3 full (`yarn test:ui:full --retries=1`, 15 projects) | 409 passed, 1 flaky (passed on retry: `a boarding call and landing show the next actions` at 1440×900 text 200 %), 52 skipped (the `generic` project until the template switch exists, and the visual specs outside the `full-<w>x<h>-<scheme>` projects), 0 failed; 25 min |
| Visual baselines (`@visual`)                               | 40 images (login, board above its list, load, profile, settings × 8 `full` projects, 2.0 MB) in `e2e/visual.spec.ts-snapshots/`; a second run without `--update-snapshots` compares clean (40 passed)                                                                       |
| Android                                                    | starts at U3.1                                                                                                                                                                                                                                                              |

## What the full run found, and what was done

- **The seed users run out of devices.** devise_token_auth keeps 10 tokens per user and removes the oldest; the suites sign
  in as the same seed owner dozens of times (UI logins, API calls of the live specs), so after a few projects the token in
  the stored Playwright session was removed and every later test ended on the login screen. The backend limit is now
  `MAX_DEVICES_PER_USER` (default 10, unchanged in production); the UI test environments (`.github/actions/ui-env`,
  CLOUD_ENV) set 1000. The API helper no longer leaves loads behind either: the board lists every load of the day, and the
  specs look for the seeded "Load #1", which scrolls out of the rendered list once dozens of loads pile up.
  `createLoadViaApi` now registers what it creates and an automatic fixture deletes it when the test ends.
- **Dark-scheme contrast on `/setup`** (`color-contrast`, serious): newly visible because dark was not run before. It is in
  the axe baseline as a known finding; the setup wizard is rebuilt in U5.
- The spike page (`/__spike`) used colours of the light scheme on the dark page; it now sets its own background.
- Reset the seed before a full run: `bin/rails db:reset db:seed:dev_baseline`.

## Axe baseline

`e2e/axe-baseline.json` lists the known serious and critical rule ids per route: 19 routes, 52 entries (the dark-scheme
`color-contrast` of `/setup` is the one added here). They are the targets of U1 to U5; a new rule on a route fails a test.

## UI debt (`yarn ui:debt`)

| Paper imports | Colour literals | Raw touchables | Numeric font sizes | Literal JSX strings |
| ------------: | --------------: | -------------: | -----------------: | ------------------: |
|           161 |             272 |             20 |                 94 |                 491 |

(U0.5 recorded 161 / 262 / 21 / 93 / 474. The difference is the dev-only spike screen, which goes with U2.3, and the i18n and theme layers.)

## Owner checks (listed for U6.5)

- System fonts and the navy brand on an iPhone and on an Android phone, light and dark: board, load, profile, settings, login.
- The visual baselines were made in headless Chromium on the cloud VM; if `ui-full` on GitHub shows font-rendering diffs
  only, regenerate them there in a checkpoint task.
