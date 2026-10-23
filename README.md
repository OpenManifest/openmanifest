

# OpenManifest
[![CI](https://github.com/OpenManifest/openmanifest/actions/workflows/ci.yml/badge.svg)](https://github.com/OpenManifest/openmanifest/actions/workflows/ci.yml)

OpenManifest is an open source dropzone management app, intended to provide a solution for anything that a manifest would normally do. 

You can contribute to OpenManifest by forking this repository and submitting a pull request.

## Set up

Requirements: Node from `.nvmrc` (24) and Yarn 1 (`corepack enable` or `npm i -g yarn@1`). The Expo CLI runs through
`npx expo`; the deprecated global `expo-cli` is not needed.

```
$ SENTRYCLI_SKIP_DOWNLOAD=1 yarn install --frozen-lockfile
$ cp .env.example .env                                         # optional keys; never commit .env
$ EXPO_ENV=local npx expo start                                # native (Expo Go / dev client)
$ EXPO_ENV=local npx expo start --web                          # web on http://localhost:19006
$ EXPO_ENV=local npx expo export --platform web                # static web build in dist/
```

`EXPO_ENV` selects the API: `local` = `http://local.openmanifest.org:5000/graphql` (run
[openmanifest-server](https://github.com/OpenManifest/openmanifest-server) locally and add
`127.0.0.1 local.openmanifest.org` to `/etc/hosts`), `staging`, or `production` (see `build/constants.ts`).

Checks: `yarn check:types`, `yarn check:linting`, `yarn check:testing`.

## UI tests (Playwright)

`e2e/` holds a Playwright Test suite that runs against the web export, the API and the offline seed. See
[`e2e/README.md`](e2e/README.md) for the full local run. In short, with the API on port 5000 (seeded) and
`127.0.0.1 local.openmanifest.org` in `/etc/hosts`:

```
$ EXPO_ENV=local npx expo export --platform web               # -> dist/
$ python3 scripts/serve-web-build.py dist 19006 &              # SPA server with index.html fallback
$ yarn test:ui:smoke                                           # two widths, light; `--grep @manifest` for one area
```

## Documentation

- [`docs/reference/README.md`](docs/reference/README.md): client reference (navigation, state, API layer, platform files, dependencies).
- [`docs/SMOKE_TEST.md`](docs/SMOKE_TEST.md): owner checklist for testing on real devices.
- [Modernisation plan](https://github.com/OpenManifest/openmanifest-server/blob/staging/docs/MODERNISATION_PLAN.md) (backend repo): the plan for both repos.
