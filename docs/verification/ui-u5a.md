# UI verification: checkpoint U5a (people and setup)

Run on the cloud VM from 2026-10-23 to 2026-11-06 against the backend from `modernise/u5-4-checkpoint` (dev seed, reset with
`bin/rails db:reset db:seed:dev_baseline` before each full run, server started with `MAX_DEVICES_PER_USER=10000`) and a web
export (`EXPO_ENV=local`) of the client branch. Tasks U5.1 to U5.3 are in the batch. The new board is on in every spec.

## Results

| Check                             | Result                                                                                                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client checks                     | `check:types` clean; `check:linting` 0 errors (223 warnings, below the 237 baseline); `check:testing` 124 suites, 1050 tests; `check:graphql` OK; web export (staging) OK     |
| Tier 3 full (`yarn test:ui:full`) | final build, three runs of the 11 projects (a reseed before each, two workers): 1578 passed, 186 skipped, 7 failed; the 7 pass alone (see below)                              |
| Baselines added                   | `people` (searched down to one person; the count, money, last load and reason masked) and `rules` (the self-manifesting switch masked), light and dark at 360, 390, 820, 1440 |
| Baselines refreshed               | `profile` and `settings` (images of the Paper screens of U0), `board` (the date of the pager is masked now: the image changed every day)                                      |
| Android                           | not run: U3.1 is `blocked (Android CI: …)`, so there is no `android-ui` run of `profile.yaml`; tier 3 here is web only, as in U4.5                                            |

The final runs, on the same build:

| Run | Projects                                | Passed | Skipped | Failed | Time |
| --- | --------------------------------------- | -----: | ------: | -----: | ---- |
| F-A | 360 and 390, light and dark             |    628 |      16 |      0 | 31 m |
| F-B | 820 and 1440, light and dark            |    628 |      10 |      6 | 36 m |
| F-C | text at 200% (390, 1440), generic (390) |    322 |     160 |      1 | 18 m |

## What the runs found, and what was done

The history, honestly: the checkpoint took several attempts before the three final runs above.

- **Run 1 (23 Oct, all projects)** broke in the fifth project (820 dark) with a wave of owner specs on the login screen, at
  the same place as U4.5's run 1. The cause was not a login from outside: the owner had 1000 device tokens, the limit the
  server was started with, so the oldest (the browsers' stored session) was removed. The API helpers sign the owner in for
  every call, about 200 times per project. Full runs now start the server with `MAX_DEVICES_PER_USER=10000`
  (backend CLOUD_ENV §4) and reseed before each run (which drops the tokens). U4.5's run 1 was most likely the same.
- **Run 2** stopped when the VM restarted; a later run A overlapped by mistake with run B (both killed, reseeded). Runs A,
  B and C after that were on builds that changed during the checkpoint (the fixes below), so they do not count.
- **Found in the product on the way:**
  - The shell marked Board as the current item on Setup and Rules (and on a phone Board instead of More): the route name
    it compared was the last segment of the path, never a screen name. It now reads the shown screen from the navigation
    state (BUG-108); the Setup and Rules baselines showed it.
  - The shared progress bar had no name, an axe finding whenever `/transactions` was caught loading (BUG-110).
  - A load card stuck after a conflict: an answer of the board's loads that left before a change arrived after it and put
    the older load (its `lockVersion`) back, and every press was refused as "changed by someone else" until a reload. The
    card now asks for the load again on a conflict, so the next press works (BUG-112). The older answer can still show
    the older state for a moment; keeping the newer copy in the cache is not part of this fix.
  - Two sign-ins of the same user at the same moment can lose one token (BUG-111, logged, not fixed): the logout and
    "login as somebody else" specs fail now and then under two workers and pass alone.
- **Specs hardened**: the picker (a row pressed while the list loads again is pressed again; rows are scrolled into the
  rendered list, which with large text does not hold them all; the ticket is chosen by typing its name, whose option
  carries its price), the visual picker (presses until the picker is open), the board's next actions (a conflict refused
  by the server is done again, the cancel question is pressed until it shows) and "the member picker opens from the load
  screen".
- **The 7 failures of the final runs**, each re-run alone (`--workers=1 --retries=0`, reseeded) on its project, all pass:
  the board's next actions (1440 dark, 390 text 200%), "cancelling a load asks first" and "the member picker opens" (820
  dark: a lost press, hardened), "a load created elsewhere ... shows its countdown" and "a load opens ... shows its last
  slot" (1440 dark: shared data under two workers, BUG-112) and the logout spec (1440 light, BUG-111). The board, picker,
  account, nav and login specs were also run alone on 360, 390, 820, 1440 and text 200% after the hardening: 147 passed.
- **Visual baselines**: compared in F-A and F-B without `--update-snapshots`; all passed.

## What the batch changed in the product

- People (`/users`, U5.1): a searchable list of the operator's people (a table on a wide window, rows elsewhere) with role,
  licence, whether they are ready (with the reason), credit and last load; filters for role and status, sort, "/" for
  search on the web; a row's menu opens the profile, "Manifest on…" and "Add credit"; "Add member" registers a walk-in.
- The profile (`/user/:id`, U5.2): a summary with readiness and the fixes the viewer has, then loads, funds, certifications
  and qualifications, equipment (the member and staff add and edit rigs; packing cards upload, BUG-106) and membership;
  one column on a phone, two on a wide window.
- Setup (`/configuration`, U5.3): three groups (Operations, People and access, Business), the list beside the chosen screen
  on a wide window; Rules (`/configuration/rules`) holds self-manifesting, the eligibility rules, the call schedule, units
  and currency and the template's optional modules. Branding no longer carries the rules.

## UI debt (`yarn ui:debt`)

| Paper imports | Colour literals | Raw touchables | Numeric font sizes | Literal JSX strings |
| ------------: | --------------: | -------------: | -----------------: | ------------------: |
|            89 |             164 |             15 |                 56 |                 381 |

(U4 recorded 108 / 175 / 16 / 64 / 410.)

## Owner checks (listed for U6.5)

- Run a day from the office with self-manifesting off (Setup → Rules): add a walk-in (People → Add member), record their rig
  on their profile, add credit, manifest them, move them to another load, call and land the load.
- People and the profile on a real phone and a desk: the search, the filters, the row menu, and the staff actions (add
  credit, edit membership, add and edit a rig, a packing card photo from the camera and from the library).
- Setup and Rules on a real desk: switching a rule and the call schedule, and that the members' screens follow (Today shows
  the desk note when self-manifesting is off).
- VoiceOver and TalkBack over People, the profile and Rules.
- The Android flows (U3.1), `profile.yaml` among them, once someone finds why the emulator shows the app no accessibility
  tree.
