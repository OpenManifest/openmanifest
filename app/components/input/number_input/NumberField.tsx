import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { TextInput, useTheme } from 'react-native-paper';

interface INumberFieldProps {
  error?: boolean;
  label?: string;
  value?: number | null;
  onChangeText(newValue: number): void;
}
export default function NumberField(props: INumberFieldProps) {
  const { onChangeText: onChangeValue, ...rest } = props;
  const { value } = rest;
  const theme = useTheme();

  const onChangeText = React.useCallback(
    (text: string) => {
      if (/\d/.test(text)) {
        const [numbers] = text.match(/^\-?\d+/) || ['0'];
        onChangeValue(Number(numbers));
      }
    },
    [onChangeValue]
  );
  return (
    <TextInput
      {...rest}
      {...{ onChangeText }}
      value={`${value || 0}`}
      mode="outlined"
      keyboardType="number-pad"
      right={
        <TextInput.Affix
          textStyle={{
            height: '100%',
          }}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          text={
            <View style={styles.chevrons}>
              <TouchableOpacity
                style={[
                  styles.affixTopChevron,
                  { borderColor: theme.colors.text, backgroundColor: theme.colors.surface },
                ]}
                onPress={() => onChangeValue?.((value || 0) + 1)}
              >
                <MaterialCommunityIcons name="chevron-up" size={24} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.affixBottomChevron, { backgroundColor: theme.colors.surface }]}
                onPress={() => onChangeValue?.((value || 0) - 1)}
              >
                <MaterialCommunityIcons name="chevron-down" size={24} />
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
    width: 48,
    height: 54 / 2,
    alignItems: 'center',
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  affixTopChevron: {
    width: 48,
    height: 54 / 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  chevrons: {
    width: 48,
    height: 59,
    paddingTop: 4,
    marginRight: -10,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
});
