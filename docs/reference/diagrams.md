# OpenManifest client — diagrams

Client diagrams at `3112795` (pass 1, 2026-10-08). System, data-model, sequence and state diagrams are in the backend
repo: <https://github.com/OpenManifest/openmanifest-server/blob/staging/docs/reference/diagrams.md>.

## 1. Navigation map

Root stack branches are chosen from persisted Redux state (`app/screens/routes.tsx`). Paths are the deep-link paths from
the linking config; tabs marked with a permission are hidden without it.

```mermaid
flowchart TD
  Root{{"Root stack<br/>routes.tsx"}}
  Root -->|no credentials| Unauth["Unauthenticated (stack)"]
  Root -->|credentials, no currentDropzone| Limbo["Limbo (stack)"]
  Root -->|credentials + currentDropzone| Auth["Authenticated → LeftDrawer (UserDrawer)"]
  Root --> Wizards["Wizards (modal stack)"]
  Root --> NotFound["NotFoundScreen"]

  Unauth --> Login["LoginScreen /login"]
  Unauth --> SignUp["SignUpScreen /signup"]
  Login -.->|userLogin| Limbo
  Limbo --> DzSelect["DropzoneSelectScreen /select-dropzone"]
  DzSelect -.->|select| Auth
  DzSelect -.->|create| DzWizard

  Auth --> Tabs["Bottom tabs (TabBar.web.tsx on web)"]
  Tabs --> Overview["Overview<br/>viewStatistics or moderator"]
  Tabs --> Manifest["Manifest"]
  Tabs --> Notifications["Notifications"]
  Tabs --> Users["Users<br/>readUser"]

  Overview --> Dashboard["DashboardScreen /dropzone/dashboard"]
  Overview --> OverviewS["OverviewScreen /overview"]

  Manifest --> Board["ManifestScreen /dropzone/manifest"]
  Board --> Load["LoadScreen /dropzone/load/:loadId"]
  Manifest --> Weather["WeatherConditionsScreen /dropzone/weather"]
  Manifest --> Wind["WindScreen /dropzone/weather/winds"]
  Manifest --> JumpRun["JumpRunScreen /dropzone/weather/jumprun"]
  Manifest --> Config["Configuration (stack)"]
  Manifest --> UserStack1["User stack"]

  Config --> Settings["SettingsMenuScreen /dropzone/configuration"]
  Settings --> DzSettings["DropzoneSettingsScreen"]
  Settings --> Aircrafts["AircraftsScreen"]
  Settings --> Tickets["TicketTypesScreen"]
  Settings --> Extras["ExtrasScreen"]
  Settings --> RigTpl["RigInspectionTemplateScreen"]
  Settings --> DzRigs["DropzoneRigsScreen"]
  Settings --> Tx["TransactionsScreen"]
  Settings --> Perms["PermissionScreen"]
  Settings --> MasterLog["MasterLogScreen"]

  Notifications --> NotifS["NotificationsScreen /notifications"]
  Notifications --> UserStack2["User stack"]
  Users --> UserStack3["User stack"]

  subgraph UserStack["User stack (shared)"]
    UL["UserListScreen"] --> Profile["ProfileScreen"]
    Profile --> Equip["EquipmentScreen"]
    Profile --> Orders["OrdersScreen"] --> Receipt["OrderReceiptScreen"]
    Equip --> RigInsp["RigInspectionScreen"]
  end
  UserStack1 -.-> UL
  UserStack2 -.-> UL
  UserStack3 -.-> UL

  Wizards --> DzWizard["DropzoneWizardScreen /setup"]
  Wizards --> UserWizard["UserWizardScreen"]
  Wizards --> Recover["RecoverPasswordScreen"]
  Wizards --> Confirm["ConfirmUserScreen /confirm"]
  Wizards --> ChangePw["ChangePasswordScreen"]
  Wizards --> UserStack4["User stack (/modal/user/…)"]
  UserStack4 -.-> UL
```

Overlays mounted inside screens (not routes): manifest-user sheet (`app/forms/manifest_user`), manifest-group sheet
(`app/components/dialogs/ManifestGroup`, mounted only in `LoadScreen` — BUG-066), credits sheet (`app/forms/credits`),
image viewer, setup form sheets.

## 2. State and data flow (current: Redux + Apollo)

```mermaid
flowchart LR
  subgraph Device["Device storage"]
    AS[("AsyncStorage / localStorage<br/>persist:open-manifest.0.9.1")]
  end

  subgraph Redux["Redux store (app/state)"]
    G["global (persisted)<br/>credentials · currentDropzoneId<br/>currentUser* · currentDropzone* · permissions*<br/>theme · palette · expoPushToken"]
    S["screens.*<br/>manifest · users · login · signup · dropzoneWizard"]
    F["forms.*<br/>dropzone · dropzoneUser · rig · rigInspection ·<br/>rigInspectionTemplate · manifest · manifestGroup · user · weather"]
    IV["imageViewer"]
  end

  subgraph Apollo["Apollo Client (app/api)"]
    Cache[("InMemoryCache")]
    Links["links: authentication → errors → appSignal → split(http | actioncable)"]
  end

  API[["Rails GraphQL API<br/>/graphql · /subscriptions"]]
  UI["Screens & components<br/>(useAppSelector / useAppDispatch,<br/>generated hooks, app/api/crud)"]

  G <-->|redux-persist| AS
  UI -->|dispatch| G & S & F & IV
  G & S & F & IV -->|useAppSelector| UI
  UI -->|useQuery / useMutation| Cache
  Cache --> UI
  Cache <--> Links
  Links -->|"headers from global.credentials"| API
  API -->|"rotated token headers → setCredentials"| G
  API -->|"loadCreated / loadUpdated / userUpdated"| Links
  Cache -.->|"snapshots copied (deprecated)"| G
  Links -.->|"auth error → global.logout (cache not cleared, BUG-069)"| G
```

`*` deprecated snapshots of server data. Logout: `useLogout` aborts the shared `AbortController` (BUG-063), clears the
Apollo store and resets `global` only (forms/screens keep state, BUG-069).

Target after plan Phase 4: Apollo cache for all server data; zustand `useSession` (credentials in `expo-secure-store` on
native) and `usePreferences`; react-hook-form for forms; no Redux.
