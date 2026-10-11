# UI/UX modernisation plan

Status: **proposal for approval** (planning only, no code changed). Written 2026-10-11 against `staging` at `dcc46d1`
(Expo SDK 57.0.27, React Native 0.86.3, React 19.2.3, react-native-paper 5.15.3 with the MD2 theme).
Mockups: <https://claude.ai/artifact/Mdiri5pZsNQ8qEBRtR3jdZ> (private until you share it). Screenshots behind the audit are in
[`docs/ui-audit/`](ui-audit/). Evidence for every number is reproducible with the commands in Appendix A.

Scope is the client. The backend was read only where it settles roles, permissions, data shapes and the generalisation design
(`backend:docs/reference/GENERALISATION.md`, `backend:config/seed/access.yml`).

---

## Decisions for Victor

Approve all of these as written and the roadmap below can start unchanged. Each says what I would do and what changes if you disagree.

| # | Decision | My default | If you say no |
|---|---|---|---|
| D-UI1 | **Manifest staff get a workspace on tablet and desktop**: permanent sidebar, load columns you can drag people between, and a searchable roster panel. Phones keep a stack. | Yes. It is where the time-critical work happens, and the current desktop web build is the phone layout stretched (see 1.8). | Keep the stacked screens at every width; Phase 3 shrinks to a restyle and the roster and drag-and-drop work drops out. |
| D-UI2 | **Design system: our own tokens and a small component layer on React Native primitives**, with Paper kept as a shrinking dependency behind our components until the last screen is moved. No Tamagui, NativeWind, Uniwind or Unistyles. | Yes (reasons in 3.3). | Tell me which library; the roadmap changes in Phase 0–1 only, the screens do not. |
| D-UI3 | **Brand direction**: neutral chrome, the operator's colour for accents and primary actions (as the app already does per dropzone), contrast guaranteed by derivation. The built-in default colour changes from the current red (`#FF1414`, `app/constants/Colors.ts`, 3.9:1 on white) to the navy used in the demo dropzone (`#1D3557`). | Yes. | Keep red as the default; it then needs a darker shade for text and for white-on-red buttons (the derivation handles it, at some cost in vividness). |
| D-UI4 | **Platform priorities**: web desktop and tablet are first-class for staff and management; native phones for jumpers, instructors and pilots; native tablets follow the web tablet layout. | Yes. This is an assumption: I found no usage data, only that the code has a web build with drag-and-drop and a manifest desk's needs (1.1). | If staff are mostly on phones, Phase 3 builds the phone board first and the desktop board second. |
| D-UI5 | **Start client-side i18n now**, with the skydiving terms bundled in the app as the default `terms` namespace, without waiting for D5 (backend industry profiles). Each screen is converted in the phase that redesigns it, so no screen is touched twice. | Yes. It does not change what skydiving users see, and it makes the later backend profile a data swap. | Then Phases 3–5 keep hard-coded English and Phase 6 becomes a second pass over every screen (about 2.5× the string work). |
| D-UI6 | **Generic vocabulary** for the profile layer: Trip (load), Vehicle (aircraft), Place (slot), Participant (jumper), Departure call (call), Destination (altitude on a ticket). Matches `GENERALISATION.md` §2. | Yes. | Give me the words; they are data, not code. |
| D-UI7 | **Scope cuts**: drop Facebook login (unverifiable, `login/form/FacebookButton*.tsx`); defer the circular jump-run dial (`input/jump_run_select/*`, 700 lines) and replace it with a numeric heading field for now; keep Apple login. | Yes to all three. | Each costs about one small task to keep. |
| D-UI8 | **System fonts** (San Francisco, Roboto, Segoe UI) instead of the bundled Roboto weights (`theme/palette.ts`). | Yes: smaller bundle, correct font scaling, tabular figures for countdowns and money. | Keep Roboto; nothing else changes. |
| D-UI9 | **Small backend asks in parallel** (Section 11): per-member eligibility reasons on a load, a member's last slot, call presets from the profile. All additive. | Yes. | The picker shows the fields the API already has (`hasLicense`, `hasMembership`, `hasRigInspection`, `hasReserveInDate`, `hasCredits`) and no reasons or last-jump defaults. |
| D-UI10 | **CI cost**: Playwright (web, 4 widths, axe) on every PR; Android emulator flows (Maestro) nightly, not per PR. | Yes. | Per-PR Android means about 8–10 extra CI minutes each; nightly only means layout regressions on Android surface a day later. |
| D-UI11 | **Offline**: the plan assumes a connection (the app is real-time over ActionCable and has no offline queue). Is a dropzone with poor signal a real case you want designed for? | Assume no. | If yes, offline manifesting becomes its own project (queued mutations, conflict handling with `lockVersion`); it is not in this plan. |

---

## 0. Where things stand (corrections to the brief)

The brief lists the dependency upgrade, Redux removal and test work as upcoming. They are already on `staging`:

| Item | State on `staging` | Where |
|---|---|---|
| Expo / RN upgrade | Expo 57.0.27, RN 0.86.3, React 19.2.3, New Architecture, Hermes, TypeScript 5.9 | `package.json`, Phase 3 |
| Paper | 5.15.3 with the **MD2** theme kept (`theme/palette.ts` uses `MD2LightTheme`/`MD2DarkTheme`) | P3.11, P3.12 |
| Redux | removed; zustand stores `app/state/*`, `app/theme/overrides.ts` | Phase 4 |
| Tests | 45 Jest files (jest-expo 57, Testing Library RN 13), 158 tests, none skipped; `scripts/web-smoke.mjs` (Playwright, run by hand, not in CI) | Phase 1, P0.8 |
| Layout root causes | `app/components/layout/*` primitives, ESLint bans `KeyboardAvoidingView`, RN `SafeAreaView` and `Dimensions.get` | Phase 5 |
| Still open | device checks for Phase 5 and P6.27 (owner), D1–D8 decisions, Phase 7 (generalisation) blocked on D5 | `backend:docs/MODERNISATION_PLAN.md` |

So the "sequencing" question is no longer upgrade-first. It is: build on the Phase 5 primitives, fold Phase 7's client i18n tasks
(P7.2, P7.7, P7.8) into the screens this plan rewrites, and pull the web end-to-end job (P8.7) forward. Section 9 sets that out.

---

## 1. Audit findings

### 1.1 Roles, workflows and what is time-critical

Roles are per dropzone (`backend:config/seed/access.yml`, `backend:docs/reference/README.md` §1). What the client does with them:

| Role (slug) | What the code lets them do | Evidence | Pressure |
|---|---|---|---|
| `manifest` | Everything on the board: create loads (`CreateLoad`), manifest others and groups (`CreateUserSlot`), move and delete slots, call/land/cancel (`UpdateLoad`), add credits (`CreateUserTransaction`), update users, weather, view activity and revenue | `access.yml`; gating in `screens/authenticated/dropzone/load/ActionButton.tsx:32-36,129-130`, `forms/credits/*` | **High**: loads fill and leave on a clock, interrupted constantly |
| `admin`, `owner` | All CRUD permissions plus per-user acting duties; settings, tickets, aircraft, rigs, permissions, master log | `access.yml` (`owner: <<: *crud`), `Drawer.tsx:30-50`, `SettingsMenuScreen.tsx:25-26,46,153,179` | Low (configuration), but the owner is also the person who sees the whole day |
| `chief_instructor`, `aff_instructor`, `tandem_instructor` | Read users and transactions, rig inspection, weather updates, DZSO/GCA/load-master duties; chief can grant permissions. **Cannot** create loads or manifest others | `access.yml` | Medium: on a phone, outdoors, between jumps |
| `coach`, `fun_jumper` | Manifest self (`createSlot`), read users, edit own rigs, GCA/load-master duties | `access.yml` | **High for the jumper**: "when do I go, am I cleared, what do I owe" |
| `student`, `tandem_passenger` | `createSlot` (student) or read-only (`tandem_passenger`) | `access.yml` | Glance only |
| `pilot` | `actAsPilot`, read load, `createSlot` | `access.yml` | Glance: which load, when |
| Platform `moderator`/`administrator` | See all dropzones, publish them; the Overview tab shows cross-dropzone figures | `ModerationRole` in `routes.tsx:46`, `overview/AdminOverview.tsx`, `backend:app/models/dropzone.rb:85-90` | Low |

Acting permissions (`actAsPilot`, `actAsGCA`, `actAsLoadMaster`, `actAsDZSO`, `actAsRigInspector`) are granted per user, not per role
(`backend:app/interactions/setup/dropzones/access/create_defaults.rb:90-93`): they decide who appears in the crew pickers.

Workflows, in order of how much they matter:

