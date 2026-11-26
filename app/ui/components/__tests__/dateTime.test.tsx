import * as React from 'react';
import { DateTime, Settings } from 'luxon';
import { act, fireEvent } from '@testing-library/react-native';
import DateField from '../form/DateField';
import TimeField from '../form/TimeField';
import {
  clockOf,
  deviceDateShowing,
  isoDateOf,
  secondsOfClock,
  secondsOfIsoDate,
} from '../form/dateTime';
import { onPlatform, renderThemed } from '../testing';

type PickerProps = {
  value: Date;
  mode: 'date' | 'time';
  onChange(event: { type: string }, date?: Date): void;
};

const mockOpen = jest.fn();
let mockPicker: PickerProps | null = null;

jest.mock('@react-native-community/datetimepicker', () => {
  const ReactNative = jest.requireActual('react-native');
  const ReactActual = jest.requireActual('react');
  return {
    __esModule: true,
    default: (props: PickerProps) => {
      mockPicker = props;
      return ReactActual.createElement(ReactNative.View, { testID: `picker-${props.mode}` });
    },
    DateTimePickerAndroid: { open: (props: PickerProps) => mockOpen(props) },
  };
});

const ZONE = 'Australia/Brisbane';

beforeAll(() => {
  Settings.defaultZone = ZONE;
});
afterAll(() => {
  Settings.defaultZone = 'system';
});
beforeEach(() => {
  mockOpen.mockReset();
  mockPicker = null;
});

describe('date and time values', () => {
  it('turns seconds into the date of this device and a date into its midday', () => {
    const noon = DateTime.fromISO('2026-11-28T12:00:00', { zone: ZONE }).toSeconds();
    expect(secondsOfIsoDate('2026-11-28')).toBe(noon);
    expect(isoDateOf(noon)).toBe('2026-11-28');
    // Midday keeps the date in UTC too, which the forms send
    expect(new Date(noon * 1000).toISOString().slice(0, 10)).toBe('2026-11-28');
  });

  it('has no value for nothing, 0 or a broken date', () => {
    expect(isoDateOf(null)).toBeNull();
    expect(isoDateOf(0)).toBeNull();
    expect(secondsOfIsoDate('')).toBeNull();
    expect(secondsOfIsoDate('2026-13-45')).toBeNull();
  });

  it("reads and sets a time of day on the operator's clock, today", () => {
    const now = DateTime.fromISO('2026-11-09T08:00:00', { zone: 'Europe/Oslo' });
    const seconds = secondsOfClock('14:05', 'Europe/Oslo', now) as number;
    expect(DateTime.fromSeconds(seconds, { zone: 'Europe/Oslo' }).toISO()).toBe(
      '2026-11-09T14:05:00.000+01:00'
    );
    expect(clockOf(seconds, 'Europe/Oslo')).toBe('14:05');
    expect(clockOf(seconds, ZONE)).toBe('23:05');
    expect(secondsOfClock('24:00', ZONE)).toBeNull();
    expect(secondsOfClock('', ZONE)).toBeNull();
  });

  it("gives the native picker a device date that shows the operator's time", () => {
    const seconds = DateTime.fromISO('2026-11-09T14:05:00', { zone: 'Europe/Oslo' }).toSeconds();
    const shown = deviceDateShowing(seconds, 'Europe/Oslo');
    expect([shown.getHours(), shown.getMinutes()]).toEqual([14, 5]);
  });
});

describe('DateField', () => {
  it('says the date, or that there is none, in a button named by its label', async () => {
    const seconds = secondsOfIsoDate('2026-11-28') as number;
    const set = await renderThemed(<DateField label="Due" value={seconds} />);
    expect(set.getByRole('button', { name: 'Due: 28 Nov 2026' })).toBeTruthy();

    const empty = await renderThemed(<DateField label="Due" value={0} />);
    expect(empty.getByRole('button', { name: 'Due: No date' })).toBeTruthy();
  });

  it('opens the calendar under the box on iOS and reports the day chosen', async () => {
    const onChange = jest.fn();
    await onPlatform('ios', async () => {
      const screen = await renderThemed(<DateField label="Due" onChange={onChange} />);
      await fireEvent.press(screen.getByRole('button', { name: 'Due: No date' }));
      expect(screen.getByTestId('picker-date')).toBeTruthy();

      await act(() => mockPicker?.onChange({ type: 'set' }, new Date(2026, 10, 28, 9, 30)));
    });
    expect(onChange).toHaveBeenCalledWith(secondsOfIsoDate('2026-11-28'));
  });

  it("opens Android's dialog, and a dismissal changes nothing", async () => {
    const onChange = jest.fn();
    await onPlatform('android', async () => {
      const screen = await renderThemed(<DateField label="Due" onChange={onChange} />);
      await fireEvent.press(screen.getByRole('button', { name: 'Due: No date' }));
    });
    expect(mockOpen).toHaveBeenCalledWith(expect.objectContaining({ mode: 'date' }));
    mockOpen.mock.calls[0][0].onChange({ type: 'dismissed' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does nothing when disabled', async () => {
    await onPlatform('android', async () => {
      const screen = await renderThemed(<DateField label="Due" disabled />);
      await fireEvent.press(screen.getByRole('button', { name: 'Due: No date' }));
    });
    expect(mockOpen).not.toHaveBeenCalled();
  });
});

describe('TimeField', () => {
  it("says the time on the operator's clock", async () => {
    const seconds = DateTime.fromISO('2026-11-09T14:05:00', { zone: 'Europe/Oslo' }).toSeconds();
    const screen = await renderThemed(
      <TimeField label="Departs" value={seconds} timeZone="Europe/Oslo" />
    );
    expect(screen.getByRole('button', { name: 'Departs: 14:05' })).toBeTruthy();
  });

  it("sets the hours and minutes chosen on Android's clock as today's time at the operator", async () => {
    const onChange = jest.fn();
    await onPlatform('android', async () => {
      const screen = await renderThemed(
        <TimeField label="Departs" timeZone="Europe/Oslo" onChange={onChange} />
      );
      await fireEvent.press(screen.getByRole('button', { name: 'Departs: No time' }));
    });
    expect(mockOpen).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'time', is24Hour: true })
    );
    mockOpen.mock.calls[0][0].onChange({ type: 'set' }, new Date(2026, 10, 9, 16, 45));
    expect(clockOf(onChange.mock.calls[0][0], 'Europe/Oslo')).toBe('16:45');
  });

  it('shows the wheels and a Done button on iOS', async () => {
    const onChange = jest.fn();
    await onPlatform('ios', async () => {
      const screen = await renderThemed(
        <TimeField label="Departs" timeZone={ZONE} onChange={onChange} />
      );
      await fireEvent.press(screen.getByRole('button', { name: 'Departs: No time' }));
      await act(() => mockPicker?.onChange({ type: 'set' }, new Date(2026, 10, 9, 7, 0)));
      await fireEvent.press(screen.getByRole('button', { name: 'Done' }));
      expect(screen.queryByTestId('picker-time')).toBeNull();
    });
    expect(clockOf(onChange.mock.calls[0][0], ZONE)).toBe('07:00');
  });
});
