import NumberField from 'app/components/input/number_input/NumberField';
import * as React from 'react';
import { View } from 'react-native';
import { Checkbox, HelperText, List } from 'react-native-paper';
import { Permission } from '../../../api/schema.d';
import useRestriction from '../../../hooks/useRestriction';
import DatePicker from '../../input/date_picker/DatePicker';
import TextInput from '../../input/text/TextField';
import { FieldItem } from './slice';

interface IFormItemItem {
  value: string | number | boolean;
  onChange(value: FieldItem): void;
  config: FieldItem;
}

export default function RigInspectionItem(props: IFormItemItem) {
  const canInspect = useRestriction(Permission.ActAsRigInspector);
  const { value, onChange, config } = props;

  if (config?.valueType && config?.valueType === 'string') {
    return (
      <View style={{ flex: 1 }}>
        <TextInput
          disabled={!canInspect}
          style={{ marginVertical: 8 }}
          value={value as string}
          onChange={(text) => onChange({ ...config, value: text })}
          label={config.label || ''}
        />
        <HelperText type="info">{config.description || 'No description'}</HelperText>
      </View>
    );
  }
  if (config?.valueType && config?.valueType === 'boolean') {
    return (
      <List.Item
        title={config.label || ''}
        disabled={!canInspect}
        description={config.description}
        style={{ marginVertical: 8 }}
        right={() => <Checkbox.Android status={value ? 'checked' : 'unchecked'} />}
        onPress={() => onChange({ ...config, value: !value as boolean })}
      />
    );
  }
  if (config?.valueType && config?.valueType === 'integer') {
    return (
      <View style={{ flex: 1 }}>
        <NumberField
          disabled={!canInspect}
          value={value as number}
          mode="outlined"
          helperText={config.description || 'No description'}
          onChange={(text) => onChange({ ...config, value: text as number })}
          label={config.label || ''}
        />
      </View>
    );
  }
  if (config?.valueType && config?.valueType === 'date') {
    return (
      <View style={{ flex: 1 }}>
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
        <HelperText type="info">{config.description || 'No description'}</HelperText>
      </View>
    );
  }

  return null;
}
