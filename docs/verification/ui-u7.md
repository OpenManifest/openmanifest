# UI verification: performance and bundle size (U6.3)

Measured on the cloud VM on 2026-11-26 against the backend from `modernise/u6-3-performance` (server started with
`MAX_DEVICES_PER_USER=10000`) and web exports (`EXPO_ENV=local`) served by `scripts/serve-web-build.py`. "Before" is the
U6.2 branch (`modernise/u6-2-motion`, `f260695b`), "after" is this branch. The baseline of U0.4 is from its pull request
(#243).

## Bundle

`EXPO_ENV=local npx expo export --platform web`; gzip is `gzip -9` of the JS bundle.

|                 | U0.4 baseline | before (U6.2) | after (U6.3) | change against U6.2 |
| --------------- | ------------: | ------------: | -----------: | ------------------: |
| JS bundle       |   7,402,153 B |   7,301,828 B |  7,022,267 B | −279,561 B (−3.8 %) |
| JS bundle, gzip |               |   1,697,124 B |  1,659,830 B |  −37,294 B (−2.2 %) |
| `dist/` total   |     14,616 kB |     14,480 kB |    14,208 kB |             −272 kB |

The bundle is below the U0.4 baseline. date-fns was 232 kB of the bundle (by source map); it is gone, and dates go through
luxon and `app/i18n/format.ts` as everywhere else. The largest packages left, by source map (bytes of minified code):
react-native-reanimated 769 k, @mui/material 562 k (the web autocomplete, map and theme bridge), lottie-web 306 k,
react-native-web 293 k, graphql 252 k, @apollo/client 232 k, react-native-reanimated-carousel 211 k (the old carousel
wizard), lodash 104 k (40 files import the whole of `lodash`). These are the candidates for later work; none is in this
task.

## The board and the people under load

`scripts/measure-ui.mjs` signs in as the owner, opens the board and times it until its six cards show, then renames one
load every `UPDATE_MS` through the API (40 changes, round the loads, each reaching the board as a `loadUpdated` push)
while it records every animation frame and long task; then it opens People, shows every page with "Show more", scrolls
the list down and up, and searches. Data: backend `bin/rails db:seed:dev_baseline db:seed:perf_scale` (500 members, 6
loads of 14 seats). `CPU_THROTTLE=4` is Chrome's 4× CPU slowdown, nearer a mid-range phone than the VM. Headless
Chromium; compare numbers from the same machine only.

Board, live updates (fps over the run; long tasks are main-thread tasks over 50 ms):

| Viewport | CPU | Updates | fps before → after | p95 frame before → after | long tasks before → after | push to screen (median) before → after |
| -------- | --: | ------- | -----------------: | -----------------------: | ------------------------: | -------------------------------------: |
| 1440×900 |  1× | 4 a s   |        44.9 → 59.8 |           50.1 → 16.7 ms |            45 (2.9 s) → 0 |                           475 → 390 ms |
| 390×844  |  1× | 4 a s   |        55.2 → 60.0 |           33.3 → 16.8 ms |            6 (0.35 s) → 0 |                           470 → 365 ms |
| 1440×900 |  4× | 4 a s   |         5.3 → 24.3 |             350 → 150 ms |  50 (12.9 s) → 84 (7.5 s) |    1845 → 530 ms (33/40 → 40/40 shown) |
| 390×844  |  4× | 4 a s   |        16.3 → 41.5 |              233 → 83 ms |   87 (9.9 s) → 39 (3.5 s) |                           684 → 435 ms |
| 1440×900 |  4× | 1 a s   |        29.9 → 50.8 |              183 → 33 ms | 118 (23.4 s) → 92 (7.7 s) |                           628 → 451 ms |
| 390×844  |  4× | 1 a s   |        44.2 → 54.2 |               83 → 17 ms | 120 (13.5 s) → 51 (4.4 s) |                           483 → 431 ms |

Renders per update (Jest `app/features/board/__tests__/BoardRenders.test.tsx`, 6 loads of 14 seats, in each layout):
6 cards before, 1 after (the card of the load that changed); a render of the board without a change renders no card.

On the VM's own CPU the board holds 60 fps with four changes a second, with no long task. With a 4× slower CPU it does
not: a change still costs about 190 ms of main thread on the wide board (Apollo writing the pushed load into the cache
and React rendering the card and its column of 14 places), so four changes a second keep it at 24 fps; one a second, more
than a busy desk makes, keeps it at 51.

People with 500 members:

| Viewport | CPU | first page shown |  all 10 pages | list blank while a page loads | scroll fps before → after | search before → after |
| -------- | --: | ---------------: | ------------: | ----------------------------: | ------------------------: | --------------------: |
| 1440×900 |  1× |   1654 → 1231 ms | 16.5 → 15.5 s |                    15.0 s → 0 |               54.4 → 59.8 |          898 → 927 ms |
| 390×844  |  1× |   1739 → 1590 ms | 15.8 → 13.0 s |                    14.5 s → 0 |               60.0 → 60.0 |         1286 → 852 ms |
| 1440×900 |  4× |   2815 → 3115 ms | 44.0 → 32.5 s |                    38.4 s → 0 |               20.7 → 48.4 |        3602 → 1252 ms |
| 390×844  |  4× |   3266 → 3492 ms | 36.3 → 33.6 s |                    32.6 s → 0 |               43.4 → 54.1 |         2868 → 990 ms |

"Show more" put the list back to its skeleton until the next page arrived, every page (BUG-124); now the people shown
stay. With memoised rows the list holds 60 fps scrolling 500 people on the VM and about 50 with a 4× slower CPU, so
FlashList was not added: the cost was rendering every row again, not the number of rows. The time to show all pages is the
server's: each "Show more" asks for all the people shown so far again (`first: 50, 100, …, 500`), and the API takes about
3 ms a member (1.5 s for 500, 28 SQL queries whatever the size, so no N+1); see BUG-126.

Startup: the board from a fresh page load until its cards show took 1244 → 1218 ms at 1440 and 1204 → 1374 ms at 390 (1×;
3.0–3.6 s at 4× both before and after): within the run-to-run noise, no worse.

## Query counts

The board: one subscription per load of the day. On a wide window each load was subscribed twice before (the board and
its column's load context), so the server resolved every change twice per open board and the client wrote it into the
cache twice; now once (BUG-125). People: unchanged, 28 SQL queries per page whatever its size.

## Checks

| Check                   | Result                                                                                                                                                                                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client checks           | `check:types` clean; `check:linting` 0 errors (149 warnings, was 150); `check:testing` 142 suites, 1172 tests in 100 s (U0.4: 50 suites, 349 tests, 51 s); `check:graphql` OK; `check-vocabulary --enforce` 0 hits                                                          |
| Tier 2 `@board @people` | `--project=smoke-390x844-light --project=smoke-1440x900-light --workers=1`, after a reseed: 44 passed, 2 skipped, twice in a row (5.1 and 5.3 min)                                                                                                                          |
| Flake fixed on the way  | "Manifest on…" (`people.spec.ts`) and "a member books from the card of a load" (`today.spec.ts`) pressed an element while a panel slid in (U6.2) or a list rendered again; `press` now waits for the element's box to stop moving, and `pressUntil` waits for it to be back |

## How to measure again

```sh
# backend (container rb40): the scaled data, then the API
bin/rails db:reset db:seed:dev_baseline db:seed:perf_scale
# client: a web export, served on :19006
EXPO_ENV=local npx expo export --platform web --output-dir /tmp/dist && python3 scripts/serve-web-build.py /tmp/dist 19006
PW_CHROMIUM=/opt/pw-browsers/chromium node scripts/measure-ui.mjs 1440 900
PW_CHROMIUM=/opt/pw-browsers/chromium CPU_THROTTLE=4 UPDATE_MS=1000 node scripts/measure-ui.mjs 390 844
# put the UI test data back before running Playwright
bin/rails db:reset db:seed:dev_baseline
```
