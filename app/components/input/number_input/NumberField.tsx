import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import TextInput from 'app/components/input/text/TextField';
import { TextInput as T, useTheme } from 'react-native-paper';

export enum NumberFieldType {
  Cash = 'cash',
  Weight = 'weight',
  CanopySize = 'canopySize',
}
interface INumberFieldProps {
  error?: string | null;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  value?: number | null;
  mode?: 'outlined' | 'flat';
  variant?: NumberFieldType | null;
  onChange(newValue: number): void;
}
export default function NumberField(props: INumberFieldProps) {
  const { onChange: onChangeValue, mode, disabled, ...rest } = props;
  const { value } = rest;
  const theme = useTheme();

  const onChange = React.useCallback(
    (text: string) => {
      if (/\d/.test(text)) {
        const [numbers] = text.match(/^\-?\d+/) || ['0'];
        onChangeValue(Number(numbers));
      }
    },
    [onChangeValue]
  );

  const onIncrement = React.useCallback(() => {
    onChangeValue?.((value || 0) + 1);
  }, [onChangeValue, value]);

  const onDecrement = React.useCallback(() => {
    onChangeValue?.((value || 0) - 1);
  }, [onChangeValue, value]);

  const themeStyle = React.useMemo(
    () => ({ borderColor: theme.colors.text, backgroundColor: theme.colors.surface }),
    [theme.colors.surface, theme.colors.text]
  );
  return (
    <TextInput
      {...rest}
      {...{ onChange, mode, disabled }}
      value={`${value || 0}`}
      keyboardType="number-pad"
      style={{ backgroundColor: theme.colors.surface }}
      right={
        <T.Affix
          textStyle={{
            height: '100%',
          }}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Elements are allowed here, but types specify string
          text={
            <View style={styles.chevrons}>
              <TouchableOpacity style={[styles.affixTopChevron, themeStyle]} onPress={onIncrement}>
                <MaterialCommunityIcons name="chevron-up" size={12} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.affixBottomChevron, { backgroundColor: theme.colors.surface }]}
                onPress={onDecrement}
              >
                <MaterialCommunityIcons name="chevron-down" size={12} />
              </TouchableOpacity>
            </View>
          }
        />
      }
      caretHidden={false}
    />
  );
}

const styles = StyleSheet.create({
  affixBottomChevron: {
    width: 24,
    height: 54 / 2,
    alignItems: 'center',
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  affixTopChevron: {
    width: 24,
    height: 54 / 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  chevrons: {
    width: 24,
    height: 59,
    paddingTop: 4,
    marginRight: -10,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
});
