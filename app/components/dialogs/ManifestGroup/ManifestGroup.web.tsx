import { AppBar, Fade, LinearProgress, Toolbar } from '@mui/material';
import { DropzoneUserProfileFragment } from 'app/api/operations';
import { useManifestGroupMutation, useDropzoneUserProfileLazyQuery } from 'app/api/reflection';
import DropzoneUserAutocomplete from 'app/components/autocomplete/DropzoneUserAutocomplete.web';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import { useNotifications } from 'app/providers/notifications';
import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import ManifestGroupForm from '../../forms/manifest_group/ManifestGroupForm';

interface IManifestUserDialog {
  open?: boolean;
  onClose(): void;
}

export default function ManifestUserDialog(props: IManifestUserDialog) {
  const { open, onClose } = props;
  const notify = useNotifications();
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.forms.manifestGroup);
  const [mutationCreateSlots, mutationData] = useManifestGroupMutation();

  const validate = React.useCallback(() => {
    let hasErrors = false;
    if (!state.fields.jumpType.value?.id) {
      hasErrors = true;
      dispatch(
        actions.forms.manifestGroup.setFieldError(['jumpType', 'You must specify the type of jump'])
      );
    }

    if (!state.fields.ticketType.value?.id) {
      hasErrors = true;
      dispatch(
        actions.forms.manifestGroup.setFieldError([
          'ticketType',
          'You must select a ticket type to manifest',
        ])
      );
    }

    return !hasErrors;
  }, [dispatch, state.fields.jumpType.value?.id, state.fields.ticketType.value?.id]);

  const onManifest = React.useCallback(async () => {
    if (!validate() || !state.fields.users.value?.length) {
      return;
    }
    try {
      const result = await mutationCreateSlots({
        variables: {
          jumpType: state.fields.jumpType.value?.id,
          ticketType: state.fields.ticketType.value?.id,
          groupNumber: state.fields?.groupNumber?.value || null,
          extras: state.fields.extras?.value?.map(({ id }) => id),
          load: state.fields.load.value?.id,
          userGroup: state.fields.users.value?.map(
            ({ id, exitWeight, rigId, rig, passengerName, passengerExitWeight }) => ({
              id,
              rig: rigId?.toString() || rig?.id || undefined,
              exitWeight,
              passengerName,
              passengerExitWeight,
            })
          ),
        },
      });

      result.data?.createSlots?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case 'jump_type':
          case 'jump_type_id':
            return dispatch(actions.forms.manifestGroup.setFieldError(['jumpType', message]));
          case 'load':
            return dispatch(actions.forms.manifestGroup.setFieldError(['load', message]));
          case 'credits':
          case 'extras':
          case 'extra_ids':
            return dispatch(actions.forms.manifestGroup.setFieldError(['extras', message]));
          case 'ticket_type':
            return dispatch(actions.forms.manifestGroup.setFieldError(['ticketType', message]));
          default:
            return null;
        }
      });
      if (result?.data?.createSlots?.errors?.length) {
        notify.error(result?.data?.createSlots?.errors[0]);
        return;
      }
      if (!result.data?.createSlots?.fieldErrors?.length) {
        onClose();
      }
    } catch (error) {
      if (error instanceof Error) {
        notify.error(error.message);
      }
    }
  }, [
    validate,
    state.fields.users.value,
    state.fields.jumpType.value?.id,
    state.fields.ticketType.value?.id,
    state.fields?.groupNumber?.value,
    state.fields.extras?.value,
    state.fields.load.value?.id,
    mutationCreateSlots,
    dispatch,
    notify,
    onClose,
  ]);

  // dispatch(actions.forms.manifestGroup.setDropzoneUsers(screens.manifest.selectedUsers));

  const [fetchProfile, { loading }] = useDropzoneUserProfileLazyQuery();
  const onSelectUser = React.useCallback(
    (profile: DropzoneUserProfileFragment) => {
      dispatch(actions.forms.manifestGroup.setDropzoneUsers([profile]));
    },
    [dispatch]
  );
  return (
    <DialogOrSheet
      // eslint-disable-next-line max-len
      loading={mutationData.loading}
      {...{ open }}
      disablePadding
      buttonLabel="Manifest"
      onClose={() => {
        dispatch(actions.forms.manifestGroup.reset());
        onClose();
      }}
      buttonAction={onManifest}
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
        <Fade in={loading || mutationData.loading}>
          <LinearProgress variant="indeterminate" />
        </Fade>
        <ScrollView testID="scroll-area">
          <ManifestGroupForm />
        </ScrollView>
      </View>
    </DialogOrSheet>
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
    height: 'calc(100% - 200px)',
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
