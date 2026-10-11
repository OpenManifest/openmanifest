import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const FLOATING_ACTION_MARGIN = 16;

export interface IFloatingActionAreaProps {
  children?: React.ReactNode;
  testID?: string;
}

/**
 * Bottom-right area for FABs. Render it next to the screen's scroll container, never inside it: it stays above the
 * gesture bar and rises with the keyboard.
 */
export default function FloatingActionArea(props: IFloatingActionAreaProps) {
  const { children, testID } = props;
  const insets = useSafeAreaInsets();
  // Inside a tab navigator the screen ends above the tab bar, which already covers the bottom inset
  const bottomInset = React.useContext(BottomTabBarHeightContext) === undefined ? insets.bottom : 0;

  return (
    <View
      testID={testID}
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          paddingBottom: bottomInset + FLOATING_ACTION_MARGIN,
          paddingRight: insets.right + FLOATING_ACTION_MARGIN,
        },
      ]}
    >
      {/* The keyboard height includes the bottom inset, which the padding above already accounts for */}
      <KeyboardStickyView offset={{ closed: 0, opened: bottomInset }}>
        {children}
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    alignItems: 'flex-end',
  },
});
