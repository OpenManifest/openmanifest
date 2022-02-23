import { useManifestGroupMutation } from 'app/api/reflection';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import { omit } from 'lodash';
import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs, TabScreen } from 'react-native-paper-tabs';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import ManifestGroupForm from '../../forms/manifest_group/ManifestGroupForm';
import UserListSelect from './UserListSelect';

interface IManifestUserDialog {
  open?: boolean;
  onClose(): void;
}

export default function ManifestUserDialog(props: IManifestUserDialog) {
  const { open, onClose } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.forms.manifestGroup);
  const [mutationCreateSlots, mutationData] = useManifestGroupMutation();
  const { screens } = useAppSelector((root) => root);
  const [tabIndex, setTabIndex] = React.useState(0);

  React.useEffect(() => {
    if (!state?.fields?.users?.value?.length) {
      setTabIndex(0);
    }
  }, [state?.fields?.users?.value?.length]);

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
          jumpTypeId: Number(state.fields.jumpType.value?.id),
          ticketTypeId: Number(state.fields.ticketType.value?.id),
          extraIds: state.fields.extras?.value?.map(({ id }) => Number(id)),
          loadId: Number(state.fields.load.value?.id),
          userGroup: state.fields.users.value?.map((slotUserWithRig) =>
            omit(slotUserWithRig, ['rig'])
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
        dispatch(
          actions.notifications.showSnackbar({
            message: result?.data?.createSlots?.errors[0],
            variant: 'error',
          })
        );
        return;
      }
      if (!result.data?.createSlots?.fieldErrors?.length) {
        onClose();
      }
    } catch (error) {
      if (error instanceof Error) {
        dispatch(
          actions.notifications.showSnackbar({
            message: error.message,
            variant: 'error',
          })
        );
      }
    }
  }, [
    dispatch,
    mutationCreateSlots,
    onClose,
    state.fields.extras?.value,
    state.fields.jumpType.value?.id,
    state.fields.load.value?.id,
    state.fields.ticketType.value?.id,
    state.fields.users.value,
    validate,
  ]);

  const onNext = React.useCallback(() => {
    if (tabIndex === 0) {
      dispatch(actions.forms.manifestGroup.setDropzoneUsers(screens.manifest.selectedUsers));
      setTabIndex(1);
    } else {
      onManifest();
    }
  }, [dispatch, onManifest, screens.manifest.selectedUsers, tabIndex]);

  return (
    <DialogOrSheet
      // eslint-disable-next-line max-len
      loading={mutationData.loading}
      {...{ open }}
      disablePadding
      buttonLabel={tabIndex === 0 ? 'Next' : 'Manifest'}
      onClose={() => {
        setTabIndex(0);
        dispatch(actions.forms.manifestGroup.reset());
        onClose();
      }}
      buttonAction={onNext}
      scrollable={false}
    >
      <View style={styles.wrapper} testID="manifest-group-sheet">
        <View pointerEvents={(state.fields.users?.value?.length || 0) > 0 ? undefined : 'none'}>
          <Tabs defaultIndex={tabIndex} mode="fixed" onChangeIndex={setTabIndex}>
            <TabScreen label="Create group">
              <View />
            </TabScreen>
            <TabScreen label="Configure jump">
              <View />
            </TabScreen>
          </Tabs>
        </View>

        {tabIndex === 0 ? (
          <View style={styles.userListContainer}>
            <UserListSelect
              containerProps={{
                style: {
                  marginTop: 8,
                  height: 'calc(100% - 216px)',
                },
              }}
              scrollable
              hideButton
              onNext={() => setTabIndex(1)}
            />
          </View>
        ) : (
          <ManifestGroupForm />
        )}
      </View>
    </DialogOrSheet>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: 'white' },
  button: {
    width: '100%',
    borderRadius: 16,
    padding: 5,
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
