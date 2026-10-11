import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import Wizard from 'app/components/wizard/Wizard';
import WizardCompleteStep from 'app/components/wizard/WizardCompleteStep';
import { useWeatherForm } from 'app/forms/weather';
import WindsStep from './steps/Winds';
import JumpRunStep from './steps/JumpRun';

function WeatherConditionsScreen() {
  const { open, save, saving } = useWeatherForm();
  const navigation = useNavigation();

  const onSaveConditions = React.useCallback(
    async (currentIndex: number, setIndex: (idx: number) => void) => {
      if (await save()) {
        setIndex(currentIndex + 1);
      }
    },
    [save]
  );

  const onClose = React.useCallback(() => {
    open(null);
    navigation.goBack();
  }, [navigation, open]);

  return (
    <Wizard>
      <WindsStep
        backButtonLabel="Cancel"
        nextButtonLabel="Next"
        onBack={onClose}
        loading={saving}
        onNext={(index, setIndex) => setIndex(index + 1)}
      />

      <JumpRunStep
        backButtonLabel="Back"
        nextButtonLabel="Next"
        loading={saving}
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
        onNext={onClose}
      />
    </Wizard>
  );
}

export default WeatherConditionsScreen;
