import * as React from 'react';
import { Text } from 'react-native';
import { waitFor } from '@testing-library/react-native';
import { ModerationRole, Permission } from 'app/api/schema.d';
import { ROLE_PERMISSIONS, renderWithProviders } from 'app/test-utils/render';
import guarded from '../AccessGuard';
import { decide, destinationsFor, type Access, type Destination } from '../destinations';

const SKYDIVING = {
  destinations: {},
  activities: {},
  certifications: {},
  equipment: {},
  daily_log: {},
};
const GENERIC = { destinations: {}, multi_vehicle: {} };

const keys = (access: Partial<Access>) =>
  destinationsFor({ permissions: [], modules: SKYDIVING, ...access }).map((d) => d.key);
const as = (role: keyof typeof ROLE_PERMISSIONS, extra: Partial<Access> = {}) =>
  keys({ permissions: ROLE_PERMISSIONS[role], ...extra });

describe('destinations by role', () => {
  it('give an owner the whole shell', () => {
    expect(as('owner')).toEqual([
      'today',
      'board',
      'people',
      'inbox',
      'money',
      'reports',
      'setup',
      'account',
    ]);
  });

  it('give manifest staff the board, people and the money', () => {
    expect(as('manifest')).toEqual([
      'today',
      'board',
      'people',
      'inbox',
      'money',
      'reports',
      'setup',
      'account',
    ]);
  });

  it('give a fun jumper the board and their wallet, without money or setup', () => {
    const jumper = as('fun_jumper');

    expect(jumper).toEqual(
      expect.arrayContaining(['today', 'board', 'inbox', 'wallet', 'account'])
    );
    expect(jumper).not.toContain('money');
    expect(jumper).not.toContain('setup');
  });

  it('give a student today, the board, the wallet and the inbox only', () => {
    expect(as('student')).toEqual(['today', 'board', 'inbox', 'wallet', 'account']);
  });

  it('add the platform for moderators only', () => {
    expect(as('student')).not.toContain('platform');
    expect(as('student', { moderationRole: ModerationRole.User })).not.toContain('platform');
    expect(as('student', { moderationRole: ModerationRole.Moderator })).toContain('platform');
  });

  it('show nobody without permissions more than today, the inbox, the wallet and the account', () => {
    expect(keys({ permissions: [] })).toEqual(['today', 'inbox', 'wallet', 'account']);
  });
});

describe('destinations by module', () => {
  const table: Destination[] = [
    { key: 'board', group: 'primary', icon: 'x', labelKey: 'a' },
    { key: 'reports', group: 'more', icon: 'x', labelKey: 'b', module: 'daily_log' },
    {
      key: 'setup',
      group: 'more',
      icon: 'x',
      labelKey: 'c',
      module: 'equipment',
      permission: Permission.UpdateOperator,
    },
  ];

  it('follow the modules of the operator', () => {
    const owner = ROLE_PERMISSIONS.owner;

    expect(
      destinationsFor({ permissions: owner, modules: SKYDIVING }, table).map((d) => d.key)
    ).toEqual(['board', 'reports', 'setup']);
    expect(
      destinationsFor({ permissions: owner, modules: GENERIC }, table).map((d) => d.key)
    ).toEqual(['board']);
  });

  it('say not available for a missing module before no access for a missing permission', () => {
    expect(decide(table[2], { permissions: [], modules: GENERIC })).toBe('not-available');
    expect(decide(table[2], { permissions: [], modules: SKYDIVING })).toBe('no-access');
  });

  it('show the same shell for a skydiving and a generic operator where no destination needs a module', () => {
    expect(as('owner', { modules: GENERIC })).toEqual(as('owner', { modules: SKYDIVING }));
  });

  it('allows a rule with any when one alternative does', () => {
    const rule = { any: [{ permission: Permission.ViewStatistics }, { moderator: true }] };

    expect(decide(rule, { permissions: [Permission.ViewStatistics], modules: {} })).toBe('allowed');
    expect(
      decide(rule, { permissions: [], modules: {}, moderationRole: ModerationRole.Moderator })
    ).toBe('allowed');
    expect(decide(rule, { permissions: [], modules: {} })).toBe('no-access');
  });
});

describe('guarded screens', () => {
  const Secret = guarded(() => <Text>secret screen</Text>, { permission: Permission.ReadUser });

  it('show the screen to those who may use it', async () => {
    const screen = await renderWithProviders(<Secret />, { role: 'manifest' });

    await waitFor(() => expect(screen.getByText('secret screen')).toBeTruthy());
  });

  it('say no access to those who may not, once their permissions are known', async () => {
    const screen = await renderWithProviders(<Secret />, { role: 'student' });

    await waitFor(() => expect(screen.getByTestId('no-access')).toBeTruthy());
    expect(screen.queryByText('secret screen')).toBeNull();
  });

  it('say not available when the operator lacks the module', async () => {
    const NoModule = guarded(() => <Text>secret screen</Text>, { module: 'escorts' });
    const screen = await renderWithProviders(<NoModule />, { role: 'owner' });

    await waitFor(() => expect(screen.getByTestId('not-available')).toBeTruthy());
  });

  it('wait with a spinner while the session has no operator yet', async () => {
    const screen = await renderWithProviders(<Secret />, { role: 'owner', session: null });

    expect(screen.queryByText('secret screen')).toBeNull();
    expect(screen.queryByTestId('no-access')).toBeNull();
  });
});
