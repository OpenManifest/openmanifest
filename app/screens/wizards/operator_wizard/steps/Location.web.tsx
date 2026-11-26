import * as React from 'react';
import { useWatch } from 'react-hook-form';
import { Animated, StyleSheet, useWindowDimensions } from 'react-native';
import * as Location from 'expo-location';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Step, IWizardStepProps } from 'app/components/carousel_wizard';
import { calculateLatLngDelta } from 'app/utils/calculateLatLngDelta';
import MapView from 'app/components/map/Map';
import { useOperatorWizardFields } from '../useOperatorWizardForm';
import { CentreMarkerLayer, MapControls } from './MapOverlay';

const FADE_MS = 100;

/** Where the operator is: the map is dragged under a fixed pin, starting at the device's location */
function LocationWizardStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control, setField } = useOperatorWizardFields();
  const [lat, lng] = useWatch({ control, name: ['lat', 'lng'] });
  const [center, setCenter] = React.useState<{ lat: number; lng: number }>();

  const setUsersLocation = React.useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const location = await Location.getCurrentPositionAsync({});

      setField('lat', location.coords.latitude);
      setField('lng', location.coords.longitude);
      setCenter({ lat: location.coords.latitude, lng: location.coords.longitude });
    } catch {
      // No location: the map stays where it is
    }
  }, [setField]);

  // Start at user location
  React.useEffect(() => {
    if (lat === null || lng == null) {
      setUsersLocation();
    }
  }, [setUsersLocation, lat, lng]);

  const [opacity] = React.useState(() => new Animated.Value(0));

  const region =
    lat && lng
      ? {
          latitude: lat,
          longitude: lng,
          latitudeDelta: calculateLatLngDelta(lat),
          longitudeDelta: calculateLatLngDelta(lat),
        }
      : undefined;

  const fades = React.useMemo(
    () => ({
      in: Animated.timing(opacity, { duration: FADE_MS, toValue: 1.0, useNativeDriver: true }),
      out: Animated.timing(opacity, { duration: FADE_MS, toValue: 0.0, useNativeDriver: true }),
    }),
    [opacity]
  );
  const setCoordinateFade = React.useCallback(
    (visible: boolean) => {
      (visible ? fades.in : fades.out).start();
    },
    [fades]
  );

  const { height, width } = useWindowDimensions();
  const [isDragging, setDragging] = React.useState(false);
  const isFocused = useIsFocused();

  if (!isFocused) {
    return null;
  }

  return (
    <Step {...props} title={t('operatorWizard.locationTitle')} hideContentUntilNavigatedTo>
      <MapView
        mapStyle={{ ...StyleSheet.absoluteFill }}
        position={{ x: 0, y: 0 }}
        {...{ height, width }}
        coords={
          region?.latitude && region?.longitude
            ? { lat: region?.latitude, lng: region?.longitude }
            : undefined
        }
        onDragStart={() => {
          setDragging(true);
          setCoordinateFade(false);
        }}
        center={center || undefined}
        onDragEnd={(r) => {
          fades.out.stop();
          fades.in.stop();
          setCoordinateFade(true);
          setDragging(false);
          setField('lat', r.lat);
          setField('lng', r.lng);
        }}
        interactive
      >
        {!region ? null : <CentreMarkerLayer dragging={isDragging} />}
      </MapView>
      <MapControls
        latitude={region?.latitude}
        longitude={region?.longitude}
        opacity={opacity}
        onMyLocation={setUsersLocation}
      />
    </Step>
  );
}

export default LocationWizardStep;
