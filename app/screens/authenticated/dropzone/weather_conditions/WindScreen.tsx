import * as React from 'react';
import { Button, HelperText } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { useWeatherForm } from 'app/forms/weather';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';

import WeatherConditionForm from 'app/components/forms/weather_conditions/WeatherConditionForm';
import { useNotifications } from 'app/providers/notifications';
import { useAuthenticatedNavigation } from '../../useAuthenticatedNavigation';
import { useAppTheme } from 'app/theme';

export default function WindScreen() {
  const { theme, palette } = useAppTheme();
  const { save, saving } = useWeatherForm();
  const navigation = useAuthenticatedNavigation();
  const notify = useNotifications();

  const onSaveConditions = React.useCallback(async () => {
    if (await save()) {
      navigation.goBack();
      notify.success('Weather board updated');
    }
  }, [save, navigation, notify]);

  return (
    <ScrollableScreen contentContainerStyle={{ backgroundColor: theme.colors.background }}>
      <WeatherConditionForm
        onPressJumpRun={() =>
          navigation.navigate('Manifest', {
            screen: 'JumpRunScreen',
          })
        }
        variant={theme.dark ? 'light' : undefined}
      />
      <View style={styles.buttons} pointerEvents="box-none">
        <Button
          loading={saving}
          mode="contained"
          color={palette.primary.main}
          disabled={saving}
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
          loading={saving}
          mode="outlined"
          color={palette.primary.main}
          disabled={saving}
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
          onPress={async () => {
            onSaveConditions();
          }}
        >
          Reload Conditions
        </Button>
        <HelperText type="info">
          Winds aloft and temperature are retrieved from MarkSchulze.net's amazing Winds Aloft
          service.
        </HelperText>
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
