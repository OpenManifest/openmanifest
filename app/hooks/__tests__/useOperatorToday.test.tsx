import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { Settings } from 'luxon';
import { useOperatorToday } from '../useOperatorToday';

describe('useOperatorToday', () => {
  const originalZone = Settings.defaultZone;
  beforeEach(() => {
    Settings.defaultZone = 'UTC';
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    Settings.defaultZone = originalZone;
  });

  it("is the dropzone's date while the device is on the day before", async () => {
    jest.setSystemTime(new Date('2026-10-08T23:00:00Z'));

    const { result } = await renderHook(() => useOperatorToday('Australia/Brisbane'));

    expect(result.current).toBe('2026-10-09');
  });

  it("moves on to the next day by itself when the dropzone's midnight passes", async () => {
    jest.setSystemTime(new Date('2026-10-08T13:58:30Z')); // 23:58:30 on 8 October at the operator
    const { result } = await renderHook(() => useOperatorToday('Australia/Brisbane'));
    expect(result.current).toBe('2026-10-08');

    await act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });
    expect(result.current).toBe('2026-10-08'); // 23:59:30

    await act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });
    expect(result.current).toBe('2026-10-09'); // 00:00:30
  });

  it('checks again when the app comes back to the foreground', async () => {
    let onChange: (state: string) => void = () => undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      _type: string,
      listener: (state: string) => void
    ) => {
      onChange = listener;
      return { remove: jest.fn() };
    }) as never);
    jest.setSystemTime(new Date('2026-10-08T13:00:00Z'));
    const { result } = await renderHook(() => useOperatorToday('Australia/Brisbane'));
    expect(result.current).toBe('2026-10-08');

    // The phone was asleep: no timer ran, the clock moved past midnight
    jest.setSystemTime(new Date('2026-10-08T15:00:00Z'));
    await act(() => onChange('active'));

    expect(result.current).toBe('2026-10-09');
  });

  it('stops checking when it is unmounted', async () => {
    jest.setSystemTime(new Date('2026-10-08T13:00:00Z'));
    const { unmount } = await renderHook(() => useOperatorToday('Australia/Brisbane'));

    await unmount();

    // What is left is React's own (it schedules work as the tree unmounts). A timer of the hook would run again and again
    // (it checks at every midnight), which runAllTimers reports by giving up after 100000 timers.
    expect(() => jest.runAllTimers()).not.toThrow();
    expect(jest.getTimerCount()).toBe(0);
  });
});
