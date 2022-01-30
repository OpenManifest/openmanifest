import { sortBy, uniq } from 'lodash';
import * as React from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { Button, Title, useTheme } from 'react-native-paper';
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

    sheetRef.current?.dismiss({ duration: 300 });
    setTimeout(onDismiss, 350);
  };

  React.useEffect(() => {
    if (open) {
      show();
      // sheetRef.current?.snapTo(snappingPoints?.length - 1, 300);
    } else {
      hide();
    }
    // We dont want to refresh everytime anything else changes,
    // this is intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDismiss, open]);
  const theme = useTheme();
  const HandleComponent = React.useCallback(() => {
    return !title ? (
      <View
        style={[
          styles.sheetHeader,
          { shadowColor: theme.colors.onSurface, backgroundColor: theme.colors.surface },
        ]}
      >
        <View style={styles.handle} />
      </View>
    ) : (
      <View
        style={[
          styles.sheetHeaderWithTitle,
          {
            shadowColor: theme.colors.onSurface,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <View style={styles.handle} />
        <Title>{title}</Title>
      </View>
    );
  }, [theme.colors.onSurface, theme.colors.surface, title]);

  return (
    <BottomSheetModal
      enableContentPanningGesture
      enableDismissOnClose
      enableOverDrag
      enablePanDownToClose
      enableHandlePanningGesture
      name="abc"
      onDismiss={onDismiss}
      ref={sheetRef}
      snapPoints={snappingPoints}
      backdropComponent={(a) => <BottomSheetBackdrop {...a} pressBehavior="close" />}
      index={(snappingPoints?.length || 1) - 1}
      handleComponent={HandleComponent}
    >
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.sheet,
          { paddingBottom: keyboardVisible ? 400 : 80, backgroundColor: theme.colors.surface },
        ]}
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
    padding: 5,
    alignSelf: 'flex-end',
    borderRadius: 20,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  sheetHeader: {
    zIndex: 10000,
    elevation: 2,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 40,
    paddingTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sheetHeaderWithTitle: {
    zIndex: 10000,
    elevation: 2,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    height: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    paddingLeft: 16,
    paddingTop: 16,
  },
});
