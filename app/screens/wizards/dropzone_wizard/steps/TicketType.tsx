import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, HelperText, List, Paragraph } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { Step, Fields, IWizardStepProps } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import AltitudeSelect from 'app/components/input/dropdown_select/AltitudeSelect';
import TextInput from 'app/components/input/text/TextField';

function TicketTypeWizardScreen(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.ticketType);
  const dispatch = useAppDispatch();
  const [price, setPrice] = React.useState(0);

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
        <HelperText type={state.fields.name.error ? 'error' : 'info'}>
          {state.fields.name.error || ''}
        </HelperText>

        <Card style={styles.card} elevation={3}>
          <View style={styles.cardTitle}>
            <List.Subheader>Price</List.Subheader>
            <Text style={styles.cardValue}>${price || 0}</Text>
          </View>

          <View style={styles.slider}>
            <Slider
              style={styles.sliderControl}
              minimumValue={0}
              maximumValue={500}
              step={1}
              value={price}
              minimumTrackTintColor="#FF1414"
              maximumTrackTintColor="#000000"
              onSlidingComplete={() => dispatch(actions.forms.ticketType.setField(['cost', price]))}
              onValueChange={setPrice}
            />
          </View>

          <HelperText type={state.fields.cost?.error ? 'error' : 'info'}>
            {state.fields.cost?.error ||
              'How many slots are required to be filled to dispatch a load with this aircraft'}
          </HelperText>
        </Card>

        <Card style={styles.card} elevation={3}>
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
