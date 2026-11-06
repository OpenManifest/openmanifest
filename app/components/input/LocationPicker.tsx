import * as React from 'react';
import { Animated, StyleSheet } from 'react-native';
import MapView, { MapMarker, Marker, Region } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'app/ui';
import MyLocationButton from './location/MyLocationButton';
import useMarkerStyle from './location/MarkerStyle';

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
  const theme = useTheme();
  const marker = useMarkerStyle();
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
        longitudeDelta: calculateLatLngDelta(location.coords.latitude),
      });

      map.current?.animateCamera({ center: location.coords });
    } catch {}
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
          longitudeDelta: calculateLatLngDelta(value.lat),
        }
      : undefined;

  const [isAnimating, setAnimating] = React.useState<boolean>(false);
  const fadeOut = React.useRef(
    Animated.timing(opacity.current, {
      duration: 100,
      toValue: 0.0,
      useNativeDriver: true,
    })
  );
  const fadeIn = React.useRef(
    Animated.timing(opacity.current, {
      duration: 100,
      toValue: 1.0,
      useNativeDriver: true,
    })
  );
  const markerRef = React.useRef<MapMarker>(null);

  const map = React.useRef<MapView>(undefined);
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
          ...StyleSheet.absoluteFill,
          top: -theme.space.xxxl,
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
              style={marker.pin}
              name={isDragging ? 'map-marker' : 'map-marker-check-outline'}
            />
          </Marker>
        )}
      </MapView>

      <MyLocationButton onPress={() => setUsersLocation()} />
    </>
  );
}

export default LocationWizardStep;
