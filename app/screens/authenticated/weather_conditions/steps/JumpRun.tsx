import * as React from 'react';
import { StyleSheet, View } from 'react-native';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as Location from 'expo-location';
import WizardScreen, { IWizardScreenProps } from '../../../../components/wizard/WizardScreen';
import { actions, useAppDispatch, useAppSelector } from '../../../../state';
import JumpRunSelector from '../../../../components/input/jump_run_select/JumpRunSelect';
import useCurrentDropzone from '../../../../api/hooks/useCurrentDropzone';

function WindsWizardScreen(props: IWizardScreenProps) {
  const state = useAppSelector((root) => root.forms.weather);
  const dispatch = useAppDispatch();
  const { dropzone } = useCurrentDropzone();
  const [location, setLocation] = React.useState<Location.LocationObject['coords']>();
  const setUsersLocation = React.useCallback(async () => {
    try {
      const { status } = await Location.requestPermissionsAsync();
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
    <WizardScreen style={styles.container} {...props} contentStyle={{ paddingTop: 130 }}>
      <View style={{ width: '100%', height: '80%' }}>
        <JumpRunSelector
          value={state.fields.jumpRun.value || 0}
          latitude={dropzone?.lat || location?.latitude || 0}
          longitude={dropzone?.lng || location?.longitude || 0}
          onChange={(value) =>
            dispatch(actions.forms.weather.setField(['jumpRun', Math.round(value)]))
          }
        />
      </View>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    alignItems: 'center',
    paddingLeft: 0,
    backgroundColor: 'blue',
    paddingRight: 0,
  },
  slider: {
    width: '100%',
    marginTop: 32,
  },
  textInput: {
    height: 80,
    width: 200,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 60,
    textAlign: 'center',
    marginBottom: 60,
  },
  content: {
    width: '100%',
    flexDirection: 'column',
  },
  iconContainer: {
    width: 250,
    height: 250,
    borderRadius: 250 / 2,
    borderWidth: 15,
    borderColor: 'white',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { position: 'absolute', top: -75 },

  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    marginVertical: 16,
  },
  headerAltitude: {
    flex: 3.5 / 10,

    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headerSpeed: {
    flex: 3 / 10,

    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headerDirection: {
    flex: 3 / 10,

    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: { padding: 8, marginVertical: 16 },
  cardTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardValue: {
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
    alignSelf: 'center',
  },
  title: {
    color: 'white',
    marginBottom: 50,
    fontWeight: 'bold',
    fontSize: 25,
    textAlign: 'center',
  },
  field: {
    marginBottom: 8,
  },
  sliderControl: { width: '100%', height: 40 },
  wingLoading: {
    alignSelf: 'center',
  },
  wingLoadingCardLeft: {
    width: '30%',
  },
  wingLoadingCardRight: {
    paddingLeft: 16,
    width: '70%',
  },
});

export default WindsWizardScreen;
