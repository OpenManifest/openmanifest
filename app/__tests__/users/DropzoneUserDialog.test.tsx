import * as React from 'react';
import { View } from 'react-native';
import { UpdateDropzoneUserDocument } from 'app/api/reflection';
import type { DropzoneUserEssentialsFragment } from 'app/api/operations';
import * as appRedux from '../../state';
import { fireEvent, render, waitFor, within } from '../../__mocks__/render';
import DropzoneUserDialog from '../../forms/dropzone_user';
import MOCK_QUERY_ROLES from '../manifest/__mocks__/QueryRoles.mock';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

const authenticatedState = {
  ...appRedux.initialState,
  global: { ...appRedux.initialState.global, authenticated: true },
};

const role = { __typename: 'UserRole', id: '1', name: 'fun_jumper', dropzoneId: 1 };
const member = (overrides: Partial<DropzoneUserEssentialsFragment> = {}) =>
  ({ __typename: 'DropzoneUser', id: '5', expiresAt: 1800000000, role, ...overrides }) as never;

function renderDialog(
  dropzoneUser: DropzoneUserEssentialsFragment,
  graphql: Parameters<typeof render>[1]['graphql'] = []
) {
  const screen = render(
    <View testID="under-test">
      <DropzoneUserDialog open dropzoneUser={dropzoneUser} onClose={jest.fn()} />
    </View>,
    {
      initialState: authenticatedState,
      session: authenticatedSession,
      graphql: [MOCK_QUERY_ROLES(), ...graphql],
    }
  );
  return within(screen.getByTestId('under-test'));
}

describe('<DropzoneUserDialog />', () => {
  it('asks for an access level and a membership expiry', async () => {
    const dialog = renderDialog(member({ role: null, expiresAt: null }));

    fireEvent.press(dialog.getByText('Save'));

    await waitFor(() => expect(dialog.getByText('User must have an access level')).toBeTruthy());
    expect(dialog.getByText('Membership expiry must be set')).toBeTruthy();
  });

  it('sends the access level and expiry to UpdateDropzoneUser', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        updateDropzoneUser: {
          __typename: 'UpdateDropzoneUserPayload',
          dropzoneUser: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));
    const dialog = renderDialog(member(), [
      {
        request: {
          query: UpdateDropzoneUserDocument,
          operationName: 'UpdateDropzoneUser',
          variables: {
            dropzoneUserId: '5',
            attributes: { userRoleId: 1, expiresAt: 1800000000 },
          },
        },
        result: mutationResult,
      },
    ]);

    fireEvent.press(dialog.getByText('Save'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });
});
