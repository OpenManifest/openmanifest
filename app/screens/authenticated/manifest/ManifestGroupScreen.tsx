import * as React from 'react';
import { omit } from 'lodash';
import { Button, Card, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import { useManifestGroupMutation } from 'app/api/reflection';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import ManifestGroupForm from 'app/components/forms/manifest_group/ManifestGroupForm';

interface IManifestGroupScreen {
  onSuccess(): void;
}

export default function ManifestGroupScreen(props: IManifestGroupScreen) {
  const { onSuccess } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.forms.manifestGroup);
  const globalState = useAppSelector((root) => root.global);
  const [mutationCreateSlots, mutationData] = useManifestGroupMutation();
  const navigation = useNavigation();

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
          userGroup: state.fields.users.value.map((slotUserWithRig) =>
            omit(slotUserWithRig, ['rig'])
          ),
        },
      });

      result.data?.createSlots?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case 'jump_type':
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
        onSuccess?.();
        navigation.navigate('Manifest', { screen: 'DropzoneScreen' });
      }
    } catch (error) {
      dispatch(
        actions.notifications.showSnackbar({
          message: error.message,
          variant: 'error',
        })
      );
    }
  }, [
    dispatch,
    mutationCreateSlots,
    navigation,
    onSuccess,
    state.fields.extras?.value,
    state.fields.jumpType.value?.id,
    state.fields.load.value?.id,
    state.fields.ticketType.value?.id,
    state.fields.users.value,
    validate,
  ]);

  return (
    <ScrollableScreen>
      <ProgressBar
        indeterminate
        visible={mutationData.loading}
        color={globalState.theme.colors.accent}
      />
      <Card.Title
        // eslint-disable-next-line max-len
        title={`Manifest ${state?.fields?.users?.value?.length} jumpers on Load #${state.fields.load?.value?.loadNumber}`}
      />
      <ManifestGroupForm />
      <Button
        mode="contained"
        style={{ width: '100%', marginVertical: 16 }}
        onPress={() => onManifest()}
        loading={mutationData.loading}
      >
        Save
      </Button>
    </ScrollableScreen>
  );
}
