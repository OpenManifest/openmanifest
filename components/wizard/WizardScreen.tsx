import * as React from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";;

export function WizardScreen(props: SafeAreaViewProps) {
  const { width } = Dimensions.get('window');
  const screenWidth = width > 500 ? 500 : width;
  return (
    <View style={StyleSheet.flatten([styles.wizardScreen, { width }, props.style])}>
      <View style={{ width: screenWidth, paddingHorizontal: 48, alignSelf: "center" }}>
        { props.children }
      </View>
    </View>
  )
}



const styles = StyleSheet.create({
  wizardScreen: {
    justifyContent: "center",
  },
});

export default WizardScreen;