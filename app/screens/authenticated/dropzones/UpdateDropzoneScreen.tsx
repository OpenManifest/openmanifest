import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button, ProgressBar } from 'react-native-paper';
import { gql } from '@apollo/client';
import { useNavigation, useRoute } from '@react-navigation/core';
import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';
import useMutationUpdateDropzone from '../../../api/hooks/useMutationUpdateDropzone';
import { actions, useAppSelector, useAppDispatch } from '../../../state';

import { View } from '../../../components/Themed';
import { Dropzone } from '../../../api/schema';
import DropzoneForm from '../../../components/forms/dropzone/DropzoneForm';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';

export default function UpdateDropzoneScreen() {
  const state = useAppSelector((root) => root.forms.dropzone);
  const globalState = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();

  const route = useRoute<{ key: string; name: string; params: { dropzone: Dropzone } }>();
  const { dropzone } = route.params;
  const navigation = useNavigation();

  const { data, currentUser, loading } = useCurrentDropzone();

  React.useEffect(() => {
    if (data?.dropzone?.id) {
      dispatch(actions.forms.dropzone.setOpen(data.dropzone));
    }
  }, [data?.dropzone, data?.dropzone?.id, dispatch]);

  const mutationUpdateDropzone = useMutationUpdateDropzone({
    onError: (message) =>
      dispatch(
        actions.notifications.showSnackbar({
          message,
          variant: 'error',
        })
      ),
    onSuccess: (payload) => {
      dispatch(
        actions.global.setDropzone({
          ...(globalState.currentDropzone || {}),
          ...(payload.dropzone as Dropzone),
        })
      );
      dispatch(
        actions.notifications.showSnackbar({
          message: `Your settings have been saved`,
          variant: 'success',
        })
      );
      navigation.goBack();
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
      requestPublication,
      isPublic,
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
          federationId: Number(federation?.value?.id),
          isCreditSystemEnabled: !!isCreditSystemEnabled,
          isPublic:
            isPublic?.value !== undefined &&
            currentUser?.user.moderationRole &&
            currentUser?.user.moderationRole !== 'user'
              ? !!isPublic?.value
              : null,
          requestPublication: !!requestPublication?.value,
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
        dispatch(
          actions.notifications.showSnackbar({
            message: error.message,
            variant: 'error',
          })
        );
      }
    }
    return null;
  }, [
    state.fields,
    dispatch,
    mutationUpdateDropzone,
    dropzone?.id,
    currentUser?.user.moderationRole,
  ]);

  return (
    <>
      <ProgressBar indeterminate color={globalState.theme.colors.accent} visible={loading} />
      <ScrollableScreen
        style={{ backgroundColor: '#f4f5f5' }}
        contentContainerStyle={styles.content}
      >
        <DropzoneForm loading={loading} />
        <View style={styles.fields}>
          <Button
            mode="contained"
            disabled={mutationUpdateDropzone.loading}
            onPress={onSave}
            loading={mutationUpdateDropzone.loading}
          >
            Save
          </Button>
        </View>
      </ScrollableScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    display: 'flex',
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    alignSelf: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    padding: 48,
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
