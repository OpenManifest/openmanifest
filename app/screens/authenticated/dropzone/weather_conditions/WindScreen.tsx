import * as React from 'react';
import { Button, HelperText } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { actions, useAppDispatch, useAppSelector } from 'app/state';

import useMutationCreateWeatherConditions from 'app/api/hooks/useMutationCreateWeatherConditions';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';

import WeatherConditionForm from 'app/components/forms/weather_conditions/WeatherConditionForm';
import { useNotifications } from 'app/providers/notifications';
import { useAuthenticatedNavigation } from '../../useAuthenticatedNavigation';

export default function WindScreen() {
  const state = useAppSelector((root) => root.forms.weather);
  const { theme, palette } = useAppSelector((root) => root.global);
  const dropzoneId = useAppSelector((root) => root.global.currentDropzoneId);
  const dispatch = useAppDispatch();
  const navigation = useAuthenticatedNavigation();
  const notify = useNotifications();

  const mutationCreateWeatherConditions = useMutationCreateWeatherConditions({
    onSuccess: () => null,
    onFieldError: (field: keyof typeof state.fields, message: string) =>
      dispatch(actions.forms.weather.setFieldError([field, message])),
    onError: notify.error
  });

  const onSaveConditions = React.useCallback(async () => {
    await mutationCreateWeatherConditions.mutate({
      id: Number(state.original?.id),
      dropzoneId: dropzoneId as number,
      winds: JSON.stringify(state.fields.winds.value),
      jumpRun: state.fields.jumpRun.value,
      temperature: state.fields.temperature.value
    });
    navigation.goBack();
    notify.success('Weather board updated');
    dispatch(actions.forms.weather.reset());
    dispatch(actions.forms.weather.setOpen(false));
  }, [
    mutationCreateWeatherConditions,
    state.original?.id,
    state.fields.winds.value,
    state.fields.jumpRun.value,
    state.fields.temperature.value,
    dropzoneId,
    navigation,
    notify,
    dispatch
  ]);

  return (
    <ScrollableScreen contentContainerStyle={{ backgroundColor: theme.colors.background }}>
      <WeatherConditionForm
        onPressJumpRun={() =>
          navigation.navigate('Manifest', {
            screen: 'JumpRunScreen'
          })
        }
        variant={theme.dark ? 'light' : undefined}
      />
      <View style={styles.buttons} pointerEvents="box-none">
        <Button
          loading={mutationCreateWeatherConditions.loading}
          mode="contained"
          color={palette.primary.main}
          disabled={mutationCreateWeatherConditions.loading}
          style={[
            styles.button,
            {
              borderRadius: 20,
              height: 42,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20
            }
          ]}
          labelStyle={{
            color: 'white'
          }}
          onPress={async () => {
            onSaveConditions();
          }}
        >
          Save
        </Button>
        <Button
          loading={mutationCreateWeatherConditions.loading}
          mode="outlined"
          color={palette.primary.main}
          disabled={mutationCreateWeatherConditions.loading}
          style={[
            styles.button,
            {
              borderRadius: 20,
              height: 42,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20
            }
          ]}
          onPress={async () => {
            onSaveConditions();
          }}
        >
          Reload Conditions
        </Button>
        <HelperText type="info">
          Winds aloft and temperature are retrieved from MarkSchulze.net's amazing Winds Aloft service.
        </HelperText>
      </View>
    </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    width: '100%'
  },
  buttonBack: {
    alignSelf: 'center',
    width: '100%',
    marginHorizontal: 48
  },
  buttons: {
    alignSelf: 'center',
    alignItems: 'flex-end',
    flexGrow: 1,
    justifyContent: 'flex-end',
    width: '100%',
    maxWidth: 404,
    marginBottom: 0
  }
});
