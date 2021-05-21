import { gql, useMutation } from "@apollo/client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Portal } from "react-native-paper";
import { Tabs, TabScreen, useTabNavigation } from 'react-native-paper-tabs';
import BottomSheetBehavior from "reanimated-bottom-sheet";
import BottomSheet from "reanimated-bottom-sheet";
import { Mutation } from "../../../graphql/schema";
import { slotForm, slotsMultipleForm, snackbarActions, useAppDispatch, useAppSelector } from "../../../redux";
import MultipleSlotForm from "../../forms/slots_multiple/MultipleSlotForm";
import UserListSelect from "./UserListSelect";
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

function NextStepButton() {
  const setTab = useTabNavigation();

  return (
    <Button
      onPress={() => setTab(1)} 
      style={styles.button}
    >
      Next
    </Button>
  )
}
export default function ManifestUserDialog(props: IManifestUserDialog) {
  const { open } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.slotsMultipleForm);
  const globalState = useAppSelector(state => state.global);
  const [mutationCreateSlots, mutationData] = useMutation<Mutation>(MUTATION_CREATE_SLOTS);
  const [tabIndex, setTabIndex] = useState(0);

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

      result.data?.createSlots?.fieldErrors?.map(({ field, message }) => {
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
        props.onClose();
      }

    } catch(error) {
      dispatch(snackbarActions.showSnackbar({ message: error.message, variant: "error" }));
    } 
  }, [JSON.stringify(state.fields), mutationCreateSlots, props.onSuccess])
  
  
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
          props.onClose();
          dispatch(slotsMultipleForm.reset());
          setTabIndex(0);
        }}
        renderHeader={() =>
          <View style={[styles.sheetHeader, { backgroundColor: globalState.theme.colors.primary }]} />
        }
        renderContent={() => 
          <View style={{ backgroundColor: "white"}} testID="manifest-group-sheet">
            <View pointerEvents={(state.fields.users?.value?.length || 0) > 0 ? undefined : "none"}>
              <Tabs defaultIndex={tabIndex} mode="fixed" onChangeIndex={setTabIndex}>
                <TabScreen label="Create group" ><View /></TabScreen>
                <TabScreen label="Configure jump"><View /></TabScreen>
              </Tabs>
            </View>
            
            {
              tabIndex === 0
                ? (
                  <View style={styles.userListContainer}>
                    <UserListSelect onNext={() => setTabIndex(1)} />
                  </View>
                ) : (
                  <ScrollView contentContainerStyle={{ paddingBottom: 200, flexGrow: 1}}>
                    <MultipleSlotForm />
                    <View style={styles.buttonContainer}>
                      <Button onPress={onManifest} loading={mutationData.loading} mode="contained" style={styles.button}>
                        Save
                      </Button>
                    </View>
                  </ScrollView>
                )
            }
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
  buttonContainer: {
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  userListContainer: {
    height: "100%",
    backgroundColor: "white",
    width: "100%",
    padding: 16,
  },
  sheet: {
    elevation: 3,
    backgroundColor: "white",
    flexGrow: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingBottom: 32,
  },
  sheetHeader: {
    elevation: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 30,
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