# CLAUDE.md — OpenManifest client

Expo / React Native client (iOS, Android, web) for OpenManifest. The Rails GraphQL API is the companion repo
`OpenManifest/openmanifest-server`.

**Source of truth:** the backend repo's `docs/MODERNISATION_PLAN.md`
(<https://github.com/OpenManifest/openmanifest-server/blob/staging/docs/MODERNISATION_PLAN.md>). This repo's
`docs/MODERNISATION_PLAN.md` is only a pointer.

Before doing any work:

1. Read the plan's **Executor instructions** section first and follow it exactly (one task per session, branch naming,
   PRs, status updates in the backend copy, stop conditions).
2. Then read the task you picked and every document it links.

Reference: `docs/reference/README.md` (navigation, store, API layer, platform files, dependencies),
`docs/reference/diagrams.md`; bugs for both repos are in the backend repo's `docs/reference/BUGS.md`; cloud VM setup in
the backend repo's `docs/reference/CLOUD_ENV.md`.

Quick commands (Node 20 until plan task P3.15, then Node 24): `SENTRYCLI_SKIP_DOWNLOAD=1 yarn install --frozen-lockfile`,
`yarn check:types`, `yarn check:linting`, `yarn check:testing`, `EXPO_ENV=staging npx expo export:web`.
Never commit secrets, `.env` files, `node_modules`, `web-build/` or `dist/`.
