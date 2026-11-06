import * as React from 'react';
import { View } from 'react-native';
import {
  ArchiveCrewRoleDocument,
  CreateCrewRoleDocument,
  CrewRolesDocument,
} from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { scoped, textInputs } from 'app/test-utils/hosts';
import { fireEvent, render, waitFor } from '../../../__mocks__/render';
import mockQueryOperator from '../../../__tests__/manifest/__mocks__/QueryOperator.mock';
import { GCA_ROLE, PILOT_ROLE } from '../../../__tests__/manifest/__mocks__/QueryCrewRoles.mock';
import CrewRolesScreen from '../CrewRolesScreen';

jest.setTimeout(30000);

const listRoles = (crewRoles: object[]) => ({
  request: { query: CrewRolesDocument, variables: { operatorId: '1' } },
  result: { data: { operator: { __typename: 'Operator', id: '1', crewRoles } } },
  maxUsageCount: 5,
});

// The operator provider mounts its own closed form dialogs, so queries are scoped to the screen under test
function Subject() {
  return (
    <View testID="under-test">
      <CrewRolesScreen />
    </View>
  );
}

describe('<CrewRolesScreen />', () => {
  it('lists the roles with how often they are filled and who may fill them', async () => {
    const screen = await render(<Subject />, {
      session: authenticatedSession,
      permissions: [Permission.UpdateOperator],
      graphql: [mockQueryOperator(), listRoles([PILOT_ROLE, GCA_ROLE])],
    });

    await waitFor(() => expect(screen.getByTestId('crew-role-pilot')).toBeTruthy());
    expect(screen.getByTestId('crew-role-gca')).toBeTruthy();
    expect(screen.getByText('Ground control')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'New crew role' })).toBeTruthy();
  });

  it('does not offer to change them to someone who may not', async () => {
    const screen = await render(<Subject />, {
      session: authenticatedSession,
      permissions: [],
      graphql: [mockQueryOperator(), listRoles([PILOT_ROLE])],
    });

    await waitFor(() => expect(screen.getByTestId('crew-role-pilot')).toBeTruthy());
    expect(screen.queryByRole('button', { name: 'Pilot' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'New crew role' })).toBeNull();
  });

  it('creates a role with a key made from its name', async () => {
    const created = jest.fn(() => ({
      data: {
        createCrewRole: {
          __typename: 'CreateCrewRolePayload',
          errors: null,
          fieldErrors: null,
          crewRole: { ...GCA_ROLE, id: '9', key: 'camera_flyer', name: 'Camera flyer' },
        },
      },
    }));
    const screen = await render(<Subject />, {
      session: authenticatedSession,
      permissions: [Permission.UpdateOperator],
      graphql: [
        mockQueryOperator(),
        listRoles([PILOT_ROLE]),
        {
          request: {
            query: CreateCrewRoleDocument,
            variables: {
              attributes: {
                name: 'Camera flyer',
                scope: 'load',
                required: false,
                occupiesSlot: false,
                permission: null,
                key: 'camera_flyer',
                position: 1,
                operatorId: 1,
              },
            },
          },
          result: created,
        },
      ],
    });

    await waitFor(() => expect(screen.getByTestId('crew-role-pilot')).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: 'New crew role' }));
    const dialog = scoped(screen.getByTestId('under-test'));
    const [name] = textInputs(dialog.container);
    await fireEvent.changeText(name, 'Camera flyer');
    await fireEvent.press(dialog.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(created).toHaveBeenCalledTimes(1));
  });

  it('archives a role from its form', async () => {
    const archived = jest.fn(() => ({
      data: {
        archiveCrewRole: {
          __typename: 'ArchiveCrewRolePayload',
          errors: null,
          fieldErrors: null,
          crewRole: GCA_ROLE,
        },
      },
    }));
    const screen = await render(<Subject />, {
      session: authenticatedSession,
      permissions: [Permission.UpdateOperator],
      graphql: [
        mockQueryOperator(),
        listRoles([PILOT_ROLE, GCA_ROLE]),
        { request: { query: ArchiveCrewRoleDocument, variables: { id: 2 } }, result: archived },
      ],
    });

    await waitFor(() => expect(screen.getByTestId('crew-role-gca')).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: 'GCA' }));
    const dialog = scoped(screen.getByTestId('under-test'));
    await fireEvent.press(dialog.getByRole('button', { name: 'Archive' }));

    await waitFor(() => expect(archived).toHaveBeenCalledTimes(1));
  });
});
