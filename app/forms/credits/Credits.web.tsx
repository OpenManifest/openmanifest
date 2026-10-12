import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs, TabScreen, TabsProvider } from 'react-native-paper-tabs';
import { TransactionType } from 'app/api/schema.d';
import { MembershipEssentialsFragment } from 'app/api/operations';
import CreditsForm from './CreditsForm';
import useCreditsForm from './useForm';

interface IMembershipDialog {
  open?: boolean;
  membership?: MembershipEssentialsFragment;
  onClose(): void;
  onSuccess(): void;
}

export default function MembershipDialog(props: IMembershipDialog) {
  const { open, onClose, membership, onSuccess } = props;
  const { onSubmit, control, setValue, loading } = useCreditsForm({
    onSuccess,
    membership,
  });

  return (
    <DialogOrSheet
      {...{ open, loading, onClose }}
      disablePadding
      buttonLabel="Save"
      buttonAction={onSubmit}
      scrollable={false}
    >
      <View style={{ marginBottom: 24 }}>
        <TabsProvider
          defaultIndex={0} // default = 0
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
      </View>
      <View style={styles.form}>
        <CreditsForm {...{ control, membership }} />
      </View>
    </DialogOrSheet>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingHorizontal: 16,
  },
});
