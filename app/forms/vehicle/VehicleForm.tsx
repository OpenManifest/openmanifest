import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Control } from 'react-hook-form';
import { FormNumberField } from 'app/components/input/number_input';
import { VehicleFields } from './useForm';

export interface IVehicleFormProps {
  control: Control<VehicleFields>;
}
export default function VehicleForm(props: IVehicleFormProps) {
  const { control } = props;
  return (
    <>
      <FormTextField {...{ control }} name="name" mode="outlined" label="Name" />

      <FormTextField {...{ control }} name="registration" label="Registration" />
      <FormNumberField {...{ control }} name="minCapacity" label="Min slots" />

      <FormNumberField
        {...{ control }}
        name="capacity"
        label="Max slots"
        helperText="Maximum amount of jumpers who can be manifested on one load"
      />
    </>
  );
}
