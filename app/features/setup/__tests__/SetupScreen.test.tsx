import * as React from 'react';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { Permission } from 'app/api/schema.d';
import { ROLE_PERMISSIONS } from 'app/test-utils/render';
import { fireEvent, render, waitFor, within } from '../../../__mocks__/render';
import SetupScreen, { openSetup } from '../SetupScreen';

jest.setTimeout(30000);

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, dispatch: mockDispatch }),
}));

async function renderSetup(permissions: Permission[]) {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const screen = await render(<SetupScreen />, {
    session: authenticatedSession,
    permissions,
    graphql: [],
  });
  await waitFor(() => expect(screen.getByTestId('setup-menu')).toBeTruthy(), { timeout: 10000 });
  return screen;
}

describe('<SetupScreen />', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockDispatch.mockClear();
  });
  afterEach(() => jest.restoreAllMocks());

  it('lists Operations, People and access, and Business, with the switch that makes the operator public', async () => {
    const screen = await renderSetup(ROLE_PERMISSIONS.owner as Permission[]);

    expect(screen.getByRole('heading', { name: 'Operations' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'People and access' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Business' })).toBeTruthy();
    const business = within(screen.getByTestId('setup-group-business'));
    expect(business.getByRole('button', { name: 'Rules' })).toBeTruthy();
    expect(business.getByRole('switch', { name: 'Public', checked: true })).toBeTruthy();
    // The operator of the fixture has no modules: nothing that needs one is listed
    expect(screen.queryByTestId('setup-destinations')).toBeNull();
    expect(screen.queryByTestId('setup-conditions')).toBeNull();
  });

  it('opens a screen of the list', async () => {
    const screen = await renderSetup(ROLE_PERMISSIONS.owner as Permission[]);

    await fireEvent.press(screen.getByRole('button', { name: 'Rules' }));

    expect(mockNavigate).toHaveBeenCalledWith('RulesScreen');
  });

  it('shows staff without the operator permission only what they may open', async () => {
    const screen = await renderSetup([Permission.ReadUserTransactions]);

    expect(screen.getByTestId('setup-money')).toBeTruthy();
    expect(screen.queryByTestId('setup-rules')).toBeNull();
    expect(screen.queryByTestId('setup-visibility')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Operations' })).toBeNull();
  });
});

describe('openSetup', () => {
  it('replaces the screen beside the list, and goes up to the Manifest stack for the conditions', () => {
    const navigation = { navigate: jest.fn(), dispatch: jest.fn() };

    openSetup(navigation, 'RulesScreen');
    expect(navigation.navigate).toHaveBeenCalledWith('RulesScreen');
    openSetup(navigation, 'VehiclesScreen', true);
    expect(navigation.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'REPLACE', payload: { name: 'VehiclesScreen' } })
    );
    openSetup(navigation, 'WeatherConditionsScreen', true);
    expect(navigation.navigate).toHaveBeenLastCalledWith('WeatherConditionsScreen');
  });
});
