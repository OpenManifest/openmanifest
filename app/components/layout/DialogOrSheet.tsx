import { pick, sortBy, isEqual, uniq } from 'lodash';
import * as React from 'react';
import { View, StyleSheet, Keyboard, Easing } from 'react-native';
import { Button, Title } from 'react-native-paper';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

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
  const sheetRef = React.useRef<BottomSheetModal>(null);
  const snappingPoints = React.useMemo(
    () => sortBy(uniq([0, ...(snapPoints || [600])])).filter((s) => s !== 0),
    [snapPoints]
  );

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

  const memoizedClose = React.useMemo(() => onClose, [onClose]);

  const onDismiss = React.useCallback(() => {
    setTimeout(() => {
      requestAnimationFrame(() => memoizedClose());
    });
  }, [memoizedClose]);

  const show = () => {
    'worklet';

    sheetRef.current?.present();
  };

  const hide = () => {
    'worklet';

    sheetRef.current?.dismiss(300);
    setTimeout(onDismiss, 350);
  };

  React.useEffect(() => {
    if (open) {
      show();
      // sheetRef.current?.snapTo(snappingPoints?.length - 1, 300);
    } else {
      hide();
    }
  }, [onDismiss, open]);

  const HandleComponent = React.useMemo(
    () => () =>
      !title ? (
        <View style={styles.sheetHeader}>
          <View style={styles.handle} />
        </View>
      ) : (
        <View style={styles.sheetHeaderWithTitle}>
          <View style={styles.handle} />
          <Title>{title}</Title>
        </View>
      ),
    [title]
  );

  return (
    <BottomSheetModal
      dismissOnPanDown
      onDismiss={onDismiss}
      ref={sheetRef}
      snapPoints={snappingPoints}
      backdropComponent={BottomSheetBackdrop}
      index={(snappingPoints?.length || 1) - 1}
      handleComponent={HandleComponent}
    >
      <BottomSheetScrollView
        style={{ backgroundColor: '#FFFFFF' }}
        contentContainerStyle={[styles.sheet, { paddingBottom: keyboardVisible ? 400 : 80 }]}
      >
        {children}
        <Button onPress={buttonAction} mode="contained" style={styles.button} loading={loading}>
          {buttonLabel}
        </Button>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: 16,
    padding: 5,
    alignSelf: 'flex-end',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#AAAAAA',
    alignSelf: 'center',
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
    paddingTop: 4,
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

const x = React.memo(DialogOrSheet, (a, b) => {
  return isEqual(
    pick(a, ['loading', 'open', 'buttonAction']),
    pick(b, ['loading', 'open', 'buttonAction'])
  );
});
