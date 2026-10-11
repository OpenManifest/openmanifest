import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import * as Location from 'expo-location';
import WizardScreen, { IWizardScreenProps } from 'app/components/wizard/WizardScreen';
import { useController } from 'react-hook-form';
import { useWeatherForm } from 'app/forms/weather';
import JumpRunSelector from 'app/components/input/jump_run_select/JumpRunSelect';

import { useDropzoneContext } from 'app/providers/dropzone/context';

function WindsWizardScreen(props: IWizardScreenProps) {
  const { control } = useWeatherForm();
  const { field: jumpRun } = useController({ name: 'jumpRun', control });
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
    <WizardScreen {...props}>
      <View style={styles.map}>
        <JumpRunSelector
          value={jumpRun.value || 0}
          latitude={dropzone?.lat || location?.latitude || 0}
          longitude={dropzone?.lng || location?.longitude || 0}
          onChange={(value) => jumpRun.onChange(Math.round(value))}
        />
      </View>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  // The selector fills its parent, so the parent needs a size
  map: { width: '100%', aspectRatio: 1 },
});

export default WindsWizardScreen;
