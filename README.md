

# OpenManifest
[![CI](https://github.com/OpenManifest/openmanifest/actions/workflows/ci.yml/badge.svg)](https://github.com/OpenManifest/openmanifest/actions/workflows/ci.yml)

OpenManifest is an open source dropzone management app, intended to provide a solution for anything that a manifest would normally do. 

You can contribute to OpenManifest by forking this repository and submitting a pull request.

## Set up

Requirements: Node from `.nvmrc` (20) and Yarn 1 (`corepack enable` or `npm i -g yarn@1`). The Expo CLI runs through
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

## Web smoke test

Needs the API running locally with the offline seed (`bin/rails db:seed db:seed:dev_baseline` in
`openmanifest-server`, server on port 5000) and `127.0.0.1 local.openmanifest.org` in `/etc/hosts`.

```
$ EXPO_ENV=local npx expo export --platform web               # -> dist/
$ python3 scripts/serve-web-build.py dist 19006 &              # SPA server with index.html fallback
$ node scripts/web-smoke.mjs --base http://localhost:19006 --out /tmp/smoke
```

The script logs in as `owner@example.com`, opens the manifest board and a load at 1280×800 and 360×640, saves four
screenshots and exits non-zero on any failed step or page error. It uses Playwright from `PLAYWRIGHT_PATH` (default
`/opt/node-tools/node_modules/playwright`).

## Documentation

- [`docs/reference/README.md`](docs/reference/README.md): client reference (navigation, state, API layer, platform files, dependencies).
- [`docs/SMOKE_TEST.md`](docs/SMOKE_TEST.md): owner checklist for testing on real devices.
- [Modernisation plan](https://github.com/OpenManifest/openmanifest-server/blob/staging/docs/MODERNISATION_PLAN.md) (backend repo): the plan for both repos.
