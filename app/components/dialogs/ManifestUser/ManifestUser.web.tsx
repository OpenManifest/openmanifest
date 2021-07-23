import { gql, useMutation } from "@apollo/client";
import * as React from "react";
import { ScrollView } from "react-native";
import { Button, Dialog, Portal, ProgressBar } from "react-native-paper";
import { Mutation } from "../../../api/schema.d";
import { actions, useAppDispatch, useAppSelector } from "../../../state";
import SlotForm from "../../forms/manifest/ManifestForm";
interface IManifestUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(): void;
}

const MUTATION_CREATE_SLOT = gql`
  mutation CreateSlot(
    $jumpTypeId: Int
    $extraIds: [Int!]
    $loadId: Int
    $rigId: Int
    $ticketTypeId: Int
    $dropzoneUserId: Int
    $exitWeight: Float
    $passengerName: String
    $passengerExitWeight: Float
  ) {
    createSlot(
      input: {
        attributes: {
          jumpTypeId: $jumpTypeId
          extraIds: $extraIds
          loadId: $loadId
          rigId: $rigId
          ticketTypeId: $ticketTypeId
          dropzoneUserId: $dropzoneUserId
          exitWeight: $exitWeight
          passengerExitWeight: $passengerExitWeight
          passengerName: $passengerName
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      slot {
        id
        jumpType {
          id
          name
        }
        extras {
          id
          name
        }
        exitWeight
        load {
          id
          name
          createdAt
          dispatchAt
          hasLanded
          maxSlots
          isFull
          isOpen
          plane {
            id
            name
          }
          gca {
            id
            user {
              id
              name
            }
          }
          pilot {
            id
            user {
              id
              name
            }
          }
          loadMaster {
            id
            user {
              id
              name
            }
          }
          slots {
            id
            createdAt
            user {
              id
              name
            }
            passengerName
            passengerExitWeight
            ticketType {
              id
              name
              isTandem
              altitude
            }
            jumpType {
              id
              name
            }
            extras {
              id
              name
            }
          }
        }
      }
    }
  }
`;

export default function ManifestUserDialog(props: IManifestUserDialog) {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.forms.manifest);
  const globalState = useAppSelector(state => state.global);
  const [mutationCreateSlot, mutationData] = useMutation<Mutation>(MUTATION_CREATE_SLOT);

  const validate = React.useCallback(() => {
    let hasErrors = false;
    if (!state.fields.jumpType.value?.id) {
      hasErrors = true;
      dispatch(
        actions.forms.manifest.setFieldError(["jumpType", "You must specify the type of jump"])
      );
    }

    if (!state.fields.ticketType.value?.id) {
      hasErrors = true;
      dispatch(
        actions.forms.manifest.setFieldError(["ticketType", "You must select a ticket type to manifest"])
      );
    }

    return !hasErrors;
  }, [JSON.stringify(state.fields)]);
  const onManifest = React.useCallback(async () => {

    if (!validate()) {
      return;
    }
    try {
      const result = await mutationCreateSlot({
        variables: {
          jumpTypeId: Number(state.fields.jumpType.value?.id),
          extraIds: state.fields.extras?.value?.map(({ id }) => Number(id)),
          loadId: Number(state.fields.load.value?.id),
          rigId: !state.fields.rig.value?.id ? null : Number(state.fields.rig.value?.id),
          ticketTypeId: Number(state.fields.ticketType?.value?.id),
          dropzoneUserId: Number(state.fields.dropzoneUser?.value?.id),
          exitWeight: state.fields.exitWeight.value,
          ...!state.fields.ticketType.value?.isTandem
            ? {}
            : {
                passengerName: state.fields.passengerName?.value,
                passengerExitWeight: state.fields.passengerExitWeight?.value,
              }
        }
      });

      result.data?.createSlot?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case "jump_type":
            return dispatch(actions.forms.manifest.setFieldError(["jumpType", message]));
          case "load":
            return dispatch(actions.forms.manifest.setFieldError(["load", message]));
          case "credits":
          case "extras":
          case "extra_ids":
            return dispatch(actions.forms.manifest.setFieldError(["extras", message]));
          case "ticket_type":
            return dispatch(actions.forms.manifest.setFieldError(["ticketType", message]));
          case "rig":
            return dispatch(actions.forms.manifest.setFieldError(["rig", message]));
          case "dropzone_user":
            return dispatch(actions.forms.manifest.setFieldError(["dropzoneUser", message]));
          case "exit_weight":
            return dispatch(actions.forms.manifest.setFieldError(["exitWeight", message]));
        }
      });
      if (result?.data?.createSlot?.errors?.length) {
        return dispatch(actions.notifications.showSnackbar({ message: result?.data?.createSlot?.errors[0], variant: "error" }));
      }
      if (!result.data?.createSlot?.fieldErrors?.length) {
        props.onSuccess();
      }

    } catch(error) {
      dispatch(actions.notifications.showSnackbar({ message: error.message, variant: "error" }));
    } 
  }, [JSON.stringify(state.fields), mutationCreateSlot, props.onSuccess])
  
  return (
    <Portal>
      <Dialog visible={!!props.open} style={{ maxHeight: 500 }}>
        <ProgressBar indeterminate visible={mutationData.loading} color={globalState.theme.colors.accent} />
        <Dialog.Title>
          {`Manifest ${state?.fields?.dropzoneUser?.value?.user?.name} on ${state.fields.load?.value?.name}`}
        </Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView>
            <SlotForm />
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={{ justifyContent: "flex-end"}}>
          <Button
            onPress={() => {
              dispatch(actions.forms.manifest.reset());
              props.onClose();
            }}
          >
            Cancel
          </Button>
          <Button onPress={onManifest}>
            Manifest
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}