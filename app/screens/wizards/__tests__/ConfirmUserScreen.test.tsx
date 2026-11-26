import * as React from 'react';
import { ConfirmUserDocument } from 'app/api/reflection';
import { render, waitFor } from '../../../__mocks__/render';
import { useSession } from '../../../state';
import ConfirmUserScreen from '../confirm_user/ConfirmUserScreen';

const mockNavigate = jest.fn();
let mockParams: { token?: string } | undefined;

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({ key: 'confirm', name: 'ConfirmUserScreen', params: mockParams }),
}));

const credentials = {
  __typename: 'Credential',
  accessToken: 'token',
  client: 'client',
  expiry: 9999999999,
  tokenType: 'Bearer',
  uid: 'new@example.com',
};

const confirmMock = (result: Record<string, unknown>) => ({
  request: {
    query: ConfirmUserDocument,
    operationName: 'ConfirmUser',
    variables: { token: 'abc' },
  },
  result,
});

describe('<ConfirmUserScreen />', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('says the account could not be confirmed when the link has no token', async () => {
    mockParams = undefined;
    const screen = await render(<ConfirmUserScreen />, { graphql: [] });

    expect(
      screen.getByRole('heading', { name: 'Your account could not be confirmed' })
    ).toBeTruthy();
    await screen.unmount();
  });

  it('confirms the account, signs the user in and opens the operator selection', async () => {
    mockParams = { token: 'abc' };
    const screen = await render(<ConfirmUserScreen />, {
      graphql: [
        confirmMock({
          data: {
            userConfirmRegistrationWithToken: {
              __typename: 'UserConfirmRegistrationWithTokenPayload',
              authenticatable: {
                __typename: 'User',
                id: '1',
                phone: null,
                pushToken: null,
                email: 'new@example.com',
              },
              credentials,
            },
          },
        }),
      ],
    });

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('Limbo', { screen: 'OperatorSelectScreen' })
    );
    expect(useSession.getState().credentials).toMatchObject({ accessToken: 'token' });
    await screen.unmount();
  });

  it('says the account could not be confirmed when the server refuses the token', async () => {
    mockParams = { token: 'abc' };
    const screen = await render(<ConfirmUserScreen />, {
      graphql: [confirmMock({ data: { userConfirmRegistrationWithToken: null } })],
    });

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Your account could not be confirmed' })
      ).toBeTruthy()
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    await screen.unmount();
  });
});
