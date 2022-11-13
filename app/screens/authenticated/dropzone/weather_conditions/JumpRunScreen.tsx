import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import { FAB, useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import * as Location from 'expo-location';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import JumpRunSelector from 'app/components/input/jump_run_select/JumpRunSelect';
// eslint-disable-next-line max-len
import useMutationCreateWeatherConditions from 'app/api/hooks/useMutationCreateWeatherConditions';
import { useDropzoneContext } from 'app/providers';
import { useNotifications } from 'app/providers/notifications';

export default function JumpRunScreen() {
  const state = useAppSelector((root) => root.forms.weather);
  const dropzoneId = useAppSelector((root) => root.global.currentDropzoneId);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const theme = useTheme();
  const notify = useNotifications();

  const mutationCreateWeatherConditions = useMutationCreateWeatherConditions({
    onSuccess: () => null,
    onFieldError: (field: keyof typeof state.fields, message: string) =>
      dispatch(actions.forms.weather.setFieldError([field, message])),
    onError: notify.error,
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
    notify.success('Weather board updated');
  }, [
    mutationCreateWeatherConditions,
    state.original?.id,
    state.fields.winds.value,
    state.fields.jumpRun.value,
    state.fields.temperature.value,
    dropzoneId,
    navigation,
    notify,
  ]);

  const {
    dropzone: { dropzone },
  } = useDropzoneContext();
  const [location, setLocation] = React.useState<Location.LocationObject['coords']>();
  const setUsersLocation = React.useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
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
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
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