1. **Run the board** (manifest): open a load, put people in places, set the call (20/15/10 minute or custom, `ActionButton.tsx:53-70`), finalise as landed or cancelled, move people between loads (drag-and-drop on web only, `components/slots_table/DragAndDrop/*.web.tsx`; swipe-to-delete on native, `UserRow.tsx`). Live updates arrive by subscription (`api/crud/subscriptions/*`). **Time-critical.**
2. **Manifest a group or yourself** (`forms/manifest_user/*`, `components/dialogs/ManifestGroup/*`). **Time-critical.**
3. **Know my status** (jumper): which load am I on, is the call out, am I eligible (licence, membership, rig inspected, reserve in date, exit weight, credit: the `hasX` fields on `DropzoneUser`, `hooks/useManifestValidator.ts`). Today this is spread across Board, Profile and Notifications.
4. **Top up and review credit** (`forms/credits/*`, `screens/authenticated/user/orders|order_receipt|transactions`).
5. **Check a rig** (`screens/authenticated/user/rig_inspection`, template in `configuration/rig_inspection_template`).
6. **Update conditions** (`dropzone/weather_conditions/*`, `manifest/Weather/WeatherBoard.tsx`).
7. **Configure the business**: tickets, add-ons, aircraft, rigs, permissions, branding, master log (`screens/authenticated/configuration/*`). Not time-critical.
8. **Monitor** (`overview/*`): statistics for management and moderators.

**Assumptions (no evidence in code or backend):** that manifest staff work on tablets or desktops and jumpers on phones; that a dropzone
has a manifest desk with a screen; that nobody needs offline. These are D-UI4 and D-UI11.

### 1.2 Screens and routes

Registered routes (`screens/routes.tsx`, `screens/authenticated/*/routes.tsx`). Visibility is gated by permission, not by role name.

| Group | Screens (route) | Gate |
|---|---|---|
| Public | `LoginScreen` `/login`, `SignUpScreen` `/signup`, `RecoverPasswordScreen`, `ConfirmUserScreen`, `ChangePasswordScreen` | none |
| Onboarding | `DropzoneSelectScreen` `/select-dropzone`, `DropzoneWizardScreen` `/setup`, `UserWizardScreen` | signed in |
| Everyone in a dropzone | Board `ManifestScreen` `/dropzone/manifest`; `LoadScreen` `/dropzone/load/:loadId`; `NotificationsScreen` `/notifications`; own `ProfileScreen`, `EquipmentScreen`, `OrdersScreen`, `OrderReceiptScreen`, `RigInspectionScreen`; weather `WeatherConditionsScreen`, `WindScreen`, `JumpRunScreen` | member |
| Staff | `UserListScreen` `/users` (Users tab) and others' profiles | `ReadUser` (`authenticated/routes.tsx:42`) |
| Management | `OverviewScreen`/`DashboardScreen` (Overview tab) | `ViewStatistics` or a platform role (`routes.tsx:41-43`) |
| Management | Configuration: `SettingsMenuScreen`, `DropzoneSettingsScreen`, `AircraftsScreen`, `TicketTypesScreen`, `ExtrasScreen`, `DropzoneRigsScreen`, `RigInspectionTemplateScreen`, `PermissionScreen`, `TransactionsScreen`, `MasterLogScreen` | `UpdateDropzone`, `UpdatePlane`, `UpdateTicketType`, `UpdateExtra`, `GrantPermission`, `UpdateDropzoneRig`, `UpdateFormTemplate` (`components/drawer/Drawer.tsx:30-50`) |

The same `User` stack is registered four times (Manifest, Users, Notifications, Wizards: `routes.tsx` lines for `/dropzone/manifest/users/…`, `/user/…`, `/modal/user/…`), so a profile has three URLs.
Deep-link config still references screens that do not exist (BUG-083, fixed) and a cold load of `/users` ends on `/` (BUG-100, open: tabs are registered only once permissions load, `authenticated/routes.tsx:42-44,76,125`).

### 1.3 Navigation, native and web

- Root: `Unauthenticated` / `Limbo` / `Authenticated` / `Wizards` stacks chosen from the zustand session (`screens/routes.tsx`).
- Authenticated: a drawer (`screens/drawers/UserDrawer.tsx`, `drawerType: 'back'`) wrapping **bottom tabs** (Overview, Manifest, Notifications, Users) wrapping stacks. The drawer repeats most tab destinations (Overview, Manifest, Notifications, Order Activity, Transactions, Settings, Profile, Equipment, Log out; `Drawer.tsx:140-287`).
- **Native and web are the same navigator**: `authenticated/TabBar.tsx` and `TabBar.web.tsx` are byte-identical (4 lines each, `createBottomTabNavigator`). `docs/reference/README.md` §6 says the web file is a "top tab bar on wide screens"; it is not. At 1440 px the app shows a full-width bottom bar with four 360 px cells, icons only on web (`tabBarShowLabel: Platform.OS !== 'web'`, `authenticated/routes.tsx:46`), and the active cell is a solid brand block (`docs/ui-audit/desktop-light-board.png`).
- Headers: `AppBar` (`components/appbar/AppBar.tsx`) on the manifest stack shows a hamburger, the title and a credits chip; there is no back button on detail screens such as the load (`desktop-light-load.png`). Credits for an owner show the dropzone's balance, which reads as a personal balance.
- Tab and drawer entries are gated by hooks, so they pop in after permissions load (BUG-100).

### 1.4 Styling

| Aspect | Finding | Evidence |
|---|---|---|
| UI library | react-native-paper 5.15.3 in **154 of 339 TSX files**, 34 distinct components; most used: `List` (53 files), `Card` (39), `Divider` (23), `HelperText` (21), `Avatar` (20), `Button` (19), `Paragraph` (18) | `audit2.py` (Appendix A) |
| Theme | one `AppTheme` merging Paper MD2 and React Navigation colours; light/dark by preference (`state/preferences`, Settings → Appearance); brand colours per dropzone come from `Dropzone.primaryColor`/`secondaryColor` and are previewed live (`theme/overrides.ts`) | `app/theme/*` |
| Paper's future | 4 releases in 6 months, last stable 5.15.3 on 26 May 2026; **6.0.0-alpha.0 (15 Jun 2026) rewrites FAB, TextInput and others for MD3 and removes deprecated API**. Staying on 5.x costs nothing now; moving to 6 would be a rewrite of the same screens | npm, Paper releases (Appendix B) |
| Hard-coded colour | 151 hex literals in 53 files; 82 outside the colour picker, theme preview, charts and constants (e.g. `LoadCard/Countdown.tsx` 8, `Weather/WeatherBoard.tsx` 6, `authenticated/routes.tsx` 4); 138 named-colour strings (`'white'`, `'black'`) in 61 files; 39 `rgba(` | `audit.py` |
| Contrast | `#FF1414` default brand on white is 3.9:1; success `#00C851` with white text is 2.2:1 (the membership badge on the profile); warning `#FF8800` is 2.4:1; caption grey ~2.7:1; **inactive tab icons in dark mode use the brand colour on black: 1.7:1** (`authenticated/routes.tsx:40-45`) | computed |
| Type | 95 `fontSize` literals over 17 distinct values (10…100); Roboto weights bundled and named in `theme/palette.ts`; legacy `Paragraph`/`Title`/`Caption` | `audit.py` |
| Spacing and shape | 550 spacing literals, 30 distinct values (16 ×132, 8 ×96, 4 ×51, then odd ones: 3, 5, 10, 48, 50); 14 distinct `borderRadius` values; 13 elevation/shadow literals in 3 files | `audit.py` |
| Style mechanism | `StyleSheet.create` in 115 files; inline `style={{…}}` 336 times in 139 files (top: `LoadCard/Large/Card.tsx` 12, `slots/SlotCardUser.tsx` 11) | `audit.py` |
| Dark mode | works (Settings → Appearance: System/Light/Dark) with pure black background; brand colour used as tint on black fails contrast (above) | `desktop-dark-load.png`, `phone-dark-board.png` |
| Platform files | 33 `*.web|android|ios` files (list in `docs/reference/README.md` §6) plus 43 inline `Platform.OS/select` in 17 files (12 and 11 in `overview/AdminOverview.tsx`, `DropzoneOverview.tsx`) | `audit.py` |

### 1.5 Component reuse and duplication

