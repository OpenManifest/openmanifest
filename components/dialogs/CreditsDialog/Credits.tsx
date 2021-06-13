import { gql, useMutation } from "@apollo/client";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Portal } from "react-native-paper";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";

import { DropzoneUser, Mutation } from "../../../graphql/schema";
import { actions, useAppDispatch, useAppSelector } from "../../../redux";
import CreditsForm from "../../forms/credits/CreditsForm";
interface ICreditsSheet {
  open?: boolean;
  dropzoneUser?: DropzoneUser;
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
  const { open, dropzoneUser } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.forms.credits);
  const global = useAppSelector(state => state.global);
  const [mutationCreateTransaction, createData] = useMutation<Mutation>(MUTATION_CREATE_TRANSACTION);

  const validate = React.useCallback(() => {
    let hasErrors = false;
    if (!state.fields.amount.value) {
      hasErrors = true;
      dispatch(
        actions.forms.credits.setFieldError(["amount", "You must specify an amount"])
      );
    }

    return !hasErrors;
  }, [JSON.stringify(state.fields)]);
  
  const onSave = React.useCallback(async () => {

    if (!validate()) {
      return;
    }
    try {
      const response = await mutationCreateTransaction({
        variables: {
          amount: state.fields.amount.value,
          message: state.fields.message.value,
          status: state.fields.status.value,
          dropzoneUserId: Number(dropzoneUser?.id),
        }
      });
      const result = state.original?.id ? response.data?.updateRig : response.data?.createRig;

      result?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case "amount":
            return dispatch(actions.forms.credits.setFieldError(["amount", message]));
          case "message":
            return dispatch(actions.forms.credits.setFieldError(["message", message]));
          case "status":
            return dispatch(actions.forms.credits.setFieldError(["status", message]));
        }
      });
      if (result?.errors?.length) {
        return dispatch(actions.notifications.showSnackbar({ message: result?.errors[0], variant: "error" }));
      }
      if (!result?.fieldErrors?.length) {
        dispatch(actions.forms.credits.reset());
        props.onSuccess();
      }

    } catch(error) {
      dispatch(actions.notifications.showSnackbar({ message: error.message, variant: "error" }));
    } 
  }, [JSON.stringify(state.fields), mutationCreateTransaction, props.onSuccess])
  
  const sheetRef = React.useRef<BottomSheet>(null);

  React.useEffect(() => {
    console.log(`Open: ${open}`);
    if (open) {
      sheetRef?.current?.snapTo(1);
    } else {
      sheetRef?.current?.close();
      props.onClose();
    }
  }, [open]);

  const snapPoints = React.useMemo(() => [0, 550], []);

  return (
    <Portal>
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        index={-1}
        onChange={(idx) => {
          if (idx <= 0) {
            props.onClose();
            sheetRef.current?.close();
          }
        }}
        backdropComponent={BottomSheetBackdrop}
        handleComponent={() =>
          <View style={[styles.sheetHeader, { backgroundColor: global.theme.colors.primary }]} />
        }
      >
          <BottomSheetView style={styles.sheet}>
            <CreditsForm />
            <View style={styles.buttonContainer}>
              <Button onPress={onSave} loading={createData.loading} mode="contained" style={styles.button}>
                Save
              </Button>
            </View>
          </BottomSheetView>
      </BottomSheet>
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