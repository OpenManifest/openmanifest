import { gql, useMutation } from "@apollo/client";
import React, { useCallback, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Portal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheetBehavior from "reanimated-bottom-sheet";
import BottomSheet from "reanimated-bottom-sheet";
import { Mutation } from "../../../graphql/schema";
import { slotForm, snackbarActions, useAppDispatch, useAppSelector } from "../../../redux";
import SlotForm from "../../forms/slot/SlotForm";
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
  const state = useAppSelector(state => state.slotForm);
  const globalState = useAppSelector(state => state.global);
  const [mutationCreateSlot, mutationData] = useMutation<Mutation>(MUTATION_CREATE_SLOT);

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
      if (result?.data?.createSlot?.errors?.length) {
        return dispatch(snackbarActions.showSnackbar({ message: result?.data?.createSlot?.errors[0], variant: "error" }));
      }
      if (!result.data?.createSlot?.fieldErrors?.length) {
        props.onSuccess();
      }

    } catch(error) {
      dispatch(snackbarActions.showSnackbar({ message: error.message, variant: "error" }));
    } 
  }, [JSON.stringify(state.fields), mutationCreateSlot, props.onSuccess])
  
  const sheetRef = useRef<BottomSheetBehavior>(null);

  useEffect(() => {
    if (state.fields.ticketType?.value?.isTandem) {
      sheetRef?.current?.snapTo(0);
    }
  }, [state.fields.ticketType?.value?.isTandem])

  useEffect(() => {
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
        initialSnap={1}
        onCloseEnd={() => {
          dispatch(slotForm.reset());
          props.onClose();
        }}
        renderHeader={() =>
          <View style={styles.sheetHeader} />
        }
        renderContent={() => 
          <View style={styles.sheet} testID="manifest-form">
            <SafeAreaView style={styles.contentContainer}>
              <SlotForm />
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
       }
       />
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