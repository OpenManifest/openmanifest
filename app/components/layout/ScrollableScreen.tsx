import * as React from 'react';
import { ScrollView, StyleSheet, ScrollViewProps } from 'react-native';
import { useAppTheme } from 'app/theme';

interface IScrollableScreen extends ScrollViewProps {
  children: React.ReactNode;
  /** Leaves room below the content for a floating action button */
  hasFab?: boolean;
}
/** Room for a FAB (56) and its margins */
const FAB_CLEARANCE = 96;

export default React.forwardRef<ScrollView, IScrollableScreen>((props, ref) => {
  const { theme } = useAppTheme();
  const { style, children, contentContainerStyle, hasFab = false, ...rest } = props;

  return (
    <ScrollView
      {...rest}
      ref={ref}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="always"
      style={[styles.container, { backgroundColor: theme.colors.surface }, style]}
      contentContainerStyle={[
        styles.content,
        { backgroundColor: theme.colors.background, paddingBottom: hasFab ? FAB_CLEARANCE : 50 },
        contentContainerStyle,
      ]}
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
    flexGrow: 1,
  },
});
