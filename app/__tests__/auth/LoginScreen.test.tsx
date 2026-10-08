import * as React from 'react';
import { TextInput } from 'react-native';
import { GraphQLError } from 'graphql';
import { LoginDocument } from 'app/api/reflection';
import { NotificationContext } from 'app/providers/notifications/context';
import * as appRedux from '../../state';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import LoginScreen from '../../screens/unauthenticated/login/LoginScreen';

const VARIABLES = { email: 'jest@example.com', password: 'secret-password' };

const credentials = {
  __typename: 'Credential',
  accessToken: 'token',
  tokenType: 'Bearer',
  client: 'client',
  expiry: 9999999999,
  uid: VARIABLES.email,
};

const authenticatable = {
  __typename: 'User',
  id: '1',
  email: VARIABLES.email,
  name: 'Jest User',
  phone: null,
  createdAt: '2022-01-01T00:00:00Z',
  updatedAt: '2022-01-01T00:00:00Z',
};

function renderLogin(mock: Record<string, unknown>) {
  const notifications = { success: jest.fn(), error: jest.fn(), info: jest.fn() };
  const screen = render(
    <NotificationContext.Provider value={notifications}>
      <LoginScreen />
    </NotificationContext.Provider>,
    {
      initialState: appRedux.initialState,
      graphql: [
        {
          request: { query: LoginDocument, operationName: 'Login', variables: VARIABLES },
          ...mock,
        },
      ],
    }
  );
  return { ...screen, notifications };
}

function fillAndSubmit(screen: ReturnType<typeof renderLogin>, values = VARIABLES) {
  const [email, password] = screen.UNSAFE_getAllByType(TextInput);
  fireEvent.changeText(email, values.email);
  fireEvent.changeText(password, values.password);
  fireEvent.press(screen.getByText('Log in'));
}

describe('<LoginScreen />', () => {
  it('renders the login form', () => {
    const screen = renderLogin({ result: { data: {} } });

    expect(screen.getByText('Log in')).toBeTruthy();
    expect(screen.getByText('Forgot your password?')).toBeTruthy();
    expect(screen.getByText('Sign up')).toBeTruthy();
  });

  it('stores the credentials and user in Redux after a successful login', async () => {
    const screen = renderLogin({
      result: {
        data: { userLogin: { __typename: 'UserLoginPayload', authenticatable, credentials } },
      },
    });

    fillAndSubmit(screen);

    await waitFor(() => {
      expect(screen.store.getState().global.credentials).toMatchObject({
        accessToken: 'token',
        client: 'client',
        uid: VARIABLES.email,
      });
    });
    expect(screen.store.getState().global.currentUser).toMatchObject({
      id: '1',
      email: VARIABLES.email,
    });
    expect(screen.notifications.error).not.toHaveBeenCalled();
  });

  it('shows the server error and stores nothing when the login fails', async () => {
    const screen = renderLogin({
      result: { errors: [new GraphQLError('Invalid login credentials')] },
    });

    fillAndSubmit(screen);

    await waitFor(() => {
      expect(screen.notifications.error).toHaveBeenCalledWith('Invalid login credentials');
    });
    expect(screen.store.getState().global.credentials).toBeFalsy();
  });

  it('does not submit when the email is invalid', async () => {
    const screen = renderLogin({ result: { data: {} } });

    fillAndSubmit(screen, { email: 'not-an-email', password: 'x' });

    await waitFor(() => {
      expect(screen.getByText('This is not a valid email')).toBeTruthy();
    });
    expect(screen.store.getState().global.credentials).toBeFalsy();
  });
});
