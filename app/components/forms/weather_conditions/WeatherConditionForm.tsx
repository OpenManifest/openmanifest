import * as React from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, TextInput, Platform } from 'react-native';
import { set } from 'lodash';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { Card, Divider, List } from 'react-native-paper';
import WindRow from './WindRow';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import { Wind } from '../../../api/schema.d';

interface IWeatherConditionFormProps {
  variant?: 'dark' | 'light';
  onPressJumpRun?(): void;
}
export default function WeatherConditionForm(props: IWeatherConditionFormProps) {
  const { variant, onPressJumpRun } = props;
  const state = useAppSelector((root) => root.forms.weather);
  const dispatch = useAppDispatch();
  const { value: winds } = state.fields.winds;

  const [temperature, setTemperature] = React.useState<number | null | undefined>(
    state.fields?.temperature?.value || 0
  );
  const [jumpRun, setJumpRun] = React.useState<number | null | undefined>(
    state.fields?.jumpRun?.value || 0
  );

  React.useEffect(() => {
    if (state.fields.jumpRun.value !== jumpRun) {
      setJumpRun(state.fields.jumpRun.value);
    }
  }, [jumpRun, state.fields.jumpRun.value]);

  React.useEffect(() => {
    if (state.fields.temperature.value !== temperature) {
      setJumpRun(state.fields.temperature.value);
    }
  }, [state.fields.jumpRun.value, state.fields.temperature.value, temperature]);
  return (
    <KeyboardAvoidingView behavior="position" style={styles.content}>
      <View style={styles.row}>
        <Text
          style={[styles.headerTemperature, { color: variant === 'light' ? 'white' : 'black' }]}
        >
          Temperature
        </Text>
        <Text style={[styles.headerJumprun, { color: variant === 'light' ? 'white' : 'black' }]}>
          Jump run
        </Text>
      </View>

      <View style={styles.altitudeTempRow}>
        <Card style={styles.temperatureCard} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <List.Icon icon="thermometer" style={{ width: 20 }} />
            <TextInput
              value={temperature?.toString()}
              onBlur={() =>
                dispatch(actions.forms.weather.setField(['temperature', Number(temperature)]))
              }
              onChangeText={(newTemp) => {
                if (/\d/.test(newTemp)) {
                  const [numbers] = newTemp.match(/^\-\d+/) || [temperature];
                  setTemperature(Number(numbers));
                }
              }}
              style={styles.textField}
              keyboardType="numeric"
            />
          </Card.Content>
        </Card>

        <Card style={styles.jumpRunCard} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <List.Icon icon="compass" style={{ width: 20 }} />
            <TextInput
              value={jumpRun?.toString()}
              onBlur={() => dispatch(actions.forms.weather.setField(['jumpRun', Number(jumpRun)]))}
              onChangeText={(newJumpRun) => {
                if (/\d/.test(newJumpRun)) {
                  const [numbers] = newJumpRun.match(/\d+/) || [jumpRun];
                  setJumpRun(Number(numbers));
                }
              }}
              keyboardType="numeric"
              style={styles.textField}
            />
            <TouchableOpacity onPress={() => onPressJumpRun?.()}>
              <List.Icon icon="earth" color="#40AA40" style={{ width: 40 }} />
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>
      <View style={styles.row}>
        <Text style={[styles.headerAltitude, { color: variant === 'light' ? 'white' : 'black' }]}>
          Altitude
        </Text>
        <Text style={[styles.headerSpeed, { color: variant === 'light' ? 'white' : 'black' }]}>
          Speed
        </Text>
        <Text style={[styles.headerDirection, { color: variant === 'light' ? 'white' : 'black' }]}>
          Direction
        </Text>
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
                const newWinds = set([...(winds as Wind[])], index, {
                  ...wind,
                  [field]: value,
                });
                dispatch(actions.forms.weather.setField(['winds', newWinds]));
              }}
            />
          );
        }}
      />
      {(winds as Wind[])?.length < 5 ? (
        <TouchableOpacity
          onPress={() =>
            dispatch(
              actions.forms.weather.setField([
                'winds',
                [...(winds || []), { altitude: '0', direction: '0', speed: '0' }],
              ])
            )
          }
        >
          <View style={{ width: '100%', opacity: 0.5 }} pointerEvents="box-only">
            <WindRow altitude="Add" direction="0" speed="0" onChange={() => null} />
          </View>
        </TouchableOpacity>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    alignItems: 'center',
    paddingLeft: 0,
    paddingRight: 0,
  },
  content: {
    width: '100%',
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  altitudeTempRow: {
    paddingHorizontal: 32,
    width: 400,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    flexGrow: 1,
    display: 'flex',
    flexWrap: 'nowrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 0,
    marginVertical: 16,
    marginTop: 0,
    marginBottom: 0,
    justifyContent: 'space-between',
  },
  textField: {
    ...Platform.select({
      web: { width: '100%' },
      ios: { flexGrow: 1 },
    }),
    paddingBottom: 4,
    height: 60,
    fontWeight: 'bold',
    fontSize: 20,
  },
  cardContent: {
    borderRadius: 5,

    flexGrow: 1,
    display: 'flex',
    flexWrap: 'nowrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginVertical: 16,
    marginTop: 0,
    marginBottom: 0,
  },
  row: {
    width: 400,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    marginVertical: 16,
  },
  headerTemperature: {
    width: 120,

    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headerJumprun: {
    width: 120,

    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  jumpRunCard: {
    width: 120,
    height: 60,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  temperatureCard: {
    height: 60,
    width: 120,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  headerAltitude: {
    width: 120,

    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headerSpeed: {
    width: 120,

    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headerDirection: {
    width: 120,

    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    marginVertical: 8,
    width: 360,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
  },
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
    marginBottom: 50,
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
