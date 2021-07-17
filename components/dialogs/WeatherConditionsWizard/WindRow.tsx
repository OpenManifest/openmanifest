import * as React from "react";
import { StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Card, List, Menu, TextInput } from "react-native-paper";
import { Wind } from "../../../graphql/schema";

export interface IWindRowProps extends Wind {
  onChange(field: keyof Wind, value: number): void;
}
export default function WindRow(props: IWindRowProps) {
  const { speed, direction, altitude, onChange } = props;
  const [altitudeMenuOpen, setAltitudeMenuOpen] = React.useState(false);
  const [_speed, _setSpeed] = React.useState(speed);
  const [_direction, _setDirection] = React.useState(direction);

  const directionRef = React.useRef();
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.row}>
      <View style={styles.altitudeCard}>
        <Menu
          onDismiss={() => setAltitudeMenuOpen(false)}
          visible={altitudeMenuOpen}
          style={{ width: 150 }}
          contentStyle={{ width: 150 }}
          anchor={
            <View style={{ flexGrow: 1 }} pointerEvents="box-none">
              <TouchableOpacity onPress={() => setAltitudeMenuOpen(true)} style={{ flexDirection: "row", width: "100%", flexGrow: 1 }}>
                <List.Icon icon="arrow-up" style={{ width: 20 }} />
                <TextInput
                  disabled
                  style={{ flexGrow: 1, width: "100%" }}
                  value={altitude?.toString()}
                />
              </TouchableOpacity>
            </View>
          }>
            {[
              14000,
              12000,
              10000,
              7000,
              5000,
              2000,
              1000
            ].map((alt) =>
              <List.Item
                onPress={() => {
                  if (alt) {
                    onChange('altitude', alt);
                  }
                  setAltitudeMenuOpen(false);
                }}
                title={alt.toString()}
                left={() => <List.Icon icon="arrow-up" />}
              />
          )}
        </Menu>
      </View>

      <View style={styles.strengthCard}>
          <List.Icon icon="weather-windy" style={{ width: 20 }} />
          <TextInput
            value={_speed?.toString()}
            onBlur={() => onChange('speed', Number(speed))}
            onChangeText={(newSpeed) => {
              if (/\d/.test(newSpeed)) {
                const [numbers] = newSpeed.match(/\d+/);
                _setSpeed(numbers);
              } else if (!newSpeed) {
                _setSpeed('')
              }
            }}
            style={{ flexGrow: 1, width: "100%" }}
            keyboardType="numeric"
          />
      </View>

      <View style={styles.directionCard}>
          <List.Icon icon="compass" style={{ width: 20 }} />
          <TextInput
            value={_direction?.toString()}
            onBlur={() => onChange('direction', Number(_direction))}
            onChangeText={(newDir) => {
              if (/\d/.test(newDir)) {
                const [numbers] = newDir.match(/\d+/);
                _setDirection(numbers);
              } else if (!newDir) {
                _setDirection('')
              }
            }}
            style={{ flexGrow: 1, width: "100%" }}
          />
      </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    width: 360,
    alignSelf: "center"
  },
  altitudeCard: {
    overflow: "hidden",
    height: 60,
    width: 120,
    flexDirection: "row",
  },
  strengthCard: {
    width: 120,
    overflow: "hidden",
    height: 60,
    flexDirection: "row",
  },
  directionCard: {
    overflow: "hidden",
    height: 60,
    width: 120,
    flexDirection: "row",
  },
  row: {
    flexGrow: 1,
    display: 'flex',
    flexWrap: "nowrap",
    flexDirection: 'row',
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginVertical: 16,
    marginTop: 0,
    marginBottom: 0,
    
  }
});