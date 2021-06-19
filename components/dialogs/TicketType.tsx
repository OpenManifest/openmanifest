import * as React from 'react';
import { gql, useMutation } from "@apollo/client";

import { actions, useAppSelector, useAppDispatch } from '../../redux';
import { Mutation } from '../../graphql/schema';
import TicketTypeForm from '../../components/forms/ticket_type/TicketTypeForm';
import { useIsFocused, useNavigation } from '@react-navigation/core';
import DialogOrSheet from '../layout/DialogOrSheet';
import useCurrentDropzone from '../../graphql/hooks/useCurrentDropzone';



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
  const state = useAppSelector(state => state.forms.ticketType);
  const dispatch = useAppDispatch();
  const currentDropzone = useCurrentDropzone();

  const [mutationCreateTicketType, create] = useMutation<Mutation>(MUTATION_CREATE_TICKET_TYPE);
  const [mutationUpdateTicketType, update] = useMutation<Mutation>(MUTATION_UPDATE_TICKET_TYPE);

  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (isFocused) {
      dispatch(actions.forms.ticketType.reset());
    }
  }, [isFocused]);

  const validate = React.useCallback((): boolean => {
    let hasError = false;
    if (!state.fields.name.value || state.fields.name.value.length < 3) {
      hasError = true;
      dispatch(
        actions.forms.ticketType.setFieldError(["name", "Name is too short"])
      );
    }

    if (state.fields.cost.value! < 1) {
      hasError = true;
      dispatch(
        actions.forms.ticketType.setFieldError(["cost", "Cost must be at least $1"])
      );
    }

    if (!state.fields.altitude.value) {
      hasError = true;
      dispatch(
        actions.forms.ticketType.setFieldError(["altitude", "Altitude must be specified"])
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
            ...state.original?.id ? { id: Number(state.original?.id)} : { dropzoneId: Number(currentDropzone?.dropzone?.id) },
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
                return dispatch(actions.forms.ticketType.setFieldError(["name", message]));
              case "altitude":
                return dispatch(actions.forms.ticketType.setFieldError(["altitude", message]));
              case "cost":
                return dispatch(actions.forms.ticketType.setFieldError(["cost", message]));
              case "allow_manifesting_self":
                return dispatch(actions.forms.ticketType.setFieldError(["allowManifestingSelf", message]));
              case "extras":
                return dispatch(actions.forms.ticketType.setFieldError(["extras", message]));
            }
          });
        }

        if (payload?.errors?.length) {
          onClose();
          return dispatch(
            actions.notifications.showSnackbar({
              message: payload?.errors[0],
              variant: "error"
            })
          );
        }
        
        if (payload?.ticketType) {
          dispatch(
            actions.notifications.showSnackbar({ message: `Saved`, variant: "success" })
          );
          dispatch(actions.forms.ticketType.reset());
          onClose();
        }
      } catch (error) {
        dispatch(
          actions.notifications.showSnackbar({ message: error.message, variant: "error" })
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