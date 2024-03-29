import * as React from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { MapMarker, Marker, Region } from 'react-native-maps';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import * as Location from 'expo-location';
import { calculateLatLngDelta } from '../../utils/calculateLatLngDelta';

interface ILocationPickerProps {
  value?: {
    lat: number;
    lng: number;
  };
  onChange(region: Region): void;
}

export function LocationWizardStep(props: ILocationPickerProps) {
  const { value = { lat: -27.550908, lng: 153.111635 }, onChange } = props;
  const setUsersLocation = React.useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const location = await Location.getCurrentPositionAsync({});

      onChange({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: calculateLatLngDelta(location.coords.latitude),
        longitudeDelta: calculateLatLngDelta(location.coords.latitude)
      });

      map.current?.animateCamera({ center: location.coords });
    } catch (error) {
      console.log(error);
    }
  }, [onChange]);

  // Start at user location
  React.useEffect(() => {
    if (value?.lng === null || value?.lng == null) {
      setUsersLocation();
    }
  }, [setUsersLocation, value?.lng]);

  const opacity = React.useRef(new Animated.Value(0));

  const region =
    value?.lng && value?.lng
      ? {
          latitude: value.lat,
          longitude: value.lng,
          latitudeDelta: calculateLatLngDelta(value.lat),
          longitudeDelta: calculateLatLngDelta(value.lat)
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
  const markerRef = React.useRef<MapMarker>(null);

  const map = React.useRef<MapView>();
  const setCoordinateFade = React.useCallback((visible: boolean) => {
    setAnimating(true);
    (visible ? fadeIn : fadeOut).current.start(() => setAnimating(false));
  }, []);

  const [isDragging, setDragging] = React.useState<boolean>(false);
  const [internalRegion, setInternalRegion] = React.useState<Region | undefined>(region);

  return (
    <>
      <MapView
        // @ts-ignore
        ref={map}
        style={{
          ...StyleSheet.absoluteFillObject,
          marginTop: -50
        }}
        initialRegion={region}
        region={internalRegion}
        onRegionChange={(_region) => {
          setInternalRegion(_region);
          if (!isAnimating) {
            setCoordinateFade(false);
            setDragging(true);
          }
        }}
        onRegionChangeComplete={(r) => {
          fadeOut.current?.stop();
          fadeIn.current?.stop();
          setAnimating(false);
          setCoordinateFade(true);
          setCoordinateFade(true);
          setDragging(false);
          onChange(r);
        }}
        minZoomLevel={7}
        mapType="satellite"
        zoomEnabled
        scrollEnabled
        focusable
      >
        {!internalRegion ? null : (
          <Marker ref={markerRef} flat coordinate={internalRegion}>
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
        <MaterialIcons name="my-location" size={20} />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 48,
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  title: {
    position: 'absolute',
    fontSize: 30,
    top: 140,
    fontWeight: 'bold',
    color: 'white',
    left: 0,
    paddingLeft: 10,
    width: '100%',
    paddingBottom: 40,
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
    bottom: 30,
    right: 30,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 8
  }
});

export default LocationWizardStep;
