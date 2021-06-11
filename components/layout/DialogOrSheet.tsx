import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Portal, Title } from "react-native-paper";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

interface IBottomSheetProps {
  open?: boolean;
  buttonLabel?: string;
  children: React.ReactNode;
  loading?: boolean;
  title?: string;

  snapPoints?: Array<string | number>;
  buttonAction?(): void;
  onClose(): void;
}

export default function DialogOrSheet(props: IBottomSheetProps) {
  const { open, snapPoints, onClose, title, buttonLabel, buttonAction, loading, children } = props;

  const sheetRef = React.useRef<BottomSheet>(null);

  const snappingPoints = snapPoints || [600, 0];

  React.useEffect(() => {
    if (open) {
      sheetRef?.current?.snapTo(snappingPoints?.length - 2);
      console.log("Oh snap!");
    } else {
      sheetRef?.current?.snapTo(snappingPoints?.length - 1);
      console.log("Oh snap1!");
    }
  }, [open]);

  return (
    <Portal>
      <BottomSheet
        ref={sheetRef}
        snapPoints={snappingPoints}
        index={-1}
        onChange={(e) => {
          if (e < 1) {
            onClose();
          }
        }}
        handleComponent={() =>
          !title
            ? <View style={styles.sheetHeader} />
            : <View style={styles.sheetHeaderWithTitle}>
                <Title>{title}</Title>
              </View>
        }
        
       >
         <BottomSheetScrollView style={{ backgroundColor: "#FFFFFF" }} contentContainerStyle={styles.sheet}>
            { children }
            <Button
              onPress={buttonAction}
              mode="contained"
              style={styles.button}
              loading={loading}
            >
              { buttonLabel }
            </Button>
          </BottomSheetScrollView>
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
    paddingBottom: 30,
    paddingHorizontal: 16,
    elevation: 3,
    backgroundColor: "white",
    flexGrow: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  sheetHeader: {
    zIndex: 10000,
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
  },
  sheetHeaderWithTitle: {
    zIndex: 10000,
    elevation: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 56,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    backgroundColor: "white",
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    paddingLeft: 16,
    paddingTop: 16,
  }

})