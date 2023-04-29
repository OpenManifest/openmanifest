import * as React from 'react';
import { Animated, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Step, IWizardStepProps } from 'app/components/carousel_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { calculateLatLngDelta } from 'app/utils/calculateLatLngDelta';
import MapView from 'app/components/map/Map';
import AddressSearchBar from 'app/components/input/search/AddressSearchBar';
import { useIsFocused } from '@react-navigation/core';
import * as yup from 'yup';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { useMemo } from 'app/hooks/react';

export const validation = yup.object({
  lat: yup.number().required(),
  lng: yup.number().required()
});

type StepFields = { [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K] };

export function useStep(): WizardFormStep<StepFields> {
  const {
    dropzone: { dropzone }
  } = useDropzoneContext();

  return useMemo(
    () => ({
      defaultValues: {
        lat: dropzone?.lat || 0,
        lng: dropzone?.lng || 0
      },
      validation
    }),
    [dropzone?.lat, dropzone?.lng]
  );
}

interface ILocationWizardPickerProps {
  label?: string;
  coords: { lat: number; lng: number };
  onChange(newCoords: { lat: number; lng: number }): void;
}
function LocationWizardPicker(props: ILocationWizardPickerProps) {
  const { onChange, coords, label } = props;
  const [searchText, setSearchText] = React.useState('');
  const [center, setCenter] = React.useState<{ lat: number; lng: number }>();

  const setUsersLocation = React.useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const location = await Location.getCurrentPositionAsync({});

      onChange({ lat: location.coords.latitude, lng: location.coords.longitude });

      setCenter({
        lat: location.coords.latitude,
        lng: location.coords.longitude
      });
    } catch (error) {
      console.log(error);
    }
  }, [onChange]);

  // Start at user location
  React.useEffect(() => {
    if (coords.lat === null || coords.lng == null) {
      setUsersLocation();
    }
  }, [setUsersLocation, coords.lat, coords.lng]);

  const opacity = React.useRef(new Animated.Value(0));

  const region =
    coords.lat && coords.lng
      ? {
          latitude: coords.lat,
          longitude: coords.lng,
          latitudeDelta: calculateLatLngDelta(coords.lat),
          longitudeDelta: calculateLatLngDelta(coords.lat)
        }
      : undefined;

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
    (visible ? fadeIn : fadeOut).current.start();
  }, []);

  const { height, width } = useWindowDimensions();
  const [isDragging, setDragging] = React.useState(false);
  const isFocused = useIsFocused();

  if (!isFocused) {
    return null;
  }

  return (
    <>
      <MapView
        mapStyle={{
          ...StyleSheet.absoluteFillObject
        }}
        position={{
          x: 0,
          y: 0
        }}
        {...{ height, width }}
        coords={region?.latitude && region?.longitude ? { lat: region?.latitude, lng: region?.longitude } : undefined}
        onDragStart={() => {
          setDragging(true);
          setCoordinateFade(false);
        }}
        center={center || undefined}
        onDragEnd={(r) => {
          fadeOut.current?.stop();
          fadeIn.current?.stop();
          setCoordinateFade(true);
          setDragging(false);
          onChange({ lat: r.lat, lng: r.lng });
        }}
        interactive
      >
        {!region ? null : (
          <View style={styles.markerFixed} pointerEvents="none">
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
          </View>
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
        <View style={{ width: 300, display: 'none', alignSelf: 'flex-start', marginLeft: 32 }}>
          <AddressSearchBar
            value={searchText}
            onChange={setSearchText}
            autocomplete
            onSelect={(item) => {
              if (item?.lat && item?.lng) {
                onChange({ lat: item.lat, lng: item.lng });
              }
            }}
          />
        </View>
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
    </>
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
    zIndex: 100,
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

export default LocationWizardPicker;
