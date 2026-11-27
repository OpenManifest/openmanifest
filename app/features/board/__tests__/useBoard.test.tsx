import * as React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { LoadState } from 'app/api/schema.d';
import { INITIAL_CONTEXT, ManifestContext } from 'app/providers/manifest/context';
import { HIGHLIGHT_MS, useBoard } from '../useBoard';
import { holdOrder, sortLoads } from '../order';

type Observer = { next(result: { data: unknown }): void; error(): void };
const subscribed: Record<string, Observer> = {};
const unsubscribed: string[] = [];
const mockClient = {
  subscribe: ({ variables }: { variables: { id: string } }) => ({
    subscribe: (observer: Observer) => {
      subscribed[variables.id] = observer;
      return { unsubscribe: () => unsubscribed.push(variables.id) };
    },
  }),
};
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => mockClient,
}));

// What the cache would do with a pushed load: the board's query hands out the new object
let mockPushToCache: (load: any) => void = () => undefined;
jest.mock('app/api/crud/subscriptions/useLoadUpdatedSubscription', () => ({
  applyLoadUpdate: (_client: unknown, load: unknown) => mockPushToCache(load),
}));

const load = (id: string, loadNumber: number, state: LoadState, extra = {}) =>
  ({ id, loadNumber, state, ...extra }) as any;

function setup(initial: any[], date = '2026-10-19') {
  const setDate = jest.fn();
  const api = { loads: initial, date, setDate };
  const Wrapper = ({ children }: React.PropsWithChildren) => {
    const [loads, setLoads] = React.useState(initial);
    api.loads = loads;
    mockPushToCache = (next) =>
      setLoads((current) => current.map((l) => (l.id === next.id ? next : l)));
    const value = {
      ...INITIAL_CONTEXT,
      manifest: {
        ...INITIAL_CONTEXT.manifest,
        loads,
        date,
        today: '2026-10-19',
        isToday: date === '2026-10-19',
        setDate,
      },
    };
    return <ManifestContext.Provider value={value}>{children}</ManifestContext.Provider>;
  };
  return { Wrapper, setDate };
}

const ids = (loads: { id: string }[]) => loads.map(({ id }) => id);

describe('sortLoads', () => {
  it('puts open before boarding before departed before completed, then by load number', () => {
    const sorted = sortLoads([
      load('a', 1, LoadState.Completed),
      load('b', 4, LoadState.Departed),
      load('c', 3, LoadState.Open),
      load('d', 2, LoadState.Cancelled),
      load('e', 5, LoadState.Boarding),
      load('f', 2, LoadState.Open),
    ]);
    expect(ids(sorted)).toEqual(['f', 'c', 'e', 'b', 'a', 'd']);
  });

  it('keeps a held order, with new loads last and gone loads dropped', () => {
    const loads = [
      load('a', 1, LoadState.Open),
      load('b', 2, LoadState.Open),
      load('c', 3, LoadState.Open),
    ];
    expect(ids(holdOrder(loads, ['c', 'x', 'a']))).toEqual(['c', 'a', 'b']);
  });
});

describe('useBoard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.keys(subscribed).forEach((key) => delete subscribed[key]);
    unsubscribed.length = 0;
  });
  afterEach(() => jest.useRealTimers());

  const day = () => [
    load('2', 2, LoadState.Departed),
    load('1', 1, LoadState.Open),
    load('3', 3, LoadState.Open),
  ];

  it('orders the loads of the day and keeps that order', async () => {
    const { Wrapper } = setup(day());
    const { result, rerender } = await renderHook(() => useBoard(), { wrapper: Wrapper });

    expect(ids(result.current.loads)).toEqual(['1', '3', '2']);
    await rerender({});
    expect(ids(result.current.loads)).toEqual(['1', '3', '2']);
    expect(result.current.changed.size).toBe(0);
  });

  it('subscribes to every load of the day', async () => {
    const { Wrapper } = setup(day());
    await renderHook(() => useBoard(), { wrapper: Wrapper });

    expect(Object.keys(subscribed).sort()).toEqual(['1', '2', '3']);
  });

  it('flags a load that a push changed for a moment, and moves it by its new state', async () => {
    const { Wrapper } = setup(day());
    const { result } = await renderHook(() => useBoard(), { wrapper: Wrapper });

    await act(() => {
      subscribed['1'].next({ data: { loadUpdated: { load: load('1', 1, LoadState.Boarding) } } });
    });

    expect(result.current.isChanged('1')).toBe(true);
    expect(result.current.isChanged('3')).toBe(false);
    expect(ids(result.current.loads)).toEqual(['3', '1', '2']);

    await act(() => {
      jest.advanceTimersByTime(HIGHLIGHT_MS + 1);
    });
    expect(result.current.isChanged('1')).toBe(false);
  });

  it('holds the order while frozen and moves the rows after unfreezing', async () => {
    const { Wrapper } = setup(day());
    const { result } = await renderHook(() => useBoard(), { wrapper: Wrapper });

    await act(() => result.current.freeze());
    expect(result.current.frozen).toBe(true);
    await act(() => {
      subscribed['1'].next({ data: { loadUpdated: { load: load('1', 1, LoadState.Completed) } } });
    });

    expect(ids(result.current.loads)).toEqual(['1', '3', '2']);
    expect(result.current.loads[0].state).toBe(LoadState.Completed);

    await act(() => result.current.unfreeze());
    expect(ids(result.current.loads)).toEqual(['3', '2', '1']);
  });

  it('shows a day ahead: asks the manifest for that date and does not flag the first loads', async () => {
    const tomorrow = '2026-10-20';
    const { Wrapper, setDate } = setup([load('9', 1, LoadState.Open)], tomorrow);
    const { result } = await renderHook(() => useBoard(tomorrow), { wrapper: Wrapper });

    expect(result.current.date).toBe(tomorrow);
    expect(result.current.isToday).toBe(false);
    expect(ids(result.current.loads)).toEqual(['9']);
    expect(result.current.changed.size).toBe(0);
    expect(setDate).not.toHaveBeenCalled();
  });

  it('moves the manifest to the date it is asked for', async () => {
    const { Wrapper, setDate } = setup(day());
    await renderHook(() => useBoard('2026-10-21'), { wrapper: Wrapper });

    expect(setDate).toHaveBeenCalledWith('2026-10-21');
  });

  it('stops listening when the board goes away', async () => {
    const { Wrapper } = setup(day());
    const { unmount } = await renderHook(() => useBoard(), { wrapper: Wrapper });

    await unmount();

    expect(unsubscribed.sort()).toEqual(['1', '2', '3']);
  });
});
