import * as React from 'react';
import * as appRedux from '../../state';
import { render, waitFor } from '../../__mocks__/render';
import MOCK_QUERY_PROFILE from './__mocks__/QueryDropzoneUserProfile.mock';
import ProfileScreen from '../../screens/authenticated/user/profile/ProfileScreen';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), setOptions: jest.fn(), dispatch: jest.fn() }),
  useRoute: () => ({ params: { userId: '123' } }),
  useIsFocused: () => true,
}));

const authenticatedState = {
  ...appRedux.initialState,
  global: {
    ...appRedux.initialState.global,
    authenticated: true,
  },
};

describe('<ProfileScreen />', () => {
  it('shows the name, role, funds and licence of the jumper', async () => {
    const screen = render(<ProfileScreen />, {
      initialState: authenticatedState,
      session: authenticatedSession,
      graphql: [MOCK_QUERY_PROFILE()],
    });

    await waitFor(() => expect(screen.getByText('Court Jester')).toBeTruthy(), { timeout: 10000 });
    expect(screen.getByText('FUN JUMPER')).toBeTruthy();
    expect(screen.getByText('$100')).toBeTruthy();
    expect(screen.getByText('Certifiate D')).toBeTruthy();
    expect(screen.getByText('Funds')).toBeTruthy();
    expect(screen.getByText('License')).toBeTruthy();
  });

  it('offers the funds, jumps and equipment tabs and lists the jump history by default', async () => {
    const screen = render(<ProfileScreen />, {
      initialState: authenticatedState,
      session: authenticatedSession,
      graphql: [MOCK_QUERY_PROFILE()],
    });

    await waitFor(() => expect(screen.getByText('on Load #12')).toBeTruthy(), { timeout: 10000 });
    expect(screen.getByText('Freefly')).toBeTruthy();
    expect(screen.getByText('-$25.00')).toBeTruthy();
    ['FUNDS', 'JUMPS', 'EQUIPMENT'].forEach((label) =>
      expect(screen.getAllByText(new RegExp(`^${label}$`, 'i')).length).toBeGreaterThan(0)
    );
  });
});
