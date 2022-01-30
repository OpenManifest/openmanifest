import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
// eslint-disable-next-line max-len
import useMutationCreateWeatherConditions from 'app/api/hooks/useMutationCreateWeatherConditions';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
// eslint-disable-next-line max-len
import WeatherConditionForm from 'app/components/forms/weather_conditions/WeatherConditionForm';

export default function WindScreen() {
  const state = useAppSelector((root) => root.forms.weather);
  const { theme, palette } = useAppSelector((root) => root.global);
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
    dispatch(actions.forms.weather.reset());
    dispatch(actions.forms.weather.setOpen(false));
  }, [mutationCreateWeatherConditions, state, dropzoneId, navigation, dispatch]);

  return (
    <ScrollableScreen contentContainerStyle={{ backgroundColor: theme.colors.background }}>
      <WeatherConditionForm
        onPressJumpRun={() =>
          navigation.navigate('Authenticated', {
            screen: 'Drawer',
            params: {
              screen: 'Manifest',
              params: {
                screen: 'JumpRunScreen',
              },
            },
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
              marginTop: 20,
            },
          ]}
          labelStyle={{
            color: 'white',
          }}
          onPress={async () => {
            onSaveConditions();
          }}
        >
          Save
        </Button>
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
              marginTop: 20,
            },
          ]}
          labelStyle={{
            color: 'white',
          }}
          onPress={async () => {
            onSaveConditions();
          }}
        >
          Reload conditions from MarkSchulz.net
        </Button>
      </View>
    </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    width: '100%',
  },
  buttonBack: {
    alignSelf: 'center',
    width: '100%',
    marginHorizontal: 48,
  },
  buttons: {
    alignSelf: 'center',
    alignItems: 'flex-end',
    flexGrow: 1,
    justifyContent: 'flex-end',
    width: '100%',
    maxWidth: 404,
    marginBottom: 0,
  },
});
