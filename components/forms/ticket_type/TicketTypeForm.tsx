import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { TextInput, HelperText, Checkbox, Menu, List, Divider } from 'react-native-paper';
import { xor } from "lodash";
import { Query } from '../../../graphql/schema';
import { useAppSelector, useAppDispatch } from '../../../redux';


import slice from "./slice";

const { actions } = slice;


const QUERY_EXTRAS = gql`
  query QueryExtras(
    $dropzoneId: Int!
  ) {
    extras(dropzoneId: $dropzoneId) {
      id
      cost
      name

      ticketTypes {
        id
        name
      }
    }
  }
`;

export default function TicketTypeForm() {
  const state = useAppSelector(state => state.ticketTypeForm);
  const dispatch = useAppDispatch();
  const globalState = useAppSelector(state => state.global);

  const [altitudeMenuOpen, setAltitudeMenuOpen] = React.useState(false);
  const { data, loading, refetch } = useQuery<Query>(QUERY_EXTRAS, {
    variables: {
      dropzoneId: Number(globalState.currentDropzone?.id)
    }
  });

  return ( 
    <ScrollView style={styles.fields} contentContainerStyle={{ paddingTop: 200 }}>
      <TextInput
        style={styles.field}
        mode="outlined"
        label="Name"
        error={!!state.fields.name.error}
        value={state.fields.name.value}
        onChangeText={(newValue) => dispatch(actions.setField(["name", newValue]))}
      />
      <HelperText type={!!state.fields.name.error ? "error" : "info"}>
        { state.fields.name.error || "" }
      </HelperText>

      <TextInput
        style={styles.field}
        mode="outlined"
        label="Price"
        error={!!state.fields.cost.value}
        value={state.fields.cost?.value?.toString()}
        onChangeText={(newValue) => dispatch(actions.setField(["cost", Number(newValue)]))}
      />
      <HelperText type={!!state.fields.cost.error ? "error" : "info"}>
        { state.fields.cost.error || "" }
      </HelperText>

      <Menu
        onDismiss={() => setAltitudeMenuOpen(false)}
        visible={altitudeMenuOpen}
        anchor={
          <List.Item
            onPress={() => {
              setAltitudeMenuOpen(true);
            }}
            title={
              [4000, 14000].includes(state.fields.altitude.value) ?
                {
                  "14000": "Height",
                  "4000": "Hop n Pop",
                }[state.fields.altitude.value.toString()] :
                "Custom"
            }
            right={ () =>
              <List.Icon icon={[4000, 14000].includes(state.fields.altitude.value) ?
                {
                  "14000": "airplane",
                  "4000": "parachute",
                }[state.fields.altitude.value.toString()] as string :
                "pencil-plus" 
              } />
            }
          />
        }>
          <List.Item
            onPress={() => {
              dispatch(actions.setField(["altitude", 4000]));
              setAltitudeMenuOpen(false);
            }}
            title="Hop n Pop"
            right={() => <List.Icon icon="parachute" />}
          />
          <List.Item
            onPress={() => {
              dispatch(actions.setField(["altitude", 14000]));
              setAltitudeMenuOpen(false);
            }}
            title="Height"
            right={() => <List.Icon icon="airplane-takeoff" />}
          />
          <List.Item
            onPress={() => {
              dispatch(actions.setField(["altitude", 7000]));
              setAltitudeMenuOpen(false);
            }}
            title="Other"
            right={() => <List.Icon icon="parachute" />}
          />
      </Menu>

      {
        ![4000, 14000].includes(state.fields.altitude.value) && (
          <TextInput
            style={styles.field}
            mode="outlined"
            label="Custom altitude"
            error={!!state.fields.altitude.value}
            value={state.fields.altitude?.value?.toString()}
            onChangeText={(newValue) => dispatch(actions.setField(["altitude", Number(newValue)]))}
          />
        )
      }
      <Checkbox.Item
        label="Public manifesting"
        status={!!state.fields.allowManifestingSelf.value
          ? "checked"
          : "unchecked"
        }
        onPress={
          () => dispatch(actions.setField(["allowManifestingSelf", !state.fields.allowManifestingSelf.value]))
        }
      />

      <Divider />
      <List.Subheader>Enabled ticket add-ons</List.Subheader>
      {
        data?.extras.map((extra) =>
          <Checkbox.Item
            label={extra.name!}
            status={state.fields.extraIds.value.includes(Number(extra.id))
              ? "checked"
              : "unchecked"
            }
            onPress={
              () => dispatch(actions.setField(["extraIds", xor(state.fields.extraIds.value, [Number(extra.id)])]))
            }
          />
        )
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fields: {
    width: "70%",
    flex: 1,
    
  },
  field: {
    marginBottom: 8,
  }
});
