import * as React from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Region } from 'react-native-maps';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import * as Location from 'expo-location';
import Map from '../map/Map';

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
  const { markerSize, labelSize, value, onChange } = props;
  const [center, setCenter] = React.useState<{ lat: number; lng: number }>();
  const setUsersLocation = React.useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      console.log('user location', location.coords);
      setCenter({
        lat: location.coords.latitude,
        lng: location.coords.longitude
      });
    } catch (error) {
      console.log(error);
    }
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
          lng: value.lng
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
    (visible ? fadeIn : fadeOut).current.start(() => setAnimating(false));
  }, []);

  const [isDragging, setDragging] = React.useState<boolean>(false);

  return (
    <Map
      position={{
        x: 0,
        y: 0
      }}
      width="100%"
      height="100%"
      mapStyle={{
        ...StyleSheet.absoluteFillObject,
        marginTop: -50
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
          latitude: r.lat
        });
      }}
      interactive
    >
      {!region ? null : (
        <View style={styles.markerFixed} pointerEvents="none">
          <MaterialCommunityIcons
            pointerEvents="none"
            size={markerSize || 60}
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
          <Animated.Text
            style={{
              fontSize: labelSize || 30,
              position: 'absolute',
              bottom: '30%',
              width: '100%',
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
            {region.lat.toFixed(5)},{region.lng.toFixed(5)}
          </Animated.Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.myLocation}
        onPress={() => {
          setUsersLocation();
        }}
      >
        <MaterialIcons name="my-location" size={20} />
      </TouchableOpacity>
    </Map>
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
