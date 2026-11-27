import * as React from 'react';
import { Permission } from 'app/api/schema.d';
import { LoadUpdatedDocument } from 'app/api/reflection';
import MOCK_QUERY_LOAD from 'app/__tests__/manifest/__mocks__/QueryLoad.mock';
import MOCK_CREW_ROLES from 'app/__tests__/manifest/__mocks__/QueryCrewRoles.mock';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { render, waitFor } from '../../../__mocks__/render';
import LoadScreen from '../LoadScreen';

jest.setTimeout(30000);

const mockNavigation = Object.assign(jest.fn(), { setOptions: jest.fn() });
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: { loadId: '1' } }),
  useIsFocused: () => false,
}));

const loadUpdatedMock = {
  request: { query: LoadUpdatedDocument, variables: { id: '1' } },
  result: { data: { loadUpdated: { __typename: 'LoadUpdatedPayload', load: null } } },
};

async function renderScreen(permissions: Permission[] = [Permission.ReadLoad]) {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  return render(<LoadScreen />, {
    graphql: [MOCK_QUERY_LOAD(), loadUpdatedMock, MOCK_CREW_ROLES()],
    permissions,
    session: authenticatedSession,
  });
}

describe('<LoadScreen /> (the new one)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('has a row for each person on the load, and the free places as one row', async () => {
    const screen = await renderScreen();

    await waitFor(() => expect(screen.getAllByTestId('slot-row').length).toBe(3), {
      timeout: 10000,
    });
    ['Amy Hops', 'Ali Falls', 'John Stumble'].forEach((name) =>
      expect(screen.getByText(name)).toBeTruthy()
    );
    expect(screen.getAllByTestId('free-places')).toHaveLength(1);
    expect(screen.getByText('7 free places')).toBeTruthy();
  });

  it('shows the call card: the load, its state and the places taken', async () => {
    const screen = await renderScreen();

    await waitFor(() => expect(screen.getByTestId('load-header')).toBeTruthy(), { timeout: 10000 });
    expect(screen.getByText('Load #1')).toBeTruthy();
    expect(screen.getByTestId('load-header-state')).toBeTruthy();
    expect(screen.getByTestId('load-header-places').props['aria-valuetext']).toMatch(/of 10 slots/);
  });

  it('names the screen "Load #n" in the header', async () => {
    await renderScreen();

    await waitFor(
      () => expect(mockNavigation.setOptions).toHaveBeenCalledWith({ title: 'Load #1' }),
      {
        timeout: 10000,
      }
    );
  });

  it('gives a person who may do nothing with the places no menu', async () => {
    const screen = await renderScreen();

    await waitFor(() => expect(screen.getAllByTestId('slot-row').length).toBe(3), {
      timeout: 10000,
    });
    expect(screen.queryByLabelText('Actions for Amy Hops')).toBeNull();
  });
});
