# UI verification: checkpoint U3b (picker and move)

Run on the cloud VM on 2026-10-20 and 21 against the backend from `modernise/u3-9-move` (dev seed, started with
`MAX_DEVICES_PER_USER=1000`, reset with `bin/rails db:reset db:seed:dev_baseline`) and a web export (`EXPO_ENV=local`) of
the client branch. Tasks U3.7 to U3.9 are in the batch (U3.6 was the checkpoint of U3a). The new board is on in every spec.

## Results

| Check                             | Result                                                                                                                                               |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client checks                     | `check:types` clean; `check:linting` 0 errors (237 warnings, the baseline); `check:testing` 108 suites, 881 tests; `check:graphql` OK; web export OK |
| Tier 2 smoke                      | 222 passed on the U3.9 build; the 3 failures were fixed or are timing under two workers (see below)                                                  |
| Tier 3 full (`yarn test:ui:full`) | first run: 1138 passed, 125 skipped, 57 failed (78 min); the 57 pass on re-run, in groups, after the fixes below (not one full run)                  |
| Baselines added                   | `picker` (light and dark at 360, 390, 820 and 1440): the picker with one person found by search; money, times and dates are masked                   |
| Android                           | not run: U3.1 is `blocked (Android CI: …)`; tier 3 here is web only                                                                                  |

## What the full run found, and what was done

The 57 failures were five causes, none of them a defect of the screens; all five were in how the specs share one seed:

- **Two workers booked the same member.** The picker, move and today specs put "Pat Pilot", "Stu Student" and the others on
  loads of their own; the server refuses a member on two loads that have not left, so the second spec failed ("has no last
  slot", "could not put Pat Pilot on the load"). A spec now claims the members it books (`e2e/support/claims.ts`: one
  directory per member, held until the spec's loads are gone).
- **A spec's loads were not cleaned up.** The cleanup signed in once, and two workers signing in as the owner invalidate each
  other's token: a place left on a load blocked the specs that followed. Each call of the cleanup now signs in and asks
  again. (The cleanup also takes the people off first, which gives back what their places cost.)
- **A press lost while the screen settled.** The place menu and the boarding-call picker opened on the second press, not the
  first, when the data arrived under the pointer; the specs now press again until what the press does shows
  (`pressUntil`), as a person would.
- **The operator's day ended during the re-run.** The seed's loads are on the operator's day; at midnight in Brisbane
  (14:00 UTC) the board was empty and every spec that opens the first load timed out. The database was re-seeded for the new
  day before the re-runs.
- **Data the specs left behind** showed two accessibility findings in code older than this batch: the pale secondary text
  of an order card (Transactions) and the same screen's dates. Fixed in `OrderCard` (U3.9).

Re-runs, each on a re-seeded database and on the projects it reached: `form-dialogs`, `nav`, `login`, `board-new` and
`board` passed in the first (stopped when the claims were still missing); `picker`, `account` and the rest of `board`
passed in the second (22 minutes, two workers); `move` and "a boarding call and landing show the next actions" passed on all
twelve projects in the last (29 passed, 26 skipped as narrower than the columns). There was no single full run on the
final build, so the first thing the next checkpoint (U4.5) does is one.

## What the batch changed in the product

- The picker adds a returning member in search, pick and confirm; a group of four in six interactions; a tandem and a try
  dive with their guests (`@picker`, 390 and 1440).
- Places move with "Move to…" on every platform, and by drag and drop or the keyboard between the columns of the board on
  the web (`@move`); the board holds its order while a place is held.
- Found in the product on the way: a server rule that blocked members of loads that left without a call (BUG-103), a double
  charge when a moved slot was taken off (BUG-104), an old card too pale to read, and a validator that answered for an
  earlier slot (the debounce now counts as loading).

## UI debt (`yarn ui:debt`)

| Paper imports | Colour literals | Raw touchables | Numeric font sizes | Literal JSX strings |
| ------------: | --------------: | -------------: | -----------------: | ------------------: |
|           109 |             175 |             17 |                 65 |                 414 |

(U3a recorded 102 / 168 / 15 / 65 / 397. The difference is the classic manifest forms, which moved to `app/legacy/` in U3.8:
they were exempt from the UI rules before and are counted as debt now, 7 / 7 / 2 / 0 / 17, until U6.4 removes them.)

## Owner checks (listed for U6.5)

- One staffed day on the new board (Account → "Manifest board" → new) at a dropzone, or a realistic rehearsal: the time it
  takes to manifest returning jumpers (search, pick, confirm), groups, tandems, moves, and any blocking issue.
- Drag and drop on a real desk with a mouse and a trackpad; the keyboard path (Space, the arrows, Space).
- Escorts and guests with the real tickets of the dropzone (tandem, try dive): the guests' age limits and escort
  qualifications.
- The Android flows (U3.1) once someone finds why the emulator shows the app no accessibility tree.
