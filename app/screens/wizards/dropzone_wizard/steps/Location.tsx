import * as React from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Region, Marker, MapMarker } from 'react-native-maps';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import * as Location from 'expo-location';
import { Step, IWizardStepProps } from 'app/components/carousel_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { calculateLatLngDelta } from 'app/utils/calculateLatLngDelta';

function LocationWizardStep(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.dropzone);
  const dispatch = useAppDispatch();

  const setUsersLocation = React.useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const location = await Location.getCurrentPositionAsync({});

      dispatch(actions.forms.dropzone.setField(['lat', location.coords.latitude]));
      dispatch(actions.forms.dropzone.setField(['lng', location.coords.longitude]));

      setInternalRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: calculateLatLngDelta(location.coords.latitude),
        longitudeDelta: calculateLatLngDelta(location.coords.latitude)
      });
      map.current?.animateCamera({ center: location.coords });
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  const region = React.useMemo(
    () =>
      state.fields.lat.value && state.fields.lng.value
        ? {
            latitude: state.fields.lat.value,
            longitude: state.fields.lng.value,
            latitudeDelta: calculateLatLngDelta(state.fields.lat.value),
            longitudeDelta: calculateLatLngDelta(state.fields.lat.value)
          }
        : undefined,
    [state.fields.lat.value, state.fields.lng.value]
  );

  // Start at user location
  React.useEffect(() => {
    if (!region?.latitude || !region?.longitude) {
      setUsersLocation();
    }
  }, [region, setUsersLocation]);

  const opacity = React.useRef(new Animated.Value(0));

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
    (visible ? fadeIn : fadeOut).current.start(() => setAnimating(false));
  }, []);

  const markerRef = React.useRef<MapMarker>(null);
  const [isDragging, setDragging] = React.useState<boolean>(false);
  const [internalRegion, setInternalRegion] = React.useState<Region | undefined>(region);

  return (
    <Step {...props} title="Location">
      <MapView
        // @ts-ignore
        ref={map}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onTouchStart={() => {
          markerRef.current?.hideCallout();
        }}
        onRegionChange={(_region) => {
          if (!isAnimating) {
            setCoordinateFade(false);
            setDragging(true);
          }
          setInternalRegion(_region);
        }}
        onRegionChangeComplete={(r) => {
          fadeOut.current?.stop();
          fadeIn.current?.stop();
          setDragging(false);
          setAnimating(false);
          setCoordinateFade(true);
          setCoordinateFade(true);
          dispatch(actions.forms.dropzone.setField(['lat', r.latitude]));
          dispatch(actions.forms.dropzone.setField(['lng', r.longitude]));
        }}
        mapType="hybrid"
        zoomEnabled
        scrollEnabled
        focusable
      >
        {!internalRegion ? null : (
          <Marker title={state.fields.name.value || undefined} ref={markerRef} flat coordinate={internalRegion}>
            <MaterialCommunityIcons
              pointerEvents="none"
              size={60}
              style={{
                color: '#ffffff',
                textShadowColor: 'rgba(14,14,14,0.8)',
                textShadowOffset: {
                  width: 5,
                  height: 5
                },
                textShadowRadius: 10,
                zIndex: 10
              }}
              name={isDragging ? 'map-marker' : 'map-marker-check-outline'}
            />
          </Marker>
        )}
      </MapView>
      <TouchableOpacity
        style={styles.myLocation}
        onPress={() => {
          setUsersLocation();
        }}
      >
        <MaterialIcons name="my-location" size={30} />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        {/* <AddressSearchBar
          value={searchText}
          onChange={setSearchText}
          autocomplete
          onSelect={(item) => {
            dispatch(actions.forms.dropzone.setField(['lat', item.latitude]));
            dispatch(actions.forms.dropzone.setField(['lng', item.longitude]));
            map.current?.animateCamera({ center: item });
          }}
        /> */}
        <Animated.Text
          style={{
            fontSize: 24,
            marginTop: 20,
            opacity: opacity.current,
            textAlign: 'center',
            color: '#ffffff',
            textShadowColor: 'rgba(14,14,14,0.8)',
            textShadowOffset: {
              width: 3,
              height: 3
            },
            textShadowRadius: 10
          }}
        >
          {!region?.latitude || !region?.longitude ? null : (
            <>
              {region?.latitude?.toFixed(5)},{region?.longitude?.toFixed(5)}
            </>
          )}
        </Animated.Text>
      </View>
    </Step>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 48,
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  titleContainer: {
    position: 'absolute',
    top: 32,
    left: 0,
    width: '100%',
    paddingHorizontal: 16,
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
      height: 2
    }
  },
  markerFixed: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  content: {
    width: '100%',
    justifyContent: 'space-around',
    flexDirection: 'column'
  },
  card: {
    padding: 0,
    paddingVertical: 16,
    marginVertical: 16,
    width: '100%'
  },
  myLocation: {
    position: 'absolute',
    bottom: '30%',
    right: 30,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 12
  }
});

export default LocationWizardStep;
