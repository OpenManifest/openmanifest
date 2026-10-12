import * as React from 'react';
import { Text as NativeText } from 'react-native';
import { act, fireEvent } from '@testing-library/react-native';
import Avatar, { initialsOf } from '../display/Avatar';
import Icon from '../Icon';
import FieldError from '../form/FieldError';
import Subheader from '../display/Subheader';
import Countdown from '../display/Countdown';
import { announcedMinutes, formatCountdown, secondsLeft } from '../display/countdown';
import EmptyState from '../display/EmptyState';
import ProgressMeter from '../display/ProgressMeter';
import Skeleton from '../display/Skeleton';
import StatusBadge from '../display/StatusBadge';
import Tabs from '../display/Tabs';
import { colours, flat, onPlatform, renderThemed, SCHEMES } from '../testing';

describe('StatusBadge', () => {
  it('shows the word, and an icon with it', async () => {
    const screen = await renderThemed(<StatusBadge status="boarding" label="On call" testID="b" />);

    expect(screen.getByText('On call')).toBeTruthy();
    // The icon and the word are two children of the pill
    expect(screen.getByTestId('b').children).toHaveLength(2);
  });

  it.each(SCHEMES)('uses the colours of its status in the %s scheme', async (scheme) => {
    const screen = await renderThemed(
      <>
        <StatusBadge status="landed" label="Landed" testID="landed" />
        <StatusBadge status="blocked" label="Full" testID="blocked" />
      </>,
      { scheme }
    );

    expect(flat(screen.getByTestId('landed')).backgroundColor).toBe(
      colours[scheme].status.landed.bg
    );
    expect(flat(screen.getByText('Landed')).color).toBe(colours[scheme].status.landed.fg);
    expect(flat(screen.getByTestId('blocked')).backgroundColor).toBe(
      colours[scheme].status.blocked.bg
    );
  });
});

describe('initialsOf', () => {
  it.each([
    ['Olive Owner', 'OO'],
    ['Cher', 'C'],
    ['  jo   jumper  ', 'JJ'],
    ['Ana Maria Costa', 'AM'],
    ['Émile Zola', 'ÉZ'],
    ['', ''],
  ])('makes %p into %p', (name, initials) => {
    expect(initialsOf(name)).toBe(initials);
  });
});

describe('Avatar', () => {
  it('is an image named after the person, with their initials without a photo', async () => {
    const screen = await renderThemed(<Avatar name="Olive Owner" testID="a" />);

    expect(screen.getByTestId('a').props.role).toBe('img');
    expect(screen.getByTestId('a').props['aria-label']).toBe('Photo of Olive Owner');
    expect(screen.getByText('OO')).toBeTruthy();
  });

  it('shows the photo, and the initials again if it fails to load', async () => {
    const screen = await renderThemed(
      <Avatar name="Olive Owner" imageUri="https://example.com/o.png" testID="a" />
    );

    expect(screen.getByTestId('a-image')).toBeTruthy();
    expect(screen.queryByText('OO')).toBeNull();

    await fireEvent(screen.getByTestId('a-image'), 'error');

    expect(screen.queryByTestId('a-image')).toBeNull();
    expect(screen.getByText('OO')).toBeTruthy();
  });

  it.each([
    ['sm', 32],
    ['md', 40],
    ['lg', 56],
  ] as const)('is %s: %d dp', async (size, dp) => {
    const screen = await renderThemed(<Avatar name="Olive Owner" size={size} testID="a" />);

    expect(flat(screen.getByTestId('a'))).toMatchObject({ width: dp, height: dp });
  });
});

