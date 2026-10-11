# OpenManifest client — diagrams

Client diagrams at `3112795` (pass 1, 2026-10-08). System, data-model, sequence and state diagrams are in the backend
repo: <https://github.com/OpenManifest/openmanifest-server/blob/staging/docs/reference/diagrams.md>.

## 1. Navigation map

Root stack branches are chosen from the session store (`app/screens/routes.tsx`: credentials, current dropzone id). Paths are the deep-link paths from
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
(`app/forms/manifest_group`, mounted once by `ManifestContextProvider`), credits sheet (`app/forms/credits`),
image viewer, setup form sheets.

## 2. State and data flow (zustand + Apollo)

```mermaid
flowchart LR
  subgraph Device["Device storage"]
    AS[("AsyncStorage / localStorage<br/>openmanifest.session.v1<br/>openmanifest.preferences.v1")]
    SS[("expo-secure-store<br/>openmanifest.credentials<br/>(localStorage on web)")]
  end

  subgraph Zustand["zustand stores (app/state, app/theme)"]
    Session["useSession<br/>credentials · currentDropzoneId<br/>expoPushToken · currentRouteName"]
    Prefs["usePreferences<br/>colorScheme"]
    Over["useThemeOverrides<br/>primary (preview, not persisted)"]
  end

  subgraph Apollo["Apollo Client (app/api)"]
    Cache[("InMemoryCache<br/>users · dropzone · permissions · loads")]
    Links["links: authentication → errors → appSignal → split(http | actioncable)"]
  end

  API[["Rails GraphQL API<br/>/graphql · /subscriptions"]]
  Theme["useAppTheme()<br/>theme · palette · isDark"]
  UI["Screens & components<br/>(selectors on the stores, generated hooks,<br/>app/api/crud, react-hook-form forms)"]
  Reset["resetSession()"]

  Session <-->|"credentials only"| SS
  Session <-->|"everything else"| AS
  Prefs <--> AS
  UI -->|actions| Session & Prefs & Over
  Session & Prefs & Over --> UI
  Prefs & Over --> Theme
  Cache -->|"current dropzone colours"| Theme
  Theme --> UI
  UI -->|useQuery / useMutation| Cache
  Cache --> UI
  Cache <--> Links
  Links -->|"headers from credentials"| API
  API -->|"loadCreated / loadUpdated / userUpdated"| Links
  Links -.->|"authentication error"| Reset
  UI -->|"Log out"| Reset
  Reset -->|"updateUser(pushToken: null), stop, clearStore"| Cache
  Reset -->|"reset(): credentials, dropzone"| Session
```

Server data is read from Apollo only (no copies of the current user, dropzone or permissions in client state). Forms are
react-hook-form instances owned by their screen or dialog (`app/forms/<name>`), so they go away with it; shared
dialogs live in the manifest context, `ProfileDialogsProvider` and `WeatherFormProvider`. Logging out and an expired
session both go through `resetSession`; switching dropzone resets the Apollo store.
