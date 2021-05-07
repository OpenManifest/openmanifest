import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TextInput, HelperText, Checkbox, List } from 'react-native-paper';
import { xor } from "lodash";
import { Query } from '../../../graphql/schema';
import { useAppSelector, useAppDispatch } from '../../../redux';


import slice from "./slice";
import ScrollableScreen from '../../layout/ScrollableScreen';

const { actions } = slice;


const QUERY_TICKET_TYPES = gql`
  query QueryTicketType(
    $dropzoneId: Int!
  ) {
    ticketTypes(dropzoneId: $dropzoneId) {
      id
      cost
      currency
      name
      allowManifestingSelf

      extras {
        id
        name
      }
    }
  }
`;

export default function ExtraForm() {
  const state = useAppSelector(state => state.extraForm);
  const dispatch = useAppDispatch();
  const globalState = useAppSelector(state => state.global);
  const { data, loading, refetch } = useQuery<Query>(QUERY_TICKET_TYPES, {
    variables: {
      dropzoneId: Number(globalState.currentDropzone?.id)
    }
  });

  return ( 
    <>
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
        error={!!state.fields.cost.error}
        value={state.fields.cost?.value?.toString()}
        onChangeText={(newValue) => dispatch(actions.setField(["cost", Number(newValue)]))}
      />
      <HelperText type={!!state.fields.cost.error ? "error" : "info"}>
        { state.fields.cost.error || "" }
      </HelperText>

      <View style={{ width: "100%"}}>
        <List.Subheader>
          Compatible tickets
        </List.Subheader>
        {
          data?.ticketTypes.map((ticket) =>
            <Checkbox.Item
              label={ticket.name!}
              status={state.fields.ticketTypeIds.value.includes(Number(ticket.id))
                ? "checked"
                : "unchecked"
              }
              onPress={
                () => dispatch(actions.setField(["ticketTypeIds", xor(state.fields.ticketTypeIds.value, [Number(ticket.id)])]))
              }
            />
          )
        }
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    width: "100%",
    flex: 1,
    
  },
  field: {
    marginBottom: 8,
    width: "100%"
  }
});