describe('EmptyState', () => {
  it('says what is the case, why, and offers the way out', async () => {
    const onPress = jest.fn();
    const screen = await renderThemed(
      <EmptyState
        title="No loads so far today"
        body="Create the first one"
        action={{ label: 'New load', onPress }}
      />
    );

    expect(screen.getByRole('heading', { name: 'No loads so far today' })).toBeTruthy();
    expect(screen.getByText('Create the first one')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'New load' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is just a heading without a body or an action', async () => {
    const screen = await renderThemed(<EmptyState title="Nothing here" />);

    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('countdown arithmetic', () => {
  it('counts whole seconds up, never below zero', () => {
    expect(secondsLeft(10_000, 0)).toBe(10);
    expect(secondsLeft(10_001, 0)).toBe(11);
    expect(secondsLeft(10_000, 10_000)).toBe(0);
    expect(secondsLeft(10_000, 20_000)).toBe(0);
  });

  it.each([
    [0, '00:00'],
    [9, '00:09'],
    [570, '09:30'],
    [3599, '59:59'],
    [3600, '1:00:00'],
    [3725, '1:02:05'],
  ])('writes %i seconds as %s', (seconds, text) => {
    expect(formatCountdown(seconds)).toBe(text);
  });

  it('tells readers the minutes rounded up', () => {
    expect(announcedMinutes(600)).toBe(10);
    expect(announcedMinutes(541)).toBe(10);
    expect(announcedMinutes(540)).toBe(9);
    expect(announcedMinutes(1)).toBe(1);
    expect(announcedMinutes(0)).toBe(0);
  });
});

describe('Countdown', () => {
  const NOW = Date.UTC(2026, 9, 12, 3, 0, 0);

  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  const minutesFromNow = (minutes: number) => new Date(NOW + minutes * 60_000);
  const tick = (ms: number) =>
    act(async () => {
      jest.advanceTimersByTime(ms);
    });

  it('shows the time left and counts down every second', async () => {
    const screen = await renderThemed(
      <Countdown end={minutesFromNow(10)} label="Boarding call" testID="c" />
    );

    expect(screen.getByTestId('c-clock').props.children).toBe('10:00');
    await tick(1000);
    expect(screen.getByTestId('c-clock').props.children).toBe('09:59');
    await tick(59_000);
    expect(screen.getByTestId('c-clock').props.children).toBe('09:00');
  });

  it('hides the digits from screen readers and announces the minutes in a polite live region', async () => {
    const screen = await renderThemed(
      <Countdown
        end={minutesFromNow(10)}
        label="Boarding call"
        timeZone="Australia/Sydney"
        testID="c"
      />
    );

    expect(screen.getByTestId('c-clock').props['aria-hidden']).toBe(true);
    const announcement = screen.getByTestId('c-announcement');
    expect(announcement.props.role).toBe('status');
    expect(announcement.props['aria-live']).toBe('polite');
    // 03:10 UTC is 14:10 in Sydney (AEDT, UTC+11)
    expect(announcement.props.children).toBe('Boarding call: 10 minutes left, at 14:10');
  });

  it('changes the announcement once a minute, not every second', async () => {
    const screen = await renderThemed(
      <Countdown end={minutesFromNow(10)} label="Boarding call" timeZone="UTC" testID="c" />
    );
    const text = () => screen.getByTestId('c-announcement').props.children;
    const first = text();

    await tick(30_000);
    expect(text()).toBe(first);
    await tick(29_000);
    expect(text()).toBe(first);
    await tick(1000);
    expect(text()).toBe('Boarding call: 9 minutes left, at 03:10');
  });

  it('says one minute in the singular', async () => {
    const screen = await renderThemed(
      <Countdown end={minutesFromNow(1)} label="Boarding call" timeZone="UTC" testID="c" />
    );

    expect(screen.getByTestId('c-announcement').props.children).toBe(
      'Boarding call: 1 minute left, at 03:01'
    );
  });

  it('follows the time zone of the dropzone for the clock time, not for the countdown', async () => {
    const zones = await renderThemed(
      <>
        <Countdown end={minutesFromNow(5)} label="A" timeZone="Pacific/Auckland" testID="a" />
        <Countdown end={minutesFromNow(5)} label="B" timeZone="America/Denver" testID="b" />
      </>
    );

    expect(zones.getByTestId('a-announcement').props.children).toBe('A: 5 minutes left, at 16:05');
    expect(zones.getByTestId('b-announcement').props.children).toBe('B: 5 minutes left, at 21:05');
    expect(zones.getByTestId('a-clock').props.children).toBe('05:00');
    expect(zones.getByTestId('b-clock').props.children).toBe('05:00');
  });

  it('stops at zero, says time is up and calls onElapsed once', async () => {
    const onElapsed = jest.fn();
    const screen = await renderThemed(
      <Countdown
        end={new Date(NOW + 3000)}
        label="Boarding call"
        timeZone="UTC"
        onElapsed={onElapsed}
        testID="c"
      />
    );

    await tick(3000);
    expect(screen.getByTestId('c-clock').props.children).toBe('00:00');
    expect(screen.getByTestId('c-announcement').props.children).toBe('Boarding call: time is up');
    await tick(10_000);
    expect(screen.getByTestId('c-clock').props.children).toBe('00:00');
    expect(onElapsed).toHaveBeenCalledTimes(1);
  });

  it('is already at zero for a time in the past', async () => {
    const onElapsed = jest.fn();
    const screen = await renderThemed(
      <Countdown end={minutesFromNow(-5)} label="Call" onElapsed={onElapsed} testID="c" />
    );

    expect(screen.getByTestId('c-clock').props.children).toBe('00:00');
    expect(onElapsed).toHaveBeenCalledTimes(1);
  });

  it.each(SCHEMES)(
    'turns warning in the last five minutes and blocked at zero in the %s scheme',
    async (scheme) => {
      const screen = await renderThemed(
        <Countdown end={new Date(NOW + 301_000)} label="Call" testID="c" />,
        { scheme }
      );
      const colour = () => flat(screen.getByTestId('c-clock')).color;

      expect(colour()).toBe(colours[scheme].text);
      await tick(2000);
      expect(colour()).toBe(colours[scheme].status.warning.fg);
      await tick(300_000);
      expect(colour()).toBe(colours[scheme].status.blocked.fg);
    }
  );

  it('stops ticking when it unmounts', async () => {
    const screen = await renderThemed(<Countdown end={minutesFromNow(10)} label="Call" />);

    const clear = jest.spyOn(globalThis, 'clearInterval' as never);
    await screen.unmount();

    expect(clear).toHaveBeenCalled();
    clear.mockRestore();
  });
});

describe('Tabs', () => {
  const tabs = [
    { value: 'jumps', label: 'Jumps' },
    { value: 'gear', label: 'Gear' },
    { value: 'money', label: 'Money', disabled: true },
  ];

  it('is a tab list with the chosen tab selected and its panel shown', async () => {
    const screen = await renderThemed(
      <Tabs label="Sections" tabs={tabs} value="gear" onChange={jest.fn()}>
        <NativeText>Gear panel</NativeText>
      </Tabs>
    );

    expect(screen.getByLabelText('Sections').props.role).toBe('tablist');
    expect(screen.getByRole('tab', { name: 'Gear', selected: true })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Jumps', selected: false })).toBeTruthy();
    expect(screen.getByText('Gear panel')).toBeTruthy();
  });

  it('chooses the pressed tab, but not a disabled one', async () => {
    const onChange = jest.fn();
    const screen = await renderThemed(
      <Tabs label="Sections" tabs={tabs} value="gear" onChange={onChange} />
    );

    await fireEvent.press(screen.getByRole('tab', { name: 'Jumps' }));
    await fireEvent.press(screen.getByRole('tab', { name: 'Money' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('jumps');
  });

  it.each(SCHEMES)(
    'marks the chosen tab with the brand colour in the %s scheme',
    async (scheme) => {
      const screen = await renderThemed(
        <Tabs label="Sections" tabs={tabs} value="gear" onChange={jest.fn()} />,
        {
          scheme,
        }
      );

      expect(flat(screen.getByRole('tab', { name: 'Gear' })).borderBottomColor).toBe(
        colours[scheme].brand
      );
      expect(flat(screen.getByRole('tab', { name: 'Jumps' })).borderBottomColor).toBe(
        'transparent'
      );
    }
  );

  it('is at least as tall as the touch target on Android', async () => {
    await onPlatform('android', async () => {
      const screen = await renderThemed(
        <Tabs label="Sections" tabs={tabs} value="gear" onChange={jest.fn()} />
      );

      expect(flat(screen.getByRole('tab', { name: 'Gear' })).minHeight).toBeGreaterThanOrEqual(48);
    });
  });
});

describe('Skeleton', () => {
  it('is hidden from screen readers', async () => {
    const screen = await renderThemed(<Skeleton testID="s" />);

    expect(screen.getByTestId('s').props['aria-hidden']).toBe(true);
  });

  it('draws a bar per line, the last one shorter', async () => {
    const screen = await renderThemed(<Skeleton testID="s" lines={3} />);
    const bars = screen.getByTestId('s').children as unknown as { props: { style: unknown } }[];

    expect(bars).toHaveLength(3);
    expect(flat(bars[0]).width).toBe('100%');
    expect(flat(bars[2]).width).toBe('60%');
  });

  it('can be a circle', async () => {
    const screen = await renderThemed(<Skeleton testID="s" circle height={40} />);
    const [bar] = screen.getByTestId('s').children as unknown as { props: { style: unknown } }[];

    expect(flat(bar)).toMatchObject({ width: 40, height: 40, borderRadius: 999 });
  });
});

describe('ProgressMeter', () => {
  it('is a progress bar with its name, value, limits and text', async () => {
    const screen = await renderThemed(
      <ProgressMeter label="Slots filled" value={3} max={10} valueText="3 of 10" testID="p" />
    );
    const meter = screen.getByTestId('p');

    expect(meter.props.role).toBe('progressbar');
    expect(meter.props['aria-label']).toBe('Slots filled');
    expect(meter.props['aria-valuemin']).toBe(0);
    expect(meter.props['aria-valuemax']).toBe(10);
    expect(meter.props['aria-valuenow']).toBe(3);
    expect(meter.props['aria-valuetext']).toBe('3 of 10');
    expect(flat(screen.getByTestId('p-fill')).width).toBe('30%');
    expect(screen.getByText('3 of 10')).toBeTruthy();
  });

  it('is a fraction by default, shown as a percentage', async () => {
    const screen = await renderThemed(<ProgressMeter label="Upload" value={0.25} testID="p" />);

    expect(screen.getByText('25%')).toBeTruthy();
    expect(flat(screen.getByTestId('p-fill')).width).toBe('25%');
  });

  it('keeps the value within its limits', async () => {
    const screen = await renderThemed(
      <>
        <ProgressMeter label="Over" value={14} max={10} testID="over" />
        <ProgressMeter label="Under" value={-3} max={10} testID="under" />
      </>
    );

    expect(flat(screen.getByTestId('over-fill')).width).toBe('100%');
    expect(flat(screen.getByTestId('under-fill')).width).toBe('0%');
  });

  it.each(SCHEMES)(
    'fills with the brand, or the colour of a status, in the %s scheme',
    async (scheme) => {
      const screen = await renderThemed(
        <>
          <ProgressMeter label="A" value={0.5} testID="a" />
          <ProgressMeter label="B" value={1} tone="blocked" testID="b" />
        </>,
        { scheme }
      );

      expect(flat(screen.getByTestId('a-fill')).backgroundColor).toBe(colours[scheme].brand);
      expect(flat(screen.getByTestId('b-fill')).backgroundColor).toBe(
        colours[scheme].status.blocked.fg
      );
    }
  );

  it('can leave the words to its row', async () => {
    const screen = await renderThemed(
      <ProgressMeter label="Slots" value={0.5} showValue={false} />
    );

    expect(screen.queryByText('50%')).toBeNull();
  });
});

describe('Subheader', () => {
  it('is a level 3 heading', async () => {
    const screen = await renderThemed(<Subheader>Ticket</Subheader>);

    expect(screen.getByRole('heading', { name: 'Ticket' })).toBeTruthy();
  });
});

describe('Icon', () => {
  it('is hidden from screen readers', async () => {
    const screen = await renderThemed(<Icon name="calendar" />);

    expect(screen.queryByRole('img')).toBeNull();
  });
});

describe('FieldError', () => {
  it('announces its message as an alert in the blocked colour', async () => {
    const screen = await renderThemed(<FieldError>Required</FieldError>);

    expect(screen.getByText('Required').props.role).toBe('alert');
    expect(flat(screen.getByText('Required')).color).toBe(colours.light.status.blocked.fg);
  });

  it('shows nothing without a message', async () => {
    const screen = await renderThemed(
      <>
        <FieldError>{''}</FieldError>
        <FieldError>{null}</FieldError>
      </>
    );

    expect(screen.queryByRole('alert')).toBeNull();
  });
});
