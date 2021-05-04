
import { gql, useMutation } from "@apollo/client";
import React, { useCallback, useEffect } from "react";
import { ScrollView } from "react-native";
import { Button, Card, ProgressBar } from "react-native-paper";
import ScrollableScreen from "../../../components/layout/ScrollableScreen";
import { DropzoneUser, Mutation, Slot } from "../../../graphql/schema";
import { slotForm, slotsMultipleForm, snackbarActions, useAppDispatch, useAppSelector } from "../../../redux";
import MultipleSlotForm from "../../../components/forms/slots_multiple/MultipleSlotForm";
import { useNavigation, useRoute } from "@react-navigation/core";
interface IManifestUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(): void;
}

const MUTATION_CREATE_SLOTS = gql`
  mutation CreateSlot(
    $jumpTypeId: Int
    $extraIds: [Int!]
    $loadId: Int
    $ticketTypeId: Int
    $userGroup: [SlotUser!]!,
  ) {
    createSlots(
      input: {
        attributes: {
          jumpTypeId: $jumpTypeId
          extraIds: $extraIds
          loadId: $loadId
          ticketTypeId: $ticketTypeId
          userGroup: $userGroup,
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      
      load {
        id
        name
        loadNumber
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
`;

export default function ManifestGroupScreen(props: IManifestUserDialog) {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.slotsMultipleForm);
  const globalState = useAppSelector(state => state.global);
  const [mutationCreateSlots, mutationData] = useMutation<Mutation>(MUTATION_CREATE_SLOTS);
  const navigation = useNavigation();
  

  const validate = useCallback(() => {
    let hasErrors = false;
    if (!state.fields.jumpType.value?.id) {
      hasErrors = true;
      dispatch(
        slotForm.setFieldError(["jumpType", "You must specify the type of jump"])
      );
    }

    if (!state.fields.ticketType.value?.id) {
      hasErrors = true;
      dispatch(
        slotForm.setFieldError(["ticketType", "You must select a ticket type to manifest"])
      );
    }

    return !hasErrors;
  }, [JSON.stringify(state.fields)]);
  
  const onManifest = useCallback(async () => {

    if (!validate()) {
      return;
    }
    try {
      const result = await mutationCreateSlots({
        variables: {
          jumpTypeId: Number(state.fields.jumpType.value?.id),
          ticketTypeId: Number(state.fields.ticketType.value?.id),
          extraIds: state.fields.extras?.value?.map(({ id }) => Number(id)),
          loadId: Number(state.fields.load.value?.id),
          userGroup: state.fields.users.value,
        }
      });

      result.data?.createSlot?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case "jump_type":
            return dispatch(slotForm.setFieldError(["jumpType", message]));
          case "load":
            return dispatch(slotForm.setFieldError(["load", message]));
          case "credits":
          case "extras":
          case "extra_ids":
            return dispatch(slotForm.setFieldError(["extras", message]));
          case "ticket_type":
            return dispatch(slotForm.setFieldError(["ticketType", message]));
          case "rig":
            return dispatch(slotForm.setFieldError(["rig", message]));
          case "user":
            return dispatch(slotForm.setFieldError(["user", message]));
          case "exit_weight":
            return dispatch(slotForm.setFieldError(["exitWeight", message]));
        }
      });
      if (result?.data?.createSlots?.errors?.length) {
        return dispatch(snackbarActions.showSnackbar({ message: result?.data?.createSlots?.errors[0], variant: "error" }));
      }
      if (!result.data?.createSlots?.fieldErrors?.length) {
        navigation.navigate("Manifest", { screen: "DropzoneScreen" });
      }

    } catch(error) {
      dispatch(snackbarActions.showSnackbar({ message: error.message, variant: "error" }));
    } 
  }, [JSON.stringify(state.fields), mutationCreateSlots, props.onSuccess])
  
  return (
    <ScrollableScreen>
      <ProgressBar indeterminate visible={mutationData.loading} color={globalState.theme.colors.accent} />
      <Card.Title title={`Manifest ${state?.fields?.users?.value?.length} jumpers on Load #${state.fields.load?.value?.loadNumber}`} />
      <MultipleSlotForm />
      <Button
        mode="contained"
        style={{ width: "100%", marginVertical: 16 }}
        onPress={() => onManifest()}
        loading={mutationData.loading}
      >
        Save
      </Button>
  </ScrollableScreen>
  )
}