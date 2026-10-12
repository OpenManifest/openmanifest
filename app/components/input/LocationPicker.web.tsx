import * as React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Region } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'app/ui';
import MyLocationButton from './location/MyLocationButton';
import useMarkerStyle from './location/MarkerStyle';

import * as Location from 'expo-location';
import MapView from '../map/Map';

interface ILocationPickerProps {
  markerSize?: number;
  labelSize?: number;
  value: {
    lat: number;
    lng: number;
  };
  onChange(region: Pick<Region, 'latitude' | 'longitude'>): void;
}
export function LocationWizardStep(props: ILocationPickerProps) {
  const { markerSize, labelSize, value = { lat: -27.550908, lng: 153.111635 }, onChange } = props;
  const theme = useTheme();
  const marker = useMarkerStyle();
  const [center, setCenter] = React.useState<{ lat: number; lng: number }>();
  const setUsersLocation = React.useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setCenter({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    } catch {}
  }, []);

  // Start at user location
  React.useEffect(() => {
    if (value?.lng === null || value?.lng == null) {
      setUsersLocation();
    }
  }, [setUsersLocation, value?.lng]);

  const opacity = React.useRef(new Animated.Value(0));

  const region =
    value.lng && value.lng
      ? {
          lat: value.lat,
          lng: value.lng,
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

  const setCoordinateFade = React.useCallback((visible: boolean) => {
    setAnimating(true);
    (visible ? fadeIn : fadeOut).current.start(() => setAnimating(false));
  }, []);

  const [isDragging, setDragging] = React.useState<boolean>(false);

  return (
    <MapView
      position={{
        x: 0,
        y: 0,
      }}
      width="100%"
      height="100%"
      mapStyle={{
        ...StyleSheet.absoluteFill,
        top: -theme.space.xxxl,
      }}
      coords={region}
      center={center || region}
      onDragStart={() => {
        if (!isAnimating) {
          setCoordinateFade(false);
          setDragging(true);
        }
      }}
      onDragEnd={(r) => {
        fadeOut.current?.stop();
        fadeIn.current?.stop();
        setAnimating(false);
        setCoordinateFade(true);
        setCoordinateFade(true);
        setDragging(false);
        onChange({
          longitude: r.lng,
          latitude: r.lat,
        });
      }}
      interactive
    >
      {!region ? null : (
        <View style={styles.markerFixed} pointerEvents="none">
          <MaterialCommunityIcons
            pointerEvents="none"
            size={markerSize || 60}
            style={marker.pin}
            name={isDragging ? 'map-marker' : 'map-marker-check-outline'}
          />
          <Animated.Text
            style={{
              ...theme.type.title,
              fontSize: labelSize || theme.type.title.fontSize,
              position: 'absolute',
              bottom: '30%',
              width: '100%',
              opacity: opacity.current,
              textAlign: 'center',
              ...marker.label,
            }}
          >
            {region.lat.toFixed(5)},{region.lng.toFixed(5)}
          </Animated.Text>
        </View>
      )}

      <MyLocationButton onPress={() => setUsersLocation()} />
    </MapView>
  );
}

const styles = StyleSheet.create({
  markerFixed: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
});

export default LocationWizardStep;
