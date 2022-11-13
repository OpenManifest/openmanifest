import * as React from 'react';
import { Permission } from 'app/api/schema.d';
import { View } from 'react-native';
import { FormTextField } from 'app/components/input/text/TextField';
import { Divider } from 'react-native-paper';
import { Control } from 'react-hook-form';
import {
  DropzoneUserChipSelectField,
  PlaneChipSelectField,
} from 'app/components/input/chip_select';
import { FormNumberField } from 'app/components/input/number_input';
import { LoadFields } from './useForm';

interface ILoadFormProps {
  control: Control<LoadFields>;
}
export default function LoadForm(props: ILoadFormProps) {
  const { control } = props;

  return (
    <>
      <FormTextField name="name" label="Name" {...{ control }} placeholder="Optional" />

      <FormNumberField label="Max Slots" {...{ control }} name="maxSlots" />
      <View style={{ width: '100%' }}>
        <PlaneChipSelectField {...{ control }} name="plane" />

        <DropzoneUserChipSelectField
          label="GCA"
          {...{ control }}
          name="gca"
          requiredPermissions={[Permission.ActAsGca]}
        />

        <DropzoneUserChipSelectField
          label="Pilot"
          name="pilot"
          {...{ control }}
          requiredPermissions={[Permission.ActAsPilot]}
        />
        <Divider style={{ marginVertical: 8 }} />
      </View>
    </>
  );
}
