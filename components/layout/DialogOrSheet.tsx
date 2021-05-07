import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Portal, Title } from "react-native-paper";
import BottomSheetBehavior from "reanimated-bottom-sheet";
import ReanimatedBottomSheet from "reanimated-bottom-sheet";
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

  const sheetRef = useRef<BottomSheetBehavior>(null);

  const snappingPoints = snapPoints || [600, 0];

  useEffect(() => {
    if (open) {
      sheetRef?.current?.snapTo(snappingPoints?.length - 2);
    } else {
      sheetRef?.current?.snapTo(snappingPoints?.length - 1);
    }
  }, [open]);

  return (
    <Portal>
      <ReanimatedBottomSheet
        ref={sheetRef}
        snapPoints={snappingPoints}
        initialSnap={snappingPoints.length - 1}
        onCloseEnd={() => {
          onClose();
        }}
        renderHeader={() =>
          !title
            ? <View style={styles.sheetHeader} />
            : <View style={styles.sheetHeaderWithTitle}>
                <Title>{title}</Title>
              </View>
        }
        renderContent={() => 
          <ScrollView style={{ backgroundColor: "#FFFFFF" }} contentContainerStyle={styles.sheet}>
            { children }
            <Button
              onPress={buttonAction}
              mode="contained"
              style={styles.button}
              loading={loading}
            >
              { buttonLabel }
            </Button>
          </ScrollView>
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