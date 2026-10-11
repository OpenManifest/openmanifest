import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import Sheet from 'app/components/layout/Sheet';

import { Tabs, TabScreen, TabsProvider } from 'react-native-paper-tabs';
import { DropzoneUserDetailsFragment, OrderEssentialsFragment } from 'app/api/operations';
import { TransactionType } from 'app/api/schema.d';
import useCreditsForm from './useForm';
import CreditsForm from './CreditsForm';
import { useAppTheme } from 'app/theme';

export interface ICreditsSheet {
  open?: boolean;
  dropzoneUser?: DropzoneUserDetailsFragment;
  onClose(): void;
  onSuccess?(order: OrderEssentialsFragment): void;
}

function HandleComponent() {
  const { theme } = useAppTheme();
  return <View style={[styles.sheetHeader, { backgroundColor: theme.colors.primary }]} />;
}

export default function CreditSheet(props: ICreditsSheet) {
  const { open, dropzoneUser, onClose, onSuccess } = props;
  const { onSubmit, control, setValue, loading } = useCreditsForm({
    onSuccess,
    dropzoneUser,
  });

  return (
    <Sheet
      name="credits-modal"
      testID="credits-sheet"
      {...{ open, onClose }}
      disablePadding
      handle={<HandleComponent />}
      header={
        <TabsProvider
          defaultIndex={0}
          onChangeIndex={(newIndex) => {
            setValue('type', newIndex === 1 ? TransactionType.Withdrawal : TransactionType.Deposit);
          }}
        >
          <Tabs mode="fixed">
            <TabScreen label="Deposit" icon="arrow-up">
              <View />
            </TabScreen>
            <TabScreen label="Withdraw" icon="arrow-down">
              <View />
            </TabScreen>
          </Tabs>
        </TabsProvider>
      }
    >
      <View style={styles.sheet}>
        <CreditsForm {...{ control, dropzoneUser }} />
        <View style={styles.buttonContainer}>
          <Button onPress={onSubmit} {...{ loading }} mode="contained" style={styles.button}>
            Save
          </Button>
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: 16,
    padding: 5,
  },
  buttonContainer: {
    paddingHorizontal: 16,
  },
  sheet: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: 'column',
  },
  sheetHeader: {
    elevation: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
});
