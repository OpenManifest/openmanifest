// eslint-disable-next-line import/no-extraneous-dependencies
import { parse } from 'semver';
import type { SemVer } from 'semver';
import packageJson from '../package.json';

// Package and App versioning
const { version } = packageJson;
const { minor, major, patch } = parse(version) as SemVer;

// App version is always X.Y.0, but the individual builds
// include the patch version. Once the app is released, a build
// with version 1.2.3 becomes 1.2.0 on the app store, and we bump
// the minor version afterwards to 1.3.0 and the patch version (build number)
// is reset.

// This is the version in the app store:
export const APP_VERSION = [major, minor, 0].join('.');

// This is the build number since the last version bump
export const BUILD_NUMBER = patch + 1;

export const BUILD_VERSION = packageJson.version;

export const APP_NAME = packageJson.name;

// Server URLs for each environment
export const ENDPOINTS = {
  local: 'http://local.openmanifest.org:5000/graphql',
  staging: 'https://stg.openmanifest.org/graphql',
  default: 'https://stg.openmanifest.org/graphql',
  production: 'https://prod.openmanifest.org/graphql',
};

export const FRONTENDS = {
  local: 'http://local.openmanifest.org:19000',
  staging: 'https://staging.openmanifest.org',
  production: 'https://www.openmanifest.org',
};

// Helper to get the correct URL for the current environment
export function getEnvironmentEndpoint(environment: keyof typeof ENDPOINTS): string {
  if (!(environment in ENDPOINTS)) {
    throw new Error(`Invalid environment: ${environment}`);
  }
  return ENDPOINTS[environment];
}

// Helper to get the correct URL for the current environment
export function getEnvironmentFrontend(environment: keyof typeof FRONTENDS): string {
  if (!(environment in FRONTENDS)) {
    throw new Error(`Invalid environment: ${environment}`);
  }
  return FRONTENDS[environment];
}

// Gets the current environment from the ZAVY_ENV env variable
export function getEnvironment(): keyof typeof ENDPOINTS {
  const environment = process.env.EXPO_ENV || 'local';
  if (!(environment in ENDPOINTS)) {
    throw new Error(`Invalid environment: ${environment}. Must be one of ${Object.keys(ENDPOINTS).join(', ')}`);
  }
  return environment as keyof typeof ENDPOINTS;
}

// Gets the current endpoint for the configured environment
export function getEndpoint() {
  return getEnvironmentEndpoint(getEnvironment());
}

export function getFrontend() {
  return getEnvironmentFrontend(getEnvironment() as keyof typeof FRONTENDS);
}
