# UI verification: checkpoint U4 (the member experience)

Run on the cloud VM on 2026-10-20 against the backend from `modernise/u4-4-inbox` (dev seed, started with
`MAX_DEVICES_PER_USER=1000`, reset with `bin/rails db:reset db:seed:dev_baseline`) and a web export (`EXPO_ENV=local`) of
the client branch. Tasks U4.1 to U4.4 are in the batch. The new board is on in every spec.

## Results

| Check                             | Result                                                                                                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client checks                     | `check:types` clean; `check:linting` 0 errors (237 warnings, the baseline); `check:testing` 115 suites, 951 tests; `check:graphql` OK; web export OK            |
| Backend                           | `rspec spec/requests/client_operations` 563+ examples, 0 failures (the member screens, BUG-105); rubocop clean                                                  |
| Tier 2 smoke                      | `@today @board @picker @nav @wallet @inbox @profile` at 390 and 1440: all passed on the builds of U4.2 to U4.4                                                  |
| Tier 3 full (`yarn test:ui:full`) | two runs, see below: 11 projects in all (360, 390, 820, 1440 × light and dark, text at 200% on 390 and 1440, generic words on 390); every failure passes alone  |
| Baselines added                   | `today`, `wallet`, `inbox` (light and dark at 360, 390, 820 and 1440; counts, money and times masked); `board` refreshed (it was an image of the classic board) |
| Android                           | not run: U3.1 is `blocked (Android CI: …)`, so there is no `today.yaml` run; tier 3 here is web only                                                            |

## What the full runs found, and what was done

- **Run 1** (all 11 projects, two workers) stopped in the 820 dark project, after 883 passes. From there every spec that signs
  in as the owner failed (52 of the 77 failures, 360 to 820 had four): the owner's token had been invalidated by a login of
  the same user from outside the browser (a GraphQL validation made by a helper while the run was going). Not a defect of
  the screens.
- **Run 2** (the six projects that run 1 had not finished or had broken: 820 dark, 1440 light and dark, the two text-at-200%
  projects and the generic one): 683 passed, 135 skipped (narrower or wider than a spec's layout), 16 failed. Each failure was
  run alone afterwards and passes, except the ones below.
- **"Move to…" at every width** failed in both runs. The sheet lists every load of the day, and a spec's load can be below the
  fold of that list when earlier runs left loads behind; the press missed. The spec now scrolls the target into view and
  presses until the sheet closes.
- **Found in the product on the way:**
  - `moveSlot` answered with the destination load twice (BUG-105), so the load a place left was never in the answer; fixed in
    the backend with a spec.
  - A member without `readUser` (a student) got "no access" on their own profile: Today's Fix and Account → Profile led
    nowhere. A member's own profile, equipment, inspection and orders now open for them (`guardedUnlessOwn`); the list of
    people is still for those who may read people.
- **Specs hardened**: the aircraft and equipment dialogs (the press that opens them can be lost), the keyboard walk of the bar
  (waits for the items before counting) and "Move to…".
- **Stale baseline**: `board.png` was an image of the classic board and failed on the dark phone projects; it is the new board
  now, together with the new baselines. There was no single uninterrupted full run on the final build (the two runs above
  and the single re-runs cover it), so U5.4 is the next place for one.

## What the batch changed in the product

- Today (`/today`) is where those who do not manifest others land: their next load with the countdown and take-me-off (or the
  note to ask the desk), "Ready to fly?" with a fix for each rule, credit, the loads of the day and, for crew, their duties.
- Members book themselves from Today, from the card of a load on the board and from the free places of the load screen, with
  the picker in self mode (their last slot filled in, two interactions); with self-manifesting off there is no entry point.
- The Wallet (`/wallet`) has the balance, what is held for booked jumps, how to top up (at the desk) and what they paid, with a
  receipt for each order; those who run the money keep Money.
- The Inbox has the notifications with their read state, a row that opens what it is about, "Mark all as read", an unread
  badge on the bar, and a tap on a push opens Today for calls and changes of the manifest, the Wallet for money or the Inbox.

## UI debt (`yarn ui:debt`)

| Paper imports | Colour literals | Raw touchables | Numeric font sizes | Literal JSX strings |
| ------------: | --------------: | -------------: | -----------------: | ------------------: |
|           108 |             175 |             16 |                 64 |                 410 |

(U3b recorded 109 / 175 / 17 / 65 / 414.)

## Owner checks (listed for U6.5)

- VoiceOver and TalkBack over Today, booking and the Wallet: the order, the names ("Inbox, 3 unread"), the take-me-off and the
  confirm buttons.
- A push for a call opens Today on a real phone, with the app closed, in the background and in the foreground; the same for
  money (the Wallet).
- Booking from Today at a real dropzone: a returning jumper, and one whose licence or credit is not in order (the fix leads to
  their profile).
- The Android flows (U3.1), `today.yaml` among them, once someone finds why the emulator shows the app no accessibility tree.
