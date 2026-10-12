import * as React from 'react';
import { View } from 'react-native';
import { UpdateUserDocument } from 'app/api/reflection';
import type { MembershipDetailsFragment } from 'app/api/operations';
import { fireEvent, render, waitFor, within } from '../../__mocks__/render';
import UserDialog from '../../forms/user/Dialog';
import MOCK_QUERY_FEDERATIONS from '../manifest/__mocks__/QueryFederations.mock';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

const federation = { __typename: 'Federation', id: '1', name: 'APF', slug: 'apf' };
const membership = {
  __typename: 'Membership',
  id: '5',
  license: { __typename: 'License', id: '2', name: 'Certificate D', federation },
  user: {
    __typename: 'User',
    id: '9',
    name: 'Court Jester',
    nickname: 'CJ',
    email: 'cj@example.com',
    phone: '0400 000 000',
    bodyMassKg: 70,
    userFederations: [],
  },
} as unknown as MembershipDetailsFragment;

async function renderDialog(graphql: Parameters<typeof render>[1]['graphql'] = []) {
  const screen = await render(
    <View testID="under-test">
      <UserDialog open membership={membership} onClose={jest.fn()} />
    </View>,
    {
      session: authenticatedSession,
      graphql: [MOCK_QUERY_FEDERATIONS(), ...graphql],
    }
  );
  return within(screen.getByTestId('under-test'));
}

describe('<UserDialog />', () => {
  it('starts with the details of the member being edited', async () => {
    const dialog = await renderDialog();

    await waitFor(() => expect(dialog.getByDisplayValue('Court Jester')).toBeTruthy());
    expect(dialog.getByDisplayValue('cj@example.com')).toBeTruthy();
    expect(dialog.getByDisplayValue('0400 000 000')).toBeTruthy();
  });

  it('reports an invalid email and does not save', async () => {
    const mutationResult = jest.fn();
    const dialog = await renderDialog([
      {
        request: { query: UpdateUserDocument, operationName: 'UpdateUser', variables: {} },
        result: mutationResult,
      },
    ]);

    await waitFor(() => expect(dialog.getByDisplayValue('cj@example.com')).toBeTruthy());
    await fireEvent.changeText(dialog.getByDisplayValue('cj@example.com'), 'not-an-email');
    await fireEvent.press(dialog.getByText('Save'));

    await waitFor(() => expect(dialog.getByText('Not a valid email')).toBeTruthy());
    expect(mutationResult).not.toHaveBeenCalled();
  });

  it('sends the edited values to UpdateUser', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        updateUser: {
          __typename: 'UpdateUserPayload',
          user: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));
    const dialog = await renderDialog([
      {
        request: {
          query: UpdateUserDocument,
          operationName: 'UpdateUser',
          variables: {
            membership: '5',
            name: 'Court J. Jester',
            license: 2,
            phone: '0411 111 111',
            bodyMassKg: 70,
            email: 'cj@example.com',
          },
        },
        result: mutationResult,
      },
    ]);

    await waitFor(() => expect(dialog.getByDisplayValue('Court Jester')).toBeTruthy());
    await fireEvent.changeText(dialog.getByDisplayValue('Court Jester'), 'Court J. Jester');
    await fireEvent.changeText(dialog.getByDisplayValue('0400 000 000'), '0411 111 111');
    await fireEvent.press(dialog.getByText('Save'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });
});
