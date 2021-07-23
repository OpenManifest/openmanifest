import { sortBy, uniq } from 'lodash';
import * as React from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { Button, Portal, Title } from 'react-native-paper';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

interface IBottomSheetProps {
  open?: boolean;
  buttonLabel?: string;
  children: React.ReactNode;
  loading?: boolean;
  title?: string;

  snapPoints?: (string | number)[];
  buttonAction?(): void;
  onClose(): void;
}

export default function DialogOrSheet(props: IBottomSheetProps) {
  const { open, snapPoints, onClose, title, buttonLabel, buttonAction, loading, children } = props;
  const sheetRef = React.useRef<BottomSheet>(null);
  const snappingPoints = React.useMemo(
    () => sortBy(uniq([0, ...(snapPoints || [600])])),
    [snapPoints]
  );
  const [currentIndex, setIndex] = React.useState(-1);

  const [keyboardVisible, setKeyboardVisible] = React.useState(false);

  const onKeyboardVisible = () => setKeyboardVisible(true);
  const onKeyboardHidden = () => setKeyboardVisible(false);

  React.useEffect(() => {
    Keyboard.addListener('keyboardDidShow', onKeyboardVisible);
    Keyboard.addListener('keyboardDidHide', onKeyboardHidden);

    return () => {
      Keyboard.removeListener('keyboardDidShow', onKeyboardVisible);
      Keyboard.removeListener('keyboardDidHide', onKeyboardHidden);
    };
  }, []);

  React.useEffect(() => {
    if (open) {
      sheetRef?.current?.snapTo(snappingPoints?.length - 1);
    } else {
      setIndex(-1);
      sheetRef?.current?.close();
    }
  }, [open, snappingPoints?.length]);

  React.useEffect(() => {
    if (open) {
      sheetRef?.current?.snapTo(snappingPoints?.length - 1);
    } else {
      setIndex(-1);
      sheetRef?.current?.close();
    }
  }, [open, snappingPoints?.length]);

  React.useEffect(() => {
    if (open && currentIndex < 0) {
      sheetRef?.current?.snapTo(snappingPoints?.length - 1);
    } else if (!open && currentIndex > -1) {
      setIndex(-1);
      sheetRef?.current?.close();
    }
  }, [currentIndex, open, snappingPoints?.length]);

  return (
    <Portal>
      <BottomSheet
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        ref={sheetRef}
        backdropComponent={BottomSheetBackdrop}
        snapPoints={snappingPoints}
        index={-1}
        onChange={(toIndex) => {
          setIndex(toIndex);
          if (toIndex <= 0) {
            onClose();
            Keyboard.dismiss();
            sheetRef?.current?.close();
          }
        }}
        handleComponent={() =>
          !title ? (
            <View style={styles.sheetHeader} />
          ) : (
            <View style={styles.sheetHeaderWithTitle}>
              <Title>{title}</Title>
            </View>
          )
        }
      >
        <BottomSheetScrollView
          style={{ backgroundColor: '#FFFFFF' }}
          contentContainerStyle={[styles.sheet, { paddingBottom: keyboardVisible ? 400 : 0 }]}
        >
          {children}
          <Button onPress={buttonAction} mode="contained" style={styles.button} loading={loading}>
            {buttonLabel}
          </Button>
        </BottomSheetScrollView>
      </BottomSheet>
    </Portal>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
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
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  sheetHeader: {
    zIndex: 10000,
    elevation: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    backgroundColor: 'white',
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sheetHeaderWithTitle: {
    zIndex: 10000,
    elevation: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    backgroundColor: 'white',
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    paddingLeft: 16,
    paddingTop: 16,
  },
});
