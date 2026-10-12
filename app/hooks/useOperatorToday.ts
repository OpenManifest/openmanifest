import * as React from 'react';
import { AppState } from 'react-native';
import { useOperatorContext } from 'app/providers/operator/context';
import { resolveTimeZone, todayInZone } from 'app/utils/operatorTime';

/** The time zone of the operator that is selected */
export function useOperatorTimeZone(): string {
  const {
    operator: { operator },
  } = useOperatorContext();
  return resolveTimeZone(operator?.timeZone);
}

/**
 * Today's date (yyyy-MM-dd) at the selected operator, not on the device. Checked every minute and when the app comes
 * back to the foreground, so a board left open over midnight (at the operator) moves on to the new day by itself.
 */
export function useOperatorToday(timeZone?: string): string {
  const operatorTimeZone = useOperatorTimeZone();
  const zone = timeZone ?? operatorTimeZone;
  const [today, setToday] = React.useState(() => todayInZone(zone));

  React.useEffect(() => {
    const update = () => setToday(todayInZone(zone));
    update();

    const timer = setInterval(update, 60 * 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        update();
      }
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [zone]);

  return today;
}
