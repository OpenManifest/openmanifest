import * as React from 'react';
import { StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import type { KeyboardAwareScrollViewProps } from 'react-native-keyboard-controller';

export const FORM_COLUMN_MAX_WIDTH = 560;

export interface IFormColumnProps extends Omit<
  KeyboardAwareScrollViewProps,
  'contentContainerStyle'
> {
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/** Scrolling, keyboard-aware column for forms: full width up to 560 and centred on wide screens */
const FormColumn = React.forwardRef<
  React.ElementRef<typeof KeyboardAwareScrollView>,
  IFormColumnProps
>((props, ref) => {
  const { children, contentContainerStyle, style, ...rest } = props;

  return (
    <KeyboardAwareScrollView
      bottomOffset={16}
      keyboardShouldPersistTaps="handled"
      {...rest}
      ref={ref}
      style={[styles.scroll, style]}
      contentContainerStyle={[styles.content, contentContainerStyle]}
    >
      {children}
    </KeyboardAwareScrollView>
  );
});

FormColumn.displayName = 'FormColumn';

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: FORM_COLUMN_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
});

export default FormColumn;
