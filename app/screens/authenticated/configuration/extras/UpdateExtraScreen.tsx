import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/core';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { actions, useAppSelector, useAppDispatch } from 'app/state';

import { View } from 'app/components/Themed';
import { actions as snackbar } from 'app/components/notifications';

import { Extra } from 'app/api/schema.d';
import ExtraForm from 'app/components/forms/extra/ExtraForm';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import { useUpdateExtraMutation } from 'app/api/reflection';

export default function UpdateExtraScreen() {
  const currentDropzone = useCurrentDropzone();
  const state = useAppSelector((root) => root.forms.extra);
  const dispatch = useAppDispatch();

  const navigation = useNavigation();
  const route = useRoute<{ key: string; name: string; params: { extra: Extra } }>();
  const { extra } = route.params;

  React.useEffect(() => {
    dispatch(actions.forms.extra.setOpen(extra));
  }, [dispatch, extra, extra.id]);

  const [mutationUpdateExtra, data] = useUpdateExtraMutation();

  const validate = React.useCallback((): boolean => {
    let hasError = false;
    if ((state.fields.name.value?.length || 0) < 3) {
      hasError = true;
      dispatch(actions.forms.extra.setFieldError(['name', 'Name is too short']));
    }

    if (Number(state.fields.cost.value) < 0) {
      hasError = true;
      dispatch(actions.forms.extra.setFieldError(['cost', 'Price must be a number']));
    }

    return !hasError;
  }, [state.fields, dispatch]);

  const onSave = React.useCallback(async () => {
    const { name, cost, ticketTypes } = state.fields;

    if (validate()) {
      try {
        const result = await mutationUpdateExtra({
          variables: {
            id: Number(state.original?.id),
            dropzoneId: Number(currentDropzone?.dropzone?.id),
            name: name.value,
            cost: cost.value,
            ticketTypeIds: ticketTypes.value?.map(({ id }) => Number(id)),
          },
        });

        if (result.data?.updateExtra?.extra) {
          dispatch(snackbar.showSnackbar({ message: `Saved`, variant: 'success' }));
          navigation.goBack();
        }
      } catch (error) {
        if (error instanceof Error) {
          dispatch(snackbar.showSnackbar({ message: error.message, variant: 'error' }));
        }
      }
    }
  }, [
    state.fields,
    state.original?.id,
    validate,
    mutationUpdateExtra,
    currentDropzone?.dropzone?.id,
    dispatch,
    navigation,
  ]);

  return (
    <ScrollableScreen contentContainerStyle={{ paddingHorizontal: 48 }}>
      <MaterialCommunityIcons
        name="ticket-percent"
        size={100}
        color="#999999"
        style={{ alignSelf: 'center' }}
      />
      <ExtraForm />
      <View style={styles.fields}>
        <Button mode="contained" disabled={data.loading} onPress={onSave} loading={data.loading}>
          Save
        </Button>
      </View>
    </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
