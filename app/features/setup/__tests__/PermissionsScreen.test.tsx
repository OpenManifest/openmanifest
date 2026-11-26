import * as React from 'react';
import { View } from 'react-native';
import { RolesDocument, UpdateRoleDocument } from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { NotificationContext } from 'app/providers/notifications/context';
import { renderThemed } from 'app/ui/components/testing';
import { fireEvent, render, waitFor, within } from '../../../__mocks__/render';
import PermissionMatrix from '../PermissionMatrix';
import PermissionsScreen from '../PermissionsScreen';

jest.setTimeout(30000);

const role = (id: string, name: string, permissions: string[]) => ({
  __typename: 'UserRole' as const,
  id,
  name,
  operatorId: 1,
  permissions,
});

const STUDENT = role('2', 'student', ['readLoad', 'createSlot']);
const MANIFEST = role('9', 'manifest', ['readLoad', 'createLoad', 'createUserSlot']);

const listRoles = (roles: object[]) => ({
  request: { query: RolesDocument, variables: { operatorId: '1' } },
  result: { data: { operator: { __typename: 'Operator', id: '1', roles } } },
  maxUsageCount: 5,
});

const updateRole = (
  variables: { roleId: number; permissionName: string; enabled: boolean },
  payload: object,
  delay = 50
) => ({
  request: { query: UpdateRoleDocument, variables },
  result: { data: { updateRole: { __typename: 'UpdateRolePayload', ...payload } } },
  delay,
});

const notify = { success: jest.fn(), error: jest.fn(), info: jest.fn() };

// The operator provider mounts its own closed form dialogs, so queries are scoped to the screen under test
function Subject() {
  return (
    <NotificationContext.Provider value={notify}>
      <View testID="under-test">
        <PermissionsScreen />
      </View>
    </NotificationContext.Provider>
  );
}

beforeEach(() => jest.clearAllMocks());

describe('<PermissionsScreen /> on a phone', () => {
  it('shows one role at a time, each switch named by the role and the permission', async () => {
    const screen = await render(<Subject />, {
      session: authenticatedSession,
      permissions: [Permission.UpdatePermissions],
      graphql: [listRoles([STUDENT, MANIFEST])],
    });

    await waitFor(() => expect(screen.getByTestId('permissions-list-mode')).toBeTruthy());
    expect(
      await screen.findByRole('switch', { name: 'Student: See loads', checked: true })
    ).toBeTruthy();
    expect(
      screen.getByRole('switch', { name: 'Student: Create loads', checked: false })
    ).toBeTruthy();
    expect(screen.queryByRole('switch', { name: 'Manifest: Create loads' })).toBeNull();
    // The groups of the access list, in its words
    expect(screen.getByText('Acting')).toBeTruthy();
    expect(screen.getByText('Manifesting')).toBeTruthy();
  });

  it('switches a permission on at once and keeps it when the server agrees', async () => {
    const screen = await render(<Subject />, {
      session: authenticatedSession,
      permissions: [Permission.UpdatePermissions],
      graphql: [
        listRoles([STUDENT]),
        updateRole(
          { roleId: 2, permissionName: 'readPackjob', enabled: true },
          {
            role: {
              __typename: 'UserRole',
              id: '2',
              name: 'student',
              permissions: [...STUDENT.permissions, 'readPackjob'],
            },
            errors: null,
            fieldErrors: null,
          }
        ),
      ],
    });

    const toggle = await screen.findByRole('switch', { name: 'Student: See pack jobs' });
    fireEvent.press(toggle);
    await waitFor(() =>
      expect(
        screen.getByRole('switch', { name: 'Student: See pack jobs', checked: true })
      ).toBeTruthy()
    );
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(
      screen.getByRole('switch', { name: 'Student: See pack jobs', checked: true })
    ).toBeTruthy();
    expect(notify.error).not.toHaveBeenCalled();
  });

  it('puts the switch back and says why when the server refuses', async () => {
    const screen = await render(<Subject />, {
      session: authenticatedSession,
      permissions: [Permission.UpdatePermissions],
      graphql: [
        listRoles([STUDENT]),
        updateRole(
          { roleId: 2, permissionName: 'readPackjob', enabled: true },
          { role: null, errors: ["You can't modify permission settings"], fieldErrors: null },
          // Long enough to see the switch on before the answer
          600
        ),
      ],
    });

    const toggle = await screen.findByRole('switch', { name: 'Student: See pack jobs' });
    fireEvent.press(toggle);
    // Optimistic: on before the answer
    await waitFor(() =>
      expect(
        screen.getByRole('switch', { name: 'Student: See pack jobs', checked: true })
      ).toBeTruthy()
    );
    await waitFor(() =>
      expect(notify.error).toHaveBeenCalledWith("You can't modify permission settings")
    );
    expect(
      screen.getByRole('switch', { name: 'Student: See pack jobs', checked: false })
    ).toBeTruthy();
  });

  it('only shows them to someone who may not change them', async () => {
    const screen = await render(<Subject />, {
      session: authenticatedSession,
      permissions: [Permission.ReadPermissions],
      graphql: [listRoles([STUDENT])],
    });

    expect(
      await screen.findByRole('switch', { name: 'Student: See loads', disabled: true })
    ).toBeTruthy();
    expect(screen.getByText(/You can see the permissions, but not change them/)).toBeTruthy();
  });
});

describe('<PermissionMatrix />', () => {
  it('has a column for every role and a row for every permission', async () => {
    const onSwitch = jest.fn();
    const screen = await renderThemed(
      <PermissionMatrix roles={[STUDENT, MANIFEST]} canEdit onSwitch={onSwitch} intro="Intro" />
    );

    const row = screen.getByTestId('permission-row-createLoad');
    expect(
      within(row).getByRole('switch', { name: 'Student: Create loads', checked: false })
    ).toBeTruthy();
    expect(
      within(row).getByRole('switch', { name: 'Manifest: Create loads', checked: true })
    ).toBeTruthy();
    expect(screen.getAllByRole('switch')).toHaveLength(2 * 75);

    fireEvent.press(within(row).getByRole('switch', { name: 'Student: Create loads' }));
    expect(onSwitch).toHaveBeenCalledWith(STUDENT, 'createLoad', true);
    fireEvent.press(within(row).getByRole('switch', { name: 'Manifest: Create loads' }));
    expect(onSwitch).toHaveBeenCalledWith(MANIFEST, 'createLoad', false);
  });
});
