import * as React from 'react';
import { View } from 'react-native';
import { UpdateMembershipDocument } from 'app/api/reflection';
import type { MembershipEssentialsFragment } from 'app/api/operations';
import { fireEvent, render, waitFor, within } from '../../__mocks__/render';
import MembershipDialog from '../../forms/membership';
import MOCK_QUERY_ROLES from '../manifest/__mocks__/QueryRoles.mock';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

const role = { __typename: 'UserRole', id: '1', name: 'fun_jumper', operatorId: 1 };
const member = (overrides: Partial<MembershipEssentialsFragment> = {}) =>
  ({ __typename: 'Membership', id: '5', expiresAt: 1800000000, role, ...overrides }) as never;

function renderDialog(
  membership: MembershipEssentialsFragment,
  graphql: Parameters<typeof render>[1]['graphql'] = []
) {
  const screen = render(
    <View testID="under-test">
      <MembershipDialog open membership={membership} onClose={jest.fn()} />
    </View>,
    {
      session: authenticatedSession,
      graphql: [MOCK_QUERY_ROLES(), ...graphql],
    }
  );
  return within(screen.getByTestId('under-test'));
}

describe('<MembershipDialog />', () => {
  it('asks for an access level and a membership expiry', async () => {
    const dialog = renderDialog(member({ role: null, expiresAt: null }));

    fireEvent.press(dialog.getByText('Save'));

    await waitFor(() => expect(dialog.getByText('User must have an access level')).toBeTruthy());
    expect(dialog.getByText('Membership expiry must be set')).toBeTruthy();
  });

  it('sends the access level and expiry to UpdateDropzoneUser', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        updateMembership: {
          __typename: 'UpdateMembershipPayload',
          membership: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));
    const dialog = renderDialog(member(), [
      {
        request: {
          query: UpdateMembershipDocument,
          operationName: 'UpdateMembership',
          variables: {
            membershipId: '5',
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
