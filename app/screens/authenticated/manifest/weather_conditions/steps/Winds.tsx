import * as React from 'react';
import WizardScreen, { IWizardScreenProps } from 'app/components/wizard/WizardScreen';

import WeatherConditionForm from 'app/components/forms/weather_conditions/WeatherConditionForm';

function WindsWizardScreen(props: IWizardScreenProps) {
  return (
    <WizardScreen {...props} title="Winds Aloft">
      <WeatherConditionForm />
    </WizardScreen>
  );
}

export default WindsWizardScreen;
