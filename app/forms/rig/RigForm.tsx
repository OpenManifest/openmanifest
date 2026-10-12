import * as React from 'react';
import { View } from 'react-native';
import { Control, useController } from 'react-hook-form';

import TextInput, { FormTextField } from 'app/components/input/text/TextField';
import DatePicker from 'app/components/input/date_picker';
import ChipSelect from 'app/components/input/chip_select/ChipSelect';
import useRestriction from 'app/hooks/useRestriction';
import { Permission } from 'app/api/schema.d';
import { RigFields } from './useForm';
import { useTranslation } from 'react-i18next';
import { FieldError, Stack } from 'app/ui';

export interface IRigFormProps {
  control: Control<RigFields>;
  showTypeSelect?: boolean;
}

export default function RigForm(props: IRigFormProps) {
  const { t } = useTranslation('common');
  const { control, showTypeSelect } = props;
  const canCreateEquipments = useRestriction(Permission.CreateEquipment);
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
    <Stack gap="md">
      <FormTextField
        {...{ control }}
        name="name"
        label={t('forms.fields.name')}
        helperText={t('forms.rig.youCanGiveYourEquipment')}
      />
      <FormTextField
        {...{ control }}
        name="make"
        label={t('forms.rig.make')}
        helperText={t('forms.rig.eGJavelinMirage')}
      />
      <FormTextField
        {...{ control }}
        name="model"
        label={t('forms.fields.model')}
        helperText={t('forms.rig.eGG41')}
      />
      <FormTextField {...{ control }} name="serial" label={t('forms.rig.serial')} />

      <TextInput
        label={t('forms.rig.currentCanopySize')}
        error={canopySizeState.error?.message}
        value={canopySize.value?.toString() || ''}
        keyboardType="number-pad"
        helperText={t('forms.rig.sizeOfCanopyInContainer')}
        onChangeText={(newValue) => canopySize.onChange(newValue === '' ? null : Number(newValue))}
      />

      {!showTypeSelect ? null : (
        <ChipSelect<string>
          items={['student', 'sport', 'tandem']}
          renderItemLabel={(item) => item}
          isDisabled={(item) => (!canCreateEquipments ? item !== 'sport' : false)}
          value={[rigType.value || 'sport']}
          onChange={([newType]) => rigType.onChange(newType)}
        />
      )}
      <DatePicker
        value={repackExpiresAt.value || new Date().getTime() / 1000}
        onChange={repackExpiresAt.onChange}
        label={t('forms.rig.reserveRepackExpiryDate')}
      />
      <FieldError>{repackState.error?.message || ''}</FieldError>
    </Stack>
  );
}
