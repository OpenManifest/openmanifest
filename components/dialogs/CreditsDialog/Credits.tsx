import { gql, useMutation } from "@apollo/client";
import React, { useCallback, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Portal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheetBehavior from "reanimated-bottom-sheet";
import BottomSheet from "reanimated-bottom-sheet";
import { Mutation } from "../../../graphql/schema";
import { creditsForm, snackbarActions, useAppDispatch, useAppSelector } from "../../../redux";
import CreditsForm from "../../forms/credits/CreditsForm";
interface ICreditsSheet {
  open?: boolean;
  dropzoneUserId: number;
  onClose(): void;
  onSuccess(): void;
}

const MUTATION_CREATE_TRANSACTION = gql`
  mutation CreatrTransaction(
    $message: String,
    $status: String,
    $amount: Float,
    $dropzoneUserId: Int,
  ) {
    createTransaction(
      input: {
        attributes: {
          amount: $amount,
          dropzoneUserId: $dropzoneUserId,
          message: $message,
          status: $status,
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      transaction {
        id
        amount
        message

        dropzoneUser {
          id
          credits

          transactions {
            edges {
              node {
                id
                status
                amount
                createdAt
                message
              }
            }
          }
        }
      }
    }
  }
`;

export default function CreditSheet(props: ICreditsSheet) {
  const { open, dropzoneUserId } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.creditsForm);
  const global = useAppSelector(state => state.global);
  const [mutationCreateTransaction, createData] = useMutation<Mutation>(MUTATION_CREATE_TRANSACTION);

  const validate = useCallback(() => {
    let hasErrors = false;
    if (!state.fields.amount.value) {
      hasErrors = true;
      dispatch(
        creditsForm.setFieldError(["amount", "You must specify an amount"])
      );
    }

    return !hasErrors;
  }, [JSON.stringify(state.fields)]);
  
  const onSave = useCallback(async () => {

    if (!validate()) {
      return;
    }
    try {
      const response = await mutationCreateTransaction({
        variables: {
          amount: state.fields.amount.value,
          message: state.fields.message.value,
          status: state.fields.status.value,
          dropzoneUserId: Number(dropzoneUserId),
        }
      });
      const result = state.original?.id ? response.data?.updateRig : response.data?.createRig;

      result?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case "amount":
            return dispatch(creditsForm.setFieldError(["amount", message]));
          case "message":
            return dispatch(creditsForm.setFieldError(["message", message]));
          case "status":
            return dispatch(creditsForm.setFieldError(["status", message]));
        }
      });
      if (result?.errors?.length) {
        return dispatch(snackbarActions.showSnackbar({ message: result?.errors[0], variant: "error" }));
      }
      if (!result?.fieldErrors?.length) {
        dispatch(creditsForm.reset());
        props.onSuccess();
      }

    } catch(error) {
      dispatch(snackbarActions.showSnackbar({ message: error.message, variant: "error" }));
    } 
  }, [JSON.stringify(state.fields), mutationCreateTransaction, props.onSuccess])
  
  const sheetRef = useRef<BottomSheetBehavior>(null);

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
        snapPoints={[550, 0]}
        initialSnap={1}
        onCloseEnd={() => props.onClose()}
        renderHeader={() =>
          <View style={[styles.sheetHeader, { backgroundColor: global.theme.colors.primary }]} />
        }
        renderContent={() => 
          <View style={styles.sheet}>
            <CreditsForm />
            <View style={styles.buttonContainer}>
              <Button onPress={onSave} loading={createData.loading} mode="contained" style={styles.button}>
                Save
              </Button>
            </View>
          </View>
      }
    />
    </Portal>
  );
}


const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: 16,
    padding: 5,
  },
  buttonContainer: {
    paddingHorizontal: 16,
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