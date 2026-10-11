import * as React from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { set } from 'lodash';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { Card, Divider, List, useTheme } from 'react-native-paper';
import WindRow from './WindRow';
import { useWatch } from 'react-hook-form';
import { MAX_WINDS, useWeatherForm } from '../../../forms/weather/useForm';

interface IWeatherConditionFormProps {
  variant?: 'dark' | 'light';
  onPressJumpRun?(): void;
}
export default function WeatherConditionForm(props: IWeatherConditionFormProps) {
  const { variant, onPressJumpRun } = props;
  const { control, setValue } = useWeatherForm();
  const [winds, formJumpRun, formTemperature] = useWatch({
    control,
    name: ['winds', 'jumpRun', 'temperature'],
  });
  const theme = useTheme();

  // While a text field is being edited it shows what was typed; the form gets the number on blur
  const [typedTemperature, setTypedTemperature] = React.useState<number | null>(null);
  const [typedJumpRun, setTypedJumpRun] = React.useState<number | null>(null);
  const temperature = typedTemperature ?? formTemperature ?? 0;
  const jumpRun = typedJumpRun ?? formJumpRun ?? 0;

  return (
    <View style={styles.content}>
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
        <Card
          style={[styles.temperatureCard, { backgroundColor: theme.colors.surface }]}
          elevation={3}
        >
          <Card.Content style={styles.cardContent}>
            <List.Icon icon="thermometer" style={{ width: 20 }} />
            <TextInput
              value={temperature?.toString()}
              onBlur={() => setValue('temperature', Number(temperature), { shouldDirty: true })}
              onChangeText={(newTemp) => {
                if (/\d/.test(newTemp)) {
                  const [numbers] = newTemp.match(/^\-?\d+/) || [temperature];
                  setTypedTemperature(Number(numbers));
                }
              }}
              style={[styles.textField, { color: theme.colors.onSurface }]}
              keyboardType="numeric"
            />
          </Card.Content>
        </Card>

        <Card style={styles.jumpRunCard} elevation={3}>
          <Card.Content style={[styles.cardContent, { backgroundColor: theme.colors.surface }]}>
            <List.Icon icon="compass" style={{ width: 20 }} />
            <TextInput
              value={jumpRun?.toString()}
              onBlur={() => {
                if (typedJumpRun !== null) {
                  setValue('jumpRun', typedJumpRun, { shouldDirty: true });
                  setTypedJumpRun(null);
                }
              }}
              onChangeText={(newJumpRun) => {
                if (/\d/.test(newJumpRun)) {
                  const [numbers] = newJumpRun.match(/\d+/) || [jumpRun];
                  setTypedJumpRun(Number(numbers));
                }
              }}
              keyboardType="numeric"
              style={[styles.textField, { color: theme.colors.onSurface }]}
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
        keyExtractor={(item, index) => `wind.${item.altitude}.${index}`}
        scrollEnabled={false}
        renderItem={({ item: wind, index }) => {
          return (
            <WindRow
              {...wind}
              key={`wind-input-${index}`}
              onChange={(field, value) => {
                const newWinds = set([...winds], index, {
                  ...wind,
                  [field]: value,
                });
                setValue('winds', newWinds, { shouldDirty: true });
              }}
            />
          );
        }}
      />
      {winds.length < MAX_WINDS ? (
        <TouchableOpacity
          onPress={() =>
            setValue('winds', [...winds, { altitude: '0', direction: '0', speed: '0' }], {
              shouldDirty: true,
            })
          }
        >
          <View style={{ width: '100%', opacity: 0.5 }} pointerEvents="box-only">
            <WindRow altitude="Add" direction="0" speed="0" onChange={() => null} />
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
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
    gap: 16,
    width: '100%',
    maxWidth: 350,
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
    // Grows on every platform: without a width the input collapses on Android
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    paddingBottom: 4,
    minHeight: 60,
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
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    marginVertical: 16,
  },
  headerTemperature: {
    flex: 1,

    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headerJumprun: {
    flex: 1,

    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  jumpRunCard: {
    flex: 1,
    minHeight: 60,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  temperatureCard: {
    minHeight: 60,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  headerAltitude: {
    flex: 1,

    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headerSpeed: {
    flex: 1,

    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headerDirection: {
    flex: 1,

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
