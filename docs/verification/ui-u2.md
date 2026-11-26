# UI verification: checkpoint U2 (components and forms)

Run on the cloud VM on 2026-10-12 against the backend from `modernise/u2-7-forms` (dev seed, started with
`MAX_DEVICES_PER_USER=1000`, reset with `bin/rails db:reset db:seed:dev_baseline` before the run) and a web export
(`EXPO_ENV=local`) of the client branch. Tasks U1.4 to U2.7 are in the batch.

## Results

| Check                                             | Result                                                                                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Client checks                                     | `check:types` clean; `check:linting` 0 errors (228 warnings); `check:testing` 73 suites, 651 tests; `check:graphql` OK; web export OK |
| Tier 2 smoke (`yarn test:ui:smoke`)               | all pass (the `@setup` and `@forms` subset re-run after the fix below: 46 passed)                                                     |
| Tier 3 full (`GALLERY_SHOTS=1 yarn test:ui:full`) | 996 passed, 80 skipped, 2 failed (30+ min); the two failures are fixed below and pass on re-run                                       |
| Gallery baselines (`e2e/gallery.spec.ts`)         | 240 images (4.0 MB): every section at 4 widths, light and dark, plus 200 % text; clocks and skeletons are masked                      |
| Android                                           | starts at U3.1                                                                                                                        |

## What the full run found, and what was done

- **`/configuration/basic` at 820 px (light and dark): new `target-size` finding.** The "use my location" button sat over
  the top-left corner of the map's own camera control (Google Maps widget, 40 px square), leaving 22 × 40 px
  clickable. The button moved to the bottom left of the map; the probe at the control's four corners now hits the control.
  Both tests pass.
- Earlier in the batch, the gallery itself found and fixed: a nameless loading spinner in `Button`, faded disabled fields
  with too little contrast, `Tabs` and `Segmented` focus not following the arrow keys, a scrollable region with nothing
  focusable in it, a countdown that took seconds where a `Date` was expected, and jump-run labels unreadable on missing
  map imagery.

## UI debt (`yarn ui:debt`)

| Paper imports | Colour literals | Raw touchables | Numeric font sizes | Literal JSX strings |
| ------------: | --------------: | -------------: | -----------------: | ------------------: |
|           102 |             169 |             15 |                 65 |                 416 |

(U1 recorded 156 / 264 / 20 / 90 / 471. The remainder is in the manifest, the screens converted in U3 to U5, and the
three exempted form folders.)

## Owner checks (listed for U6.5)

- Each form on a small Android phone with the keyboard open: the focused field stays visible and the footer buttons stay
  reachable (wizard steps, credits, rig inspection, operator).
- Overlays with TalkBack and VoiceOver: the dialog is announced with its title, focus moves in and returns, the sheet
  closes with the escape gesture, menus and popovers read their items.
- Date, time and colour pickers on a device: native sheet versus the Modal fallback.
- The location button now sits bottom left on every map; check it does not collide with the OS gesture area on iOS.
