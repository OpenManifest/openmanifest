
import { gql, useMutation } from "@apollo/client";
import * as React from "react";
import { Button, Card, ProgressBar } from "react-native-paper";
import ScrollableScreen from "../../../components/layout/ScrollableScreen";
import { Mutation } from "../../../api/schema.d";
import { actions, useAppDispatch, useAppSelector } from "../../../state";
import ManifestGroupForm from "../../../components/forms/manifest_group/ManifestGroupForm";
import { useNavigation } from "@react-navigation/core";
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
  const state = useAppSelector(state => state.forms.manifestGroup);
  const globalState = useAppSelector(state => state.global);
  const [mutationCreateSlots, mutationData] = useMutation<Mutation>(MUTATION_CREATE_SLOTS);
  const navigation = useNavigation();
  

  const validate = React.useCallback(() => {
    let hasErrors = false;
    if (!state.fields.jumpType.value?.id) {
      hasErrors = true;
      dispatch(
        actions.forms.manifestGroup.setFieldError(["jumpType", "You must specify the type of jump"])
      );
    }

    if (!state.fields.ticketType.value?.id) {
      hasErrors = true;
      dispatch(
        actions.forms.manifestGroup.setFieldError(["ticketType", "You must select a ticket type to manifest"])
      );
    }

    return !hasErrors;
  }, [JSON.stringify(state.fields)]);
  
  const onManifest = React.useCallback(async () => {

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
            return dispatch(actions.forms.manifestGroup.setFieldError(["jumpType", message]));
          case "load":
            return dispatch(actions.forms.manifestGroup.setFieldError(["load", message]));
          case "credits":
          case "extras":
          case "extra_ids":
            return dispatch(actions.forms.manifestGroup.setFieldError(["extras", message]));
          case "ticket_type":
            return dispatch(actions.forms.manifestGroup.setFieldError(["ticketType", message]));
        }
      });
      if (result?.data?.createSlots?.errors?.length) {
        return dispatch(actions.notifications.showSnackbar({ message: result?.data?.createSlots?.errors[0], variant: "error" }));
      }
      if (!result.data?.createSlots?.fieldErrors?.length) {
        navigation.navigate("Manifest", { screen: "DropzoneScreen" });
      }

    } catch(error) {
      dispatch(actions.notifications.showSnackbar({ message: error.message, variant: "error" }));
    } 
  }, [JSON.stringify(state.fields), mutationCreateSlots, props.onSuccess])
  
  return (
    <ScrollableScreen>
      <ProgressBar indeterminate visible={mutationData.loading} color={globalState.theme.colors.accent} />
      <Card.Title title={`Manifest ${state?.fields?.users?.value?.length} jumpers on Load #${state.fields.load?.value?.loadNumber}`} />
      <ManifestGroupForm />
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