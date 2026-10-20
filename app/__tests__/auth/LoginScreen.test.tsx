import * as React from 'react';
import { GraphQLError } from 'graphql';
import { LoginDocument } from 'app/api/reflection';
import { NotificationContext } from 'app/providers/notifications/context';
import { useSession } from '../../state';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import LoginScreen from '../../screens/unauthenticated/login/LoginScreen';
import { textInputs } from 'app/test-utils/hosts';

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

async function renderLogin(mock: Record<string, unknown>) {
  const notifications = { success: jest.fn(), error: jest.fn(), info: jest.fn() };
  const screen = await render(
    <NotificationContext.Provider value={notifications}>
      <LoginScreen />
    </NotificationContext.Provider>,
    {
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

async function fillAndSubmit(screen: Awaited<ReturnType<typeof renderLogin>>, values = VARIABLES) {
  const [email, password] = textInputs(screen.container);
  await fireEvent.changeText(email, values.email);
  await fireEvent.changeText(password, values.password);
  await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));
}

describe('<LoginScreen />', () => {
  it('renders the login form', async () => {
    const screen = await renderLogin({ result: { data: {} } });

    expect(screen.getByRole('button', { name: 'Log in' })).toBeTruthy();
    expect(screen.getByText('Forgot your password?')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeTruthy();
  });

  it('stores the credentials in the session after a successful login', async () => {
    const screen = await renderLogin({
      result: {
        data: { userLogin: { __typename: 'UserLoginPayload', authenticatable, credentials } },
      },
    });

    await fillAndSubmit(screen);

    await waitFor(() => {
      expect(useSession.getState().credentials).toMatchObject({
        accessToken: 'token',
        client: 'client',
        uid: VARIABLES.email,
      });
    });
    expect(screen.notifications.error).not.toHaveBeenCalled();
  });

  it('shows the server error and stores nothing when the login fails', async () => {
    const screen = await renderLogin({
      result: { errors: [new GraphQLError('Invalid login credentials')] },
    });

    await fillAndSubmit(screen);

    await waitFor(() => {
      expect(screen.notifications.error).toHaveBeenCalledWith('Invalid login credentials');
    });
    expect(useSession.getState().credentials).toBeFalsy();
  });

  it('does not submit when the email is invalid', async () => {
    const screen = await renderLogin({ result: { data: {} } });

    await fillAndSubmit(screen, { email: 'not-an-email', password: 'x' });

    await waitFor(() => {
      expect(screen.getByText('This is not a valid email')).toBeTruthy();
    });
    expect(useSession.getState().credentials).toBeFalsy();
  });
});
