import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import { FAB } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import * as Location from 'expo-location';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import JumpRunSelector from '../../../components/input/jump_run_select/JumpRunSelect';
// eslint-disable-next-line max-len
import useMutationCreateWeatherConditions from '../../../api/hooks/useMutationCreateWeatherConditions';
import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';

export default function JumpRunScreen() {
  const state = useAppSelector((root) => root.forms.weather);
  const dropzoneId = useAppSelector((root) => root.global.currentDropzoneId);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const mutationCreateWeatherConditions = useMutationCreateWeatherConditions({
    onSuccess: () => null,
    onFieldError: (field: keyof typeof state.fields, message: string) =>
      dispatch(actions.forms.weather.setFieldError([field, message])),
    onError: (message) => {
      dispatch(actions.notifications.showSnackbar({ message, variant: 'error' }));
    },
  });

  const onSaveConditions = React.useCallback(async () => {
    await mutationCreateWeatherConditions.mutate({
      id: Number(state.original?.id),
      dropzoneId: dropzoneId as number,
      winds: JSON.stringify(state.fields.winds.value),
      jumpRun: state.fields.jumpRun.value,
      temperature: state.fields.temperature.value,
    });
    navigation.goBack();
    dispatch(
      actions.notifications.showSnackbar({
        message: 'Weather board updated',
        variant: 'success',
      })
    );
  }, [
    mutationCreateWeatherConditions,
    state.original?.id,
    state.fields.winds.value,
    state.fields.jumpRun.value,
    state.fields.temperature.value,
    dropzoneId,
    navigation,
    dispatch,
  ]);

  const { dropzone } = useCurrentDropzone();
  const [location, setLocation] = React.useState<Location.LocationObject['coords']>();
  const setUsersLocation = React.useCallback(async () => {
    try {
      const { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const position = await Location.getCurrentPositionAsync({});

      setLocation(position.coords);
    } catch (error) {
      console.log(error);
    }
  }, []);

  React.useEffect(() => {
    if (!dropzone?.lat || !dropzone?.lng) {
      setUsersLocation();
    }
  }, [dropzone?.lat, dropzone?.lng, setUsersLocation]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <JumpRunSelector
        value={state.fields.jumpRun.value || 0}
        latitude={dropzone?.lat || location?.latitude || 0}
        longitude={dropzone?.lng || location?.longitude || 0}
        onChange={(value) =>
          dispatch(actions.forms.weather.setField(['jumpRun', Math.round(value)]))
        }
      />
      <FAB
        style={styles.fab}
        small
        icon="check"
        loading={mutationCreateWeatherConditions.loading}
        disabled={mutationCreateWeatherConditions.loading}
        onPress={() => onSaveConditions()}
        label="Save"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
