import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs, TabScreen } from 'react-native-paper-tabs';
import { TransactionType } from 'app/api/schema.d';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import CreditsForm from './CreditsForm';
import useCreditsForm from './useForm';

interface IDropzoneUserDialog {
  open?: boolean;
  dropzoneUser?: DropzoneUserEssentialsFragment;
  onClose(): void;
  onSuccess(): void;
}

export default function DropzoneUserDialog(props: IDropzoneUserDialog) {
  const { open, onClose, dropzoneUser, onSuccess } = props;
  const { onSubmit, control, setValue, loading } = useCreditsForm({
    onSuccess,
    dropzoneUser,
  });

  return (
    <DialogOrSheet
      // eslint-disable-next-line max-len
      {...{ open, loading, onClose }}
      disablePadding
      buttonLabel="Save"
      buttonAction={onSubmit}
      scrollable={false}
    >
      <View style={{ marginBottom: 24 }}>
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
      <View style={styles.form}>
        <CreditsForm {...{ control, dropzoneUser }} />
      </View>
    </DialogOrSheet>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingHorizontal: 16,
  },
});
