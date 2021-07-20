import * as React from "react";
import { StyleSheet, View, Text, KeyboardAvoidingView } from "react-native";
import WizardScreen, { IWizardScreenProps } from "../../../../components/wizard/WizardScreen";
import { actions, useAppDispatch, useAppSelector } from "../../../../redux";
import { set } from "lodash";
import WindRow from "../WindRow";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { Divider } from "react-native-paper";

function WindsWizardScreen(props: IWizardScreenProps) {
  const state = useAppSelector(state => state.forms.weather);
  const dispatch = useAppDispatch();
  const { value: winds } = state.fields.winds;

  return (
    <WizardScreen style={styles.container} {...props} title="Atmospheric winds">
      <KeyboardAvoidingView behavior="position" style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.headerAltitude}>Altitude</Text>
          <Text style={styles.headerSpeed}>Speed</Text>
          <Text style={styles.headerDirection}>Direction</Text>
        </View>
        <Divider />
        <FlatList
          data={winds}
          keyExtractor={({ item }, index) => `wind.${index}`}
          renderItem={({ item: wind, index }) => {
            return (
              <WindRow
                {...wind}
                key={`wind-input-${index}`}
                onChange={(field, value) => {
                  const newWinds = set([...winds], index, { ...wind, [field]: value });
                  dispatch(
                    actions.forms.weather.setField([
                      "winds",
                      newWinds
                    ])
                  );
                }}
              />
            );
          }}
        />
        {
          winds?.length < 5 ? (
            <TouchableOpacity
              onPress={() =>
                dispatch(
                  actions.forms.weather.setField([
                    "winds",
                    [
                      ...(winds || []),
                      { altitude: "0", direction: "0", speed: "0" }
                    ]
                  ])
              )}
            >
              <View style={{ width: "100%", opacity: 0.5 }} pointerEvents="box-only">
                <WindRow
                  altitude="Add"
                  direction="0"
                  speed="0"
                  onChange={() => null}
                />
              </View>
            </TouchableOpacity>
          ) : null
        }
      </KeyboardAvoidingView>
    </WizardScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    alignItems: "center",
    paddingLeft: 0,
    paddingRight: 0,
  },
  content: {
    width: "100%",
    flexDirection: "column",
  },
  row: {
    width: 360,
    alignSelf: "center",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    marginVertical: 16,
  },
  headerAltitude: {
    width: 120,
    
    color: 'white',
    textAlign: "center",
    fontWeight: "bold"
  },
  headerSpeed: {
    width: 120,
    
    color: 'white',
    textAlign: "center",
    fontWeight: "bold"
  },
  headerDirection: {
    width: 120,
    
    color: 'white',
    textAlign: "center",
    fontWeight: "bold"
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

export default WindsWizardScreen;