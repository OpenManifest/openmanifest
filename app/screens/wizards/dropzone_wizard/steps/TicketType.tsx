import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Paragraph } from 'react-native-paper';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import AltitudeSelect from 'app/components/input/dropdown_select/AltitudeSelect';
import TextInput from 'app/components/input/text/TextField';
import NumberField, { NumberFieldType } from 'app/components/input/number_input/NumberField';

function TicketTypeWizardScreen(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.ticketType);
  const dispatch = useAppDispatch();

  return (
    <Step {...props} title="Tickets">
      <Fields>
        <TextInput
          style={styles.field}
          mode="flat"
          label="Name"
          error={state.fields.name.error}
          value={state.fields.name.value || ''}
          onChangeText={(newValue) =>
            dispatch(actions.forms.ticketType.setField(['name', newValue]))
          }
        />

        <Card style={styles.card} elevation={3}>
          <NumberField
            mode="flat"
            onChange={(cost) => dispatch(actions.forms.ticketType.setField(['cost', cost]))}
            label="Price"
            variant={NumberFieldType.Cash}
            value={state.fields.cost.value}
            error={state.fields.cost.error}
          />
        </Card>

        <Card style={styles.altitudeSelect} elevation={3}>
          <AltitudeSelect
            onChange={(value) => dispatch(actions.forms.ticketType.setField(['altitude', value]))}
            value={state.fields.altitude.value || 14000}
          />
          {(!state.fields.altitude.value ||
            ![4000, 14000].includes(state.fields.altitude.value)) && (
            <TextInput
              style={styles.field}
              label="Custom altitude"
              error={state.fields.altitude.error}
              value={state.fields.altitude?.value?.toString()}
              onChange={(newValue) =>
                dispatch(actions.forms.ticketType.setField(['altitude', Number(newValue)]))
              }
            />
          )}
        </Card>
        <Paragraph style={styles.paragraph}>
          You can add more tickets later under Settings
        </Paragraph>
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
  card: { padding: 8, marginVertical: 16 },
  altitudeSelect: { padding: 8, marginVertical: 16 },
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
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 25,
    textAlign: 'center',
  },
  paragraph: {
    marginBottom: 8,
    fontWeight: 'bold',
    // fontSize: 25,
    textAlign: 'center',
  },
  field: {
    marginBottom: 8,
    // marginHorizontal: 16,
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

export default TicketTypeWizardScreen;
