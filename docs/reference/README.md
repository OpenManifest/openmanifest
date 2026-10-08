# OpenManifest client — reference documentation

Reference for the Expo / React Native client (`OpenManifest/openmanifest`), written in pass 1 on 2026-10-08 against
`staging` at `3112795`. The system-wide reference (domain, backend, multi-tenancy, deployment) is in the backend repo:
<https://github.com/OpenManifest/openmanifest-server/blob/staging/docs/reference/README.md>.

Related documents (backend repo, `docs/`):
[MODERNISATION_PLAN.md](https://github.com/OpenManifest/openmanifest-server/blob/staging/docs/MODERNISATION_PLAN.md) (source of truth for all work),
[BUGS.md](https://github.com/OpenManifest/openmanifest-server/blob/staging/docs/reference/BUGS.md) (bug register for both repos),
[CLOUD_ENV.md](https://github.com/OpenManifest/openmanifest-server/blob/staging/docs/reference/CLOUD_ENV.md) (cloud VM setup).
Client diagrams: [diagrams.md](diagrams.md).

## 1. Stack

| Concern | Library (installed version) | Where |
|---|---|---|
| Runtime | Expo SDK 47.0.13, React Native 0.70.8, React 18.1.0, JavaScriptCore on native (no `jsEngine` set; Hermes becomes the default in SDK 48) | `package.json`, `app.json` |
| Language | TypeScript 4.9.4 (`strict`), path alias `app/*` via `babel-plugin-module-resolver` | `tsconfig.json`, `babel.config.js` |
| Server data | Apollo Client 3.7.11 (`BatchHttpLink`, ActionCable link for subscriptions) | `app/api/` |
| Client state | Redux Toolkit 1.9.3 + redux-persist 6 (`global` slice persisted) | `app/state/` |
| Navigation | React Navigation 6 (stack, drawer, material bottom tabs) | `app/screens/**/routes.tsx` |
| UI kit | react-native-paper 4.12.4, @gorhom/bottom-sheet 4.4.5, react-native-reanimated 2.12.0 | |
| Forms | react-hook-form 7 + yup (newer forms in `app/forms/`); Redux form slices (older forms in `app/components/forms/`) | |
| Code generation | graphql-codegen (`codegen.yml`) → `app/api/schema.d.ts`, `operations.ts`, `reflection.tsx` | |
| Web | `expo export:web` (webpack 4 via `@expo/webpack-config`) | `webpack.config.js` |
| Builds | EAS Build / EAS Update (`eas.json`, project id `1d8fa34d-2ff8-4095-ab49-29a426117a8c`) | |
| Monitoring | AppSignal JS (`@appsignal/javascript`, Apollo link), `sentry-expo` (installed, unused) | `app/api/client/links/appSignal.ts` |
| Lint/format | ESLint (react-hooks rules only), Rome 11 nightly (lint + format), Prettier config | `.eslintrc.js`, `rome.json` |

Environment selection: `EXPO_ENV` ∈ `local` | `staging` | `production` (default `local`) picks the API endpoint in
`build/constants.ts` (`local` = `http://local.openmanifest.org:5000/graphql`, `staging` = `https://stg.openmanifest.org/graphql`,
`production` = `https://prod.openmanifest.org/graphql`). The websocket URL is derived from it
(`app/api/client/utils/getServerUrl.ts`, `links/websockets.ts`).

## 2. Navigation map and screens

Root stack (`app/screens/routes.tsx`, header hidden). Which branch renders depends on persisted Redux state:
`credentials` absent → **Unauthenticated**; `credentials` present and `currentDropzone` (deprecated snapshot) absent →
**Limbo**; both present → **Authenticated**. **Wizards** and **NotFound** are always registered.

```
Root (stack)
├── Unauthenticated (stack)      LoginScreen /login · SignUpScreen /signup
├── Limbo (stack)                DropzoneSelectScreen /select-dropzone
├── Authenticated
│   └── LeftDrawer (drawer: UserDrawer — dropzone switcher, profile, logout)
│       └── Tabs (material bottom tabs; TabBar.web.tsx on web)
│           ├── Overview      DashboardScreen /dropzone/dashboard · OverviewScreen /overview
│           │                 (visible with viewStatistics permission or moderator)
│           ├── Manifest      ManifestScreen /dropzone/manifest · LoadScreen /dropzone/load/:loadId
│           │                 WeatherConditionsScreen /dropzone/weather · WindScreen /dropzone/weather/winds
│           │                 JumpRunScreen /dropzone/weather/jumprun
│           │                 User (stack, see below, under /dropzone/manifest/users/…)
│           │                 Configuration (stack): SettingsMenuScreen /dropzone/configuration ·
│           │                   DropzoneSettingsScreen /basic · AircraftsScreen /aircrafts · TicketTypesScreen /ticket-types ·
│           │                   ExtrasScreen /dropzone/ticket-types/extra · RigInspectionTemplateScreen /rig-inspection ·
│           │                   DropzoneRigsScreen /rigs · TransactionsScreen /dropzone/transactions ·
│           │                   PermissionScreen /permissions · MasterLogScreen /dropzone/master-log
│           ├── Notifications NotificationsScreen /notifications · User stack
│           └── Users         UserListScreen /users · ProfileScreen /user/:userId · EquipmentScreen ·
│                             OrdersScreen · OrderReceiptScreen · RigInspectionScreen   (visible with readUser)
├── Wizards (stack, modal)       DropzoneWizardScreen /setup · UserWizardScreen · RecoverPasswordScreen /recover-password ·
│                                ConfirmUserScreen /confirm · ChangePasswordScreen /change-password · User stack (/modal/user/…)
└── NotFound
```

User stack (reused in Manifest, Notifications, Users and Wizards): `UserListScreen`, `ProfileScreen` (tabs: jumps,
equipment, transactions), `EquipmentScreen`, `OrdersScreen`, `OrderReceiptScreen`, `RigInspectionScreen`.

Deep-link config: `app/screens/routes.tsx` `options` (prefixes `openmanifest://`, `https://www.openmanifest.org`,
`https://staging.openmanifest.org`, `http://localhost:19006`). It references three screens that are not registered
(`Manifest/DashboardScreen`, `Configuration/AircraftScreen`, `Unauthenticated/SignUpWizard`) — BUG-083.

Main flows:

| Flow | Screens / components |
|---|---|
| Login | `LoginScreen` → `login/form/LoginForm.tsx` (`userLogin`), `AppleButton*.tsx`, `FacebookButton*.tsx` → Limbo |
| Sign up | `SignUpScreen` (wizard) → confirmation email → `ConfirmUserScreen` |
| Select dropzone | `DropzoneSelectScreen` (list of dropzones, create → `DropzoneWizardScreen`) |
| Manifest board | `ManifestScreen` (load cards, `app/providers/manifest/provider.tsx` for date/filters), FAB: new load, manifest me |
| Load | `LoadScreen` (slots table `app/components/slots_table/`, `ActionButton.tsx` for calls/land/cancel, drag-and-drop on web) |
| Manifest a jumper / group | `app/forms/manifest_user/*` sheet, `app/components/dialogs/ManifestGroup/*` |
| Credits | `app/forms/credits/*` (`createOrder`) from profile and transactions |
| Weather | `WeatherConditionsScreen`, `WindScreen`, `JumpRunScreen` (`app/components/forms/weather_conditions/`) |
| Setup | Configuration stack screens; forms in `app/forms/{aircraft,ticket_type,ticket_type_addon,dropzone}` and `app/components/forms/*` |

## 3. Store shape

Redux store (`app/state/store.ts`), persisted with redux-persist under key `persist:open-manifest.0.9.1` (AsyncStorage on
native, `localStorage` on web), whitelist `global` only.

| Slice | Fields | Kind | Notes |
|---|---|---|---|
| `global` | `credentials` (`accessToken`, `client`, `uid`, `expiry`, `tokenType`), `authenticated` | session | persisted unencrypted (BUG-017) |
| `global` | `currentDropzoneId` | session | read in 21 files |
| `global` | `currentUser`, `currentDropzone`, `permissions` | **server-data snapshot (deprecated)** | duplicates Apollo data; `currentDropzone` still decides Limbo vs Authenticated in `routes.tsx` |
| `global` | `expoPushToken`, `currentRouteName` | device/UI | |
| `global` | `theme`, `palette`, `isDarkMode` | UI preferences | theme derived from dropzone colours; read in ~19 files |
| `imageViewer` | open image | UI | |
| `screens.*` | `manifest`, `users`, `login`, `signup`, `dropzoneWizard` | UI | `app/screens/slice.ts` |
| `forms.*` | `dropzone`, `dropzoneUser`, `rig`, `rigInspection`, `rigInspectionTemplate`, `manifest`, `manifestGroup`, `user`, `weather` | form state | `app/components/forms/slice.ts`; `useAppSelector` on `forms.*` in ~25 files |

Server data lives in the Apollo `InMemoryCache` (`app/api/client/cache.ts`, type policies for pagination). Mutations update
it via `refetchQueries`, `update` functions and optimistic responses (`app/api/crud/useLoad.tsx`).

Problems: logout resets only `global` (BUG-069); auth-error logout does not clear Apollo; form slices survive dropzone
switches. Target state (plan Phase 4): Apollo for server data, zustand `useSession` / `usePreferences` stores,
react-hook-form for forms, no Redux.

## 4. API layer

Three generations coexist in `app/api/`:

| Generation | Files | Pattern | Users |
|---|---|---|---|
| 1. Hand-written mutation hooks | `app/api/hooks/useMutation*.ts(x)` (16 files), `createMutation.tsx`, `createQuery.tsx` | inline `gql` documents, types from `schema.d.ts`, client-side validators | 7 importers |
| 2. Generated hooks | `app/api/{queries,mutations,fragments,subscriptions}/*.gql` (24 queries, 41 mutation documents) → `reflection.tsx` (`useXQuery`, `useXMutation`), `operations.ts` | graphql-codegen | 68 importers |
| 3. CRUD hooks | `app/api/crud/*` (`useLoad`, `useManifest`, `useDropzone`, `useUserProfile`, `useTickets`, `useAircrafts`, `useEquipment`, `useDropzones`, `factory.tsx`) | wrap generated hooks; return `{ data, loading, create, update, … }`, normalise `fieldErrors` | 42 importers |

Operations: 76 named operations (41 mutations, 32 queries, 3 subscriptions: `loadCreated`, `loadUpdated`, `userUpdated`).
Pass 1 validated all of them against the live server schema: 0 validation errors, and the committed
`app/api/openmanifest.graphql` matches the server's introspection (0 differences).

Links (`app/api/client/links/`): `authentication.ts` (adds `access-token`, `client`, `uid` headers from Redux; stores
refreshed tokens from response headers), `errors.ts` (logs out on authentication errors, shows snackbars), `appSignal.ts`
(reports errors), `http.ts` (`BatchHttpLink`, batch max 10, with a module-level `AbortController` — BUG-063),
`websockets.ts` (`@rails/actioncable` + `graphql-ruby-client` `ActionCableLink`, URL `<api host>/subscriptions`),
`link.ts`/`index.ts` (split subscriptions vs HTTP).

Scripts: `yarn sync:schema` (download schema), `yarn ts:graphql` (codegen), `yarn check:graphql` (posts documents to
`<api>/graphql/validate`, a route the server does not have — BUG-080).

## 5. Authentication and session

1. `userLogin(email, password)` (graphql_devise) returns `credentials`; `LoginForm` dispatches `global.setCredentials`
   and `global.setUser`. Apple: `loginWithApple(token)`; Facebook: `loginWithFacebook(token)` via `expo-facebook`
   (cannot be built on current SDKs, BUG-084).
2. Every request carries `access-token`, `client`, `uid` (authentication link). devise_token_auth may rotate tokens; the
   link stores new values from response headers.
3. Subscriptions: credentials are passed as ActionCable channel params; the server looks the user up by `email: uid`
   (fails for Apple users, BUG-060).
4. Dropzone selection writes `currentDropzoneId` and the `currentDropzone` snapshot; the backend auto-creates a
   membership when the user's permissions are read (BUG-005).
5. Push: `app/entrypoint/providers/PushNotificationProvider.tsx` registers an Expo push token and writes it to the user
   with `updateUser(pushToken)`; it is never cleared on logout (BUG-018).
6. Logout (`app/api/hooks/useLogout.ts`): `abortController.abort()` (breaks all later requests, BUG-063),
   `client.clearStore()`, `global.logout()`.

## 6. Platform-specific files

Metro/webpack pick `*.web.tsx`, `*.android.tsx`, `*.ios.tsx` over the base file.

| File | Platform | Why |
|---|---|---|
| `app/entrypoint/EntrypointWrapper.web.tsx`, `providers/ThemeProvider.web.tsx` | web | web-only providers/fonts |
| `app/components/GradientText.web.tsx`, `LottieView.web.tsx`, `Skeleton.web.tsx` | web | native libs unavailable on web |
| `app/components/activity/{ActivityFeed,Feed}.web.tsx` | web | table layout |
| `app/components/autocomplete/DropzoneUserAutocomplete.web.tsx` | web | |
| `app/components/dialogs/ImageViewer/ImageViewer.web.tsx` | web | uses `react-image-lightbox` (deprecated) |
| `app/components/dialogs/ManifestGroup/ManifestGroup.web.tsx`, `app/forms/manifest_user/Dialog.web.tsx`, `app/forms/credits/Credits.web.tsx`, `app/components/layout/DialogOrSheet.web.tsx` | web | dialogs instead of bottom sheets |
| `app/components/input/LocationPicker.web.tsx`, `app/components/map/Map.web.tsx`, `app/screens/wizards/dropzone_wizard/steps/Location.web.tsx` | web | Google Maps JS instead of `react-native-maps` (maps issue client#127, BUG-085) |
| `app/components/input/date_picker/DatePicker.web.tsx`, `number_input/NumberField.web.tsx`, `select/Select.web.tsx`, `popover/Menu.web.tsx` | web | |
| `app/components/input/jump_run_select/JumpRunSelect.{android,web}.tsx` | Android, web | circular slider variants |
| `app/components/slots_table/AvailableRow.web.tsx`, `DragAndDrop/*.web.tsx` | web | drag-and-drop between loads (`@dnd-kit/core`) |
| `app/hooks/useColorScheme.web.ts` | web | |
| `app/screens/authenticated/TabBar.web.tsx` | web | top tab bar on wide screens |
| `app/screens/authenticated/dropzone/manifest/LoadCard/CountdownTimer.web.ts` | web | |
| `app/screens/authenticated/overview/statistics/LoadsByDay.web.tsx` | web | chart library differs |
| `app/screens/unauthenticated/login/form/AppleButton.{android,web}.tsx` | Android, web | Apple sign-in only on iOS (stubs) |
| `app/screens/unauthenticated/login/form/FacebookButton.web.tsx` | web | `react-facebook-login` |

`Platform.OS`/`Platform.select` branches are also used inline (`grep -rn "Platform\.\(OS\|select\)" app`); several omit
Android (BUG-078). Android layout root causes are listed in BUGS.md ("Android / mobile layout").

## 7. Build and release configuration (as of 2023)

- `app.json` (version 1.3.0, iOS `buildNumber` 44, Android `versionCode` 15) and `app.config.ts` (overrides version from
  `package.json` 1.1.60 via `build/constants.ts`; BUG-088). Bundle id `com.dangertechnologies.openmanifest`.
- `eas.json`: profiles `development`, `staging`, `production`; `runtimeVersion.policy: sdkVersion`; EAS Update URL with the
  project id above.
- `.github/workflows/publish.yml`: on push to `staging`/`main`, EAS Update and web deploy to GitHub Pages repos
  `OpenManifest/openmanifest-web-staging` / `openmanifest-web` (BUG-057; disabled in plan P0.1).
- Google Maps keys (`GOOGLE_MAPS_*`), AppSignal key and Facebook app id come from environment variables at build time
  (`app.config.ts` `extra`).

## 8. Local setup notes (pass 1, cloud VM)

Nothing below was committed; the plan's Phase 0 makes it reproducible.

| Step | What happened | Resolution |
|---|---|---|
| Node | No `.nvmrc`; CI used Node 16/18. Node 20 (`/opt/node20`) works with SDK 47 tooling | `export PATH=/opt/node20/bin:$PATH` |
| Yarn | Yarn 1 lockfile | `corepack` / `npm i -g yarn@1.22.22` |
| Install | `yarn install --frozen-lockfile` failed: `@sentry/cli` postinstall download from `downloads.sentry-cdn.com` blocked (403) | `SENTRYCLI_SKIP_DOWNLOAD=1 yarn install --frozen-lockfile` (~2 min) |
| Type check | `yarn check:types` (tsc) | passes |
| Lint | ESLint and Rome | pass |
| Tests | `check:testing` is `exit 0`. Running `npx jest` finds 1 suite / 8 tests (utility tests); `ManifestScreen` test is excluded and fails (react-test-renderer 17 vs React 18.1; after aligning, `BottomSheetModalInternalContext` null) — BUG-081, fix in plan P1.10 | |
| Expo API | `api.expo.dev` blocked; `npx expo install --check` and `expo-doctor` cannot fetch version data | `EXPO_OFFLINE=1` |
| Web export | `EXPO_ENV=local npx expo export:web` → `web-build/` (~3 min, warnings only). `--output-dir` is not supported in SDK 47 | move the old `web-build/` aside for a second build |
| Serving | the global `serve` package is broken in the VM | small Python SPA server (fallback to `index.html`); plan P0.8 adds `scripts/serve-web-build.py` |
| Browser test | Playwright with pre-installed Chromium; `fill()` on Paper inputs timed out | click + `keyboard.type`; launch with `--proxy-bypass-list=local.openmanifest.org` so the websocket is not sent through the agent proxy |
| Result | login → dropzone → manifest board → load screen works at 360×640 and 1280×800 against the local API. At 360×640 the login "Sign up" button is below the fold and the screen does not scroll (BUG-076) | |
| Audit | `yarn audit --groups dependencies --summary`: 715 advisories (61 critical, 452 high, 161 moderate, 41 low) | BUG-016 |

## 9. Known issues

All client bugs are in the shared register (backend repo `docs/reference/BUGS.md`, rows with Repo `client` or `both`):
BUG-016…018, 024, 040, 057, 063…088. Android/mobile layout problems are grouped by root cause (RC1–RC9) at the top of
that file. Open GitHub issues referenced there: client#127 (maps), client#126 (create ghost), client#133 and client#134
(Android keyboard in wizards).

## 10. Dependency inventory

Checked 2026-10-08 with `npm view <package> version time.modified deprecated` for every entry in `package.json`.
"Installed" is the version in `node_modules` after `yarn install --frozen-lockfile`. "Expo SDK 57 pin" is the version
range from `expo@57.0.27`'s `bundledNativeModules.json` (use `npx expo install` for these). "Last publish" is shown when
the package has not been published for two years or more — a sign of abandonment. The plan's Phase 3 removes or
replaces every deprecated or abandoned package.

Headline:

| Package | Installed | Latest | Target in plan |
|---|---|---|---|
| expo | 47.0.13 | 57.0.27 | 57.0.27 (P3.18) |
| react-native | 0.70.8 | 0.87.1 (npm `latest`) | 0.86.x pinned by SDK 57 |
| react | 18.1.0 | 19.3.0 (npm `latest`) | 19.2.x pinned by SDK 57 |
| @apollo/client | 3.7.11 | 4.3.2 | 3.14.1 (P3.19); 4.x is backlog |
| typescript | 4.9.4 | 7.0.2 | 5.9.3 (P3.20) |
| Node (tooling) | 16/18 in CI | 24.21.0 LTS | 20 until P3.15, then 24 |

Full table:

| Package | Group | package.json | Installed | Latest on npm | Expo SDK 57 pin | Notes |
|---|---|---|---|---|---|---|
| `@apollo/client` | dep | `3.7.11` | 3.7.11 | 4.3.2 |  |  |
| `@appsignal/javascript` | dep | `1.3.26` | 1.3.26 | 1.6.1 |  |  |
| `@appsignal/plugin-path-decorator` | dep | `^1.0.15` | 1.0.15 | 1.0.18 |  |  |
| `@appsignal/plugin-window-events` | dep | `1.0.19` | 1.0.19 | 1.0.26 |  |  |
| `@appsignal/react` | dep | `1.0.22` | 1.0.22 | 1.0.31 |  |  |
| `@babel/plugin-proposal-logical-assignment-operators` | dep | `7.20.7` | 7.20.7 | 7.20.7 |  | **deprecated on npm**; last publish 2023-09-01 |
| `@dnd-kit/core` | dep | `6.0.6` | 6.0.6 | 6.3.1 |  |  |
| `@dnd-kit/utilities` | dep | `3.2.1` | 3.2.1 | 3.2.2 |  | last publish 2023-11-06 |
| `@emotion/react` | dep | `11.10.6` | 11.10.6 | 11.14.0 |  |  |
| `@emotion/styled` | dep | `11.10.6` | 11.10.6 | 11.14.1 |  |  |
| `@expo-google-fonts/inter` | dep | `^0.2.2` | 0.2.2 | 0.4.2 |  |  |
| `@expo-google-fonts/roboto` | dep | `^0.2.2` | 0.2.2 | 0.4.3 |  |  |
| `@expo/config-plugins` | dep | `^5.0.2` | 5.0.4 | 57.0.10 |  |  |
| `@expo/vector-icons` | dep | `^13.0.0` | 13.0.0 | 15.1.1 | `^15.0.2` |  |
| `@formatjs/intl-datetimeformat` | dep | `4.5.1` | 4.5.1 | 7.8.1 |  |  |
| `@formatjs/intl-displaynames` | dep | `5.4.1` | 5.4.1 | 7.3.15 |  |  |
| `@formatjs/intl-getcanonicallocales` | dep | `1.9.0` | 1.9.0 | 3.2.12 |  |  |
| `@formatjs/intl-listformat` | dep | `6.5.1` | 6.5.1 | 8.3.15 |  |  |
| `@formatjs/intl-locale` | dep | `2.4.44` | 2.4.44 | 5.3.12 |  |  |
| `@formatjs/intl-numberformat` | dep | `7.4.1` | 7.4.1 | 9.4.3 |  |  |
| `@formatjs/intl-pluralrules` | dep | `4.3.1` | 4.3.1 | 6.3.15 |  |  |
| `@formatjs/intl-relativetimeformat` | dep | `9.5.1` | 9.5.1 | 12.3.15 |  |  |
| `@fseehawer/react-circular-slider` | dep | `2.5.16` | 2.5.16 | 3.3.7 |  | **deprecated on npm** |
| `@gorhom/animated-tabbar` | dep | `2.1.2` | 2.1.2 | 2.1.2 |  | last publish 2022-04-05 |
| `@gorhom/bottom-sheet` | dep | `4.4.5` | 4.4.5 | 5.2.14 |  |  |
| `@gorhom/portal` | dep | `1.0.14` | 1.0.14 | 1.0.14 |  | last publish 2022-06-23 |
| `@hookform/resolvers` | dep | `2.9.10` | 2.9.10 | 5.9.1 |  |  |
| `@mui/material` | dep | `5.11.4` | 5.11.4 | 9.4.0 |  |  |
| `@rails/actioncable` | dep | `7.0.4` | 7.0.4 | 8.1.400 |  |  |
| `@react-google-maps/api` | dep | `2.18.1` | 2.18.1 | 2.20.8 |  |  |
| `@react-native-async-storage/async-storage` | dep | `~1.17.3` | 1.17.12 | 3.1.1 | `2.2.0` |  |
| `@react-native-community/datetimepicker` | dep | `6.5.2` | 6.5.2 | 9.2.1 | `9.1.0` |  |
| `@react-native-masked-view/masked-view` | dep | `0.2.8` | 0.2.8 | 0.3.2 | `0.3.2` |  |
| `@react-navigation/bottom-tabs` | dep | `6.5.7` | 6.5.7 | 7.20.0 |  |  |
| `@react-navigation/core` | dep | `6.4.8` | 6.4.8 | 7.23.0 |  |  |
| `@react-navigation/drawer` | dep | `6.6.2` | 6.6.2 | 7.14.3 |  |  |
| `@react-navigation/material-bottom-tabs` | dep | `6.2.15` | 6.2.15 | 6.2.29 |  | **deprecated on npm** |
| `@react-navigation/material-top-tabs` | dep | `6.6.2` | 6.6.2 | 7.8.0 |  |  |
| `@react-navigation/native` | dep | `6.1.6` | 6.1.6 | 7.5.0 |  |  |
| `@react-navigation/stack` | dep | `6.3.16` | 6.3.16 | 7.12.0 |  |  |
| `@reduxjs/toolkit` | dep | `1.9.3` | 1.9.3 | 2.13.0 |  |  |
| `@vitu.soares/react-native-skeleton-content` | dep | `1.0.26` | 1.0.26 | 1.0.26 |  | last publish 2022-04-07 |
| `check-password-strength` | dep | `2.0.7` | 2.0.7 | 3.0.0 |  |  |
| `color` | dep | `4.2.3` | 4.2.3 | 5.0.3 |  |  |
| `cosmiconfig` | dep | `7.0.1` | 7.0.1 | 10.0.1 |  |  |
| `date-fns` | dep | `2.29.3` | 2.29.3 | 4.4.0 |  |  |
| `deprecated-react-native-prop-types` | dep | `2.3.0` | 2.3.0 | 5.0.0 |  |  |
| `dotenv` | dep | `14.3.2` | 14.3.2 | 18.0.6 |  |  |
| `expo` | dep | `47.0.13` | 47.0.13 | 57.0.27 | `~57.0.27` |  |
| `expo-apple-authentication` | dep | `~5.0.1` | 5.0.1 | 57.0.2 | `~57.0.2` |  |
| `expo-application` | dep | `~5.0.1` | 5.0.1 | 57.0.3 | `~57.0.3` |  |
| `expo-asset` | dep | `~8.7.0` | 8.7.0 | 57.0.19 | `~57.0.19` |  |
| `expo-blur` | dep | `~12.0.1` | 12.0.1 | 57.0.3 | `~57.0.3` |  |
| `expo-constants` | dep | `~14.0.2` | 14.0.2 | 57.0.21 | `~57.0.21` |  |
| `expo-device` | dep | `~5.0.0` | 5.0.0 | 57.0.2 | `~57.0.2` |  |
| `expo-document-picker` | dep | `~11.0.1` | 11.0.1 | 57.0.3 | `~57.0.3` |  |
| `expo-facebook` | dep | `12.2.0` | 12.2.0 | 12.2.0 |  |  |
| `expo-font` | dep | `~11.0.1` | 11.0.1 | 57.0.4 | `~57.0.4` |  |
| `expo-image-picker` | dep | `~14.0.2` | 14.0.2 | 57.0.20 | `~57.0.20` |  |
| `expo-linear-gradient` | dep | `~12.0.1` | 12.0.1 | 57.0.2 | `~57.0.2` |  |
| `expo-linking` | dep | `~3.3.1` | 3.3.1 | 57.0.12 | `~57.0.12` |  |
| `expo-localization` | dep | `~14.0.0` | 14.0.0 | 57.0.2 | `~57.0.2` |  |
| `expo-location` | dep | `~15.0.1` | 15.0.1 | 57.0.20 | `~57.0.20` |  |
| `expo-notifications` | dep | `~0.17.0` | 0.17.0 | 57.0.22 | `~57.0.22` |  |
| `expo-splash-screen` | dep | `~0.17.5` | 0.17.5 | 57.0.9 | `~57.0.9` |  |
| `expo-status-bar` | dep | `~1.4.2` | 1.4.2 | 57.0.1 | `~57.0.1` |  |
| `expo-updates` | dep | `~0.15.6` | 0.15.6 | 57.0.25 | `~57.0.25` |  |
| `expo-web-browser` | dep | `~12.0.0` | 12.0.0 | 57.0.3 | `~57.0.3` |  |
| `graphql` | dep | `15.8.0` | 15.8.0 | 17.0.2 |  |  |
| `graphql-ruby-client` | dep | `1.11.7` | 1.11.7 | 1.16.0 |  |  |
| `graphql-tag` | dep | `2.12.6` | 2.12.6 | 2.12.7 |  |  |
| `lodash` | dep | `^4.17.21` | 4.17.21 | 4.18.1 |  |  |
| `lottie-react-native` | dep | `5.1.4` | 5.1.4 | 7.5.0 | `~7.3.8` |  |
| `luxon` | dep | `3.3.0` | 3.3.0 | 3.7.2 |  |  |
| `postinstall-postinstall` | dep | `^2.1.0` | 2.1.0 | 2.1.0 |  | last publish 2022-05-13 |
| `react` | dep | `18.1.0` | 18.1.0 | 19.3.0 | `19.2.3` |  |
| `react-calendar-heatmap` | dep | `1.9.0` | 1.9.0 | 1.10.0 |  |  |
| `react-countdown-circle-timer` | dep | `3.1.0` | 3.1.0 | 3.2.1 |  | last publish 2023-03-15 |
| `react-day-picker` | dep | `^7.4.10` | 7.4.10 | 10.0.2 |  |  |
| `react-dom` | dep | `18.1.0` | 18.1.0 | 19.3.0 | `19.2.3` |  |
| `react-facebook-login` | dep | `^4.1.1` | 4.1.1 | 4.1.1 |  | last publish 2022-06-25 |
| `react-hook-form` | dep | `7.42.1` | 7.42.1 | 7.89.0 |  |  |
| `react-image-lightbox` | dep | `^5.1.4` | 5.1.4 | 5.1.4 |  | **deprecated on npm**; last publish 2023-01-19 |
| `react-native` | dep | `0.70.8` | 0.70.8 | 0.87.1 | `0.86.3` |  |
| `react-native-animatable` | dep | `^1.3.3` | 1.3.3 | 1.4.0 |  | last publish 2023-10-26 |
| `react-native-animated-nav-tab-bar` | dep | `3.1.8` | 3.1.8 | 3.1.13 |  |  |
| `react-native-chart-kit` | dep | `6.12.0` | 6.12.0 | 7.0.4 |  |  |
| `react-native-color-picker` | dep | `^0.6.0` | 0.6.0 | 0.6.0 |  | last publish 2022-06-26 |
| `react-native-countdown-circle-timer` | dep | `3.1.0` | 3.1.0 | 3.2.1 |  | last publish 2023-03-15 |
| `react-native-dotenv` | dep | `3.4.8` | 3.4.8 | 5.0.0 |  |  |
| `react-native-geocoding` | dep | `^0.5.0` | 0.5.0 | 0.5.0 |  | last publish 2022-06-26 |
| `react-native-gesture-handler` | dep | `~2.8.0` | 2.8.0 | 3.3.0 | `~2.32.0` |  |
| `react-native-get-random-values` | dep | `~1.8.0` | 1.8.0 | 2.0.0 | `~1.11.0` |  |
| `react-native-image-viewing` | dep | `0.2.2` | 0.2.2 | 0.2.2 |  | last publish 2022-05-14 |
| `react-native-input-spinner` | dep | `1.8.0` | 1.8.0 | 1.8.1 |  | last publish 2023-04-25 |
| `react-native-localize` | dep | `2.2.6` | 2.2.6 | 3.7.2 |  |  |
| `react-native-maps` | dep | `1.3.2` | 1.3.2 | 1.29.11 | `1.27.2` |  |
| `react-native-mmkv-storage` | dep | `0.8.0` | 0.8.0 | 12.0.1 |  |  |
| `react-native-numeric-input` | dep | `1.9.1` | 1.9.1 | 1.9.1 |  | last publish 2022-05-14 |
| `react-native-pager-view` | dep | `6.0.1` | 6.0.1 | 9.0.6 | `8.0.2` |  |
| `react-native-paper` | dep | `4.12.4` | 4.12.4 | 5.15.3 |  |  |
| `react-native-paper-dates` | dep | `0.8.7` | 0.8.7 | 0.24.0 |  |  |
| `react-native-paper-tabs` | dep | `0.7.0` | 0.7.0 | 0.11.4 |  |  |
| `react-native-reanimated` | dep | `2.12.0` | 2.12.0 | 4.7.1 | `4.5.1` |  |
| `react-native-reanimated-carousel` | dep | `3.1.5` | 3.1.5 | 5.1.1 |  |  |
| `react-native-safe-area-context` | dep | `4.4.1` | 4.4.1 | 5.10.1 | `~5.7.0` |  |
| `react-native-screens` | dep | `~3.18.0` | 3.18.2 | 4.28.0 | `~4.26.0` |  |
| `react-native-skeleton-content` | dep | `1.0.28` | 1.0.28 | 1.0.28 |  | last publish 2022-10-04 |
| `react-native-svg` | dep | `13.4.0` | 13.4.0 | 15.15.5 | `15.15.4` |  |
| `react-native-swiper-flatlist` | dep | `3.0.18` | 3.0.18 | 3.2.5 |  | last publish 2024-09-10 |
| `react-native-tab-view` | dep | `3.3.4` | 3.3.4 | 4.3.3 |  |  |
| `react-native-toast-message` | dep | `2.1.6` | 2.1.6 | 2.5.2 |  |  |
| `react-native-web` | dep | `~0.18.7` | 0.18.10 | 0.21.3 | `~0.21.0` |  |
| `react-native-web-lottie` | dep | `^1.4.4` | 1.4.4 | 1.4.4 |  | last publish 2022-06-26 |
| `react-redux` | dep | `7.2.6` | 7.2.6 | 9.3.0 |  |  |
| `react-use` | dep | `^17.4.0` | 17.4.0 | 17.6.1 |  |  |
| `redux` | dep | `4.2.1` | 4.2.1 | 5.0.1 |  | last publish 2024-05-06 |
| `redux-persist` | dep | `^6.0.0` | 6.0.0 | 6.0.0 |  |  |
| `sentry-expo` | dep | `~6.0.0` | 6.0.0 | 7.2.0 | `~7.0.0` |  |
| `styled-components` | dep | `5.3.9` | 5.3.9 | 6.5.3 |  |  |
| `urijs` | dep | `1.19.11` | 1.19.11 | 1.19.11 |  | last publish 2022-06-28 |
| `yup` | dep | `0.32.11` | 0.32.11 | 1.7.1 |  |  |
| `zen-observable` | dep | `0.8.15` | 0.8.15 | 0.10.0 |  | last publish 2024-01-08 |
| `zen-observable-ts` | dep | `1.1.0` | 1.1.0 | 1.1.0 |  | last publish 2022-06-29 |
| `@babel/core` | dev | `7.21.4` | 7.21.4 | 8.0.7 |  |  |
| `@babel/plugin-proposal-export-namespace-from` | dev | `7.18.9` | 7.18.9 | 7.18.9 |  | **deprecated on npm**; last publish 2023-09-01 |
| `@babel/plugin-proposal-numeric-separator` | dev | `7.18.6` | 7.18.6 | 7.18.6 |  | **deprecated on npm**; last publish 2023-09-01 |
| `@babel/plugin-proposal-optional-chaining` | dev | `7.21.0` | 7.21.0 | 7.21.0 |  | **deprecated on npm**; last publish 2023-09-01 |
| `@babel/plugin-syntax-bigint` | dev | `^7.8.3` | 7.8.3 | 7.8.3 |  | last publish 2022-06-12 |
| `@babel/preset-env` | dev | `7.21.4` | 7.21.4 | 8.0.7 |  |  |
| `@babel/runtime` | dev | `7.21.0` | 7.21.0 | 8.0.7 |  |  |
| `@expo/metro-config` | dev | `0.7.1` | 0.7.1 | 57.0.13 |  |  |
| `@expo/webpack-config` | dev | `18.0.3` | 18.0.3 | 19.0.1 |  |  |
| `@graphql-codegen/add` | dev | `3.2.3` | 3.2.3 | 7.1.1 |  |  |
| `@graphql-codegen/cli` | dev | `2.16.4` | 2.16.4 | 7.4.5 |  |  |
| `@graphql-codegen/import-types-preset` | dev | `2.2.6` | 2.2.6 | 4.0.1 |  |  |
| `@graphql-codegen/introspection` | dev | `2.2.3` | 2.2.3 | 6.1.0 |  |  |
| `@graphql-codegen/schema-ast` | dev | `2.6.1` | 2.6.1 | 6.1.1 |  |  |
| `@graphql-codegen/typescript` | dev | `2.8.7` | 2.8.7 | 6.1.1 |  |  |
| `@graphql-codegen/typescript-operations` | dev | `2.5.12` | 2.5.12 | 6.1.10 |  |  |
| `@graphql-codegen/typescript-react-apollo` | dev | `3.3.7` | 3.3.7 | 5.0.0 |  |  |
| `@react-native-community/eslint-config` | dev | `3.2.0` | 3.2.0 | 3.2.0 |  |  |
| `@testing-library/jest-dom` | dev | `5.16.5` | 5.16.5 | 7.0.1 |  |  |
| `@testing-library/jest-native` | dev | `4.0.11` | 4.0.11 | 5.4.3 |  | **deprecated on npm** |
| `@testing-library/react-native` | dev | `^9.0.0` | 9.0.0 | 14.0.1 |  |  |
| `@types/base-64` | dev | `1.0.0` | 1.0.0 | 1.0.2 |  |  |
| `@types/color` | dev | `3.0.3` | 3.0.3 | 4.2.1 |  |  |
| `@types/facebook-js-sdk` | dev | `3.3.6` | 3.3.6 | 3.3.13 |  |  |
| `@types/gh-pages` | dev | `3.2.1` | 3.2.1 | 6.1.0 |  |  |
| `@types/isomorphic-fetch` | dev | `0.0.36` | 0.0.36 | 0.0.39 |  |  |
| `@types/jest` | dev | `27.4.0` | 27.4.0 | 30.0.0 |  |  |
| `@types/lodash` | dev | `4.14.192` | 4.14.192 | 4.17.25 |  |  |
| `@types/luxon` | dev | `3.3.0` | 3.3.0 | 3.7.6 |  |  |
| `@types/rails__actioncable` | dev | `^6.1.6` | 6.1.6 | 8.0.3 |  |  |
| `@types/react` | dev | `18.0.33` | 18.0.33 | 19.3.0 |  |  |
| `@types/react-calendar-heatmap` | dev | `^1.6.3` | 1.6.3 | 1.9.0 |  |  |
| `@types/react-facebook-login` | dev | `4.1.5` | 4.1.5 | 4.1.11 |  |  |
| `@types/react-native` | dev | `~0.70.6` | 0.70.8 | 0.73.0 |  | **deprecated on npm**; last publish 2023-12-21 |
| `@types/react-test-renderer` | dev | `17.0.1` | 17.0.1 | 19.3.0 |  |  |
| `@types/urijs` | dev | `1.19.19` | 1.19.19 | 1.19.26 |  |  |
| `@typescript-eslint/eslint-plugin` | dev | `5.57.1` | 5.57.1 | 8.71.1 |  |  |
| `@typescript-eslint/parser` | dev | `5.57.1` | 5.57.1 | 8.71.1 |  |  |
| `babel-plugin-module-resolver` | dev | `5.0.0` | 5.0.0 | 5.0.3 |  |  |
| `base-64` | dev | `1.0.0` | 1.0.0 | 1.0.0 |  | last publish 2024-04-02 |
| `enzyme` | dev | `^3.11.0` | 3.11.0 | 3.11.0 |  | last publish 2022-06-17 |
| `eslint` | dev | `8.38.0` | 8.38.0 | 10.12.0 |  |  |
| `eslint-config-airbnb-typescript` | dev | `17.0.0` | 17.0.0 | 18.0.0 |  | last publish 2024-03-02 |
| `eslint-config-airbnb-typescript-prettier` | dev | `5.0.0` | 5.0.0 | 5.0.0 |  | last publish 2023-04-12 |
| `eslint-config-universe` | dev | `11.2.0` | 11.2.0 | 16.0.0 |  |  |
| `eslint-import-resolver-babel-module` | dev | `5.3.2` | 5.3.2 | 5.3.2 |  | last publish 2023-01-16 |
| `eslint-plugin-import` | dev | `2.27.5` | 2.27.5 | 2.32.0 |  |  |
| `eslint-plugin-jsx-a11y` | dev | `6.7.1` | 6.7.1 | 6.10.2 |  |  |
| `eslint-plugin-react` | dev | `7.32.2` | 7.32.2 | 7.37.5 |  |  |
| `eslint-plugin-react-hooks` | dev | `4.6.0` | 4.6.0 | 7.1.1 |  |  |
| `gh-pages` | dev | `4.0.0` | 4.0.0 | 6.3.0 |  |  |
| `glob` | dev | `9.3.2` | 9.3.2 | 13.0.6 |  |  |
| `isomorphic-fetch` | dev | `3.0.0` | 3.0.0 | 3.0.0 |  | last publish 2023-10-23 |
| `jest` | dev | `^26.6.3` | 26.6.3 | 30.5.2 |  |  |
| `jest-expo` | dev | `^47.0.0` | 47.0.1 | 57.0.5 | `~57.0.5` |  |
| `jest-junit` | dev | `13.0.0` | 13.0.0 | 17.0.0 |  |  |
| `json` | dev | `^11.0.0` | 11.0.0 | 11.0.0 |  | last publish 2023-03-04 |
| `patch-package` | dev | `6.5.1` | 6.5.1 | 8.0.1 |  |  |
| `prettier` | dev | `2.8.7` | 2.8.7 | 3.9.9 |  |  |
| `react-test-renderer` | dev | `17.0.1` | 18.1.0 | 19.3.0 |  |  |
| `redux-mock-store` | dev | `^1.5.4` | 1.5.4 | 1.5.5 |  |  |
| `rome` | dev | `11.0.0-nightly.aec33ef` | 11.0.0-nightly.aec33ef | 12.1.3 |  | last publish 2024-04-16 |
| `semver` | dev | `7.3.8` | 7.3.8 | 7.8.5 |  |  |
| `ts-node` | dev | `10.9.1` | 10.9.1 | 10.9.2 |  |  |
| `typescript` | dev | `^4.6.3` | 4.9.4 | 7.0.2 |  |  |
