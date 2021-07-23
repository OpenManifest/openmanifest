import * as React from "react";
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card, HelperText, List, TextInput } from "react-native-paper";
import FederationSelect from "../../../input/dropdown_select/FederationSelect";
import WizardScreen, { IWizardScreenProps } from "../../../../components/wizard/WizardScreen";
import { actions, useAppDispatch, useAppSelector } from "../../../../state";
import MapView, { Region } from "react-native-maps";
import { calculateLatLngDelta } from "../../../../utils/calculateLatLngDelta";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";



function LocationWizardStep(props: IWizardScreenProps) {
  const state = useAppSelector(state => state.forms.dropzone);
  const dispatch = useAppDispatch();

  const setUsersLocation = React.useCallback(async () => {
    try {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      
      
      dispatch(actions.forms.dropzone.setField(["lat", location.coords.latitude]));
      dispatch(actions.forms.dropzone.setField(["lng", location.coords.longitude]));

      setInternalRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: calculateLatLngDelta(location.coords.latitude),
        longitudeDelta: calculateLatLngDelta(location.coords.latitude),
      });
      map.current?.animateCamera({ center: location.coords });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const region = state.fields.lat.value && state.fields.lng.value
  ? {
    latitude: state.fields.lat.value,
    longitude: state.fields.lng.value,
    latitudeDelta: calculateLatLngDelta(state.fields.lat.value),
    longitudeDelta: calculateLatLngDelta(state.fields.lat.value),
  }
  : undefined;

  // Start at user location
  React.useEffect(() => {
    if (!region?.latitude || !region?.longitude) {
      setUsersLocation();
    }
  }, [region]);

  const opacity = React.useRef(
    new Animated.Value(0)
  );

  const map = React.useRef<MapView>();

  

  const [isAnimating, setAnimating] = React.useState<boolean>(false);
  const fadeOut = React.useRef(
    Animated.timing(opacity.current, {
      duration: 100,
      toValue: 0.0,
      useNativeDriver: true
    })
  );
  const fadeIn = React.useRef(
    Animated.timing(opacity.current, {
      duration: 100,
      toValue: 1.0,
      useNativeDriver: true
    })
  );
  const setCoordinateFade = React.useCallback((visible: boolean) => {
    setAnimating(true);
    console.log({ visible });
    (visible ? fadeIn : fadeOut).current.start(() => setAnimating(false));
  }, [isAnimating]);


  const [isDragging, setDragging] = React.useState<boolean>(false);
  const [internalRegion, setInternalRegion] = React.useState<Region>(region);

  return (
    <WizardScreen disableScroll style={styles.container} containerStyle={{ paddingHorizontal: 0 }} {...props}>
      <MapView
        ref={map}
        style={{
          ...StyleSheet.absoluteFillObject,
          marginTop: -50,
        }}
        initialRegion={
          region
        }
        region={internalRegion}
        onRegionChange={(_region) => {
          if (!isAnimating) {
            setCoordinateFade(false);
            setDragging(true);
          }
          setInternalRegion(_region)
        }}
        onRegionChangeComplete={(r) => {
          fadeOut.current?.stop();
          fadeIn.current?.stop();
          setDragging(false);
          setAnimating(false);
          setCoordinateFade(true);
          setCoordinateFade(true);
          dispatch(actions.forms.dropzone.setField(["lat", r.latitude]));
          dispatch(actions.forms.dropzone.setField(["lng", r.longitude]));
        }}
        mapType="hybrid"
        zoomEnabled
        scrollEnabled
        focusable
      >
        
        {!region ? null :
        <View style={styles.markerFixed} pointerEvents="none">
         
          <MaterialCommunityIcons
            pointerEvents="none"
            size={60}
            style={{
              color: '#ffffff',
              textShadowColor: 'rgba(14,14,14,0.8)',
              textShadowOffset: {
                width: 5,
                height: 5,
              },
              textShadowRadius: 10,
              zIndex: 10,
            }}
            name={isDragging ? 'map-marker' : 'map-marker-check-outline'}
          />
           
        </View>}
       

      </MapView>
      <TouchableOpacity
        style={styles.myLocation}
        onPress={() => {
          setUsersLocation();
        }}
      >
        <MaterialIcons
          name="my-location"
          size={30}
        />
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Pick location
        </Text>
        <Animated.Text
          style={{
            fontSize: 24,
            marginTop: 20,
            opacity: opacity.current,
            textAlign: "center",
            color: '#ffffff',
            textShadowColor: 'rgba(14,14,14,0.8)',
            textShadowOffset: {
              width: 3,
              height: 3,
            },
            textShadowRadius: 10,
          }}
        >
          { !region?.latitude || !region?.longitude ? null :
            <>{region?.latitude?.toFixed(5)},{region?.longitude?.toFixed(5)}</>
          }
        </Animated.Text>
      </View>
    </WizardScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 48,
    alignItems: "center",
    backgroundColor: "transparent"
  },
  titleContainer: {
    position: 'absolute',
    top: 140,
    left: 0,
    width: "100%",
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(15, 15, 15, 0.5)',
    textShadowRadius: 10,
    textShadowOffset: {
      width: 2,
      height: 2,
    },
  },
  markerFixed: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: 'center',
    flexDirection: "column",
  },
  content: {
    width: "100%",
    justifyContent: "space-around",
    flexDirection: "column",
  },
  card: {
    padding: 0,
    paddingVertical: 16,
    marginVertical: 16,
    width: "100%",
  },
  myLocation: {
    position: "absolute",
    bottom: "30%",
    right: 30,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 12
  }
});

export default LocationWizardStep;