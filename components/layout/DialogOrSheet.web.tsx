import React from "react";
import { StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Dialog, Portal, ProgressBar } from "react-native-paper";
import { useAppSelector } from "../../redux";
interface IBottomSheetProps {
  open?: boolean;
  title?: string;
  buttonLabel?: string;
  children: React.ReactNode;
  loading?: boolean;

  snapPoints?: Array<string | number>;
  buttonAction?(): void;
  onClose(): void;
}

export default function DialogOrSheet(props: IBottomSheetProps) {
  const { buttonLabel, buttonAction, title, loading, children } = props;
  const globalState = useAppSelector(state => state.global);

  return (
    <Portal>
      <Dialog visible={!!props.open} dismissable={false} style={{ maxWidth: 500, alignSelf: "center" }}>
        <ProgressBar indeterminate visible={loading} color={globalState.theme.colors.accent} />
        <Dialog.Title>
          { title }
        </Dialog.Title>
        <Dialog.Content pointerEvents="box-none">
          <Dialog.ScrollArea>
            <ScrollView>
              { children }
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog.Content>
        <Dialog.Actions style={{ justifyContent: "flex-end"}}>
          <Button
            onPress={() => {
              props.onClose();
            }}
          >
            Cancel
          </Button>
          
          <Button onPress={buttonAction}>
            { buttonLabel }
          </Button>
        </Dialog.Actions>
      </Dialog>
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