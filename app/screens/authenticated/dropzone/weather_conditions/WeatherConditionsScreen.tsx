import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import Wizard from 'app/components/wizard/Wizard';
import WizardCompleteStep from 'app/components/wizard/WizardCompleteStep';
import { actions, useAppDispatch, useAppSelector } from 'app/state';

import useMutationCreateWeatherConditions from 'app/api/hooks/useMutationCreateWeatherConditions';
import { useNotifications } from 'app/providers/notifications';
import WindsStep from './steps/Winds';
import JumpRunStep from './steps/JumpRun';

function WeatherConditionsScreen() {
  const state = useAppSelector((root) => root.forms.weather);
  const dropzoneId = useAppSelector((root) => root.global.currentDropzoneId);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const notify = useNotifications();

  const mutationCreateWeatherConditions = useMutationCreateWeatherConditions({
    onSuccess: () => null,
    onFieldError: (field: keyof typeof state.fields, message: string) =>
      dispatch(actions.forms.weather.setFieldError([field, message])),
    onError: notify.error
  });

  const onSaveConditions = React.useCallback(
    async (currentIndex: number, setIndex: (idx: number) => void) => {
      await mutationCreateWeatherConditions.mutate({
        id: Number(state.original?.id),
        dropzoneId: dropzoneId as number,
        winds: JSON.stringify(state.fields.winds.value),
        jumpRun: state.fields.jumpRun.value,
        temperature: state.fields.temperature.value
      });
      setIndex(currentIndex + 1);
    },
    [mutationCreateWeatherConditions, state, dropzoneId]
  );

  return (
    <Wizard>
      <WindsStep
        backButtonLabel="Cancel"
        nextButtonLabel="Next"
        onBack={() => {
          dispatch(actions.forms.weather.reset());
          dispatch(actions.forms.weather.setOpen(false));
          navigation.goBack();
        }}
        loading={mutationCreateWeatherConditions.loading}
        onNext={(index, setIndex) => setIndex(index + 1)}
      />

      <JumpRunStep
        backButtonLabel="Back"
        nextButtonLabel="Next"
        loading={mutationCreateWeatherConditions.loading}
        onNext={(index, setIndex) => {
          onSaveConditions(index, setIndex);
        }}
        onBack={(index, setIndex) => setIndex(index - 1)}
      />

      <WizardCompleteStep
        title="Weather conditions saved"
        subtitle="You can update these at any time"
        backButtonLabel="Back"
        nextButtonLabel="Done"
        onBack={(index, setIndex) => {
          setIndex(index - 1);
        }}
        onNext={() => {
          dispatch(actions.forms.weather.reset());
          dispatch(actions.forms.weather.setOpen(false));
          navigation.goBack();
        }}
      />
    </Wizard>
  );
}

export default WeatherConditionsScreen;
