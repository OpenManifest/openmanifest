import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, HelperText, List, Menu, Paragraph, TextInput } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { actions, useAppDispatch, useAppSelector } from '../../../../state';
import WizardScreen, { IWizardScreenProps } from '../../../../components/wizard/WizardScreen';

function TicketTypeWizardScreen(props: IWizardScreenProps) {
  const state = useAppSelector((root) => root.forms.ticketType);
  const dispatch = useAppDispatch();
  const [altitudeMenuOpen, setAltitudeMenuOpen] = React.useState(false);
  const [price, setPrice] = React.useState(0);

  return (
    <WizardScreen style={styles.container} {...props} title="Tickets">
      <Paragraph style={styles.paragraph}>You can add more tickets later under Settings</Paragraph>

      <View style={styles.content}>
        <Card style={styles.card}>
          <List.Subheader>Name</List.Subheader>
          <TextInput
            style={styles.field}
            mode="outlined"
            error={!!state.fields.name.error}
            value={state.fields.name.value || ''}
            onChangeText={(newValue) =>
              dispatch(actions.forms.ticketType.setField(['name', newValue]))
            }
          />
          <HelperText type={state.fields.name.error ? 'error' : 'info'}>
            {state.fields.name.error || ''}
          </HelperText>
        </Card>

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
          <Menu
            onDismiss={() => setAltitudeMenuOpen(false)}
            visible={altitudeMenuOpen}
            contentStyle={{ width: 300 }}
            anchor={
              <TouchableOpacity onPress={() => setAltitudeMenuOpen(true)}>
                <View style={styles.cardTitle}>
                  <List.Subheader>Altitude</List.Subheader>
                  <Text style={styles.cardValue}>
                    {state.fields.altitude.value &&
                    [4000, 14000].includes(state.fields.altitude.value)
                      ? {
                          '14000': 'Height',
                          '4000': 'Hop n Pop',
                        }[state.fields.altitude.value.toString() as '14000' | '4000']
                      : 'Custom'}
                  </Text>
                </View>
              </TouchableOpacity>
            }
          >
            <List.Item
              onPress={() => {
                dispatch(actions.forms.ticketType.setField(['altitude', 4000]));
                setAltitudeMenuOpen(false);
              }}
              title="Hop n Pop"
              right={() => <List.Icon icon="parachute" />}
            />
            <List.Item
              onPress={() => {
                dispatch(actions.forms.ticketType.setField(['altitude', 14000]));
                setAltitudeMenuOpen(false);
              }}
              title="Height"
              right={() => <List.Icon icon="airplane-takeoff" />}
            />
            <List.Item
              onPress={() => {
                dispatch(actions.forms.ticketType.setField(['altitude', 7000]));
                setAltitudeMenuOpen(false);
              }}
              title="Other"
              right={() => <List.Icon icon="parachute" />}
            />
          </Menu>

          {(!state.fields.altitude.value ||
            ![4000, 14000].includes(state.fields.altitude.value)) && (
            <TextInput
              style={styles.field}
              mode="outlined"
              label="Custom altitude"
              error={!!state.fields.altitude.error}
              value={state.fields.altitude?.value?.toString()}
              onChangeText={(newValue) =>
                dispatch(actions.forms.ticketType.setField(['altitude', Number(newValue)]))
              }
            />
          )}
        </Card>
      </View>
    </WizardScreen>
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
    color: 'white',
    marginBottom: 8,
    fontWeight: 'bold',
    // fontSize: 25,
    textAlign: 'center',
  },
  field: {
    marginBottom: 8,
    marginHorizontal: 16,
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
