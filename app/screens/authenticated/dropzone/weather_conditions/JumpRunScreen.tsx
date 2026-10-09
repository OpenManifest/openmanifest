import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import { FAB, useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import FloatingActionArea from 'app/components/layout/FloatingActionArea';
import ScreenContainer from 'app/components/layout/ScreenContainer';

import * as Location from 'expo-location';
import { useController } from 'react-hook-form';
import { useWeatherForm } from 'app/forms/weather';
import JumpRunSelector from 'app/components/input/jump_run_select/JumpRunSelect';

import { useDropzoneContext } from 'app/providers/dropzone/context';
import { useNotifications } from 'app/providers/notifications';

export default function JumpRunScreen() {
  const { control, save, saving } = useWeatherForm();
  const { field: jumpRun } = useController({ name: 'jumpRun', control });
  const navigation = useNavigation();
  const theme = useTheme();
  const notify = useNotifications();

  const onSaveConditions = React.useCallback(async () => {
    if (await save()) {
      navigation.goBack();
      notify.success('Weather board updated');
    }
  }, [save, navigation, notify]);

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
    <ScreenContainer edges={['bottom']}>
      <View style={styles.map}>
        <JumpRunSelector
          value={jumpRun.value || 0}
          latitude={dropzone?.lat || location?.latitude || 0}
          longitude={dropzone?.lng || location?.longitude || 0}
          onChange={(value) => jumpRun.onChange(Math.round(value))}
        />
      </View>
      <FloatingActionArea>
        <FAB
          testID="jump-run-save-primary-action"
          style={{ backgroundColor: theme.colors.primary }}
          small
          icon="check"
          loading={saving}
          disabled={saving}
          onPress={() => onSaveConditions()}
          label="Save"
        />
      </FloatingActionArea>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // The selector fills its parent
  map: { flex: 1 },
});
