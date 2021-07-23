import * as React from 'react';
import { StyleSheet, View, ViewStyle, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Card, List, Menu, TextInput } from 'react-native-paper';
import { Wind } from '../../../api/schema';

export interface IWindRowProps extends Wind {
  onChange(field: keyof Wind, value: number): void;
}
export default function WindRow(props: IWindRowProps) {
  const { speed, direction, altitude, onChange } = props;
  const [altitudeMenuOpen, setAltitudeMenuOpen] = React.useState(false);
  const [_speed, _setSpeed] = React.useState(speed);
  const [_direction, _setDirection] = React.useState(direction);

  return (
    <Card style={styles.card} elevation={3}>
      <Card.Content style={styles.row}>
        <View style={styles.altitudeCard}>
          <Menu
            onDismiss={() => setAltitudeMenuOpen(false)}
            visible={altitudeMenuOpen}
            style={{ minWidth: 130 }}
            anchor={
              <TouchableOpacity
                style={{
                  flexGrow: 1,
                  height: 60,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => setAltitudeMenuOpen(true)}
              >
                <List.Icon icon="arrow-up" style={styles.icon} />
                <Text style={styles.altitudeOption}>{altitude?.toString()}</Text>
              </TouchableOpacity>
            }
          >
            {[14000, 12000, 10000, 7000, 5000, 2000, 1000].map((alt) => (
              <List.Item
                onPress={() => {
                  if (alt) {
                    onChange('altitude', alt);
                  }
                  setAltitudeMenuOpen(false);
                }}
                title={alt.toString()}
                left={() => <List.Icon style={styles.icon} icon="arrow-up" />}
              />
            ))}
          </Menu>
        </View>

        <View style={styles.strengthCard}>
          <List.Icon icon="weather-windy" style={styles.icon} />
          <TextInput
            value={_speed?.toString()}
            onBlur={() => onChange('speed', Number(_speed))}
            onChangeText={(newSpeed) => {
              if (/\d/.test(newSpeed)) {
                const [numbers] = newSpeed.match(/\d+/) || [_speed];
                _setSpeed(numbers);
              } else if (!newSpeed) {
                _setSpeed('');
              }
            }}
            style={styles.textField}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.directionCard}>
          <List.Icon icon="compass" style={styles.icon} />
          <TextInput
            value={_direction?.toString()}
            onBlur={() => onChange('direction', Number(_direction))}
            onChangeText={(newDir) => {
              if (/\d/.test(newDir)) {
                const [numbers] = newDir.match(/\d+/) || [_direction];
                _setDirection(numbers);
              } else if (!newDir) {
                _setDirection('');
              }
            }}
            style={styles.textField}
            keyboardType="numeric"
          />
        </View>
      </Card.Content>
    </Card>
  );
}

const CARD_STYLE: ViewStyle = {
  height: 60,
  flexDirection: 'row',
  width: 350 / 3,
};

const styles = StyleSheet.create({
  altitudeOption: {
    minWidth: 50,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    lineHeight: 20,
    fontSize: 20,
    alignSelf: 'center',
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 18,
    width: 350,
    alignSelf: 'center',

    borderRadius: 10,
  },
  icon: {
    width: 20,
  },
  altitudeCard: {
    ...CARD_STYLE,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    overflow: 'hidden',
  },
  strengthCard: {
    ...CARD_STYLE,
  },
  directionCard: {
    ...CARD_STYLE,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
  textField: {
    flex: 1,
    flexGrow: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    width: '100%',
    minWidth: 80,
  },
  row: {
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
});
