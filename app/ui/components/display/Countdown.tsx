import * as React from 'react';
import { View } from 'react-native';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { formatTime, inZone, type Instant } from 'app/i18n/format';
import Text, { type TextTone } from '../Text';
import { announcedMinutes, formatCountdown, secondsLeft } from './countdown';

export type CountdownProps = {
  /** When it ends: a `Date`, an ISO string, a luxon date or seconds since the epoch */
  end: Instant;
  /** What is counting down ("Boarding call"): the start of what a screen reader hears */
  label: string;
  /** The operator's time zone, for the clock time a screen reader hears ("at 14:30") */
  timeZone?: string | null;
  /** Called once when it reaches zero */
  onElapsed?(): void;
  testID?: string;
};

/** Ticks once a second until `end`, then stops; the clock is read at each tick, so a late timer cannot drift it */
function useSecondsLeft(endMs: number, onElapsed?: () => void) {
  const [left, setLeft] = React.useState(() => secondsLeft(endMs, Date.now()));
  const elapsed = React.useRef(onElapsed);
  React.useEffect(() => {
    elapsed.current = onElapsed;
  });

  React.useEffect(() => {
    const read = () => {
      const next = secondsLeft(endMs, Date.now());
      setLeft(next);
      return next;
    };
    if (read() <= 0) {
      elapsed.current?.();
      return undefined;
    }
    const timer = setInterval(() => {
      if (read() <= 0) {
        clearInterval(timer);
        elapsed.current?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endMs]);

  return left;
}

/**
 * A countdown to an instant: tabular digits that change every second, which a screen reader never hears. It hears a
 * polite message once a minute instead ("Boarding call: 9 minutes left, at 14:30") and one when time is up.
 */
export default function Countdown({ end, label, timeZone, onElapsed, testID }: CountdownProps) {
  const { t } = useTranslation('common');
  const endDate = React.useMemo(() => inZone(end, timeZone), [end, timeZone]);
  const endMs = endDate.toMillis();
  const left = useSecondsLeft(endMs, onElapsed);
  const minutes = announcedMinutes(left);

  // Only the minute changes the message, so the live region is quiet between minutes
  const message = React.useMemo(
    () =>
      minutes <= 0
        ? t('countdown.elapsed', { label })
        : t('countdown.announce', {
            label,
            count: minutes,
            time: formatTime(DateTime.fromMillis(endMs), timeZone),
          }),
    [minutes, label, endMs, timeZone, t]
  );
  const tone: TextTone = left <= 0 ? 'blocked' : left <= 300 ? 'warning' : 'default';

  return (
    <View testID={testID}>
      <Text
        variant="countdown"
        tone={tone}
        aria-hidden
        importantForAccessibility="no-hide-descendants"
        testID={testID ? `${testID}-clock` : undefined}
      >
        {formatCountdown(left)}
      </Text>
      {/* For screen readers, not for the eye: the digits above are the display */}
      <View style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        <Text
          role="status"
          aria-live="polite"
          accessibilityLiveRegion="polite"
          testID={testID ? `${testID}-announcement` : undefined}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}
