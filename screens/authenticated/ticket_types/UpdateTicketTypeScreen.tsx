import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { gql, useMutation } from "@apollo/client";
import { useAppSelector, useAppDispatch, dropzoneForm, snackbarActions } from '../../../redux';

import { View } from '../../../components/Themed';
import { actions as snackbar } from "../../../components/notifications";
import globalSlice from "../../../redux/global";

import slice from "../../../components/forms/ticket_type/slice";
import { Mutation, TicketType } from '../../../graphql/schema';
import TicketTypeForm from '../../../components/forms/ticket_type/TicketTypeForm';
import { useNavigation, useRoute } from '@react-navigation/core';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScrollableScreen from '../../../components/ScrollableScreen';

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
    if (!state.fields.name.value || state.fields.name.value.length < 3) {
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
    const { name, cost, allowManifestingSelf, altitude, extras, isTandem } = state.fields;

    

    if (validate()) {
      try {
        const result = await mutationUpdateTicketType({
          variables: {
            id: Number(state.original!.id!),
            name: name.value,
            cost: cost.value,
            altitude: altitude.value,
            allowManifestingSelf: allowManifestingSelf.value,
            extraIds: extras?.value?.map(({ id }) => id),
            isTandem: !!isTandem.value
          }
        });


        result?.data?.updateTicketType?.fieldErrors?.map(({ field, message }) => {
          switch (field) {
            case "name":
              return dispatch(actions.setFieldError(["name", message]));
            case "altitude":
              return dispatch(actions.setFieldError(["altitude", message]));
            case "cost":
              return dispatch(actions.setFieldError(["cost", message]));
            case "allow_manifesting_self":
              return dispatch(actions.setFieldError(["allowManifestingSelf", message]));
            case "extras":
              return dispatch(actions.setFieldError(["extras", message]));
          }
        });

        if (result?.data?.updateTicketType?.errors?.length) {
          return dispatch(
            snackbarActions.showSnackbar({
              message: result?.data?.updateTicketType?.errors[0],
              variant: "error"
            })
          );
        }
        
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
    <ScrollableScreen contentContainerStyle={{ paddingHorizontal: 48 }}>
        <MaterialCommunityIcons name="ticket" size={100} color="#999999" style={{ alignSelf: "center" }} />
        <TicketTypeForm />
        <View style={styles.fields}>
          <Button mode="contained" disabled={data.loading} onPress={onSave} loading={data.loading}>
            Save
          </Button>
      </View>
    </ScrollableScreen>
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
    width: "100%",
    marginVertical: 16
  },
  field: {
    marginBottom: 8,
  }
});
