import * as React from 'react';
import { Text } from 'react-native';
import { useOperatorContext } from 'app/providers/operator/context';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { mockProfileQuery, profile } from 'app/__fixtures__/profile.fixture';
import { Permission } from 'app/api/schema.d';
import { fireEvent, render, waitFor, within } from '../../../__mocks__/render';
import ProfileScreen from '../ProfileScreen';

jest.setTimeout(30000);

const mockNavigate = jest.fn();
let mockParams: { userId: string } = { userId: '123' };
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: jest.fn(),
    dispatch: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => true,
  }),
  useRoute: () => ({ params: mockParams }),
  useIsFocused: () => true,
}));

/** Shows once the operator's permissions have loaded, so absence checks are not vacuous */
function LoadedProbe() {
  const {
    operator: { permissions, currentUser },
  } = useOperatorContext();
  return permissions && currentUser ? <Text testID="loaded">loaded</Text> : null;
}

/** Another member's profile (the signed-in user is 123), as staff see it */
const OTHER = { ...profile, id: '999', walletId: '999', user: { ...profile.user, id: '777' } };

async function renderProfile(
  permissions: Permission[] = [],
  options: { id?: string; membership?: object } = {}
) {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const id = options.id ?? '123';
  mockParams = { userId: id };
  const mock = mockProfileQuery(
    { id },
    options.membership ? { membership: options.membership } : undefined
  );
  const screen = await render(
    <>
      <LoadedProbe />
      <ProfileScreen />
    </>,
    {
      session: authenticatedSession,
      permissions,
      graphql: [mock, mock, mock] as never,
    }
  );
  await waitFor(() => expect(screen.getByTestId('profile-summary')).toBeTruthy(), {
    timeout: 10000,
  });
  await waitFor(() => expect(screen.getByTestId('loaded')).toBeTruthy());
  return screen;
}

