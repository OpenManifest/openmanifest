import * as React from 'react';
import { LayoutRectangle, View, ViewStyle } from 'react-native';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
// eslint-disable-next-line import/no-unresolved
import { GOOGLE_MAPS_WEB } from '@env';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as Location from 'expo-location';
import { calculateLatLngDelta } from '../../utils/calculateLatLngDelta';

interface IMapProps {
  width: number | string;
  height: number | string;
  position: {
    x: number;
    y: number;
  };
  coords?: {
    lat: number;
    lng: number;
  };
  shape: 'round' | 'square';

  children?: React.ReactNode;
  interactive?: boolean;
  center?: { lat: number; lng: number };
  mapStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  // onDragStart?(): void;
  onDragEnd?(coords: { lat: number; lng: number }): void;
}
export default function Map(props: IMapProps) {
  const { width, height, position, children, center, coords, shape, interactive, onDragEnd } =
    props;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_WEB,
    id: 'google-maps-script',
  });

  const { containerStyle, mapStyle } = props;
  const map = React.useRef<GoogleMap>(null);

  const onLoad = React.useCallback(
    async (component: GoogleMap) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      map.current = component;
      try {
        const { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        const lat = coords?.lat || location.coords.latitude;
        const lng = coords?.lng || location.coords.longitude;
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const bounds = new window.google.maps.LatLngBounds();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        map.current?.fitBounds(bounds);
      }
    },
    [coords?.lat, coords?.lng]
  );

  const onUnmount = React.useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    map.current = null;
  }, []);

  const delayedPanningTimer = React.useRef<ReturnType<typeof setTimeout>>();

  const panDelayed = React.useCallback((lat: number, lng: number) => {
    if (delayedPanningTimer) {
      clearTimeout(delayedPanningTimer.current);
      delayedPanningTimer.current = null;
    }
    return;
    if (map.current?.panTo) {
      console.log('PANNING', lat, lng);
      map.current?.panTo?.({ lat, lng });

      const latDelta = calculateLatLngDelta(lat, 0.5);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const bounds = new window.google.maps.LatLngBounds(
        { lat: lat - latDelta, lng: lng - latDelta },
        { lat: lat + latDelta, lng: lng + latDelta }
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      map.current?.fitBounds(bounds);
    } else {
      console.log('DELAYING PANNING TO ', lat, lng, map.current);
      delayedPanningTimer.current = setTimeout(() => panDelayed(lat, lng), 500);
    }
  }, []);

  React.useEffect(() => {
    if (center) {
      console.log({ center, coords });
      panDelayed(center.lat, center.lng);
    }
  }, [center, coords, panDelayed]);

  const [rootLayout, setRootLayout] = React.useState<LayoutRectangle>();
  return !isLoaded ? null : (
    <View
      onLayout={({ nativeEvent }) => setRootLayout(nativeEvent.layout)}
      style={{
        width,
        height,
        borderRadius: shape === 'round' && rootLayout?.width ? rootLayout.width / 2 : undefined,
        overflow: 'hidden',
        position: 'absolute',
        top: position.y,
        left: position.x,
        ...containerStyle,
      }}
      pointerEvents={interactive ? undefined : 'none'}
    >
      <GoogleMap
        onLoad={(component: GoogleMap) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          map.current = component;
          onLoad(component);
        }}
        center={coords}
        onDragEnd={() => {
          onDragEnd?.({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            lat: map.current.center.lat(),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            lng: map.current.center.lng(),
          });
        }}
        onUnmount={onUnmount}
        // provider={PROVIDER_GOOGLE}
        mapContainerStyle={{
          width: '100%',
          height: '100%',
          ...(mapStyle as any),
        }}
        options={{
          zoom: 15,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: false,
          mapTypeId: 'satellite',
        }}
      >
        {children}
      </GoogleMap>
    </View>
  );
}
