import * as React from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import WizardScreen, { IWizardScreenProps } from "../../../../components/wizard/WizardScreen";
import { actions, useAppDispatch, useAppSelector } from "../../../../redux";
import { calculateLatLngDelta } from "../../../../utils/calculateLatLngDelta";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import Map from "../../../../components/map/Map";


function LocationWizardStep(props: IWizardScreenProps) {
  const state = useAppSelector(state => state.forms.dropzone);
  const dispatch = useAppDispatch();
  const [center, setCenter] = React.useState<{ lat: number, lng: number }>();

  const setUsersLocation = React.useCallback(async () => {
    try {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log(status);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      
      
      dispatch(actions.forms.dropzone.setField(["lat", location.coords.latitude]));
      dispatch(actions.forms.dropzone.setField(["lng", location.coords.longitude]));

      setCenter({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  // Start at user location
  React.useEffect(() => {
    if (state.fields.lat.value === null || state.fields.lng.value == null) {
      setUsersLocation();
    }
  }, []);

  const opacity = React.useRef(
    new Animated.Value(0)
  );

  const region = state.fields.lat.value && state.fields.lng.value
  ? {
    latitude: state.fields.lat.value,
    longitude: state.fields.lng.value,
    latitudeDelta: calculateLatLngDelta(state.fields.lat.value),
    longitudeDelta: calculateLatLngDelta(state.fields.lat.value),
  }
  : undefined;

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

  const { height, width } = useWindowDimensions();
  const [isDragging, setDragging] = React.useState(false);

  return (
    <WizardScreen disableScroll style={styles.container} containerStyle={{ paddingHorizontal: 0 }} {...props}>
      <Map
        mapStyle={{
          ...StyleSheet.absoluteFillObject,
        }}
        position={{
          x: 0,
          y: 0
        }}
        { ...{ height, width }}
        coords={{
          lat: region?.latitude,
          lng: region?.longitude
        }}
        onDragStart={() => {
          setDragging(true);
          setCoordinateFade(false);
        }}
        center={
          center
            ? center
            : undefined
        }
        onDragEnd={(r) => {
          fadeOut.current?.stop();
          fadeIn.current?.stop();
          setAnimating(false);
          setCoordinateFade(true);
          setDragging(false);
          dispatch(actions.forms.dropzone.setField(["lat", r.lat]));
          dispatch(actions.forms.dropzone.setField(["lng", r.lng]));
        }}
        interactive
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
      </Map>
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
    justifyContent: 'flex-start',
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
    zIndex: 100,
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