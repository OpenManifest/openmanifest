import * as React from 'react';
import '@testing-library/jest-native';
import { Permission } from 'app/api/schema.d';
import { CreateLoadDocument } from 'app/api/reflection';
import * as appRedux from '../../state';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import MOCK_QUERY_PLANES from './__mocks__/QueryPlane.mock';
import MOCK_QUERY_DROPZONE_USERS from './__mocks__/QueryDropzoneUsers.mock';
import LoadDialog from '../../forms/load/Dialog';

jest.setTimeout(30000);

const authenticatedState = {
  ...appRedux.initialState,
  global: {
    ...appRedux.initialState.global,
    authenticated: true,
    credentials: {
      accessToken: 'jest',
      client: 'jest',
      uid: 'jest@example.com',
      tokenType: 'Bearer',
      expiry: 9999999999,
    },
    currentDropzoneId: 1,
  },
};

const dropzoneUser = (id: string, name: string) => ({
  __typename: 'DropzoneUser',
  id,
  walletId: id,
  expiresAt: null,
  hasCredits: true,
  hasMembership: true,
  hasLicense: true,
  hasExitWeight: true,
  role: null,
  license: null,
  user: {
    __typename: 'User',
    id,
    name,
    nickname: null,
    phone: null,
    email: null,
    exitWeight: '80',
    moderationRole: null,
    image: null,
    apfNumber: null,
  },
});

// Builds the mock without touching the shared fixture (the helper merges overrides in place).
function usersWithPermission(permission: Permission, user: ReturnType<typeof dropzoneUser>) {
  const mock = MOCK_QUERY_DROPZONE_USERS({ permissions: [permission] });
  return {
    ...mock,
    result: {
      data: {
        __typename: 'Query',
        dropzoneUsers: {
          __typename: 'DropzoneUserConnection',
          edges: [{ __typename: 'DropzoneUserEdge', node: user }],
        },
      },
    },
  };
}

describe('<LoadDialog />', () => {
  it('sends the selected plane, pilot and GCA to CreateLoad', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        createLoad: {
          __typename: 'CreateLoadPayload',
          load: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));

    const screen = render(<LoadDialog open onClose={jest.fn()} onSuccess={jest.fn()} />, {
      initialState: authenticatedState,
      graphql: [
        MOCK_QUERY_PLANES(),
        usersWithPermission(Permission.ActAsGca, dropzoneUser('31', 'Gina GCA')),
        usersWithPermission(Permission.ActAsPilot, dropzoneUser('32', 'Pete Pilot')),
        {
          request: {
            query: CreateLoadDocument,
            operationName: 'CreateLoad',
            variables: {
              gca: '31',
              pilot: '32',
              plane: '1',
              maxSlots: 10,
              state: 'open',
              name: null,
            },
          },
          result: mutationResult,
        },
      ],
    });

    // Plane, GCA and pilot are auto-selected once their queries resolve, and the plane sets max slots
    await waitFor(() => expect(screen.getAllByText('Gina GCA').length).toBeGreaterThan(0), {
      timeout: 10000,
    });
    await waitFor(() => expect(screen.getAllByText('Pete Pilot').length).toBeGreaterThan(0), {
      timeout: 10000,
    });
    await waitFor(() => expect(screen.getAllByText('Beaver').length).toBeGreaterThan(0), {
      timeout: 10000,
    });

    // ManifestContextProvider mounts its own (closed) copy of this dialog, which is never filled in,
    // so pressing every "Create" button only submits ours.
    screen.getAllByText('Create').forEach((button) => fireEvent.press(button));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });
});
