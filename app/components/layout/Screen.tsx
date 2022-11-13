import * as React from 'react';
import { ScrollView, StyleSheet, ScrollViewProps, useWindowDimensions } from 'react-native';
import { useAppSelector } from '../../state';

interface IScrollableScreen extends ScrollViewProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}
export default React.forwardRef<ScrollView, IScrollableScreen>((props, ref) => {
  const { height, width } = useWindowDimensions();
  const { theme } = useAppSelector((root) => root.global);
  const { style, children, fullWidth = false, contentContainerStyle, ...rest } = props;

  return (
    <ScrollView
      {...rest}
      ref={ref}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="always"
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: theme.colors.background, height: height - 56 * 2 },
        style,
      ])}
      contentContainerStyle={StyleSheet.flatten(
        [
          styles.content,
          fullWidth ? undefined : { width: width < 920 ? '100%' : 920 },
          contentContainerStyle,
        ].filter(Boolean)
      )}
    >
      {children}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
    alignSelf: 'center',
    flexGrow: 1,
    paddingBottom: 50,
  },
  centerAlignedContent: {
    maxWidth: 920,
  },
});
