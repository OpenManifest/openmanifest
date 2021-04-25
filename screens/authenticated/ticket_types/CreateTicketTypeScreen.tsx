import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { gql, useMutation } from "@apollo/client";
import { useAppSelector, useAppDispatch, dropzoneForm, snackbarActions } from '../../../redux';

import { View } from '../../../components/Themed';
import { actions as snackbar } from "../../../components/notifications";
import globalSlice from "../../../redux/global";

import slice from "../../../components/forms/ticket_type/slice";
import { Mutation } from '../../../graphql/schema';
import TicketTypeForm from '../../../components/forms/ticket_type/TicketTypeForm';
import { useIsFocused, useNavigation } from '@react-navigation/core';
import ScrollableScreen from '../../../components/ScrollableScreen';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const { actions } = slice;
const { actions: globalActions } = globalSlice;


const MUTATION_CREATE_TICKET_TYPE = gql`
  mutation CreateTicketType(
    $name: String,
    $cost: Float,
    $dropzoneId: Int!
    $altitude: Int
    $allowManifestingSelf: Boolean
  ){
    createTicketType(input: {
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

export default function CreateTicketTypeScreen() {
  const { ticketTypeForm: state, global: globalState } = useAppSelector(state => state);
  const dispatch = useAppDispatch();

  const navigation = useNavigation();

  const [mutationCreateTicketType, data] = useMutation<Mutation>(MUTATION_CREATE_TICKET_TYPE);
  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (isFocused) {
      dispatch(actions.reset());
    }
  }, [isFocused]);

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
        const result = await mutationCreateTicketType({
          variables: {
            dropzoneId: Number(globalState.currentDropzone?.id),
            name: name.value,
            cost: cost.value,
            altitude: altitude.value,
            allowManifestingSelf: allowManifestingSelf.value,
            extraIds: extras?.value?.map(({ id }) => id),
            isTandem: !!isTandem.value
          }
        });
        
        result?.data?.createTicketType?.fieldErrors?.map(({ field, message }) => {
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

        if (result?.data?.createTicketType?.errors?.length) {
          return dispatch(
            snackbarActions.showSnackbar({
              message: result?.data?.createTicketType?.errors[0],
              variant: "error"
            })
          );
        }
        
        if (result.data?.createTicketType?.ticketType) {
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
    
  }, [JSON.stringify(state.fields), dispatch, mutationCreateTicketType]);

  return (
    <ScrollableScreen contentContainerStyle={{ paddingHorizontal: 48 }}>
        <MaterialCommunityIcons name="ticket" size={100} color="#999999" style={{ alignSelf: "center" }} />
        <TicketTypeForm />
        <View style={styles.actions}>
          <Button mode="contained" disabled={data.loading} onPress={onSave} loading={data.loading}>
            Save
          </Button>
        </View>
    </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  actions: {
    marginVertical: 16,
    width: "100%"
  },
});
