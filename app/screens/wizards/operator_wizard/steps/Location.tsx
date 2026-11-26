import * as React from 'react';
import { useWatch } from 'react-hook-form';
import { Animated, StyleSheet } from 'react-native';
import MapView, { Region, Marker, MapMarker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { Step, IWizardStepProps } from 'app/components/carousel_wizard';
import { calculateLatLngDelta } from 'app/utils/calculateLatLngDelta';
import { useOperatorWizardFields } from '../useOperatorWizardForm';
import { CentreMarker, MapControls } from './MapOverlay';

const FADE_MS = 100;

/** Where the operator is: a satellite map with a pin, starting at the device's location */
function LocationWizardStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control, setField } = useOperatorWizardFields();
  const [name, lat, lng] = useWatch({ control, name: ['name', 'lat', 'lng'] });
  const map = React.useRef<MapView>(null);

  const region = React.useMemo(
    () =>
      lat && lng
        ? {
            latitude: lat,
            longitude: lng,
            latitudeDelta: calculateLatLngDelta(lat),
            longitudeDelta: calculateLatLngDelta(lat),
          }
        : undefined,
    [lat, lng]
  );
  const [internalRegion, setInternalRegion] = React.useState<Region | undefined>(region);

  const setUsersLocation = React.useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const location = await Location.getCurrentPositionAsync({});

      setField('lat', location.coords.latitude);
      setField('lng', location.coords.longitude);

      setInternalRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: calculateLatLngDelta(location.coords.latitude),
        longitudeDelta: calculateLatLngDelta(location.coords.latitude),
      });
      map.current?.animateCamera({ center: location.coords });
    } catch {
      // No location: the map stays where it is
    }
  }, [setField]);

  // Start at user location
  React.useEffect(() => {
    if (!region?.latitude || !region?.longitude) {
      setUsersLocation();
    }
  }, [region, setUsersLocation]);

  const [opacity] = React.useState(() => new Animated.Value(0));
  const [isAnimating, setAnimating] = React.useState<boolean>(false);
  const fades = React.useMemo(
    () => ({
      in: Animated.timing(opacity, { duration: FADE_MS, toValue: 1.0, useNativeDriver: true }),
      out: Animated.timing(opacity, { duration: FADE_MS, toValue: 0.0, useNativeDriver: true }),
    }),
    [opacity]
  );
  const setCoordinateFade = React.useCallback(
    (visible: boolean) => {
      setAnimating(true);
      (visible ? fades.in : fades.out).start(() => setAnimating(false));
    },
    [fades]
  );

  const markerRef = React.useRef<MapMarker>(null);
  const [isDragging, setDragging] = React.useState<boolean>(false);

  return (
    <Step {...props} title={t('operatorWizard.locationTitle')}>
      <MapView
        ref={map}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onTouchStart={() => {
          markerRef.current?.hideCallout();
        }}
        onRegionChange={(changed) => {
          if (!isAnimating) {
            setCoordinateFade(false);
            setDragging(true);
          }
          setInternalRegion(changed);
        }}
        onRegionChangeComplete={(r) => {
          fades.out.stop();
          fades.in.stop();
          setDragging(false);
          setAnimating(false);
          setCoordinateFade(true);
          setField('lat', r.latitude);
          setField('lng', r.longitude);
        }}
        mapType="hybrid"
        zoomEnabled
        scrollEnabled
        focusable
      >
        {!internalRegion ? null : (
          <Marker title={name || undefined} ref={markerRef} flat coordinate={internalRegion}>
            <CentreMarker dragging={isDragging} />
          </Marker>
        )}
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
