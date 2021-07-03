import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card, HelperText, List, TextInput } from "react-native-paper";
import WizardScreen, { IWizardScreenProps } from "../../../wizard/WizardScreen";
import { actions, useAppDispatch, useAppSelector } from "../../../../redux";
import Slider from '@react-native-community/slider';

function AircraftWizardScreen(props: IWizardScreenProps) {
  const state = useAppSelector(state => state.forms.plane);
  const [minSlots, setMinSlots] = React.useState(state?.fields?.minSlots?.value || 0);
  const [maxSlots, setMaxSlots] = React.useState(state?.fields?.maxSlots?.value || 0);
  const dispatch = useAppDispatch();

  return (
    <WizardScreen style={styles.container} {...props} title="Aircraft">

      <View style={styles.content}>
      <Card style={styles.card}>
        <List.Subheader>Information</List.Subheader>
        <TextInput
          style={styles.field}
          mode="outlined"
          label="Name"
          error={!!state.fields.name.error}
          value={state.fields.name.value}
          onChangeText={(newValue) => dispatch(actions.forms.plane.setField(["name", newValue]))}
        />
        <HelperText type={!!state.fields.name.error ? "error" : "info"}>
          { state.fields.name.error || "" }
        </HelperText>
      
        <TextInput
          style={styles.field}
          mode="outlined"
          label="Registration"
          error={!!state.fields.registration.error}
          value={state.fields.registration.value}
          onChangeText={(newValue) => dispatch(actions.forms.plane.setField(["registration", newValue]))}
        />
        <HelperText type={!!state.fields.registration.error ? "error" : "info"}>
          { state.fields.registration.error || "" }
        </HelperText>
      </Card>

      <Card style={styles.card} elevation={3}>
          <View style={styles.cardTitle}>
            <List.Subheader>Minimum slots</List.Subheader>
            <Text style={styles.cardValue}>{(minSlots || 0)}</Text>
          </View>
            
          <View style={styles.slider}>
            <Slider
              style={styles.sliderControl}
              minimumValue={0}
              maximumValue={maxSlots || 34}
              step={1}
              value={minSlots}
              minimumTrackTintColor="#FF1414"
              maximumTrackTintColor="#000000"
              onValueChange={(value) => setMinSlots(value)}
              onSlidingComplete={() => dispatch(actions.forms.plane.setField(["minSlots", minSlots]))}
            />
          </View>
            
          <HelperText type={state.fields.minSlots?.error ? "error" : "info" }>
            {state.fields.minSlots?.error || "How many slots are required to be filled to dispatch a load with this aircraft"}
          </HelperText>
        </Card>

        <Card style={styles.card} elevation={3}>
          <View style={styles.cardTitle}>
            <List.Subheader>Max slots</List.Subheader>
            <Text style={styles.cardValue}>{(maxSlots || 34)}</Text>
          </View>
            
          <View style={styles.slider}>
            <Slider
              style={styles.sliderControl}
              minimumValue={2}
              maximumValue={34}
              step={1}
              minimumTrackTintColor="#FF1414"
              maximumTrackTintColor="#000000"
              value={maxSlots}
              onValueChange={(value) => setMaxSlots(value)}
              onSlidingComplete={() => dispatch(actions.forms.plane.setField(["maxSlots", Number(maxSlots)]))}
            />
          </View>
            
          <HelperText type={state.fields.maxSlots?.error ? "error" : "info" }>
            {state.fields.maxSlots?.error || "Max available slots on this aircraft"}
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
  content: {
    width: "100%",
    justifyContent: "space-around",
    flexDirection: "column",
  },
  card: { padding: 8, marginVertical: 4 },
  cardTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardValue: {
    fontWeight: "bold",
    marginRight: 8,
    fontSize: 16,
    alignSelf: "center",
  },
  title: {
    color: "white",
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 25,
    textAlign: "center",
    
  },
  field: {
    marginBottom: 8,
  },
  slider: {
    flexDirection: "column",
  },
  sliderControl: { width: "100%", height: 40 },
  wingLoading: {
    alignSelf: "center",
  },
  wingLoadingCardLeft: {
    width: "30%",
  },
  wingLoadingCardRight: {
    paddingLeft: 16,
    width: "70%",
  },
});

export default AircraftWizardScreen;