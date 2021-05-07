import * as React from 'react';
import { gql, useMutation } from "@apollo/client";

import { useAppSelector, useAppDispatch, snackbarActions } from '../../redux';
import { actions as snackbar } from "../../components/notifications";
import slice from "../../components/forms/ticket_type/slice";
import { Mutation } from '../../graphql/schema';
import TicketTypeForm from '../../components/forms/ticket_type/TicketTypeForm';
import { useIsFocused, useNavigation } from '@react-navigation/core';
import DialogOrSheet from '../layout/DialogOrSheet';

const { actions } = slice;


const MUTATION_CREATE_TICKET_TYPE = gql`
  mutation CreateTicketType(
    $name: String,
    $cost: Float,
    $dropzoneId: Int!
    $altitude: Int
    $allowManifestingSelf: Boolean
    $isTandem: Boolean
  ){
    createTicketType(input: {
      attributes: {
        name: $name,
        cost: $cost,
        dropzoneId: $dropzoneId
        altitude: $altitude
        allowManifestingSelf: $allowManifestingSelf
        isTandem: $isTandem
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

        dropzone {
          id

          ticketTypes {
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
    }
  }
`;

const MUTATION_UPDATE_TICKET_TYPE = gql`
  mutation UpdateTicketType(
    $id: Int!,
    $name: String,
    $cost: Float,
    $altitude: Int
    $allowManifestingSelf: Boolean
    $isTandem: Boolean
  ){
    updateTicketType(input: {
      id: $id
      attributes: {
        name: $name,
        cost: $cost,
        altitude: $altitude
        allowManifestingSelf: $allowManifestingSelf
        isTandem: $isTandem
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

        dropzone {
          id

          ticketTypes {
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
    }
  }
`;



interface ITicketTypeDialog {
  open: boolean;
  onClose(): void;
}

export default function TicketTypeDialog(props: ITicketTypeDialog) {
  const { open, onClose } = props;
  const { ticketTypeForm: state, global: globalState } = useAppSelector(state => state);
  const dispatch = useAppDispatch();

  const navigation = useNavigation();

  const [mutationCreateTicketType, create] = useMutation<Mutation>(MUTATION_CREATE_TICKET_TYPE);
  const [mutationUpdateTicketType, update] = useMutation<Mutation>(MUTATION_UPDATE_TICKET_TYPE);

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

        const mutation = state.original?.id
          ? mutationUpdateTicketType
          : mutationCreateTicketType;
        
        const result = await mutation({
          variables: {
            ...state.original?.id ? { id: Number(state.original?.id)} : { dropzoneId: Number(globalState.currentDropzone?.id) },
            name: name.value,
            cost: cost.value,
            altitude: altitude.value,
            allowManifestingSelf: allowManifestingSelf.value,
            extraIds: extras?.value?.map(({ id }) => id),
            isTandem: !!isTandem.value
          }
        });

        const payload = state?.original?.id
          ? result?.data?.updateTicketType
          : result?.data?.createTicketType;
        
        if (payload?.fieldErrors) {
          return payload?.fieldErrors?.map(({ field, message }) => {
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
        }

        if (payload?.errors?.length) {
          onClose();
          return dispatch(
            snackbarActions.showSnackbar({
              message: payload?.errors[0],
              variant: "error"
            })
          );
        }
        
        if (payload?.ticketType) {
          dispatch(
            snackbar.showSnackbar({ message: `Saved`, variant: "success" })
          );
          dispatch(actions.reset());
          onClose();
        }
      } catch (error) {
        dispatch(
          snackbar.showSnackbar({ message: error.message, variant: "error" })
        );
      }
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationCreateTicketType]);

  return (
    <DialogOrSheet
      title={ state.original?.id ? "Edit ticket" : "New ticket"}
      open={open}
      onClose={() => {
        onClose();
      }}
      loading={create.loading || update.loading}
      buttonAction={onSave}
      buttonLabel="Save"
    >
      <TicketTypeForm />
    </DialogOrSheet>
  );
}