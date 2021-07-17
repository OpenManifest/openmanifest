import * as React from "react";
import { StyleSheet, View } from "react-native";
import WizardScreen, { IWizardScreenProps } from "../../../wizard/WizardScreen";
import { actions, useAppDispatch, useAppSelector } from "../../../../redux";
import JumpRunSelector from '../../../input/JumpRunSelect';
import useCurrentDropzone from "../../../../graphql/hooks/useCurrentDropzone";
import * as Location from "expo-location";

function WindsWizardScreen(props: IWizardScreenProps) {
  const state = useAppSelector(state => state.forms.weather);
  const dispatch = useAppDispatch();
  const { dropzone } = useCurrentDropzone();
  const [jumpRun, setJumpRun] = React.useState(state.fields.jumpRun.value || 0);
  const [location, setLocation] = React.useState<Location.LocationObject['coords']>();
  const setUsersLocation = React.useCallback(async () => {
    try {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      
      
      setLocation(location.coords);
    } catch (error) {
      console.log(error);
    }
  }, []);

  React.useEffect(() => {
    if (!dropzone?.lat || !dropzone?.lng) {
      setUsersLocation();
    }
  }, []);

  return (
    <WizardScreen style={styles.container} {...props}>
      <View style={{ width: "100%", height: "80%" }}>
      <JumpRunSelector
        value={jumpRun}
        latitude={dropzone?.lat || location?.latitude || 0}
        longitude={dropzone?.lng || location?.longitude || 0}
        onChange={(value) => dispatch(actions.forms.weather.setField(['jumpRun', Math.round(value)]))}
      />
      </View>
    </WizardScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    alignItems: "center",
    paddingLeft: 0,
    backgroundColor: 'blue',
    paddingRight: 0,
  },
  slider: {
    width: '100%',
    marginTop: 32
  },
  textInput: {
    height: 80,
    width: 200,
    alignSelf: "center",
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 60,
    textAlign: 'center',
    marginBottom: 60,
  },
  content: {
    width: "100%",
    flexDirection: "column",
  },
  iconContainer: {
    width: 250,
    height: 250,
    borderRadius: 250/2,
    borderWidth: 15,
    borderColor: 'white',
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
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
    flex: 3.5/10,
    
    color: 'white',
    textAlign: "center",
    fontWeight: "bold"
  },
  headerSpeed: {
    flex: 3/10,
    
    color: 'white',
    textAlign: "center",
    fontWeight: "bold"
  },
  headerDirection: {
    flex: 3/10,
    
    color: 'white',
    textAlign: "center",
    fontWeight: "bold"
  },
  card: { padding: 8, marginVertical: 16 },
  cardTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardValue: {
    fontWeight: "bold",
    marginRight: 8,
    fontSize: 16,
    alignSelf: "center",
  },
  title: {
    color: "white",
    marginBottom: 50,
    fontWeight: "bold",
    fontSize: 25,
    textAlign: "center",
    
  },
  field: {
    marginBottom: 8,
  },
  sliderControl: { width: "100%", height: 40 },
  wingLoading: {
    alignSelf: "center",
  },
  wingLoadingCardLeft: {
    width: "30%",
  },
  wingLoadingCardRight: {
    paddingLeft: 16,
    width: "70%",
  },
});

export default WindsWizardScreen;