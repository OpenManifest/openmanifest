import * as React from 'react';
import { AppState } from 'react-native';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { resolveTimeZone, todayInZone } from 'app/utils/dropzoneTime';

/** The time zone of the dropzone that is selected */
export function useDropzoneTimeZone(): string {
  const {
    dropzone: { dropzone },
  } = useDropzoneContext();
  return resolveTimeZone(dropzone?.timeZone);
}

/**
 * Today's date (yyyy-MM-dd) at the selected dropzone, not on the device. Checked every minute and when the app comes
 * back to the foreground, so a board left open over midnight (at the dropzone) moves on to the new day by itself.
 */
export function useDropzoneToday(timeZone?: string): string {
  const dropzoneTimeZone = useDropzoneTimeZone();
  const zone = timeZone ?? dropzoneTimeZone;
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
