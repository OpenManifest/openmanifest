# UI verification: checkpoint U5b (setup lists, permissions, conditions, reports, the signed-out screens)

Run on the cloud VM on 2026-11-06 and 2026-11-07 against the backend from `modernise/u5-8-remaining-screens` (dev seed,
reset with `bin/rails db:reset db:seed:dev_baseline` before each full run, server started with `MAX_DEVICES_PER_USER=10000`)
and a web export (`EXPO_ENV=local`) of the client branch. Tasks U5.5 to U5.8b are in the batch. The new board is on in
every spec.

## Results

| Check                             | Result                                                                                                                                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client checks                     | `check:types` clean; `check:linting` 0 errors (156 warnings, below the 237 baseline); `check:testing` 137 suites, 1132 tests; `check:graphql` OK; web export (staging) OK                                  |
| Axe baseline                      | `e2e/axe-baseline.json` is empty (`{}`): no route has a known serious or critical violation left; every `expectAccessible` of the smoke and full projects ran against the empty file                       |
| Tier 3 full (`yarn test:ui:full`) | final build, three runs of the 11 projects (a reseed before each, two workers): 1877 passed, 231 skipped, 4 failed; every failure passes alone (see below)                                                 |
| Baselines added                   | `setup-wizard`, `recover-password` (the wizard frame), `reports`, `money`, `vehicles` (the setup list pattern), `permissions` and `conditions-panel`, light and dark at 360, 390, 820 and 1440 (56 images) |
| Baselines refreshed               | none needed: `login` and `board` (both changed in the batch) were compared with `--update-snapshots` and stayed within the threshold, so the files are unchanged                                           |
| Android                           | not run: U3.1 is `blocked (Android CI: …)`, so there is no `android-ui` run; tier 3 here is web only, as in U4 and U5a                                                                                     |

The final runs, on the same build:

| Run | Projects                                | Passed | Skipped | Failed | Time   |
| --- | --------------------------------------- | -----: | ------: | -----: | ------ |
| A   | 360 and 390, light and dark             |    750 |      16 |      2 | 36.5 m |
| B   | 820 and 1440, light and dark            |    756 |      10 |      2 | 41.5 m |
| C   | text at 200% (390, 1440), generic (390) |    371 |     205 |      0 | 19.6 m |

## What the runs found, and what was done

The history, honestly:

- **U5.8b first.** U5.9 depends on U5.8b (split off from U5.8), which was still `todo`, so it was done first in its own
  branch and PRs (login, sign-up, password reset and change, account confirmation, operator selection, operator wizard
  and the wizard frame on `app/ui`, with `@login` specs). Its tier 2 runs took `/login`, `/signup` and `/setup` out of the
  axe baseline.
- **Emptying the baseline.** With an empty `e2e/axe-baseline.json`, the specs that check the old baseline routes
  (Setup and its lists, the board, the load, the daily log, Money; smoke 390 and 1440) left only `/manifest`:
  - the board's date pager was still Paper; its chevrons render on the web as `role="img"` without a name
    (`role-img-alt`). `DateBar` is on `app/ui` now (BUG-120);
  - at 1440 the loads that are over were dimmed with `opacity: 0.7`, which took their text below AA (`color-contrast`).
    They keep the surface and get a dashed border instead (BUG-120).
- **Run A1** (360 and 390) was stopped at about 200 of 768 tests: in the dark projects the board failed axe on the
  conditions strip's "Update", the operator's brand text at 4.47:1 on the raised colour. `deriveBrand` checked the brand
  text against `surface` and `brandSoft` only; it now also checks `app` and `raised` (BUG-121, Jest over 50 colours in
  both schemes). The build changed, so A1 does not count; the database was reseeded and run A started again.
- **Specs hardened**:
  - People's "Add credit" (360 light, A1 and A): the row's menu button sat at the foot of the list under the tab bar of a
    360×640 window, so the press opened More. The spec brings the button to the middle of the list first.
  - "An add-on is added once and edited" (390 dark, A): two workers both found the spec's add-on missing and both added
    it, then the name matched two rows. The spec waits for the list before deciding and takes the first of two copies.
  - Both pass alone, twice, on the projects that failed.
- **The other failures of the final runs**, each re-run alone (`--workers=1 --retries=0`) on its project, pass: "a load
  created elsewhere gets a card, and a call shows its countdown" (1440 light: shared data under two workers, BUG-112) and
  "logout then login as somebody else" (1440 dark, BUG-111).
- **Visual baselines**: compared in runs A and B (the full projects that compare them) without `--update-snapshots`; all passed.

## What the batch changed in the product

- The setup lists (U5.5): vehicles, destinations, tickets, add-ons, equipment, inspection forms, crew roles and
  certification bodies share one pattern (`ResourceList` and `ResourceForm`: a sheet on a phone, a side panel on a wide
  window, a dialog in between).
- Roles and permissions (U5.6): a roles × permissions matrix grouped like the server's `access.yml` on a wide window, one
  role at a time as switches on a phone; switches change at once and go back with the reason when the server refuses.
- Conditions of the day (U5.7): "Update" on the board's conditions strip opens a panel with the ground temperature, the
  jump run heading and the winds aloft; the weather wizard and its screens are gone.
- Reports, Platform, Money and the daily log (U5.8): Reports with periods, figures, bar lists and the event feed (revenue
  only for `viewRevenue`), the moderators' Platform overview, Money with the operator's orders by day, and the daily log
  by day with its duty officer and notes.
- The signed-out screens and wizards (U5.8b): the login card, the operator selection as a list, the password reset and
  change, the account confirmation (also says when a link has no token) and the operator setup wizard, on one wizard frame
  with a named progress bar.

## UI debt (`yarn ui:debt`)

| Paper imports | Colour literals | Raw touchables | Numeric font sizes | Literal JSX strings |
| ------------: | --------------: | -------------: | -----------------: | ------------------: |
|            54 |              91 |              8 |                 35 |                 192 |

(U5a recorded 89 / 164 / 15 / 56 / 381.) The Paper imports left are in `app/components` (27: shared inputs and dialogs the
classic screens still use), the classic manifest (11) and `app/legacy` (7), both removed with U6.4, the user stack (5) and
a few providers; U6.1 removes Paper.

## Owner checks (listed for U6.5)

- The setup lists on a real phone and desk: add, edit and archive a vehicle, a ticket type with its default destination
  and a crew role; the form as a sheet on the phone and as a side panel on the desk.
- Roles and permissions: switch a permission in the matrix (desk) and in the per-role list (phone), and that a member of
  that role gains or loses the action.
- Conditions: update the winds aloft and the jump run from the board's strip on a phone (sheet) and a desk (panel), and
  "Fetch winds" with a location.
- Reports, Money and the daily log with a real day's data: the periods, revenue only for those who may see it, an order's
  receipt from Money, the daily log's download.
- The signed-out flow on a real iPhone and Android phone: sign up, the confirmation link from the email, log in (and Sign
  in with Apple on iOS), "Forgot your password?" with the reset link from the email, choose an operator, and set up a new
  operator with the wizard (location from the device, a logo from the library).
- VoiceOver and TalkBack over the login, the wizard (the progress is read as "Step n of m"), the permissions matrix and the
  conditions panel.
- The Android flows (U3.1) once someone finds why the emulator shows the app no accessibility tree.
