import * as React from "react";
import { Dimensions, ScrollView, StyleSheet, ScrollViewProps, useWindowDimensions } from "react-native";
import { useAppSelector } from "../../redux";


interface IScrollableScreen extends ScrollViewProps {
  children: React.ReactNode;
}
export default function ScrollableScreen(props: IScrollableScreen) {

  const { height } = useWindowDimensions();
  const { theme } = useAppSelector(state => state.global);
  const { style, children, contentContainerStyle, ...rest } = props;


  return (
    <ScrollView
      {...rest}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="always"
      style={[styles.container, { backgroundColor: theme.colors.surface, height: height - (56 * 2) }, style]}
      contentContainerStyle={[styles.content, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: { 
    paddingHorizontal: 16, 
    alignItems: "flex-start", 
    flexGrow: 1,
    paddingBottom: 50
  }
})