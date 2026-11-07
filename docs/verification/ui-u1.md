# UI verification: checkpoint U1 (app shell)

Run on the cloud VM on 2026-10-12 against the backend from `modernise/u1-5-user-stack` (dev seed, started with
`MAX_DEVICES_PER_USER=1000`, reset with `bin/rails db:reset db:seed:dev_baseline` before the run) and a web export
(`EXPO_ENV=local`) of the client branch. Tasks U1.1 to U1.5 are in the batch.

## Results

| Check                                          | Result                                                                                                                                                                            |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client checks                                  | `check:types` clean; `check:linting` 0 errors (234 warnings); `check:testing` 63 suites, 484 tests; `check:graphql` OK                                                            |
| Tier 2 smoke (`yarn test:ui:smoke`)            | 104 passed, 10 skipped                                                                                                                                                            |
| Tier 3 full (`yarn test:ui:full`, 15 projects) | first run 553 passed, 7 failed, 67 skipped (30 min); after the two fixes below the failing specs pass: 40 visual specs compare clean and the navigation spec passes at every size |
| Visual baselines (`@visual`)                   | 5 of 40 images regenerated (board at 820 and 1440, load at 360 and 390, settings at 360): the screen header and the rail replace the old app bar                                  |
| Android                                        | starts at U3.1                                                                                                                                                                    |

## What the full run found, and what was done

- **The navigation spec assumed two layouts.** It expected the bar at the bottom below 1024 px, but a tablet (820 px) gets the
  80 px rail on the left (U1.2). The spec now checks tabs below 600 px, the rail from 600 px and the sidebar from 1024 px.
  Smoke only runs at 390 and 1440, so this was first seen here.
- **Five baselines changed on purpose**: the header (title, back arrow, no credits chip, no hamburger) and, at 820 and 1440,
  the navigation. They were looked at before regenerating.
- On `ui-full` in GitHub, the backend PR that reads `MAX_DEVICES_PER_USER` must be merged first, or the seed users run out
  of devices (see U0.10).

## UI debt (`yarn ui:debt`)

| Paper imports | Colour literals | Raw touchables | Numeric font sizes | Literal JSX strings |
| ------------: | --------------: | -------------: | -----------------: | ------------------: |
|           156 |             264 |             20 |                 90 |                 471 |

(U0.10 recorded 161 / 272 / 20 / 94 / 491. The app bar, the drawer and their strings are gone.)

## Owner checks (listed for U6.5)

- Navigation per role on a phone and on a tablet, in both orientations: tabs on the phone, rail on the tablet, More and
  Account reachable.
- Keyboard on a desktop browser: the skip link, the bar, the header back button and the people search.
- VoiceOver and TalkBack reach every tab and the header's back button ("Back to Board").
- A profile opened from a load or the inbox switches to People; Back returns to the people list.
