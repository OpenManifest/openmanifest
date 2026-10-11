import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import type { StyleProp, ViewStyle } from 'react-native';
import { useAppTheme } from 'app/theme';

export interface IScreenContainerProps {
  children?: React.ReactNode;
  /**
   * Edges to pad with the safe area. Defaults to top and bottom for screens without a navigator header; pass
   * `['bottom']` for screens under one.
   */
  edges?: readonly Edge[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const DEFAULT_EDGES: readonly Edge[] = ['top', 'bottom'];

/** Root of a screen: fills the space, uses the theme background and keeps content out of the system bars */
export default function ScreenContainer(props: IScreenContainerProps) {
  const { children, edges = DEFAULT_EDGES, style, testID } = props;
  const { theme } = useAppTheme();

  return (
    <SafeAreaView
      testID={testID}
      edges={edges}
      style={[styles.container, { backgroundColor: theme.colors.background }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
