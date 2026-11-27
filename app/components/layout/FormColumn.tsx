import * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import type { KeyboardAwareScrollViewProps } from 'react-native-keyboard-controller';
import { useTheme } from 'app/ui';

export const FORM_COLUMN_MAX_WIDTH = 560;
/** For dashboards and tables, which need more room than a form */
export const FORM_COLUMN_WIDE_MAX_WIDTH = 920;

export interface IFormColumnProps extends Omit<
  KeyboardAwareScrollViewProps,
  'contentContainerStyle'
> {
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** The widest the column gets before it is centred (default 560, `FORM_COLUMN_WIDE_MAX_WIDTH` for dashboards) */
  maxWidth?: number;
  /** Leaves room below the content for a floating action button */
  hasFab?: boolean;
}

/** Scrolling, keyboard-aware column for forms and lists: full width up to 560 and centred on wide screens */
const FormColumn = React.forwardRef<
  React.ElementRef<typeof KeyboardAwareScrollView>,
  IFormColumnProps
>((props, ref) => {
  const {
    children,
    contentContainerStyle,
    style,
    maxWidth = FORM_COLUMN_MAX_WIDTH,
    hasFab = false,
    ...rest
  } = props;
  const { space } = useTheme();

  return (
    <KeyboardAwareScrollView
      bottomOffset={space.lg}
      keyboardShouldPersistTaps="handled"
      {...rest}
      ref={ref}
      style={[{ flex: 1 }, style]}
      contentContainerStyle={[
        {
          flexGrow: 1,
          width: '100%',
          maxWidth,
          alignSelf: 'center',
          paddingHorizontal: space.lg,
          paddingBottom: hasFab ? space.xxxl * 2 : space.xxxl,
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </KeyboardAwareScrollView>
  );
});

FormColumn.displayName = 'FormColumn';

export default FormColumn;
