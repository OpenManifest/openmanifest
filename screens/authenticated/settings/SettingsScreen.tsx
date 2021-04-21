import * as React from 'react';
import { StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import { View } from '../../../components/Themed';
import { useAppSelector } from '../../../redux';




export default function SettingsScreen() {
  
  const navigation = useNavigation();
  const state = useAppSelector(state => state.global);
 

  return (
    <View style={styles.container}>
      <List.Section title="Dropzone">
        <List.Item
          title="Basic settings"
          onPress={() => navigation.navigate("UpdateDropzoneScreen", { dropzone: state.currentDropzone })}
          left={() => <List.Icon color="#000" icon="information-outline" />}
        />
        <List.Item
          title="Planes"
          onPress={() => navigation.navigate("PlanesScreen")}
          left={() => <List.Icon color="#000" icon="airplane" />}
        />
        <List.Item
          title="Rigs"
          left={() => <List.Icon color="#000" icon="parachute" />}
        />
        <List.Item
          title="Users"
          left={() => <List.Icon color="#000" icon="account-cog" />}
        />
      </List.Section>

      <List.Section title="Tickets">
        <List.Item
          title="Ticket types"
          onPress={() => navigation.navigate("TicketTypesScreen")}
          left={() => <List.Icon color="#000" icon="ticket" />}
          />
        <List.Item
          title="Ticket add-ons"
          onPress={() => navigation.navigate("ExtrasScreen")}
          left={() => <List.Icon color="#000" icon="plus" />}
        />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    display: "flex"
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%"
  }
});
