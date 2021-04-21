import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { gql, useMutation } from "@apollo/client";
import { useAppSelector, useAppDispatch, dropzoneForm } from '../../../redux';

import { View } from '../../../components/Themed';
import { actions as snackbar } from "../../../components/notifications";
import globalSlice from "../../../redux/global";

import slice from "../../../components/forms/ticket_type/slice";
import { Mutation, TicketType } from '../../../graphql/schema';
import TicketTypeForm from '../../../components/forms/ticket_type/TicketTypeForm';
import { useNavigation, useRoute } from '@react-navigation/core';

const { actions } = slice;
const { actions: globalActions } = globalSlice;


const MUTATION_UPDATE_TICKET_TYPE = gql`
  mutation UpdateTicketType(
    $id: Int!,
    $name: String,
    $cost: Float,
    $dropzoneId: Int!
    $altitude: Int
    $allowManifestingSelf: Boolean
  ){
    updateTicketType(input: {
      id: $id
      attributes: {
        name: $name,
        cost: $cost,
        dropzoneId: $dropzoneId
        altitude: $altitude
        allowManifestingSelf: $allowManifestingSelf
      }
    }) {
      ticketType {
        id
        name
        altitude
        cost
        allowManifestingSelf
        extras {
          id
          name
          cost
        }
      }
    }
  }
`;

export default function UpdateTicketTypeScreen() {
  const { ticketTypeForm: state, global: globalState } = useAppSelector(state => state);
  const dispatch = useAppDispatch();

  const navigation = useNavigation();
  const route = useRoute<{ key: string, name: string, params: { ticketType: TicketType }}>();
  const ticketType = route.params!.ticketType;

  React.useEffect(() => {
    dispatch(actions.setOriginal(ticketType));
  }, [ticketType?.id]);

  const [mutationUpdateTicketType, data] = useMutation<Mutation>(MUTATION_UPDATE_TICKET_TYPE);

  const validate = React.useCallback((): boolean => {
    let hasError = false;
    if (state.fields.name.value.length < 3) {
      hasError = true;
      dispatch(
        actions.setFieldError(["name", "Name is too short"])
      );
    }

    if (state.fields.cost.value! < 1) {
      hasError = true;
      dispatch(
        actions.setFieldError(["cost", "Cost must be at least $1"])
      );
    }

    if (!state.fields.altitude.value) {
      hasError = true;
      dispatch(
        actions.setFieldError(["altitude", "Altitude must be specified"])
      );
    }

    return !hasError;
  }, [JSON.stringify(state.fields), dispatch]);

  const onSave = React.useCallback(async () => {
    const { name, cost, allowManifestingSelf, altitude, extraIds } = state.fields;

    

    if (validate()) {
      try {
        const result = await mutationUpdateTicketType({
          variables: {
            id: Number(state.original!.id!),
            name: name.value,
            cost: cost.value,
            altitude: altitude.value,
            allowManifestingSelf: allowManifestingSelf.value,
            extraIds: extraIds.value,
          }
        });
        
        if (result.data?.updateTicketType?.ticketType) {
          dispatch(
            snackbar.showSnackbar({ message: `Saved`, variant: "success" })
          );
          navigation.goBack();
        }
      } catch (error) {
        dispatch(
          snackbar.showSnackbar({ message: error.message, variant: "error" })
        );
      }
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationUpdateTicketType]);

  return (
    <View style={styles.container}>
        <TicketTypeForm />
        <View style={styles.fields}>
          <Button mode="contained" disabled={data.loading} onPress={onSave} loading={data.loading}>
            Save
          </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  fields: {
    width: "70%",
    marginBottom: 16
  },
  field: {
    marginBottom: 8,
  }
});