- **Most imported internal modules**: `providers/notifications` (46 files), `providers/dropzone/context` (44), `hooks/useRestriction` (37), `components/input/text/TextField` (25), `carousel_wizard` (23), `components/ProgressBar` (17), `layout/DialogOrSheet` (12), `layout/ScreenContainer` (12), `components/Skeleton` (12), `components/UserAvatar` (11).
- **Duplicated by purpose**: three slot cards (`components/cards/SlotCard/*`, `screens/…/load/SlotCard.tsx`, `screens/…/user/profile/SlotCard.tsx`); two order cards (`components/orders/OrderCard.tsx`, `screens/…/user/transactions/OrderCard.tsx`); two load cards (`LoadCard/Large`, `LoadCard/Small`); two chip systems (Paper `Chip` and `components/chips/Chip.tsx`, with `GcaChip`, `PilotChip`, `PlaneChip`, `LoadMasterChip`); two date libraries (luxon in 8 files, date-fns in 19).
- **Legacy and dead**: `components/Themed.tsx`, `layout/Screen.tsx`, `layout/ScrollableScreen.tsx` (still used by 10 files), `components/UserAvatar.web.old.tsx`, `components/input/LocationPicker.oldios.tsx`, `app/providers/load/context .tsx` (a file name containing a space), 88 `console.log/debug` calls in 57 files.
- **Largest screens** (lines): `PermissionsScreen` 440, `WeatherBoard` 375, `Drawer` 356, `JumpRunSelect.web` 349, `LoadCard/Large/Card` 320, `ManifestScreen` 317, `AdminOverview` 310, `SettingsMenuScreen` 302, `DropzoneForm` 296.

### 1.6 Layout patterns behind the Android bugs (after Phase 5)

Phase 5 removed the root causes (`BUGS.md` "Android / mobile layout"): safe areas, keyboard handling, nested scrolling, FAB inside scroll content. What remains is the *class* of risk, which is why Section 8 exists:

- Fixed sizes: 203 numeric `height`/`minHeight`/`maxHeight` in 85 files and 152 numeric widths in 64 files (hot spots: `Weather/WeatherBoard.tsx` 11 heights and 7 widths, `forms/dropzone/DropzoneForm.tsx` 10 heights, `jump_run_select/JumpRunSelect.web.tsx` 8 and 8, `components/forms/weather_conditions/WeatherConditionForm.tsx` 7 widths).
- 59 `position: 'absolute'` in 25 files (theme previews 9 and 9, `Weather/JumpRun.tsx` 4, `LocationPicker.web.tsx` 3).
- 35 scroll containers in 32 files; the load screen's slots list is the only scroller since P5.5.
- Only 14 files read the window size or breakpoint (`useBreakpoint` is used by `layout/*`, `SetupWarning.tsx`, `WizardFrame.tsx`, `load/Header.tsx`, `load/views/TableView.tsx`); the rest of the app does not adapt to width at all.
- Layout is verified only by `scripts/web-smoke.mjs` run by hand, and by owner device checklists (`docs/SMOKE_TEST.md`). Nothing in CI renders a layout.

### 1.7 Accessibility today

| Check | Result |
|---|---|
| `accessibilityLabel` | 5 uses in 4 files |
| `accessibilityRole`, `accessibilityState`, `accessibilityHint`, `accessible`, `aria-*`, live regions | **0** |
| `hitSlop` | 0; 21 raw `Touchable*`/`Pressable` in 19 files with no role |
| Touch targets | `IconButton` 24 and 32 dp (9 uses), small `Chip` 25 dp (`components/chips/Chip.tsx:24`), crew chips ~24 dp, tab labels 10 dp (`authenticated/routes.tsx` `tabLabel`) |
| Font scaling | `maxFontSizeMultiplier` 1.6 on tab and FAB labels only (`layout/fontScale.ts`); slot table text is 12 dp (`slots_table/UserRow.tsx:206`) |
| Contrast | see 1.4; status is colour-only in places (green/amber dots and the membership badge) |
| Keyboard and focus on web | no focus management in `Select.web.tsx`, `Menu.web.tsx`, `DialogOrSheet.web.tsx`; the member picker (`DropzoneUserAutocomplete.web.tsx`) has no visible search field in the screenshot |
| Test queries | Jest tests query by text and `testID` (58 `testID`s in 30 files), not by role, so missing roles are invisible to them |

### 1.8 The web build at phone, tablet and desktop widths

Captured at 390, 820 and 1440 px, light and dark (`docs/ui-audit/`). Findings, in order of impact for staff:

1. **Board** (`desktop-light-board.png`): two load cards fill the left third of a 1440 px window; a weather hero (`Weather/WeatherBoard.tsx`) takes ~200 px at the top, and at ≥ 820 px its artwork stops at 640 px and leaves a white block on the right. Crew chips truncate ("Cara…", "Pat Pil…") with hundreds of pixels free. Call countdown, state and seats are small text on the card.
2. **Load** (`desktop-light-load.png`, `phone-light-load.png`): the table shows seven columns on desktop (12 dp text in 48 dp rows) but three on a phone (licence, equipment, wing loading disappear). A 14-row list of "- Available -" fills the screen. The call, group and landing actions hide behind a speed-dial "+" (`ActionButton.tsx:48-130`). The page title is "Load", not "Load #1", and there is no back button.
3. **Adding a jumper** (`*-manifest-dialog.png`): tapping an available row opens an inline alphabetical list of all members (92 dp rows, no eligibility, four names visible) that covers the table. Eligibility fields exist per member (`hasLicense`, `hasMembership`, `hasRigInspection`, `hasReserveInDate`, `hasCredits`, `hasExitWeight` in `api/schema.d.ts`) but are used only for the signed-in user (`hooks/useManifestValidator.ts`).
4. **Navigation** (all desktop shots): bottom tab bar across 1440 px, icons only.
5. **Profile** (`desktop-light-profile.png`): the Jumps tab renders an empty grey panel with no empty state; the membership badge reads "08/10/27" (day or month first?) in white on `#00C851` (2.2:1).
6. **Settings** (`desktop-light-config-menu.png`): one long list; the entry called "Configuration" sits under "Settings"; check-mark icons on rows that are not checks ("Rig Inspection Template", "Go offline"); "Master Log … Temporarily disabled" copy although master logs are scheduled again (P6.17); the Appearance control (a device setting) sits among dropzone settings.
7. **Overview** (`desktop-light-overview.png`): "Dispatched Loads" renders as a grey hatch and "Jump types" is empty.
8. **Weather** (`desktop-light-weather.png`): a full-screen navy wizard with white inputs, stepper and "Next/Cancel" for editing four numbers.
9. **Users** (`desktop-light-users.png`): three columns of identical icon avatars, no role or eligibility signal, search behind an icon.
10. Dark mode (`phone-dark-board.png`): black background, "No weather data" grey on black, inactive tab icons nearly invisible.

### 1.9 Skydiving terminology in the UI

All strings are hard-coded English: no i18n library; `expo-localization` is imported only by `entrypoint/bootstrap/PaperDatesPolyfill.ts`. Of 2,467 UI string candidates in 375 files:

| Concept | Strings | Files |
|---|---|---|
| manifest/manifesting | 95 | 32 |
| dropzone | 82 | 25 |
| rig/reserve/repack/canopy | 80 | 29 |
| load(s) | 79 | 29 |
| slot(s) | 33 | 16 |
| jump/jumper/jump run | 31 | 26 |
| altitude/winds/jump run/exit spot | 30 | 18 |
| aircraft/plane | 28 | 15 |
| exit weight/wing loading | 22 | 12 |
| calls (10/20 minute, boarding) | 15 | 5 |
| pilot / GCA / load master / DZSO | 11 / 11 / 3 / 7 | 10 / 9 / 3 / 6 |
| licence/federation/APF | 12 / 7 | 9 / 5 |
| tandem / AFF / student / coach | 6 / 12 | 4 / 3 |

Units: `$` appears in 140 strings (money is now cents and formatted by `utils/money.ts`, with the symbol still literal); `kg` 4, `ft` 2, `°C` 1; altitude is displayed as feet divided by 1000 plus "k". Screen titles are literals (`'Planes'`, `'Aircrafts'`, `'Winds Aloft'`, `'Jump Run'`, `'Dropzone users'`): the same concept is "Aircrafts" in Settings and "Planes" in Permissions and the title.

### 1.10 Tests and CI today

- Jest: `jest-expo` ~57.0.5, `@testing-library/react-native` ^13 (14.1.0 is current and requires RN ≥ 0.78 and React ≥ 19, which we meet); 45 test files; queries by text and `testID`.
- CI (`.github/workflows/ci.yml`): `checks` (types, lint, Jest, GraphQL validation) and `web-export`. **No rendered layout, no accessibility check, no end-to-end job.** `scripts/web-smoke.mjs` runs Playwright from `/opt/node-tools` by hand; Playwright is not a dependency.
- `eslint-plugin-react-native-a11y` is **not usable**: last release 3.5.1 (Nov 2024), peer `eslint ^3 … ^8`; the repo uses ESLint 9 flat config.

### 1.11 Quick fixes noticed (logged, not made)

