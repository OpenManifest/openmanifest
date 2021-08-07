import * as React from 'react';
import { ScrollView, StyleSheet, ScrollViewProps, useWindowDimensions } from 'react-native';
import { useAppSelector } from '../../state';

interface IScrollableScreen extends ScrollViewProps {
  children: React.ReactNode;
}
export default React.forwardRef<ScrollView, IScrollableScreen>((props, ref) => {
  const { height } = useWindowDimensions();
  const { theme } = useAppSelector((root) => root.global);
  const { style, children, contentContainerStyle, ...rest } = props;

  return (
    <ScrollView
      {...rest}
      ref={ref}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="always"
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface, height: height - 56 * 2 },
        style,
      ]}
      contentContainerStyle={[
        styles.content,
        { backgroundColor: theme.colors.background },
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
    paddingBottom: 50,
  },
});
