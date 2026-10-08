

# OpenManifest
[![CI](https://github.com/OpenManifest/openmanifest/actions/workflows/ci.yml/badge.svg)](https://github.com/OpenManifest/openmanifest/actions/workflows/ci.yml)

OpenManifest is an open source dropzone management app, intended to provide a solution for anything that a manifest would normally do. 

You can contribute to OpenManifest by forking this repository and submitting a pull request.

## Set up

```
$ yarn global add expo-cli 
$ yarn install
$ yarn start
# or
$ yarn ios:production
```



## Web smoke test

Needs the API running locally with the offline seed (`bin/rails db:seed db:seed:dev_baseline` in
`openmanifest-server`, server on port 5000) and `127.0.0.1 local.openmanifest.org` in `/etc/hosts`.

```
$ EXPO_ENV=local npx expo export:web                          # -> web-build/
$ python3 scripts/serve-web-build.py web-build 19006 &        # SPA server with index.html fallback
$ node scripts/web-smoke.mjs --base http://localhost:19006 --out /tmp/smoke
```

The script logs in as `owner@example.com`, opens the manifest board and a load at 1280×800 and 360×640, saves four
screenshots and exits non-zero on any failed step or page error. It uses Playwright from `PLAYWRIGHT_PATH` (default
`/opt/node-tools/node_modules/playwright`).
