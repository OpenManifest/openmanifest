import * as React from 'react';
import { StyleSheet } from 'react-native';
import { FAB, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import useMutationUpdateDropzone from 'app/api/hooks/useMutationUpdateDropzone';
import { actions, useAppSelector, useAppDispatch } from 'app/state';

import { Permission } from 'app/api/schema.d';
import DropzoneForm from 'app/components/forms/dropzone/DropzoneForm';
import useRestriction from 'app/hooks/useRestriction';
import { DropzoneEssentialsFragment } from 'app/api/operations';
import { Screen } from 'app/components/layout';
import { useNotifications } from 'app/providers/notifications';

export default function UpdateDropzoneScreen() {
  const state = useAppSelector((root) => root.forms.dropzone);
  const globalState = useAppSelector((root) => root.global);
  const notify = useNotifications();
  const dispatch = useAppDispatch();

  const navigation = useNavigation();

  const {
    dropzone: { dropzone, loading },
  } = useDropzoneContext();

  React.useEffect(() => {
    if (dropzone?.id) {
      dispatch(actions.forms.dropzone.setOpen(dropzone));
    }
  }, [dropzone, dropzone?.id, dispatch]);

  const mutationUpdateDropzone = useMutationUpdateDropzone({
    onError: (message) => notify.error(message),
    onSuccess: (payload) => {
      if (payload?.dropzone?.id) {
        dispatch(
          actions.global.setDropzone({
            ...(globalState.currentDropzone || {}),
            ...payload?.dropzone,
          })
        );
        notify.success(`Your settings have been saved`);
        navigation.goBack();
      }
    },
  });

  const onSave = React.useCallback(async () => {
    let hasError = false;
    const {
      name,
      banner,
      federation,
      lat,
      lng,
      primaryColor,
      secondaryColor,
      isCreditSystemEnabled,
    } = state.fields;

    if (!name.value?.length || name.value?.length < 3) {
      hasError = true;
      dispatch(actions.forms.dropzone.setFieldError(['name', 'Name is too short']));
    }

    if (!hasError) {
      try {
        const result = await mutationUpdateDropzone.mutate({
          id: Number(dropzone?.id),
          name: name.value as string,
          lat: lat.value,
          lng: lng.value,
          banner: banner.value || null,
          primaryColor: primaryColor.value,
          secondaryColor: secondaryColor.value,
          federation: Number(federation?.value?.id),
          isCreditSystemEnabled: !!isCreditSystemEnabled,
        });

        result?.fieldErrors?.map(({ field, message }) => {
          switch (field) {
            case 'federation':
            case 'federation_id':
              return dispatch(actions.forms.dropzone.setFieldError(['federation', message]));
            case 'banner':
              return dispatch(actions.forms.dropzone.setFieldError(['banner', message]));
            case 'primary_color':
              return dispatch(actions.forms.dropzone.setFieldError(['primaryColor', message]));
            case 'secondary_color':
              return dispatch(actions.forms.dropzone.setFieldError(['secondaryColor', message]));
            case 'is_credit_system_enabled':
              return dispatch(
                actions.forms.dropzone.setFieldError(['isCreditSystemEnabled', message])
              );
            case 'name':
              return dispatch(actions.forms.dropzone.setFieldError(['name', message]));
            case 'is_public':
              return dispatch(actions.forms.dropzone.setFieldError(['isPublic', message]));
            default:
              return null;
          }
        });
        return null;
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    }
    return null;
  }, [state.fields, dispatch, mutationUpdateDropzone, dropzone?.id, notify]);

  const canUpdateDropzone = useRestriction(Permission.UpdateDropzone);

  const isDirty: boolean = React.useMemo(() => {
    return ['banner', 'isCreditSystemEnabled', 'name', 'primaryColor', 'lat', 'lng'].some(
      (field) =>
        state.original &&
        field in state.original &&
        state.original[field as keyof DropzoneEssentialsFragment] !==
          state.fields[field as keyof typeof state.fields].value
    );
  }, [state]);
  return (
    <>
      <ProgressBar indeterminate color={globalState.theme.colors.primary} visible={loading} />
      <Screen fullWidth={false}>
        <DropzoneForm loading={loading} />
      </Screen>
      <FAB
        style={[styles.fab, { backgroundColor: globalState.theme.colors.primary }]}
        visible={Boolean(canUpdateDropzone && isDirty)}
        disabled={!isDirty || mutationUpdateDropzone.loading}
        small
        icon="check"
        onPress={onSave}
        label="Save"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    display: 'flex',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    marginTop: 0,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  fields: {
    width: '100%',
    marginBottom: 16,
  },
  field: {
    marginBottom: 8,
  },
});
