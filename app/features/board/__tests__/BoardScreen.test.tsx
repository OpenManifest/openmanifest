import * as React from 'react';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import MOCK_QUERY_LOADS from 'app/__tests__/manifest/__mocks__/QueryLoads.mock';
import MOCK_CREW_ROLES from 'app/__tests__/manifest/__mocks__/QueryCrewRoles.mock';
import { Permission } from 'app/api/schema.d';
import type { Breakpoint } from 'app/components/layout/useBreakpoint';
import { fireEvent, render, waitFor } from '../../../__mocks__/render';
import BoardScreen from '../BoardScreen';

jest.setTimeout(30000);

let mockBreakpoint: Breakpoint = 'compact';
jest.mock('app/components/layout/useBreakpoint', () => ({
  ...jest.requireActual('app/components/layout/useBreakpoint'),
  __esModule: true,
  default: () => mockBreakpoint,
}));
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, setOptions: jest.fn() }),
  useIsFocused: () => true,
}));

async function renderBoard(breakpoint: Breakpoint, permissions: Permission[] = []) {
  mockBreakpoint = breakpoint;
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  return render(<BoardScreen />, {
    session: authenticatedSession,
    permissions,
    graphql: [MOCK_QUERY_LOADS(), MOCK_CREW_ROLES()],
  });
}

describe('<BoardScreen />', () => {
  afterEach(() => jest.restoreAllMocks());

  it('is a list of cards on a phone, with the day above it', async () => {
    const board = await renderBoard('compact');

    await waitFor(() => expect(board.getAllByTestId('load-card').length).toBe(2));
    expect(board.getByTestId('loads')).toBeTruthy();
    expect(board.getByTestId('manifest-date-bar')).toBeTruthy();
    expect(board.queryByTestId('board-selected')).toBeNull();
  });

  it('puts the selected load beside the list on a tablet', async () => {
    const board = await renderBoard('medium');

    // The pane of the selected load is the old load card until the load screen is rebuilt (U3.5)
    await waitFor(() => expect(board.getAllByTestId('load-card-open').length).toBe(2));
    expect(board.getByTestId('board-selected')).toBeTruthy();
  });

  it('has a column for each load on a wide window', async () => {
    const board = await renderBoard('expanded');

    await waitFor(() => expect(board.getAllByTestId('load-card').length).toBe(2));
    expect(board.getByTestId('loads')).toBeTruthy();
    expect(board.queryByTestId('board-selected')).toBeNull();
  });

  it('opens the load that is pressed', async () => {
    const board = await renderBoard('compact');
    await waitFor(() => expect(board.getAllByTestId('load-card-open').length).toBe(2));

    await fireEvent.press(board.getAllByTestId('load-card-open')[0]);

    expect(mockNavigate).toHaveBeenCalledWith('Authenticated', {
      screen: 'Manifest',
      params: { screen: 'LoadScreen', params: { loadId: '1' } },
    });
  });

  it('offers to create a load to someone who may', async () => {
    const board = await renderBoard('compact', [Permission.CreateLoad]);

    await waitFor(() => expect(board.getByTestId('new-load-primary-action')).toBeTruthy());
  });

  it('offers nothing to create to someone who may not', async () => {
    const board = await renderBoard('compact');

    await waitFor(() => expect(board.getAllByTestId('load-card').length).toBe(2));
    expect(board.queryByTestId('new-load-primary-action')).toBeNull();
  });
});