describe('<ProfileScreen />', () => {
  beforeEach(() => mockNavigate.mockClear());
  afterEach(() => jest.restoreAllMocks());

  it('shows the name, role, licence, readiness and funds of the member', async () => {
    const screen = await renderProfile();

    expect(screen.getByTestId('profile-summary-name').props.children).toBe('Court Jester');
    expect(screen.getByTestId('profile-summary-role').props.children).toBe(
      'Fun Jumper · Certifiate D'
    );
    expect(within(screen.getByTestId('profile-summary-status')).getByText('Ready')).toBeTruthy();
    expect(screen.getByTestId('profile-funds-amount').props.children).toBe('$100.00');
    expect(screen.getByText('jest@test.com')).toBeTruthy();
  });

  it('lists the loads with their day, type of jump, ticket and cost, and opens one', async () => {
    const screen = await renderProfile();

    expect(screen.getByText('Load #12 · 8 Oct 2026')).toBeTruthy();
    expect(screen.getByText('Freefly · Full altitude · $25.00')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('profile-loads-900'));
    expect(mockNavigate).toHaveBeenCalledWith('Authenticated', {
      screen: 'Manifest',
      params: { screen: 'LoadScreen', params: { loadId: '12' } },
    });
  });

  it('says there are no loads yet, with the way to the board', async () => {
    const screen = await renderProfile([], {
      membership: { slots: { edges: [], pageInfo: { hasNextPage: false } } },
    });

    expect(screen.getByTestId('profile-loads-empty')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Go to the board' }));
    expect(mockNavigate).toHaveBeenCalledWith('Authenticated', { screen: 'Manifest' });
  });

  // Another member's: the signed-in member's own entry in the cache comes from the operator's query too
  it('lists the certification with its number and the qualifications with their expiry', async () => {
    const screen = await renderProfile([], { id: '999', membership: OTHER });

    expect(screen.getByText('APF · Certifiate D')).toBeTruthy();
    expect(screen.getByText('No. 12345 · Verified 2 Jan 2026 · Counts here')).toBeTruthy();
    expect(screen.getByText('Camera')).toBeTruthy();
    expect(screen.getByText('No. C-7 · Expires 4 Mar 2099')).toBeTruthy();
  });

  it('shows the membership with a date nobody reads two ways', async () => {
    const screen = await renderProfile([], { id: '999', membership: OTHER });

    expect(screen.getByTestId('profile-membership-expires-value').props.children).toBe(
      '1 Jan 2100'
    );
    expect(screen.getByTestId('profile-membership-role-value').props.children).toBe('Fun Jumper');
  });

  it('gives a member their wallet and their own details, and none of the office', async () => {
    const screen = await renderProfile([Permission.CreateEquipment]);

    expect(screen.getByTestId('profile-funds-wallet')).toBeTruthy();
    expect(screen.getByTestId('profile-summary-edit')).toBeTruthy();
    expect(screen.getByTestId('profile-add-equipment')).toBeTruthy();
    expect(screen.queryByTestId('profile-funds-add')).toBeNull();
    expect(screen.queryByTestId('profile-funds-transactions')).toBeNull();
    expect(screen.queryByTestId('profile-membership-edit')).toBeNull();

    await fireEvent.press(screen.getByTestId('profile-funds-wallet'));
    expect(mockNavigate).toHaveBeenCalledWith('Authenticated', {
      screen: 'Wallet',
      params: { screen: 'WalletScreen' },
    });
  });

  it('gives staff the office actions on another member', async () => {
    const screen = await renderProfile(
      [
        Permission.ReadUser,
        Permission.UpdateUser,
        Permission.CreateUserTransaction,
        Permission.ReadUserTransactions,
      ],
      { id: '999', membership: OTHER }
    );

    await waitFor(() => expect(screen.getByTestId('profile-funds-add')).toBeTruthy());
    expect(screen.getByTestId('profile-funds-transactions')).toBeTruthy();
    expect(screen.queryByTestId('profile-funds-wallet')).toBeNull();
    expect(screen.getByTestId('profile-membership-edit')).toBeTruthy();
    expect(screen.getByTestId('profile-summary-edit')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('profile-funds-transactions'));
    expect(mockNavigate).toHaveBeenCalledWith('Authenticated', {
      screen: 'Users',
      params: { screen: 'OrdersScreen', params: { userId: '999' }, initial: false },
    });
  });

  // UB.2: staff run a member's equipment from the office
  it('offers staff with UpdateUser to add and edit equipment of another member', async () => {
    const screen = await renderProfile([Permission.UpdateUser], { id: '999', membership: OTHER });

    await waitFor(() => expect(screen.getByTestId('profile-add-equipment')).toBeTruthy());
    expect(screen.getByText('Primary')).toBeTruthy();
    expect(screen.getByTestId('profile-equipment-1-edit')).toBeTruthy();
  });

  it('does not offer another member to add equipment for someone else', async () => {
    const screen = await renderProfile([Permission.CreateEquipment], {
      id: '999',
      membership: OTHER,
    });

    await waitFor(() => expect(screen.getByText('Primary')).toBeTruthy());
    expect(screen.queryByTestId('profile-add-equipment')).toBeNull();
    expect(screen.queryByTestId('profile-equipment-1-edit')).toBeNull();
    expect(screen.queryByTestId('profile-summary-edit')).toBeNull();
  });

  it('lists what stops the member with the fix the viewer has', async () => {
    const screen = await renderProfile([], {
      membership: {
        eligibility: {
          ready: false,
          rules: [
            {
              __typename: 'EligibilityResult',
              code: 'credits',
              ok: false,
              status: 'FAIL',
              message: 'Not enough credits to manifest for this jump',
              problem: 'credits',
              bypassed: false,
              expiresAt: null,
              amountCents: null,
            },
            {
              __typename: 'EligibilityResult',
              code: 'membership',
              ok: false,
              status: 'FAIL',
              message: 'Membership expired',
              problem: 'membership',
              bypassed: false,
              expiresAt: null,
              amountCents: null,
            },
          ],
        },
      },
    });

    expect(screen.getByText('Blocked')).toBeTruthy();
    expect(screen.getByText('Not enough credits to manifest for this jump')).toBeTruthy();
    // Their own credit: the wallet; their membership: only the desk extends it
    expect(screen.getByTestId('profile-ready-credits-fix')).toBeTruthy();
    expect(screen.queryByTestId('profile-ready-membership-fix')).toBeNull();
    await fireEvent.press(screen.getByTestId('profile-ready-credits-fix'));
    expect(mockNavigate).toHaveBeenCalledWith('Authenticated', {
      screen: 'Wallet',
      params: { screen: 'WalletScreen' },
    });
  });
});
