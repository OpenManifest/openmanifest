import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Card, HelperText, List, Surface, Title, TouchableRipple } from "react-native-paper";
import WizardScreen from "../../../wizard/WizardScreen";
import { actions, useAppDispatch, useAppSelector } from "../../../../redux";
import { PhonePreview, WebPreview } from "../../../theme_preview";
import ColorPicker from "../../../input/colorpicker";

function ReserveRepackWizardScreen() {
  const state = useAppSelector(state => state.forms.dropzone);
  const dispatch = useAppDispatch();

  return (
    <WizardScreen style={styles.container}>
      <Title style={styles.title}>Branding</Title>

      <View style={styles.content}>

        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-evenly" }}>
          <PhonePreview
            primaryColor={state.fields.primaryColor.value}
            secondaryColor={state.fields.secondaryColor.value}
          />

          <WebPreview
            primaryColor={state.fields.primaryColor.value}
            secondaryColor={state.fields.secondaryColor.value}
          />
        </View>
          
        <ColorPicker
          title="Primary color"
          helperText="Primary color is used for elements like the title bar and the tab bar"
          error={state.fields.primaryColor.error}
          onChange={(color) => dispatch(actions.forms.dropzone.setField(["primaryColor", color]))}
          value={state.fields.primaryColor.value}
        />

        <ColorPicker
          title="Accent color"
          helperText="Accent color is used for highlights, like buttons and loading bars"
          error={state.fields.secondaryColor.error}
          onChange={(color) => dispatch(actions.forms.dropzone.setField(["secondaryColor", color]))}
          value={state.fields.secondaryColor.value}
        />
      </View>
    </WizardScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 48,
    alignItems: "center",
  },
  field: {
    marginBottom: 8,
  },
  content: {
    width: "100%",
    justifyContent: "space-around",
    flexDirection: "column",
  },
  card: { padding: 8, marginVertical: 16 },
  title: { color: "white", fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" },

  colorBox: {
    height: 25,
    width: 25,
    margin: 5,
  }
});

export default ReserveRepackWizardScreen;