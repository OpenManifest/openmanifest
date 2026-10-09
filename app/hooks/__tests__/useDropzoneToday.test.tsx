import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { Settings } from 'luxon';
import { useDropzoneToday } from '../useDropzoneToday';

describe('useDropzoneToday', () => {
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

  it("is the dropzone's date while the device is on the day before", () => {
    jest.setSystemTime(new Date('2026-10-08T23:00:00Z'));

    const { result } = renderHook(() => useDropzoneToday('Australia/Brisbane'));

    expect(result.current).toBe('2026-10-09');
  });

  it("moves on to the next day by itself when the dropzone's midnight passes", () => {
    jest.setSystemTime(new Date('2026-10-08T13:58:30Z')); // 23:58:30 on 8 October at the dropzone
    const { result } = renderHook(() => useDropzoneToday('Australia/Brisbane'));
    expect(result.current).toBe('2026-10-08');

    act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });
    expect(result.current).toBe('2026-10-08'); // 23:59:30

    act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });
    expect(result.current).toBe('2026-10-09'); // 00:00:30
  });

  it('checks again when the app comes back to the foreground', () => {
    let onChange: (state: string) => void = () => undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      _type: string,
      listener: (state: string) => void
    ) => {
      onChange = listener;
      return { remove: jest.fn() };
    }) as never);
    jest.setSystemTime(new Date('2026-10-08T13:00:00Z'));
    const { result } = renderHook(() => useDropzoneToday('Australia/Brisbane'));
    expect(result.current).toBe('2026-10-08');

    // The phone was asleep: no timer ran, the clock moved past midnight
    jest.setSystemTime(new Date('2026-10-08T15:00:00Z'));
    act(() => onChange('active'));

    expect(result.current).toBe('2026-10-09');
  });

  it('stops checking when it is unmounted', () => {
    jest.setSystemTime(new Date('2026-10-08T13:00:00Z'));
    const { unmount } = renderHook(() => useDropzoneToday('Australia/Brisbane'));

    unmount();

    expect(jest.getTimerCount()).toBe(0);
  });
});
