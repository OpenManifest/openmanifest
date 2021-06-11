import { gql, useMutation } from "@apollo/client";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Portal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";
import { Mutation } from "../../../graphql/schema";
import { actions, useAppDispatch, useAppSelector } from "../../../redux";
import ManifestForm from "../../forms/manifest/ManifestForm";
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
    $userId: Int
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
          userId: $userId
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
  const { open } = props;
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
          userId: Number(state.fields.user?.value?.id),
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
          case "user":
            return dispatch(actions.forms.manifest.setFieldError(["user", message]));
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
  
  const sheetRef = React.useRef<BottomSheet>(null);

  React.useEffect(() => {
    if (state.fields.ticketType?.value?.isTandem) {
      sheetRef?.current?.snapTo(0);
    }
  }, [state.fields.ticketType?.value?.isTandem])

  React.useEffect(() => {
    if (open) {
      sheetRef?.current?.snapTo(0);
    } else if (!open) {
      sheetRef?.current?.snapTo(1);
    }
  }, [open]);

  return (
    <Portal>
      <BottomSheet
        ref={sheetRef}
        snapPoints={[600, 0]}
        index={-1}
        onCloseEnd={() => {
          dispatch(actions.forms.manifest.reset());
          props.onClose();
        }}
        renderHeader={() =>
          <View style={styles.sheetHeader} />
        }
       >
         <View style={styles.sheet} testID="manifest-form">
            <SafeAreaView style={styles.contentContainer}>
              <ManifestForm />
              <Button
                onPress={onManifest}
                mode="contained"
                style={styles.button}
                loading={mutationData.loading}
              >
                Manifest
              </Button>
            </SafeAreaView>
          </View>
        </BottomSheet>
    </Portal>
  )
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: 16,
    padding: 5,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sheet: {
    elevation: 3,
    backgroundColor: "white",
    flexGrow: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  sheetHeader: {
    elevation: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    backgroundColor: "white",
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  }

})