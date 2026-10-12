import NumberField from 'app/components/input/number_input/NumberField';
import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import DatePicker from 'app/components/input/date_picker/DatePicker';
import TextInput from 'app/components/input/text/TextField';
import { FieldItem } from './fieldItem';
import { Stack, Switch, Text } from 'app/ui';

interface IFormItemItem {
  value: string | number | boolean;
  onChange(value: FieldItem): void;
  config: FieldItem;
}

export default function RigInspectionItem(props: IFormItemItem) {
  const { t } = useTranslation('common');
  const canInspect = useRestriction(Permission.ActAsEquipmentInspector);
  const { value, onChange, config } = props;

  if (config?.valueType && config?.valueType === 'string') {
    return (
      <Stack gap="xs" flex>
        <TextInput
          disabled={!canInspect}
          value={value as string}
          onChange={(text) => onChange({ ...config, value: text })}
          label={config.label || ''}
        />
        <Text variant="caption" tone="muted">
          {config.description || t('forms.rig_inspection_template.noDescription')}
        </Text>
      </Stack>
    );
  }
  if (config?.valueType && config?.valueType === 'boolean') {
    return (
      <Switch
        label={config.label || ''}
        disabled={!canInspect}
        helperText={config.description}
        value={!!value}
        onChange={(checked) => onChange({ ...config, value: checked })}
      />
    );
  }
  if (config?.valueType && config?.valueType === 'integer') {
    return (
      <Stack gap="xs" flex>
        <NumberField
          disabled={!canInspect}
          value={value as number}
          helperText={config.description || t('forms.rig_inspection_template.noDescription')}
          onChange={(text) => onChange({ ...config, value: text as number })}
          label={config.label || ''}
        />
      </Stack>
    );
  }
  if (config?.valueType && config?.valueType === 'date') {
    return (
      <Stack gap="xs" flex>
        <DatePicker
          disabled={!canInspect}
          value={Number(value)}
          onChange={(time) =>
            onChange({
              ...config,
              value: time.toString() as string,
            })
          }
          label={config.label || ''}
        />
        <Text variant="caption" tone="muted">
          {config.description || t('forms.rig_inspection_template.noDescription')}
        </Text>
      </Stack>
    );
  }

  return null;
}
