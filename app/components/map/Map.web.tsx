import * as React from 'react';
import { LayoutRectangle, View, ViewStyle } from 'react-native';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import Constants from 'app/constants/expo';

import * as Location from 'expo-location';
import { useIsFocused } from '@react-navigation/core';

// Used if user location cant be used and we have no other fallback
// This points to Brisbane:
const DEFAULT_COORDS = { lat: -27.4705, lng: 153.026 };

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
export default function MapWebView(props: IMapProps) {
  const { width, height, position, children, center, coords: _coords, shape, interactive, onDragEnd } = props;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: Constants?.googleMapsWeb,
    id: 'google-maps-script'
  });

  const { containerStyle, mapStyle } = props;
  const map = React.useRef<GoogleMap>(null);
  const coords = _coords || DEFAULT_COORDS;

  const onLoad = React.useCallback(
    async (component: GoogleMap) => {
      // @ts-ignore
      map.current = component;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        // const location = await Location.getCurrentPositionAsync({});
        // const lat = coords?.lat || location.coords.latitude;
        // const lng = coords?.lng || location.coords.longitude;
      } catch (error) {
        console.log({ error });
      } finally {
        // @ts-ignore
        const bounds = new window.google.maps.LatLngBounds(coords);

        // @ts-ignore
        map.current?.fitBounds(bounds);
        map.current?.panTo?.(coords);
      }
    },
    [coords]
  );

  const onUnmount = React.useCallback(() => {
    // @ts-ignore
    map.current = null;
  }, []);

  const [rootLayout, setRootLayout] = React.useState<LayoutRectangle>();
  const isFocused = useIsFocused();

  return !isLoaded || !isFocused ? null : (
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
        ...containerStyle
      }}
      pointerEvents={interactive ? undefined : 'none'}
    >
      <GoogleMap
        // @ts-ignore
        onLoad={(component: GoogleMap) => {
          // @ts-ignore
          map.current = component;
          onLoad(component);
        }}
        ref={map}
        center={coords}
        onDragEnd={() => {
          onDragEnd?.({
            // @ts-ignore
            lat: map.current.center.lat(),

            // @ts-ignore
            lng: map.current.center.lng()
          });
        }}
        onUnmount={onUnmount}
        mapTypeId={google.maps.MapTypeId.HYBRID}
        mapContainerStyle={{
          width: '100%',
          height: '100%',

          // Intentional because the types for this damn map is fucked

          ...(mapStyle as any)
        }}
        options={{
          zoom: 15,
          fullscreenControl: false,
          streetViewControl: false,
          center: coords,
          mapTypeControl: false,
          mapTypeId: google.maps.MapTypeId.HYBRID,
          zoomControl: false
        }}
      >
        {children}
      </GoogleMap>
    </View>
  );
}
