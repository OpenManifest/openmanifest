import * as React from 'react';
import type { TimeFieldProps } from './TimeField';
import BrowserInput from './browserInput.web';
import { clockOf, secondsOfClock } from './dateTime';
import { withHookForm } from './withHookForm';

export type { TimeFieldProps } from './TimeField';

/** A time of day on the web, today on the operator's clock: the browser's time input (the native one is `TimeField.tsx`) */
function TimeField({ value, onChange, timeZone, ...rest }: TimeFieldProps) {
  return (
    <BrowserInput
      {...rest}
      type="time"
      value={clockOf(value, timeZone) ?? ''}
      onChange={(clock) => {
        const seconds = secondsOfClock(clock, timeZone);
        if (seconds !== null) onChange?.(seconds);
      }}
    />
  );
}

export default TimeField;
export const FormTimeField = withHookForm(TimeField);
