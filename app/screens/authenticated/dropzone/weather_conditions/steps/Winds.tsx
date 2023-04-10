import * as React from 'react';
import { StyleSheet } from 'react-native';
import WizardScreen, { IWizardScreenProps } from 'app/components/wizard/WizardScreen';

import WeatherConditionForm from 'app/components/forms/weather_conditions/WeatherConditionForm';

function WindsWizardScreen(props: IWizardScreenProps) {
  return (
    <WizardScreen style={styles.container} {...props} title="Winds Aloft">
      <WeatherConditionForm />
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    alignItems: 'center',
    paddingLeft: 0,
    paddingRight: 0
  }
});

export default WindsWizardScreen;
