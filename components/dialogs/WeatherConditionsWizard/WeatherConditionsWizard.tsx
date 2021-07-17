import * as React from "react";
import { StyleSheet } from "react-native";
import { Portal, Modal } from "react-native-paper";
import Wizard from "../../wizard/Wizard";
import WizardCompleteStep from "../../wizard/WizardCompleteStep";
import { actions, useAppDispatch, useAppSelector } from "../../../redux";
import useMutationCreateWeatherConditions from "../../../graphql/hooks/useMutationCreateWeatherConditions";
import WindsStep from "./steps/Winds";
import JumpRunStep from "./steps/JumpRun";

export function WeatherConditionsWizard() {
  const state = useAppSelector(state => state.forms.weather);
  const dropzoneId = useAppSelector(state => state.global.currentDropzoneId);
  const dispatch = useAppDispatch();
  
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
        id: Number(state.original.id),
        dropzoneId,
        winds: JSON.stringify(state.fields.winds.value),
        jumpRun: state.fields.jumpRun.value,
        temperature: state.fields.temperature.value,
      });
    } catch (e) {

    }
    setIndex(currentIndex + 1);
  }, [JSON.stringify(state.fields), mutationCreateWeatherConditions])
  
  return (
    <Portal>
      <Modal
        visible={state.open}
        dismissable={false}
        style={styles.modal}
        contentContainerStyle={{ height: "100%" }}
      >

          <Wizard>
            <WindsStep
              backButtonLabel="Cancel"
              nextButtonLabel="Next"
              onBack={() => {
                dispatch(actions.forms.weather.reset());
                dispatch(actions.forms.weather.setOpen(false));
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
              }}
            />
          </Wizard>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    ...StyleSheet.absoluteFillObject,
    paddingLeft: 0,
    marginLeft: 0,
    marginBottom: 0,
    marginTop: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    backgroundColor: "red",
    display: "flex",
    width: "100%",
    height: "100%",
    flex: 1,
    alignItems: "center"
  }
})

export default WeatherConditionsWizard;