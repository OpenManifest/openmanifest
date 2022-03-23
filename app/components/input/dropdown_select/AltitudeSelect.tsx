import * as React from 'react';
import Select from '../select/Select';

interface IAltitudeSelectProps {
  value: number;
  onChange(value: number): void;
}
export default function AltitudeSelect(props: IAltitudeSelectProps) {
  const { value, onChange } = props;

  return (
    <Select
      {...{ value, onChange }}
      options={[
        { label: 'Hop n Pop', value: 4000, icon: 'parachute' },
        { label: 'Height', value: 14000, icon: 'airplane-takeoff' },
        { label: 'Other', value: -1, icon: 'parachute' },
      ]}
    />
  );
}
