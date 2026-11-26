import * as React from 'react';
import type { DateFieldProps } from './DateField';
import BrowserInput from './browserInput.web';
import { isoDateOf, secondsOfIsoDate } from './dateTime';
import { withHookForm } from './withHookForm';

export type { DateFieldProps } from './DateField';

/** A date on the web: the browser's date input (the native one is `DateField.tsx`) */
function DateField({ value, onChange, ...rest }: DateFieldProps) {
  return (
    <BrowserInput
      {...rest}
      type="date"
      value={isoDateOf(value) ?? ''}
      onChange={(iso) => {
        const seconds = secondsOfIsoDate(iso);
        if (seconds !== null) onChange?.(seconds);
      }}
    />
  );
}

export default DateField;
export const FormDateField = withHookForm(DateField);
