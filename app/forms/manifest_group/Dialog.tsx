import * as React from 'react';
import { View } from 'react-native';
import { FormProvider, useWatch } from 'react-hook-form';
import { useTheme } from 'react-native-paper';
import { Tabs, TabScreen, TabsProvider } from 'react-native-paper-tabs';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import type { DropzoneUserEssentialsFragment } from 'app/api/operations';
import ManifestGroupForm from './ManifestGroupForm';
import UserListSelect from './UserListSelect';
import useManifestGroupForm, {
  IManifestGroupInitial,
  SlotUserWithRig,
  toggleSlotUsers,
} from './useForm';

export interface IManifestGroupDialogProps extends IManifestGroupInitial {
  open?: boolean;
  onClose(): void;
  onSuccess?(): void;
}

export default function ManifestGroupDialog(props: IManifestGroupDialogProps) {
  const { open, load, slots, users: initialUsers, onClose, onSuccess } = props;
  const methods = useManifestGroupForm({
    load,
    slots,
    users: initialUsers,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });
  const { control, getValues, setValue, loading, onSubmit } = methods;
  const users = useWatch({ control, name: 'users' });

  const [tabIndex, setTabIndex] = React.useState(0);
  React.useEffect(() => {
    if (!users?.length) {
      setTabIndex(0);
    }
  }, [users?.length]);

  const onNext = React.useCallback(async () => {
    if (tabIndex === 0) {
      setTabIndex(1);
      return;
    }
    await onSubmit();
  }, [onSubmit, tabIndex]);

  const onDismiss = React.useCallback(() => {
    setTimeout(() => {
      requestAnimationFrame(() => {
        onClose();
        setTabIndex(0);
      });
    });
  }, [onClose]);

  const onSelect = React.useCallback(
    (dropzoneUser: DropzoneUserEssentialsFragment) => {
      if (tabIndex === 0 && dropzoneUser) {
        setValue('users', toggleSlotUsers(getValues('users'), [dropzoneUser]), {
          shouldDirty: true,
        });
      }
    },
    [getValues, setValue, tabIndex]
  );

  const theme = useTheme();
  const handleStyles = React.useMemo(
    () => ({ backgroundColor: theme.colors.primary }),
    [theme.colors.primary]
  );

  const StickyHeader = React.useCallback(
    () => (
      <View pointerEvents={(users?.length || 0) > 0 ? undefined : 'none'}>
        <TabsProvider defaultIndex={tabIndex} onChangeIndex={setTabIndex}>
          <Tabs mode="fixed">
            <TabScreen label="Create group">
              <View />
            </TabScreen>
            <TabScreen label="Configure jump">
              <View />
            </TabScreen>
          </Tabs>
        </TabsProvider>
      </View>
    ),
    [users?.length, tabIndex]
  );

  return (
    <FormProvider {...methods}>
      <DialogOrSheet
        loading={loading}
        {...{ open, handleStyles }}
        buttonLabel={tabIndex === 1 ? 'Manifest' : 'Next'}
        onClose={onDismiss}
        buttonAction={onNext}
        handle={<StickyHeader />}
        scrollable
      >
        {tabIndex === 0 ? (
          <View style={{ paddingHorizontal: 8, marginTop: 8, marginBottom: 100 }}>
            <UserListSelect
              hideButton
              scrollable={false}
              {...{ onSelect, value: users as SlotUserWithRig[] }}
            />
          </View>
        ) : (
          <ManifestGroupForm />
        )}
      </DialogOrSheet>
    </FormProvider>
  );
}
