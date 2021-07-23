import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Card, HelperText, List, Title } from "react-native-paper";
import DatePicker from "../../../input/date_picker/DatePicker";
import WizardScreen, { IWizardScreenProps } from "../../../wizard/WizardScreen";
import { actions, useAppDispatch, useAppSelector } from "../../../../state";


function ReserveRepackWizardScreen(props: IWizardScreenProps) {
  const state = useAppSelector(state => state.forms.rig);
  const dispatch = useAppDispatch();

  return (
    <WizardScreen style={styles.container} {...props} title="Next reserve repack?">
      <View style={styles.content}>
        <Card style={styles.card}>
          <List.Subheader>Due date</List.Subheader>
          <DatePicker
            timestamp={state.fields.repackExpiresAt.value || new Date().getTime() / 1000}
            onChange={(time) => dispatch(actions.forms.rig.setField(["repackExpiresAt", time]))}
          />
          <HelperText type={!!state.fields.repackExpiresAt.error ? "error" : "info"}>
            { state.fields.repackExpiresAt.error || "" }
          </HelperText>
        </Card>
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
  title: { color: "white", fontSize: 24, fontWeight: "bold", marginBottom: 80, textAlign: "center" }
});

export default ReserveRepackWizardScreen;