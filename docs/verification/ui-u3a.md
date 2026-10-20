# UI verification: checkpoint U3a (board and load)

Run on the cloud VM on 2026-10-20 against the backend from `modernise/u3-5-load-screen` (dev seed, started with
`MAX_DEVICES_PER_USER=1000`, reset with `bin/rails db:reset db:seed:dev_baseline` before the run) and a web export
(`EXPO_ENV=local`) of the client branch. Tasks U3.2 to U3.5 are in the batch. The new board is on in every spec (a browser
without stored preferences gets `newBoard` on).

## Results

| Check                             | Result                                                                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Client checks                     | `check:types` clean; `check:linting` 0 errors (warnings at baseline); `check:testing` 102 suites, 855 tests; `check:graphql` OK; web export OK |
| Tier 3 full (`yarn test:ui:full`) | 1114 passed, 92 skipped, 4 failed (52 min); 3 of the 4 pass on re-run, the fourth is fixed below and passes (see "What the run found")         |
| Baselines updated                 | board and load (light, 360, 390, 820, 1440), profile (360 light), settings (390 light); the profile and settings ones were stale since P7.12   |
| Android                           | not run: U3.1 is `blocked (Android CI: …)`. Maestro and uiautomator see none of the app's views on the emulator. Tier 3 here is web only       |

## What the run found, and what was done

- **Board at 200 % text (`board and load at 200% text`, 390 px): the "Create load" button was wider than the window.**
  `FloatingActionArea` was pinned at the right edge only, so a wide button spilled to the left, out of reach. The area
  is now pinned at both edges, the wrapper is held to the window width, and a `Button` label shrinks (with an ellipsis)
  instead of pushing the button out. The spec also scaled the text twice in the `text200` projects (400 %); it now
  leaves the scaling to `expectLayout` there. Passes at 390 and 1440.
- **`form-dialogs` (390), `board` "a boarding call and landing show the next actions" (820), `nav` keyboard test (1440 dark):**
  each failed once during the run and passed alone on the re-run (`--last-failed`). The cause is not established: none
  touches code of this batch, and during the run another Playwright session also logged in as the seed owner, which
  can invalidate a token. They are recorded here as flakes to watch; if one fails alone, it is real.
- Earlier in the batch the specs found and fixed: cards without vehicles or crew (the `loadCard` fragment), a nested
  `h1`, `aria-prohibited-attr` on the crew chip, a `nested-interactive` finding in the tablet pane, the logout and
  re-login showing the previous user, and e2e data piling up in the shared seed (loads are removed after each test, and
  the generic operator is created under a fresh user).

## UI debt (`yarn ui:debt`)

| Paper imports | Colour literals | Raw touchables | Numeric font sizes | Literal JSX strings |
| ------------: | --------------: | -------------: | -----------------: | ------------------: |
|           102 |             168 |             15 |                 65 |                 397 |

(U2 recorded 102 / 169 / 15 / 65 / 416. `app/features/board` and `app/features/load` are in the converted lint list: no
Paper, no numeric spacing, strings through `t()`.)

## Owner checks (listed for U6.5)

- Run a real load with the new board (`Account` → "Manifest board" → new) on a tablet at the desk and on a phone:
  call, depart and land with the one-tap action, take someone off from the place menu, swipe a place on a phone.
- The load's countdown and the place meters in direct sun at the largest system font.
- The Android flows (U3.1) once someone finds why the emulator shows the app no accessibility tree.
