import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Card, List } from 'react-native-paper';
import TextInput from 'app/components/input/text/TextField';
import { Step, Fields, IWizardStepProps } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import NumberField from 'app/components/input/number_input/NumberField';

function AircraftWizardScreen(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.plane);
  const dispatch = useAppDispatch();

  return (
    <Step {...props} title="Aircraft">
      <Fields>
        <List.Subheader>Information</List.Subheader>
        <TextInput
          style={styles.field}
          mode="flat"
          label="Name"
          error={state.fields.name.error}
          value={state.fields.name.value || ''}
          onChangeText={(newValue) => dispatch(actions.forms.plane.setField(['name', newValue]))}
        />

        <TextInput
          style={styles.field}
          mode="flat"
          label="Registration"
          error={state.fields.registration.error}
          value={state.fields.registration.value || ''}
          onChangeText={(newValue) =>
            dispatch(actions.forms.plane.setField(['registration', newValue]))
          }
        />

        <Card style={styles.card} elevation={3}>
          <NumberField
            mode="flat"
            onChange={(slots) => dispatch(actions.forms.plane.setField(['maxSlots', slots]))}
            label="Max slots"
            helperText="Max available slots on this aircraft"
            value={state.fields.maxSlots.value}
            error={state.fields.maxSlots.error}
          />
        </Card>
      </Fields>
    </Step>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    justifyContent: 'space-around',
    flexDirection: 'column',
  },
  card: { padding: 8, marginVertical: 4 },
  cardTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardValue: {
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
    alignSelf: 'center',
  },
  title: {
    color: 'white',
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 25,
    textAlign: 'center',
  },
  field: {
    marginBottom: 8,
  },
  slider: {
    flexDirection: 'column',
  },
  sliderControl: { width: '100%', height: 40 },
  wingLoading: {
    alignSelf: 'center',
  },
  wingLoadingCardLeft: {
    width: '30%',
  },
  wingLoadingCardRight: {
    paddingLeft: 16,
    width: '70%',
  },
});

export default AircraftWizardScreen;
