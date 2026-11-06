import * as React from 'react';
import { Dimensions } from 'react-native';
import type { MockedResponse } from '@apollo/client/testing';
import type { Permission } from 'app/api/schema.d';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { usePreferences } from 'app/state/preferences';
import type { SessionState } from 'app/state/session';
import { render } from '../__mocks__/render';
import roles from './fixtures/roles.json';

export type TestRole = keyof typeof roles;
export type TestBreakpoint = 'compact' | 'medium' | 'expanded';

/** The permissions of the skydiving template's roles (synced from the backend presets, `yarn sync:roles`) */
export const ROLE_PERMISSIONS = roles as Record<TestRole, Permission[]>;

const WINDOW: Record<TestBreakpoint, { width: number; height: number }> = {
  compact: { width: 390, height: 844 },
  medium: { width: 820, height: 1180 },
  expanded: { width: 1440, height: 900 },
};

export type RenderWithProvidersOptions = {
  /** Who is signed in, with the permissions that role has in a skydiving operator (default `owner`) */
  role?: TestRole;
  /** Permissions on top of the role's (or `permissions` to replace them) */
  permissions?: Permission[];
  /** Overrides for the session store; signed in to operator 1 by default, `null` for logged out */
  session?: Partial<SessionState> | null;
  scheme?: 'light' | 'dark';
  /** The window the screen is laid out in (default `compact`, a phone) */
  breakpoint?: TestBreakpoint;
  /** Apollo mocks (`MockedResponse`s) on top of the operator and permissions mocks */
  mocks?: MockedResponse<Record<string, unknown>>[];
  /** The template whose words the screen shows (default the operator's own: skydiving in the fixtures) */
  industry?: 'generic' | 'skydiving';
};

/**
 * Renders `ui` with everything a screen needs: theme (scheme and brand), terms, Apollo mocks, the operator and manifest
 * contexts, a signed-in session with a role's permissions, and a window size. Query by role: `getByRole('button',
 * { name: 'Save' })`.
 *
 * `profile` of the design plan is the signed-in operator mock: pass its overrides as the first `mocks` entry.
 */
export async function renderWithProviders(
  ui: React.ReactElement,
  {
    role = 'owner',
    permissions,
    session,
    scheme = 'light',
    breakpoint = 'compact',
    mocks = [],
    industry,
  }: RenderWithProvidersOptions = {}
) {
  usePreferences.setState({ colorScheme: scheme });
  const { width, height } = WINDOW[breakpoint];
  // RN's jest Dimensions can be set; useWindowDimensions (useBreakpoint, useDevice) reads it
  (Dimensions as unknown as { set(dimensions: object): void }).set({
    window: { width, height, scale: 1, fontScale: 1 },
    screen: { width, height, scale: 1, fontScale: 1 },
  });

  return render(ui, {
    session: session === null ? undefined : { ...authenticatedSession, ...session },
    permissions: permissions ?? ROLE_PERMISSIONS[role],
    graphql: mocks,
    industry,
  });
}
