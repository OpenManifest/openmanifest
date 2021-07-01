import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Avatar, Card, HelperText, List, Paragraph } from "react-native-paper";
import WizardScreen from "../../../wizard/WizardScreen";
import { actions, useAppDispatch, useAppSelector } from "../../../../redux";
import Slider from '@react-native-community/slider';
import { ceil, debounce } from "lodash";

function WingloadingWizardScreen() {
  const rigForm = useAppSelector(state => state.forms.rig);
  const userForm = useAppSelector(state => state.forms.user);
  const dispatch = useAppDispatch();

  return (
    <WizardScreen style={styles.container}>
      <Text style={styles.title}>Your wingloading</Text>

      <View style={styles.content}>
        <Card>
          <Card.Content style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <View style={styles.wingLoadingCardLeft}>
              <Avatar.Text
                label={
                  ceil(
                    2.205 * Number(userForm.fields.exitWeight.value || 50) /
                    (rigForm.fields.canopySize.value || 150),
                    2
                  ).toString()
                }
                size={100}
                style={styles.wingLoading}
              />
            </View>
            <View style={styles.wingLoadingCardRight}>
              <Card.Title title="Your wingloading" style={{ paddingLeft: 0 }} />
              <Paragraph>Your wingloading is an indicator of your descent rate under canopy</Paragraph>
            </View>
            
          </Card.Content>
        </Card>
        <Card style={styles.card} elevation={3}>
          <View style={styles.cardTitle}>
            <List.Subheader>Your exit weight</List.Subheader>
            <Text style={styles.cardValue}>{(userForm.fields.exitWeight.value || 50)}kg</Text>
          </View>
          <Slider
            style={styles.sliderControl}
            minimumValue={50}
            maximumValue={160}
            step={0.5}
            minimumTrackTintColor="#FF1414"
            maximumTrackTintColor="#000000"
            onValueChange={debounce((value) =>
              dispatch(actions.forms.user.setField(["exitWeight", value.toString()])),
              20
            )}
          />
          <HelperText type={userForm.fields.exitWeight?.error ? "error" : "info" }>
            { userForm.fields.exitWeight?.error || "Your weight in kg's with all equipment on"}
          </HelperText>
        </Card>

        <Card style={styles.card} elevation={3}>
          <View style={styles.cardTitle}>
            <List.Subheader>Canopy size</List.Subheader>
            <Text style={styles.cardValue}>{(rigForm.fields.canopySize.value || 120)}ft</Text>
          </View>
            
          <View style={styles.slider}>
            <Slider
              style={styles.sliderControl}
              minimumValue={34}
              maximumValue={350}
              step={1}
              value={rigForm.fields.canopySize.value || 120}
              minimumTrackTintColor="#FF1414"
              maximumTrackTintColor="#000000"
              onValueChange={debounce((value) =>
                dispatch(actions.forms.rig.setField(["canopySize", value])),
                20
              )}
            />
          </View>
            
          <HelperText type={userForm.fields.exitWeight?.error ? "error" : "info" }>
            {userForm.fields.exitWeight?.error || "Size of your main canopy in square feet"}
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
  card: { padding: 8, marginVertical: 16 },
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
    marginBottom: 50,
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

export default WingloadingWizardScreen;