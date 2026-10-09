import { AppBar, Fade, LinearProgress, Toolbar } from '@mui/material';
import { DropzoneUserProfileFragment } from 'app/api/operations';
import { useDropzoneUserProfileLazyQuery } from 'app/api/reflection';
import DropzoneUserAutocomplete from 'app/components/autocomplete/DropzoneUserAutocomplete.web';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import * as React from 'react';
import { FormProvider } from 'react-hook-form';
import { DimensionValue, View, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import ManifestGroupForm from './ManifestGroupForm';
import useManifestGroupForm, { IManifestGroupInitial, toggleSlotUsers } from './useForm';

export interface IManifestGroupDialogProps extends IManifestGroupInitial {
  open?: boolean;
  onClose(): void;
  onSuccess?(): void;
}

export default function ManifestGroupDialog(props: IManifestGroupDialogProps) {
  const { open, load, slots, users, onClose, onSuccess } = props;
  const methods = useManifestGroupForm({
    load,
    slots,
    users,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });
  const { getValues, setValue, loading: saving, onSubmit } = methods;

  const [fetchProfile, { loading }] = useDropzoneUserProfileLazyQuery();
  const onSelectUser = React.useCallback(
    (profile: DropzoneUserProfileFragment) => {
      setValue('users', toggleSlotUsers(getValues('users'), [profile]), { shouldDirty: true });
    },
    [getValues, setValue]
  );

  return (
    <FormProvider {...methods}>
      <DialogOrSheet
        loading={saving}
        {...{ open }}
        disablePadding
        buttonLabel="Manifest"
        onClose={onClose}
        buttonAction={onSubmit}
        scrollable={false}
      >
        <View style={styles.wrapper} testID="manifest-group-sheet">
          <AppBar position="static">
            <Toolbar>
              <DropzoneUserAutocomplete
                color="white"
                placeholder="Search skydivers..."
                onChange={(user) => {
                  fetchProfile({
                    variables: {
                      id: user.id,
                    },
                  }).then((result) => {
                    if (result.data?.dropzoneUser) {
                      onSelectUser(result.data?.dropzoneUser);
                    }
                  });
                }}
              />
            </Toolbar>
          </AppBar>
          <Fade in={loading || saving}>
            <LinearProgress variant="indeterminate" />
          </Fade>
          <ScrollView testID="scroll-area">
            <ManifestGroupForm />
          </ScrollView>
        </View>
      </DialogOrSheet>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  wrapper: { height: '100%' },
  button: {
    width: '100%',
    borderRadius: 16,
    padding: 5,
    paddingTop: 0,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  userListContainer: {
    // CSS calc() is valid on web but not part of React Native's DimensionValue type
    height: 'calc(100% - 200px)' as unknown as DimensionValue,
    backgroundColor: 'white',
    width: '100%',
    padding: 16,
  },
  sheet: {
    elevation: 3,
    backgroundColor: 'white',
    flexGrow: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: 32,
  },
  sheetHeader: {
    elevation: 2,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    height: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    backgroundColor: 'white',
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
});
