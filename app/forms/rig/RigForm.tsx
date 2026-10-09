import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Control, useController } from 'react-hook-form';
import { HelperText } from 'react-native-paper';
import TextInput, { FormTextField } from 'app/components/input/text/TextField';
import DatePicker from 'app/components/input/date_picker';
import ChipSelect from 'app/components/input/chip_select/ChipSelect';
import useRestriction from 'app/hooks/useRestriction';
import { Permission } from 'app/api/schema.d';
import { RigFields } from './useForm';

export interface IRigFormProps {
  control: Control<RigFields>;
  showTypeSelect?: boolean;
}

export default function RigForm(props: IRigFormProps) {
  const { control, showTypeSelect } = props;
  const canCreateRigs = useRestriction(Permission.CreateRig);
  const { field: canopySize, fieldState: canopySizeState } = useController({
    name: 'canopySize',
    control,
  });
  const { field: rigType } = useController({ name: 'rigType', control });
  const { field: repackExpiresAt, fieldState: repackState } = useController({
    name: 'repackExpiresAt',
    control,
  });

  return (
    <View>
      <FormTextField
        {...{ control }}
        style={styles.field}
        name="name"
        label="Name"
        helperText="You can give your equipment a nickname"
      />
      <FormTextField
        {...{ control }}
        style={styles.field}
        name="make"
        label="Make"
        helperText="e.g Javelin, Mirage"
      />
      <FormTextField
        {...{ control }}
        style={styles.field}
        name="model"
        label="Model"
        helperText="e.g G4.1"
      />
      <FormTextField {...{ control }} style={styles.field} name="serial" label="Serial" />

      <TextInput
        style={styles.field}
        label="Current canopy size"
        error={canopySizeState.error?.message}
        value={canopySize.value?.toString() || ''}
        keyboardType="number-pad"
        helperText="Size of canopy in container"
        onChangeText={(newValue) => canopySize.onChange(newValue === '' ? null : Number(newValue))}
      />

      {!showTypeSelect ? null : (
        <ChipSelect<string>
          items={['student', 'sport', 'tandem']}
          renderItemLabel={(item) => item}
          isDisabled={(item) => (!canCreateRigs ? item !== 'sport' : false)}
          value={[rigType.value || 'sport']}
          onChange={([newType]) => rigType.onChange(newType)}
        />
      )}
      <DatePicker
        value={repackExpiresAt.value || new Date().getTime() / 1000}
        onChange={repackExpiresAt.onChange}
        label="Reserve repack expiry date"
      />
      <HelperText type={repackState.error ? 'error' : 'info'}>
        {repackState.error?.message || ''}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 8,
  },
});
