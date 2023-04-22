import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { Tabs, TabScreen } from 'react-native-paper-tabs';
import { DropzoneUserDetailsFragment, OrderEssentialsFragment } from 'app/api/operations';
import useKeyboardVisibility from 'app/hooks/useKeyboardVisibility';
import { useAppSelector } from 'app/state';
import { TransactionType } from 'app/api/schema.d';
import useCreditsForm from './useForm';
import CreditsForm from './CreditsForm';

export interface ICreditsSheet {
  open?: boolean;
  dropzoneUser?: DropzoneUserDetailsFragment;
  onClose(): void;
  onSuccess?(order: OrderEssentialsFragment): void;
}

function HandleComponent() {
  const { theme } = useAppSelector((state) => state.global);
  return <View style={[styles.sheetHeader, { backgroundColor: theme.colors.primary }]} />;
}

export default function CreditSheet(props: ICreditsSheet) {
  const { open, dropzoneUser, onClose, onSuccess } = props;
  const { onSubmit, control, setValue, loading } = useCreditsForm({
    onSuccess,
    dropzoneUser
  });
  const keyboardVisible = useKeyboardVisibility();
  const sheetRef = React.useRef<BottomSheetModal>(null);

  const snapPoints = React.useMemo(() => [550], []);

  const memoizedClose = React.useMemo(() => onClose, [onClose]);

  const onDismiss = React.useCallback(() => {
    setTimeout(() => {
      requestAnimationFrame(() => memoizedClose());
    });
  }, [memoizedClose]);

  const show = () => {
    sheetRef.current?.present();
  };

  const hide = () => {
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
    // Intentional to not open/close the sheet every time these change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDismiss, open]);

  return (
    <BottomSheetModal
      name="credits-modal"
      ref={sheetRef}
      snapPoints={snapPoints}
      onDismiss={onDismiss}
      index={0}
      backdropComponent={BottomSheetBackdrop}
      handleComponent={HandleComponent}
    >
      <View style={{ backgroundColor: 'white', flexGrow: 1 }} testID="credits-sheet">
        <View>
          <Tabs
            defaultIndex={0} // default = 0
            onChangeIndex={(newIndex) => {
              setValue('type', newIndex === 1 ? TransactionType.Withdrawal : TransactionType.Deposit);
            }}
            mode="fixed"
          >
            <TabScreen label="Deposit" icon="arrow-up">
              <View />
            </TabScreen>
            <TabScreen label="Withdraw" icon="arrow-down">
              <View />
            </TabScreen>
          </Tabs>
        </View>

        <BottomSheetScrollView
          style={{ flex: 1, flexGrow: 1, width: '100%', height: '100%' }}
          contentContainerStyle={[styles.sheet, { paddingBottom: keyboardVisible ? 400 : 80 }]}
        >
          <CreditsForm {...{ control, dropzoneUser }} />
          <View style={styles.buttonContainer}>
            <Button onPress={onSubmit} {...{ loading }} mode="contained" style={styles.button}>
              Save
            </Button>
          </View>
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: 16,
    padding: 5
  },
  buttonContainer: {
    paddingHorizontal: 16
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32
  },
  sheet: {
    paddingBottom: 30,
    paddingHorizontal: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: 1
  },
  sheetHeader: {
    elevation: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4
    },
    backgroundColor: 'white',
    shadowOpacity: 0.22,
    shadowRadius: 2.22
  }
});
