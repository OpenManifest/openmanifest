import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
// eslint-disable-next-line max-len
import useMutationCreateWeatherConditions from '../../../api/hooks/useMutationCreateWeatherConditions';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
// eslint-disable-next-line max-len
import WeatherConditionForm from '../../../components/forms/weather_conditions/WeatherConditionForm';

export default function WindScreen() {
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
    dispatch(actions.forms.weather.reset());
    dispatch(actions.forms.weather.setOpen(false));
  }, [mutationCreateWeatherConditions, state, dropzoneId, navigation, dispatch]);

  return (
    <ScrollableScreen style={{ backgroundColor: '#F4F5F5' }}>
      <WeatherConditionForm onPressJumpRun={() => navigation.navigate('JumpRunScreen')} />
      <View style={styles.buttons} pointerEvents="box-none">
        <Button
          loading={mutationCreateWeatherConditions.loading}
          mode="contained"
          disabled={mutationCreateWeatherConditions.loading}
          style={styles.button}
          onPress={async () => {
            onSaveConditions();
          }}
        >
          Save
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
    marginBottom: 100,
  },
});
