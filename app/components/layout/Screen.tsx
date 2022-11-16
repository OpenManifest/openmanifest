import * as React from 'react';
import { ScrollView, StyleSheet, ScrollViewProps, useWindowDimensions, View } from 'react-native';
import { useAppSelector } from '../../state';

interface IScrollableScreen extends ScrollViewProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  scrollable?: boolean;
}
export default React.forwardRef<ScrollView, IScrollableScreen>((props, ref) => {
  const { height, width } = useWindowDimensions();
  const { theme } = useAppSelector((root) => root.global);
  const {
    style,
    children,
    fullWidth = false,
    scrollable = true,
    contentContainerStyle,
    ...rest
  } = props;

  if (!scrollable) {
    return <View style={{ flex: 1, width: '100%' }}>{children}</View>;
  }
  return (
    <ScrollView
      {...rest}
      ref={ref}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="always"
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: theme.colors.background },
        style,
      ])}
      contentContainerStyle={StyleSheet.flatten(
        [
          styles.content,
          fullWidth
            ? { paddingHorizontal: 0 }
            : { width: width < 920 ? '100%' : 920, paddingHorizontal: 16 },
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
    alignItems: 'flex-start',
    alignSelf: 'center',
    flexGrow: 1,
    paddingBottom: 50,
  },
  centerAlignedContent: {
    maxWidth: 920,
  },
});
