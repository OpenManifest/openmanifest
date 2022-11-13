import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Control } from 'react-hook-form';
import { FormNumberField } from 'app/components/input/number_input';
import { AircraftFields } from './useForm';

export interface IAircraftFormProps {
  control: Control<AircraftFields>;
}
export default function AircraftForm(props: IAircraftFormProps) {
  const { control } = props;
  return (
    <>
      <FormTextField {...{ control }} name="name" mode="outlined" label="Name" />

      <FormTextField {...{ control }} name="registration" label="Registration" />
      <FormNumberField {...{ control }} name="minSlots" label="Min slots" />

      <FormNumberField
        {...{ control }}
        name="maxSlots"
        label="Max slots"
        helperText="Maximum amount of jumpers who can be manifested on one load"
      />
    </>
  );
}