| Where | What |
|---|---|
| `app/providers/load/context .tsx` | file name contains a space |
| `app/components/UserAvatar.web.old.tsx`, `app/components/input/LocationPicker.oldios.tsx` | dead files |
| `app/screens/authenticated/TabBar.web.tsx` | identical to `TabBar.tsx`; `docs/reference/README.md` §6 describes it wrongly |
| `app/screens/authenticated/dropzone/manifest/Weather/WeatherBoard.tsx` | artwork does not fill the card at ≥ 820 px |
| `app/screens/authenticated/overview/statistics/LoadsByDay.web.tsx` | chart renders as a grey hatch |
| `app/screens/authenticated/configuration/settings_menu/SettingsMenuScreen.tsx` | "Master Log … Temporarily disabled" copy is stale; check-mark icons on non-check rows |
| `app/screens/authenticated/user/profile/*` | Jumps tab has no empty state; membership date format is ambiguous |
| `app/screens/authenticated/routes.tsx:40-45` | inactive tab tint on dark is the brand colour on black (1.7:1) |
| 88 `console.log/debug` | in 57 files, most in `api/crud/*` and `forms/*/useForm.tsx` |
| `backend:app/graphql/types/equipment/rig.rb:38` | `rig_inspections` reads an undefined `rig` (should be `object`) |
| `docs/reference/README.md` | stack table still says Paper "MD2 theme" correctly but §6 and the navigation text predate Phase 4–5 |

---

## 2. Design direction

Principles, each tied to a workflow in 1.1. The mockups show them.

