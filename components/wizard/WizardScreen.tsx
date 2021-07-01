import * as React from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";;

export function WizardScreen(props: SafeAreaViewProps) {
  return (
    <View style={StyleSheet.flatten([styles.wizardScreen, props.style])}>
      { props.children }
    </View>
  )
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  wizardScreen: {
    width,
    justifyContent: "center",
  },
});

export default WizardScreen;