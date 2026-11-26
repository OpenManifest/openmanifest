import * as React from 'react';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import MOCK_CREW_ROLES from 'app/__tests__/manifest/__mocks__/QueryCrewRoles.mock';
import { cardParts, loadEssentials } from 'app/__tests__/manifest/__mocks__/QueryLoad.mock';
import type { Breakpoint } from 'app/components/layout/useBreakpoint';
import { act, render, waitFor } from '../../../__mocks__/render';
import BoardScreen from '../BoardScreen';

jest.setTimeout(30000);

let mockBreakpoint: Breakpoint = 'compact';
jest.mock('app/components/layout/useBreakpoint', () => ({
  ...jest.requireActual('app/components/layout/useBreakpoint'),
  __esModule: true,
  default: () => mockBreakpoint,
}));
// One navigation object, as the navigator hands out
const mockNavigation = { navigate: jest.fn(), setOptions: jest.fn() };
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useIsFocused: () => true,
}));

// The board's loads, changed from the test as a live update would change them: a new object for the load that changed
const LOADS = 6;
const SEATS = 14;
const makeLoad = (n: number, occupied = 10) =>
  ({
    ...loadEssentials,
    ...cardParts,
    id: String(n),
    name: `Load ${n}`,
    loadNumber: n,
    maxSlots: SEATS,
    occupiedSlots: occupied,
    availableSlots: SEATS - occupied,
  }) as any;
let mockSetBoard: (update: (loads: any[]) => any[]) => void = () => undefined;
let mockChanged = new Set<string>();
jest.mock('../useBoard', () => {
  const ReactActual = jest.requireActual('react');
  return {
    useBoard: () => {
      const [loads, setLoads] = ReactActual.useState(() =>
        Array.from({ length: 6 }, (_, i) => makeLoad(i + 1))
      );
      const [changed, setChanged] = ReactActual.useState(new Set<string>());
      mockSetBoard = (update) => {
        setLoads((current: any[]) => {
          const next = update(current);
          const flagged = next.filter((load, i) => load !== current[i]).map((load) => load.id);
          setChanged(new Set(flagged));
          return next;
        });
      };
      mockChanged = changed;
      return {
        date: '2026-10-19',
        isToday: true,
        loads,
        changed,
        isChanged: (id: string) => changed.has(id),
        frozen: false,
        freeze: jest.fn(),
        unfreeze: jest.fn(),
        loading: false,
        refreshing: false,
        refetch: jest.fn(),
      };
    },
  };
});

// Counts the renders of each card through a part every card renders
const mockRenders: Record<string, number> = {};
jest.mock('../PlacesMeter', () => ({
  __esModule: true,
  default: ({ load }: { load: { id: string } }) => {
    mockRenders[load.id] = (mockRenders[load.id] ?? 0) + 1;
    return null;
  },
}));

const reset = () => Object.keys(mockRenders).forEach((id) => delete mockRenders[id]);

async function renderBoard(breakpoint: Breakpoint) {
  mockBreakpoint = breakpoint;
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const board = await render(<BoardScreen />, {
    session: authenticatedSession,
    graphql: [MOCK_CREW_ROLES()],
  });
  await waitFor(() => expect(board.getAllByTestId('load-card').length).toBe(LOADS));
  // Let the queries of the screen settle before counting
  await act(async () => new Promise((resolve) => setTimeout(resolve, 50)));
  return board;
}

describe(`the board with ${LOADS} loads of ${SEATS} seats`, () => {
  afterEach(() => {
    jest.restoreAllMocks();
    reset();
  });

  it.each<Breakpoint>(['compact', 'medium', 'expanded'])(
    'renders only the card of the load that changed (%s)',
    async (breakpoint) => {
      await renderBoard(breakpoint);
      reset();

      await act(async () =>
        mockSetBoard((loads) =>
          loads.map((load) => (load.id === '3' ? makeLoad(3, load.occupiedSlots + 1) : load))
        )
      );

      expect(mockChanged.has('3')).toBe(true);
      expect(Object.keys(mockRenders)).toEqual(['3']);
    }
  );

  it('renders nothing again when the board renders without a change', async () => {
    await renderBoard('compact');
    reset();

    await act(async () => mockSetBoard((loads) => [...loads]));

    expect(mockRenders).toEqual({});
  });
});