1. **The board is an operations surface, not a list of cards.** At a glance: what boards next, how long is left, who is missing, what blocks departure. (Workflows 1–2; mockup *Desktop: manifest board*.)
2. **Make the call the biggest thing on a load.** The call countdown is the largest numeral on a load card and on the load screen; the next logical action (Call 20 min → Departed → Land) is a button on the card, not an entry in a speed dial.
3. **Show eligibility before the tap, with the fix next to it.** Every person in a picker or a seat shows Ready / Expiring / Blocked with the reason ("Rig not inspected", "Reserve repack overdue since 2 Oct") and the action that clears it. The data exists (1.8 item 3).
4. **Two taps for the common case.** Picking a person pre-fills ticket, jump type and rig from their last jump; "Change…" opens the full form. The full form never blocks the quick path.
5. **Density follows the device and the job, tap size does not.** Desktop manifest rows are 40 dp; tablet 48; phone 56; hit areas are 44 dp or more on touch everywhere (`Density` tokens, Section 3.2).
6. **Status is never colour alone.** Every state is colour, icon and word, and the pairs meet 4.5:1 (checked values in the mockup's *Design system* board).
7. **Glanceable for jumpers.** "Today" is one screen: next jump with countdown, a pass/fail checklist, credit, and what happened earlier today. No tab-hunting.
8. **Nothing moves under the thumb.** Live updates keep the order stable, highlight what changed and never reflow a list the user is touching.
9. **Empty states are next steps.** "No jumps yet today. Book a jump." Never a blank panel (1.8 item 5).
10. **Words come from the operator.** No domain noun is hard-coded in a component; skydiving keeps its native feel through the profile (formatters such as "14k" and "20 minute call"), not through special cases in the UI.
11. **Brand is an accent.** Neutral chrome, the operator's colour for primary actions and active states, never for text on a surface it cannot reach 4.5:1 on.
12. **One data model, two shells.** A phone is a task stack; a desktop is a workspace of panes. Same components, same permissions, same URLs.

---

## 3. Design system

### 3.1 Where it lives

`app/ui/` (new): `tokens/` (colour, type, space, radius, elevation, density, motion), `theme/` (provider, `useTheme()`, Paper and Navigation theme adapters generated from tokens), `components/`, `gallery/` (a dev-only route that renders every component in every state). Nothing outside `app/ui/tokens` may contain a hex colour or a literal font size (lint rule, 3.5).

### 3.2 Tokens

| Token family | Decision |
|---|---|
| **Colour** | Semantic, not literal: `surface`, `surfaceRaised`, `app`, `border`, `text`, `textMuted`, `brand`, `onBrand`, `brandSoft`, `onBrandSoft`, plus status pairs `open`, `boarding`, `departed`, `landed`, `cancelled`, `warning`, `blocked` (each a background and a foreground). Light and dark sets, dark not pure black (`#0E1116` app, `#171B22` surface). `onBrand` and the "brand as text" shade are **derived** from the operator colour by a contrast function (`app/ui/tokens/contrast.ts`) and unit-tested against 4.5:1 for 50 sample colours. Values in the mockup's *Design system* board. |
| **Type** | System font. Scale: `countdown` 56 bold, `title` 20 semibold, `body` 15, `bodyCompact` 14, `label` 13 semibold, `caption` 12. Tabular figures on for numerals (`fontVariant: ['tabular-nums']`). All sizes scale with the OS setting; `maxFontSizeMultiplier` only on chrome (tabs, sidebar, FAB), as today (`layout/fontScale.ts`). |
| **Space** | 4-point scale: 4, 8, 12, 16, 24, 32, 48. The 30 odd values in 1.4 collapse into these. |
| **Radius** | 4 (inputs), 8 (buttons, chips), 12 (cards, sheets), pill. |
| **Elevation** | Three levels: flat (border only), raised (cards on the board: 1 dp shadow and border), overlay (menus, sheets, dialogs). Borders carry most of the separation, shadows are rare, which also removes the Android shadow/stacking quirks Paper's FAB just fixed (5.15.3). |
| **Density** | `compact` (40 dp rows), `comfortable` (48), `touch` (56). Default by breakpoint and pointer: expanded + fine pointer → compact; medium → comfortable; compact breakpoint or coarse pointer → touch. User override in Account. |
| **Motion** | 120 / 200 / 300 ms, standard easing; respects reduced motion (Reanimated `ReduceMotion`, web `prefers-reduced-motion`). Countdown and live changes use a 600 ms highlight that fades, no movement. |

### 3.3 Library decision

Facts checked on 2026-10-11 (registry and docs, Appendix B), against Expo 57 / RN 0.86 / React 19 / New Architecture / react-native-web 0.21:

| Option | Maintenance and compatibility | Web | Verdict |
|---|---|---|---|
| **Stay on Paper 5.x (MD2)** | Active but slow: 4 releases since April, last stable 26 May 2026, peers `*`; fixes track new RN (5.15.1/5.15.2 for RN 0.85). **6.0.0-alpha.0** is MD3-centred and breaking (FAB, TextInput rewritten) | RNW works | Keep as a *shrinking* dependency. Do not move to 6 (the work would be spent on a visual language we are leaving). |
| **Tamagui** | 3.0.0 published **today** (10–11 Oct 2026, 288 releases in six months); a major version one day old | Strong | No. Too new, large compiler surface, our screens are not performance-bound. |
| **NativeWind** | 4.2.7 stable; **v5 is 5.0.0-rc.0 (Sept 2026)** on `react-native-css`, Tailwind 4, with pinned `lightningcss`; docs call v5 pre-release | Yes | No. Class-string styling would touch all 339 files for little gain, and v5 is not stable. |
| **Uniwind** (Tailwind 4, by the Unistyles team) | 1.12.2 (5 Oct 2026), 14 releases in six months, MIT, RN ≥ 0.81; a paid Pro build exists | Yes | Credible, but same churn argument as NativeWind and a paid tier next to it. |
| **react-native-unistyles 3** | 3.5.2 (9 Oct 2026), 7 releases in six months, needs Nitro Modules and Reanimated, MIT | Yes (RNW) | Best of the library options for tokens and breakpoints, but adds a native C++ engine and a single-maintainer dependency to solve something React context and `useWindowDimensions` already solve here. Revisit if profiling shows theme-driven re-renders on the board. |
| **gluestack-ui** | v5 shipped June 2026 (alpha since March), builds on NativeWind v5 | Yes | No, inherits NativeWind v5's status. |
| **@expo/ui** | 57.0.22; SwiftUI and Jetpack Compose APIs stable since SDK 56, **web experimental** | Experimental | Not as the base (web is first-class for us). Candidate later for native date/time pickers and switches. |
| **Headless primitives: `@rn-primitives/*`** (dialog, select, tabs, popover, tooltip) | 1.5.2 (2 Jul 2026), peers `*` incl. react-native-web, small | Yes, with a11y semantics and portals | **Spike in Phase 0**, adopt for Dialog, Select, Tabs, Popover and Tooltip if focus trapping, Escape and arrow keys work on web and TalkBack/VoiceOver read them. Fallback: keep our existing `Select.web.tsx`/`Menu.web.tsx` and add the semantics ourselves. |

**Recommendation (D-UI2):** build `app/ui` on React Native primitives (`Pressable`, `Text`, `TextInput`, `View`) with our tokens, adopt `@rn-primitives` for the overlay components if the spike passes, and migrate screen by screen so Paper usage falls to zero over Phases 2–6, then delete it.

*Trade-off named:* Unistyles would give variants and breakpoint-aware styles for free and is the library I would pick if I were adopting one. I would still not adopt it now: it adds a native dependency in the same year we removed several, the app has no measured styling performance problem, and the in-house `useStyles(theme => …)` helper (about 60 lines) gives breakpoints and density through the same `useBreakpoint` that exists. If the helper starts to sprout features, that is the signal to move.

Smaller library calls (all checked):

| Concern | Call |
|---|---|
| Navigation | Stay on React Navigation 7. `bottom-tabs` already supports `tabBarPosition: 'left'` and `drawer` supports `drawerType: 'permanent'` (verified in the installed 7.20/7.14 types), so the responsive shell needs no navigator change. `expo-router` 57 is current but migrating routes is a rewrite for no user-visible gain; revisit when Phase 7 renames URLs. |
| Lists | `FlatList` stays; add `@shopify/flash-list` 2.3.3 (current, new-architecture only, which we are) for the roster only if it exceeds a few hundred members. |
| Drag and drop (web) | Keep `@dnd-kit/core` 6.3.1 (Dec 2024, stable); `@dnd-kit/react` is 0.5.0 (pre-1.0), not yet. Native gets "Move to…" (menu) instead of drag. |
| Icons | Keep `@expo/vector-icons` (MaterialCommunityIcons). |
| Bottom sheets | Keep `@gorhom/bottom-sheet` 5.2.14 (peer reanimated ≥ 4 supported). |
| Gestures | `react-native-gesture-handler` is ~2.32; 3.3.0 is current. Upgrade is a separate dependency task, not part of this plan; note the Expo-pinned version rules. |
| Testing Library | Upgrade `@testing-library/react-native` 13 → 14.1.0 in Phase 0 (RN ≥ 0.78, React ≥ 19: we meet both) and use `getByRole`. |

### 3.4 Core component set

Fifteen components cover every screen in 1.2: `Button` (primary, secondary, tertiary, destructive; sizes by density), `IconButton` (requires `accessibilityLabel` in its type), `TextField` (label, helper, error, units suffix), `NumberField`, `Select`, `Segmented`, `Chip`, `StatusBadge`, `ListRow`, `Card`, `Sheet`/`Dialog` (one API; sheet on native compact, dialog or side panel elsewhere), `Tabs`, `Banner`, `EmptyState`, `Avatar`, `Countdown`. Domain components built from them: `LoadCard`, `LoadHeader`, `SeatRow`, `MemberPickerRow`, `EligibilityBadge`, `CrewChip`, `ConditionsStrip`, `RosterPanel`.

They replace, by file: the three slot cards, two order cards, two load cards and chip systems in 1.5; `components/input/text/TextField`, `number_input`, `select`, `chip_select`, `dropdown_select`; `layout/DialogOrSheet*`; `Themed.tsx`, `layout/Screen.tsx`, `layout/ScrollableScreen.tsx`; the Paper `Card`/`List`/`Chip`/`Button`/`TextInput` uses.

### 3.5 Enforcement in code

- ESLint (flat config, `no-restricted-syntax`/`no-restricted-imports`, same pattern as the P5.9 guard): no hex or `rgb(` literals and no `fontSize`/numeric `margin|padding|gap` outside `app/ui/tokens`; no `TouchableOpacity`/`TouchableWithoutFeedback`/`Pressable` with `onPress` outside `app/ui` (use `Button`/`IconButton`/`ListRow`); no Paper imports in converted directories.
- A directory allow-list that grows as screens convert, so the rule ratchets and never needs a flag day.

---

## 4. Cross-platform strategy

**Share:** tokens, components, domain components, screens' logic and data hooks, URLs, terminology. Roughly 90% of files stay single-file (no `.web.tsx`).

**Diverge on purpose (and only here):**

| Concern | Compact (< 600) | Medium (600–1023) | Expanded (≥ 1024) |
|---|---|---|---|
| Navigation | bottom tabs, role-adaptive | left rail (icons and labels) via `tabBarPosition: 'left'` | sidebar with labels, operator switcher and account menu |
| Board | one column: load list → load screen | load list (left) + selected load (right) | load columns side by side + roster panel; landed loads collapse to a strip |
| Adding a person | full-screen picker | side panel | roster panel, drag onto a load or press Enter on a focused row |
| Moving a person | "Move to…" sheet | same | drag between columns (web, `@dnd-kit/core`); "Move to…" also available |
| Overlays | bottom `Sheet` | `Sheet` or dialog | side panel or dialog |
| Input | touch | touch/keyboard | keyboard first: `/` focuses search, arrow keys in lists, Esc closes, visible focus rings, hover states |
| Density | `touch` | `comfortable` | `compact` |

**Breakpoints:** keep the three classes in `layout/useBreakpoint.ts` (`compact` < 600, `medium` < 1024, `expanded`), add a **pointer** signal (`useWindowDimensions` plus `matchMedia('(pointer: coarse)')` on web, `Platform.OS` on native) because a 1024 px iPad and a 1024 px laptop differ in hit size, not layout. Content maximum width 1600 px; the board scrolls horizontally past three columns.

**Web specifics:** real focus order and `tabIndex`, `:focus-visible` ring from tokens, no hover-only affordances, text selection allowed in tables, right-click not required for anything. The web build keeps `output: single` and the custom `public/` files (`README.md` §1).

---

## 5. Information architecture and navigation

URLs do not change in the first release of any phase (deep links, bookmarks, push payloads). New neutral aliases arrive with Phase 6 and the old paths redirect for one release, as `GENERALISATION.md` §5 plans.

### 5.1 Shell by role

| Role group | Compact tabs | Medium and expanded navigation |
|---|---|---|
| Manifest, admin, owner | **Board**, **People**, **Inbox**, **More** (Setup, Money, Reports, Account) | Board, People, Inbox, Money, Reports, Setup; account menu at the bottom |
| Instructors, coaches, pilots | **Today** (their load and duties), **Board**, **Inbox**, **More** | Today, Board, People (if `ReadUser`), Inbox |
| Jumpers, students, passengers | **Today**, **Board**, **Wallet**, **Inbox** | same, Board read-only unless they may manifest self |
| Moderators | adds **Platform** (the cross-dropzone Overview) | same |

Tabs are chosen from permissions, computed once before the navigator renders (this also fixes BUG-100: tabs are registered unconditionally and each screen shows a no-access state, so cold loads of `/users` work).

### 5.2 What moves

- **Drawer disappears.** Its contents become: the operator switcher (top of the sidebar, or in Account on phones), **Account** (profile, equipment, appearance, log out), and the Setup area. The hidden "back" drawer on desktop (`UserDrawer.tsx`) goes.
- **Credits chip** leaves the app bar; the balance lives in Wallet (jumper) and on a member's profile (staff). The owner no longer sees the dropzone balance dressed as their own.
- **Notifications → Inbox** (also holds rig-inspection requests and call messages).
- **Settings** is regrouped from the single list in 1.8 item 6:
  - *Operations*: aircraft (vehicles), tickets (fares), add-ons, equipment (rigs), inspection template, conditions.
  - *People and access*: permissions (a role-by-permission matrix on desktop), roles.
  - *Business*: branding, rules (eligibility settings), money (transactions), master log, visibility (publish).
  - Appearance and sign-out move to Account.
- **Weather** becomes a strip on the board header (wind at altitude, jump run, ground temperature, "Update") with editing in a panel or sheet; the navy wizard and `JumpRunSelect` dial go (D-UI7).
- **Profile** becomes: summary and eligibility (pass/fail with fixes), then sections (Jumps, Funds, Equipment) as a single scroll on phones and a two-column page on expanded; the User stack is registered once and URLs for the other three paths redirect.

### 5.3 What changes when the product is generalised

Navigation labels, screen titles, empty states, crew roles and the call presets come from the profile's terms (Section 6). The structure above does not change: **Board** is the board of trips, **People** the participants, **Setup → Operations** lists vehicles and fares. Skydiving-only screens (jump-run, exit spot, wing loading, rig inspection) become profile-enabled modules: the shell shows them only when `industryProfile.modules` includes them (data from P7.1). Cargo, multi-leg routes and the dive-site picker are out of scope until D6.

---

## 6. Terminology and configuration layer

Aligned with `backend:docs/reference/GENERALISATION.md` §5 and P7.2, with one change: **the client does it first** (D-UI5).

1. `app/i18n/` with i18next and react-i18next (current versions are **26.4.3** and **17.0.16**; the backend plan's "25.x / 15.x" is stale), `expo-localization` for the device locale, `en-AU` default, `en` fallback.
2. Two namespaces: `common` (UI chrome, sentences with interpolation) and `terms` (domain nouns with plural forms: `trip_one/trip_other`, `vehicle`, `place`, `participant`, `departureCall`, `destination`, crew roles, state names). `terms` ships in the app as `en/terms.skydiving.json`; when P7.1 lands, `useProfileTerms()` swaps in the operator's `industryProfile.terminology` with `addResourceBundle`, exactly as the backend plan describes.
3. **Sentences take terms as parameters**: `t('common:newTrip', { trip: t('terms:trip') })`, so "New load" and "New dive" are one string. Composite phrases that do not decompose (e.g. "Mark as Landed") are separate keys per profile with a skydiving default.
4. **Formatters, not literals**, for skydiving's native feel: `formatDestination` ("14k" for skydiving, "Hogs Breath Reef · 18 m" for a dive profile), `formatCall` ("20 minute call" or "Departure call"), `formatQuantity` (kg/lb, ft/m, kn/km/h, °C/°F; `GENERALISATION.md` §4 puts SI in the API and conversion in the client), `formatMoney` (replaces the literal `$` in 140 strings; takes currency from the operator).
5. Lint: `eslint-plugin-i18next` `no-literal-string` (6.1.5 is current) in `jsx-text-only` mode, enabled directory by directory as screens convert. Phase 7's P7.7/P7.8 become "turn the rule on for the rest".
6. Dates: standardise on **luxon** (already used for the dropzone clock, `utils/dropzoneTime.ts`) and remove date-fns from 19 files as they are touched.
7. The profile also supplies: call presets, crew roles per trip, which modules are visible, unit defaults, default brand colour. None of these may be inferred from the vehicle kind in the UI.

*Keeping skydiving first-class:* the bundled `skydiving` terms are the baseline every test and screenshot runs against; a second bundled profile (`diveBoat`) exists in the repo from Phase 3 as a fixture so that every new screen is checked with both. Skydiving users never see a generic word because the default profile uses theirs.

---

## 7. Accessibility

**Target: WCAG 2.2 level AA on web; on iOS and Android, VoiceOver and TalkBack operability for the five core flows (sign in, find my load, manifest a person, call and land a load, top up credit), 44 pt / 48 dp minimum touch targets, and layouts that survive font scale 200%.** The standard is the WCAG 2.2 Success Criteria (1.4.3 text contrast, 1.4.11 non-text contrast, 2.4.7 focus visible, 2.5.8 target size, 4.1.2 name/role/value). It is a target for new and converted screens from the first phase, and the whole app by Phase 6.

Enforced by:

| Mechanism | Catches | Where |
|---|---|---|
| Token tests | every foreground/background pair and every derived brand pair ≥ 4.5:1 (3:1 for large text and icons) | Jest, `app/ui/tokens/__tests__` |
| Component types | `IconButton` and `Avatar` require `accessibilityLabel`; `Button` and `ListRow` set `accessibilityRole` and `accessibilityState` themselves; form components wire label, helper and error text | `app/ui/components` |
| ESLint | raw touchables outside `app/ui`; hex colours; missing `Image` alt | `eslint.config.js` |
| Testing Library | tests use `getByRole('button', { name })`, which fails if the role or name is missing | Jest |
| axe on web | `@axe-core/playwright` 4.13.0 on every route of the Playwright suite at 4 widths, light and dark; build fails on serious or critical | CI |
| Manual | a VoiceOver and a TalkBack pass over the five flows each phase; the owner checklist in `docs/SMOKE_TEST.md` gains a section | per phase |
| Large text | Playwright with font sizes doubled (as P5.8 does) plus Android emulator with font scale 2.0 | CI nightly |

(`eslint-plugin-react-native-a11y` is not an option: unmaintained since 2024 and ESLint 8 only, see 1.10.)

---

## 8. Testing strategy

Goal: the Android layout class of bugs (BUG-070…078) cannot come back unnoticed. Layout cannot be proven in Jest, so the plan puts each kind of check where it can actually fail.

| Layer | What it covers | Tools | Platforms and sizes | When |
|---|---|---|---|---|
| **Static** | no fixed pixel layout in screens, no hex, no raw touchables, no `Dimensions.get`, no `KeyboardAvoidingView` (existing) | ESLint rules (3.5): numeric `width`/`height` allowed only in `app/ui` and an explicit allow-list | all | every PR |
| **Component** | each `app/ui` component: states, roles, names, error text, density variants, both themes, both `terms` profiles | Jest + Testing Library 14, `getByRole` | jest-expo (iOS and Android mocks) | every PR |
| **Gallery** | every component and every domain component in every state on one route (`/__gallery`, dev and CI builds only) | Playwright screenshots | web 360×640, 390×844, 820×1180, 1440×900; light and dark; 200% text | every PR |
| **Screen** | the board, load, picker, My day, profile, settings, people with the seeded backend: layout invariants (no horizontal scroll, primary action visible, last row reachable: `checkLayout` from `scripts/web-smoke.mjs`), screenshots, axe | Playwright Test against the backend `staging` branch with the dev seed (this is P8.7 pulled forward) | the same four sizes | every PR |
| **Flow** | time-critical journeys with counted steps: manifest one person in ≤ 3 interactions, group of 4, call/cancel call/depart/land, move a person, jumper takes self off; assertions on step count make the "two taps" principle a test | Playwright (web); Maestro YAML flows (native) | web 1440 and 390; Android emulator Pixel-class and a 360×640 profile, font scale 1.0 and 2.0; iOS simulator weekly | web every PR, Android nightly, iOS weekly |
| **Visual regression** | the gallery and six screens | Playwright `toHaveScreenshot` with per-platform baselines in the repo, 0.2% pixel tolerance, masked clocks and countdowns | web only per PR; Android emulator screenshots nightly with Maestro | as above |
| **Real device** | feel (haptics, gestures, keyboard on a small phone, sunlight legibility) | `docs/SMOKE_TEST.md`, shortened to what automation cannot see | one iPhone, one Android, one small Android | each phase's owner check |

CI shape: `checks` (unchanged) → `web-ui` (builds the web export, boots the backend, runs Playwright; about 6–8 min with sharding) → nightly `android-ui` (emulator, Maestro) and weekly `ios-ui`. Baselines are updated only by a reviewed PR.

---

## 9. Sequencing

### 9.1 Order and dependencies

Done already (no longer constraints): Expo/RN upgrade, Paper 5, Redux removal, Jest harness, layout primitives.

```
Phase 0 foundations ──► Phase 1 shell ──► Phase 3 board ──► Phase 4 jumper
          │                  │                  └──────────► Phase 5 people + setup
          └─► Phase 2 core components ────────────────────────┘
                                                   Phase 6 terminology finish + units (needs backend P7.1/P7.3, D5)
                                                   Phase 7 hardening
```

- **Parallel from day one:** the backend asks in Section 11; the Playwright and axe CI job (Phase 0) independent of the UI work; the i18n runtime (Phase 0) independent of tokens.
- **Must come first:** tokens and the theme adapter (everything reads them); the Playwright job (so every later phase has a safety net); the i18n runtime (so converted screens never take hard-coded strings).
- **Rework traps if done in the wrong order:**
  - Converting strings to `t()` in a separate pass after the redesign touches each of ~375 files twice. Fold it into the phase that rewrites the screen (D-UI5).
  - Restyling screens on Paper before the tokens exist repeats the hex-literal problem. Tokens first, then Paper's theme is generated from them.
  - Moving to Paper 6 first would be thrown away.
  - Renaming URLs to neutral paths (Phase 6) before the shell and screens are stable would break deep links twice.
  - Building the desktop board before the shell (sidebar, header) forces a second layout pass.
  - Shipping generic terms before the picker and board exist means the highest-value strings are translated in screens about to be deleted.
- **Backend dependency on D5:** only Phase 6's profile swap. Phases 0–5 use the bundled skydiving terms.
- **Pending owner checks** (Phase 5 layout checklist, P6.27 device smoke) should happen on the *current* app before Phase 1 ships, so regressions are attributable.

### 9.2 What the existing plan loses and gains

| Existing task | Outcome |
|---|---|
| P7.2 (i18n runtime, tabs and drawer only) | Pulled forward to Phase 0 and unblocked from D5 (bundled terms). |
| P7.7, P7.8 (convert all screens) | Absorbed into Phases 3–5; Phase 6 only enables the lint rule for the remainder. |
| P7.3 (units), P7.1 (profile) | Unchanged, backend-led, consumed in Phase 6. |
| P8.7 (release smoke tests in CI) | The Playwright job is pulled forward to Phase 0; P8.7 shrinks to "run it against a release build". |
| P3.12 / P5.x | Done; this plan builds on them. |

---

## 10. Phased roadmap

Effort is relative: S ≈ days, M ≈ 1–2 weeks, L ≈ 3–4 weeks of one engineer. Every phase ships: the app is releasable at the end of each and each phase's PR set is stacked so it can merge in order.

| # | Phase | Effort | Depends on | Ships |
|---|---|---|---|---|
| 0 | Foundations and safety net | M | none | invisible to users; hex-free token module; CI that renders layouts |
| 1 | App shell and navigation | M | 0 | sidebar/rail/tabs by role, account menu, headers with back, no drawer |
| 2 | Core components and Paper facade | L | 0 | `app/ui` component set, gallery, first forms converted |
| 3 | Manifest board, load and picker | L | 1, 2 | the redesigned board, load, quick manifest, roster |
| 4 | Jumper experience | M | 1, 2 | Today, wallet, inbox, self-manifest, eligibility |
| 5 | People, setup and conditions | L | 1, 2 | people list, profile, settings regrouped, permissions matrix, conditions panel |
| 6 | Terminology finish, units, profile swap | M | 3–5; backend P7.1, P7.3 (D5) | generic vocabulary, units, URL aliases |
| 7 | Hardening | S–M | 3–5 | Paper removed, motion, performance, owner polish |

### Phase 0: foundations and safety net (M)

- Scope: `app/ui/tokens` and `app/ui/theme` (3.1–3.2) with the contrast function and its tests; Paper and Navigation themes **generated** from tokens (replaces `theme/palette.ts` internals; same exports so nothing else changes); default brand colour (D-UI3); system fonts (D-UI8); lint rules in warn mode with an allow-list; `app/i18n` with the skydiving `terms` and the two bundled profiles, `useTerms()`; `@testing-library/react-native` 14; `@playwright/test` and `@axe-core/playwright` as dev dependencies, `scripts/web-smoke.mjs` rewritten as a Playwright Test suite, new CI job `web-ui` (boots the backend staging branch with the dev seed); the `@rn-primitives` spike (Dialog, Select, Tabs on web and TalkBack/VoiceOver); remove the dead files and the quick fixes in 1.11 that touch no behaviour.
- Touches: `app/theme/*`, `app/constants/Colors.ts`, `eslint.config.js`, `.github/workflows/ci.yml`, `scripts/web-smoke.mjs`, `app/entrypoint/bootstrap`.
- Verify: token tests green (every pair ≥ 4.5:1); Playwright suite reproduces today's smoke at four widths; axe runs (violations recorded as a baseline, not failing yet); the app looks the same except default colours and fonts; spike notes committed with a go/no-go for `@rn-primitives`.

### Phase 1: app shell and navigation (M)

- Scope: role-adaptive tabs computed before render (also fixes BUG-100); left rail on medium and sidebar on expanded via a custom `tabBar` and `tabBarPosition: 'left'`; account menu and operator switcher replace `components/drawer/Drawer.tsx` and `screens/drawers/UserDrawer.tsx`; `ScreenHeader` (title, back, actions) replaces `components/appbar/AppBar.tsx`; credits chip removed from the header; User stack registered once with redirects from the other paths; contrast-safe tab colours (fixes the 1.7:1 dark tab icons).
- Touches: `screens/authenticated/routes.tsx`, `TabBar*.tsx`, `screens/routes.tsx`, `components/appbar/*`, `components/drawer/*`, `screens/drawers/*`.
- Verify: Playwright at four widths shows sidebar/rail/tabs correctly per role fixture; cold load of `/users` works; axe has no navigation violations; keyboard can reach every nav item; owner check on a phone and a tablet.

### Phase 2: core components and Paper facade (L)

- Scope: build the fifteen components (3.4), the gallery route and its screenshot tests; convert `TextField`/`NumberField`/`Select`/`Chip`/`Sheet`/`Dialog` users in forms (`app/forms/*`) behind the new components; delete `Themed.tsx`, `layout/Screen.tsx`, `layout/ScrollableScreen.tsx`; ratchet the lint allow-list.
- Touches: `app/ui/components/*`, `app/components/input/*`, `app/components/layout/*`, `app/forms/*` (about 40 files).
- Verify: gallery snapshots at four widths × two themes × two profiles; component tests; no Paper import left in `app/forms`; axe clean on forms.

### Phase 3: manifest board, load and picker (L), the highest-value phase

- Scope: new `LoadCard`/board (columns on expanded, list on compact, list plus detail on medium); load screen with the call card, crew chips that wrap, seat list with `EligibilityBadge`, free seats collapsed; "Add" picker (full screen, side panel, roster panel) with search, filters, eligibility reasons and one-tap defaults; context-aware primary action (Call, Cancel call, Departed, Land) in the card and the load screen; "Move to…" and, on web, drag between columns and from the roster; conditions strip in the board header (editing moves to Phase 5); empty states; live-update highlighting without reflow; all strings through `t()`.
- Replaces: `ManifestScreen.tsx`, `LoadCard/*`, `Weather/WeatherBoard.tsx` (strip), `load/LoadScreen.tsx`, `load/Header.tsx`, `load/InfoGrid.tsx`, `load/ActionButton.tsx` speed dial, `slots_table/*`, the three slot cards, `autocomplete/DropzoneUserAutocomplete*.tsx`, `forms/manifest_user/*`, `components/dialogs/ManifestGroup/*`.
- Backend asks: D-UI9 items 1–2 (per-member eligibility reasons, last slot).
- Verify: flow tests with step-count assertions (manifest one person ≤ 3 interactions; group of 4 ≤ 6; call, depart, land; move; take off) on web 1440 and 390 and on the Android emulator nightly; layout invariants at four widths; axe clean; the owner runs the manifest section of `SMOKE_TEST.md` with real staff for one day. **Exit criterion: a manifest user can add a returning jumper to a load, reading no more than the picker row.**

### Phase 4: jumper experience (M)

- Scope: **Today** screen (next jump with countdown and state, pass/fail checklist with fixes, credit, today's jumps), self-manifest from Today and Board, Wallet (balance, top-up, history; replaces `screens/authenticated/user/orders|order_receipt|transactions` for the jumper), Inbox (notifications, rig-inspection requests), push deep links land on Today.
- Touches: new `screens/authenticated/today/*`, `user/profile/*`, `notifications/*`, `forms/credits/*`.
- Verify: flow test "find my load and take myself off" on phone sizes; VoiceOver/TalkBack pass; Today renders at 200% text with no clipping.

### Phase 5: people, setup and conditions (L)

- Scope: People (table on expanded, rows elsewhere, filters by role and eligibility, search); profile redesign (summary, eligibility with fixes, sections); Settings regrouped (5.2); permissions as a matrix (`configuration/permissions/PermissionsScreen.tsx`, 440 lines, rebuilt); aircraft/tickets/add-ons/rigs on the common list-and-form pattern; conditions editing in a panel or sheet with numeric heading field (D-UI7); Overview charts fixed or replaced; remaining wizards on `FormColumn` with new components.
- Verify: Playwright screens at four widths; axe clean; permission matrix flow (grant, revoke) tested; no Paper import under `screens/authenticated/configuration|user|overview`.

### Phase 6: terminology finish, units, profile swap (M; needs D5 and backend P7.1/P7.3)

- Scope: `useProfileTerms()` reads the API profile; `formatQuantity`/`formatMoney`/`formatDestination`/`formatCall` take unit system and currency from the operator; neutral route aliases with redirects for one release; `no-literal-string` lint on all of `app/**`; remaining directories converted; the dive-boat profile is exercised by the gallery and screen tests (it already is a fixture).
- Verify: the screen suite runs twice, skydiving and dive boat, with screenshots of both; no skydiving noun in the dive-boat run (a test greps rendered text against a banned-word list); units switch kg/lb and ft/m end to end.

### Phase 7: hardening (S–M)

- Scope: remove Paper and `react-native-paper-dates` if Phase 5 left nothing (a date and time picker on tokens), motion and reduced motion, haptics on call and depart, FlashList on the roster if needed, bundle size audit (fonts removed, Paper removed, date-fns removed), performance pass on a 14-seat board with live updates, final owner polish.
- Verify: bundle size and startup compared to the Phase 0 baseline; the full suite at four widths and two themes; owner checklist on three devices.

---

## 11. Backend asks (small, additive, can run in parallel)

1. **Eligibility with reasons**: `DropzoneUser.eligibility(loadId)` returning `{ ready, reasons[] }` (the rules in `backend:app/models/slot.rb:125-131` and `dropzones/configuration.rb`), so the picker shows "Reserve repack overdue since 2 Oct" instead of a boolean. Today the client has `hasLicense`/`hasMembership`/`hasRigInspection`/`hasReserveInDate`/`hasCredits`/`hasExitWeight` and no reasons. List-safe thanks to P6.25's dataloaders.
2. **Last slot** (`DropzoneUser.lastSlot`: ticket, jump type, rig, exit weight) for the one-tap defaults.
3. **Call presets** from the dropzone settings (today hard-coded 10/15/20 in `ActionButton.tsx:53-70`); later from the industry profile.
4. **`Load.callAt`** (when the call was made) if `dispatch_at` alone cannot show "called at 12:10"; confirm before building.
5. Later (Phase 6): the industry profile fields in `GENERALISATION.md` §3 (terminology, modules, units, call presets, crew roles).

---

## 12. Risks

| Risk | Why it is real here | Mitigation |
|---|---|---|
| Two visual systems side by side for several phases | Paper in 154 files, `app/ui` growing | Paper's theme is generated from the same tokens, so the old screens already inherit brand, density and dark values; ratcheting lint allow-list; per-directory definition of done |
| The board redesign is the whole value and the largest risk | Staff use it under pressure; regressions cost real departures | Phase 3 behind a setting for one release ("New board", on by default for new installs, off for existing); flow tests with step counts; one staffed day of owner checks; keep the old board code until the setting is removed |
| Drag and drop and live updates fight (items move while dragged) | ActionCable pushes `loadUpdated`; `@dnd-kit` assumes stable lists | Freeze reordering of the dragged column while dragging, apply updates after drop; test with a scripted subscription push |
| `@rn-primitives` fails the web a11y spike | Peers are `*` and it is maintained by a small team (last release July 2026) | Spike has an explicit fallback (own semantics on existing `Select.web.tsx`, `Menu.web.tsx`); components expose our API, so swapping the internals is local |
| Playwright in CI is slow or flaky | Needs backend, DB, seed, web export | Shard by width; retry once; baseline updates by PR; fixed seed (`dev_baseline`) and masked countdowns; keep Android nightly, not per PR (D-UI10) |
| Backend gaps (eligibility reasons, last slot) arrive late | Cross-repo dependency | The picker ships with the boolean fields first (feature flag per field); reasons light up when the API has them |
| Brand colours chosen by operators break contrast | Arbitrary hex in `Dropzone.primaryColor` (`ColorPicker`) | Derivation guarantees text pairs; picker shows the derived result live; unit tests with 50 colours including extremes |
| i18n regressions in server-built copy | Notification and activity text is built by the backend (`backend:app/models/notification*.rb`), not by the client | Out of scope for the client; list the strings in the backend plan's Phase 7 (`Operator#term`); keep client-built strings in `common` |
| Native font and density differences | System fonts shift metrics per platform | Gallery screenshots per platform nightly; layouts use flex and min sizes, never text-width assumptions |
| Owner device checks backlog | Phase 5 and P6.27 checks are still open | Do them before Phase 1 ships; otherwise regressions cannot be attributed |
| Scope creep into offline, reports, new features | Easy to add while redesigning | Section 13 and D-UI11 keep them explicit; each phase has a "ships" line and nothing else |

---

## 13. Open questions

1. **Staff devices.** What do manifest staff actually use at the desk (tablet on a stand, laptop, phone)? Which browser? (D-UI4.)
2. **Dropzones with poor signal.** Is offline manifesting needed? (D-UI11.)
3. **Who reads what on the day:** do pilots need a screen at all beyond "which load, when"? Does the DZSO need the conditions strip prominently?
4. **Tandem operations.** The picker pairs a tandem passenger with an instructor today (`passengerName` fields in `forms/manifest_user/ManifestForm.tsx`). Is a first-class "pair" seat wanted in the board, or is the current flow enough?
5. **Group manifest** is a bulk flow in `components/dialogs/ManifestGroup/*`. Should groups become a persistent concept on the board (bracketed seats in the mockup), or stay a one-off action?
6. **Weather** beyond manual entry: is the winds-aloft feed (`backend` P6.19) trusted enough to show without "Update" for staff?
7. **Reports**: what do managers read in Overview, and is anything in `overview/statistics/*` worth keeping once the charts are fixed?
8. **Payments**: only prepaid credit today. Does a generalised operator need card-on-the-day, deposits or refunds in the UI?
9. **Branding of OpenManifest itself** (the cloud logo on the login screen) versus the operator's: is the product mark shown inside operator-branded screens?
10. **D1–D8 from the modernisation plan** (D5 in particular) set the pace of Phase 6.

---

## Appendix A: how the numbers were produced

Scripts used (kept outside the repo; commands are reproducible):

- File list: `git ls-files 'app/**/*.ts' 'app/**/*.tsx'` excluding tests, mocks, fixtures and generated API files (476 files, 339 TSX, 34,247 lines).
- Colours, styles, fixed sizes, scroll containers, platform branches, accessibility props: regular-expression counts over that list (hex `#[0-9A-Fa-f]{3,8}`, `StyleSheet.create`, `style={{`, `(height|minHeight|maxHeight):\s*\d+`, `position:\s*'absolute'`, `accessibility(Label|Role|Hint|State)`, `testID`, `hitSlop`, `Platform\.(OS|select)`).
- Paper and internal import frequencies: parse `import {…} from 'react-native-paper'` and `from 'app/(components|hooks|providers|forms)/…'`.
- Terminology: extract quoted strings, template literals and JSX text, then count term regexes (`\bloads?\b`, `\bslots?\b`, `\bmanifest(?:ing|ed)?\b`, …).
- Contrast: WCAG relative luminance, `(L1 + 0.05) / (L2 + 0.05)`.
- Screenshots: Playwright (Chromium) against `EXPO_ENV=local expo export --platform web` served from `dist/` and the backend dev server with the `dev_baseline` seed, logged in as the owner, at 390×844, 820×1180 and 1440×900.
- Permissions per role: `backend:config/seed/access.yml`.

## Appendix B: library checks (2026-10-11)

| Package | Latest | Published | Notes | Source |
|---|---|---|---|---|
| react-native-paper | 5.15.3 (alpha 6.0.0-alpha.0) | 26 May 2026 (alpha 15 Jun) | 6.0 alpha: MD3, FAB and TextInput rewritten, deprecated API removed, Reanimated peer | [npm](https://www.npmjs.com/package/react-native-paper), [releases](https://github.com/callstack/react-native-paper/releases) |
| tamagui | 3.0.3 | 11 Oct 2026 | major released 10 Oct | [npm](https://www.npmjs.com/package/tamagui) |
| nativewind | 4.2.7 (5.0.0-rc.0 under `preview`/`rc`) | 14 Sep 2026 | v5 pairs with `react-native-css` 3.1.0-rc.0 and Tailwind 4 for Expo 57; docs call v5 pre-release | [npm](https://www.npmjs.com/package/nativewind), [migration guide](https://www.nativewind.dev/v5/guides/migrate-from-v4) |
| uniwind | 1.12.2 | 5 Oct 2026 | Tailwind 4, RN ≥ 0.81, MIT; paid Pro build | [npm](https://www.npmjs.com/package/uniwind), [docs](https://docs.uniwind.dev/pro-version) |
| react-native-unistyles | 3.5.2 | 9 Oct 2026 | Nitro Modules + Reanimated peers, RN ≥ 0.81 | [npm](https://www.npmjs.com/package/react-native-unistyles) |
| gluestack-ui | 5.0.3 | 25 Jun 2026 | built on NativeWind v5 | [npm](https://www.npmjs.com/package/gluestack-ui), [v5 alpha notes](https://gluestack.io/blogs/gluestack-ui-v5-alpha-release) |
| @expo/ui | 57.0.22 (SDK 57 tag) | 6 Oct 2026 | SwiftUI and Jetpack Compose stable since SDK 56; web experimental | [Expo blog](https://expo.dev/blog/expo-ui-stable-sdk-56), [SDK 57 docs](https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/) |
| @rn-primitives/dialog, select, tabs, popover, tooltip | 1.5.2 (portal 1.5.3) | 2 Jul 2026 (portal 8 Aug) | peers `*`, include react-native-web | npm |
| @shopify/flash-list | 2.3.3 | 1 Oct 2026 | | npm |
| @dnd-kit/core / @dnd-kit/react | 6.3.1 / 0.5.0 | Dec 2024 / 11 Jun 2026 | | npm |
| @gorhom/bottom-sheet | 5.2.14 | 9 May 2026 | reanimated ≥ 4 | npm |
| react-native-gesture-handler | 3.3.0 (legacy 2.33.0) | 11 Sep 2026 | repo is on ~2.32 | npm |
| @testing-library/react-native | 14.1.0 | 8 Oct 2026 | RN ≥ 0.78, React ≥ 19 | npm |
| @playwright/test / @axe-core/playwright | 1.64.0 / 4.13.0 | 7 Oct / 11 Aug 2026 | | npm |
| i18next / react-i18next | 26.4.3 / 17.0.16 | 10 Oct / 6 Oct 2026 | backend plan says 25.x / 15.x | npm |
| eslint-plugin-i18next | 6.1.5 | 28 Jun 2026 | | npm |
| eslint-plugin-react-native-a11y | 3.5.1 | 4 Nov 2024 | ESLint ≤ 8 only: not usable | npm |
| Maestro | 2.8.0 (Maven artifacts) | 31 Jul 2026 | YAML flows, mobile and web | [guide](https://qaskills.sh/blog/maestro-mobile-testing-guide-2026) |
| @react-navigation/bottom-tabs, drawer | 7.20.0, 7.14.3 (installed) | | `tabBarPosition: 'left'`, `drawerType: 'permanent'` present in installed types | `node_modules/@react-navigation/*/lib/typescript` |

Not checked (stated as unverified): Maestro's current CLI version number (only its Maven artifacts), `@rn-primitives` behaviour on TalkBack/VoiceOver (that is the Phase 0 spike), and Uniwind's react-native-web behaviour beyond its own docs.
