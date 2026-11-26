import * as React from 'react';
import { RecoverPasswordDocument } from 'app/api/reflection';
import { act, fireEvent, render, waitFor } from '../../../__mocks__/render';
import { textInputs } from 'app/test-utils/hosts';
import RecoverPasswordScreen from '../recover_password/RecoverPasswordScreen';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useIsFocused: () => true,
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

describe('<RecoverPasswordScreen />', () => {
  it('asks for an email before sending the reset link', async () => {
    const screen = await render(<RecoverPasswordScreen />, { graphql: [] });

    await fireEvent.press(screen.getByTestId('wizard-next-primary-action'));

    await waitFor(() => expect(screen.getByText('Email is required')).toBeTruthy());
    await screen.unmount();
  });

  it('sends the reset link to the email that was typed', async () => {
    const sent = jest.fn(() => ({
      data: {
        userSendPasswordResetWithToken: {
          __typename: 'UserSendPasswordResetWithTokenPayload',
          message: 'sent',
        },
      },
    }));
    const screen = await render(<RecoverPasswordScreen />, {
      graphql: [
        {
          request: {
            query: RecoverPasswordDocument,
            operationName: 'RecoverPassword',
            variables: { email: 'jo@example.com', redirectUrl: '' },
          },
          result: sent,
        },
      ],
    });

    await fireEvent.changeText(textInputs(screen.container)[0], 'jo@example.com');
    await act(async () => {
      await fireEvent.press(screen.getByTestId('wizard-next-primary-action'));
    });

    await waitFor(() => expect(sent).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('Email is required')).toBeNull();
    await screen.unmount();
  });
});
