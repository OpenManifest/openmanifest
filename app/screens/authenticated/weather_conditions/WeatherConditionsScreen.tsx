import * as React from "react";
import { useNavigation } from "@react-navigation/native";
import Wizard from "../../../components/wizard/Wizard";
import WizardCompleteStep from "../../../components/wizard/WizardCompleteStep";
import { actions, useAppDispatch, useAppSelector } from "../../../state";
import useMutationCreateWeatherConditions from "../../../api/hooks/useMutationCreateWeatherConditions";
import WindsStep from "./steps/Winds";
import JumpRunStep from "./steps/JumpRun";

export function WeatherConditionsScreen() {
  const state = useAppSelector(state => state.forms.weather);
  const dropzoneId = useAppSelector(state => state.global.currentDropzoneId);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  
  const mutationCreateWeatherConditions = useMutationCreateWeatherConditions({
    onSuccess: () => {
      
    },
    onFieldError: (field: keyof typeof state.fields, message: string) =>
      dispatch(actions.forms.weather.setFieldError([field, message])),
    onError: (message) => {
      dispatch(actions.notifications.showSnackbar({ message, variant: "error" }));
    }
  });

  const onSaveConditions = React.useCallback(async (currentIndex: number, setIndex: (idx: number) => void) => {
    try {
      const result = await mutationCreateWeatherConditions.mutate({
        id: Number(state!.original!.id),
        dropzoneId: dropzoneId!,
        winds: JSON.stringify(state.fields.winds.value),
        jumpRun: state.fields.jumpRun.value,
        temperature: state.fields.temperature.value,
      });
    } catch (e) {

    }
    setIndex(currentIndex + 1);
  }, [JSON.stringify(state.fields), mutationCreateWeatherConditions])
  
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