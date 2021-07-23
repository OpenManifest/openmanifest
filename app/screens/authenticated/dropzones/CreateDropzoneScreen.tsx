import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { actions, useAppSelector, useAppDispatch } from '../../../state';

import { View } from '../../../components/Themed';

import DropzoneForm from '../../../components/forms/dropzone/DropzoneForm';
import useMutationCreateDropzone from '../../../api/hooks/useMutationCreateDropzone';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';

export default function CreateDropzoneScreen() {
  const state = useAppSelector((root) => root.forms.dropzone);
  const dispatch = useAppDispatch();

  const createDropzone = useMutationCreateDropzone({
    onError: (e: string) =>
      dispatch(actions.notifications.showSnackbar({ message: e, variant: 'error' })),
    onFieldError: (field, error) =>
      dispatch(actions.forms.dropzone.setFieldError([field as string, error])),
    // eslint-disable-next-line max-len
    onSuccess: (payload) =>
      payload?.dropzone && dispatch(actions.global.setDropzone(payload.dropzone)),
  });

  return (
    <ScrollableScreen contentContainerStyle={{ paddingHorizontal: 32 }}>
      <DropzoneForm />
      <View style={styles.fields}>
        <Button
          mode="contained"
          disabled={createDropzone.loading}
          loading={createDropzone.loading}
          onPress={() =>
            createDropzone.mutate({
              name: state.fields.name.value || '',
              banner: state.fields.banner.value || null,
              federationId: Number(state.fields.federation.value?.id),
            })
          }
        >
          Save
        </Button>
      </View>
    </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
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
  },
  field: {
    marginBottom: 8,
  },
});
