import * as React from 'react';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

interface IAltitudeSelectProps {
  value: number;
  onChange(value: number): void;
}
function AltitudeSelect(props: IAltitudeSelectProps) {
  const { value, onChange } = props;

  return (
    <Select
      label="Altitude"
      {...{ value, onChange }}
      options={[
        { label: 'Hop n Pop', value: 4000, icon: 'parachute' },
        { label: 'Height', value: 14000, icon: 'airplane-takeoff' },
        { label: 'Other', value: -1, icon: 'parachute' },
      ]}
    />
  );
}

export const AltitudeSelectField = withHookForm(AltitudeSelect);

export default AltitudeSelect;
