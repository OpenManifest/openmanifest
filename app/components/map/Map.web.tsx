import * as React from "react";
import { LayoutRectangle, StyleSheet, View, ViewStyle } from "react-native";
import { Region } from 'react-native-maps';
import { calculateLatLngDelta } from "../../utils/calculateLatLngDelta";
import { GoogleMap, useJsApiLoader,  } from '@react-google-maps/api';
import { GOOGLE_MAPS_WEB } from "@env";
import * as Location from "expo-location";

const containerStyle = {
  width: '400px',
  height: '400px'
};

const center = {
  lat: -3.745,
  lng: -38.523
};


interface IMapProps {
  width: number | string;
  height: number | string,
  position: {
    x: number,
    y: number,
  }
  coords: {
    lat: number,
    lng: number
  },
  shape: "round" | "square";
  
  children?: React.ReactNode;
  interactive?: boolean;
  center?: { lat: number, lng: number };
  mapStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  onChange(region: Region): void;
  onDragStart?(): void;
  onDragEnd?(coords: { lat: number, lng: number }): void;
}
export default function Map(props: IMapProps) {
  const { width, height, position, center, coords, shape, interactive, onDragEnd } = props;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_WEB,
    id: 'google-maps-script'
  });
  
  const { containerStyle, mapStyle } = props;
  const map = React.useRef<GoogleMap>(null);

  const onLoad = React.useCallback(async (component: GoogleMap) => {
    map.current = component;
    try {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const lat = coords.lat || location.coords.latitude;
      const lng = coords.lng || location.coords.longitude;

      const latDelta = calculateLatLngDelta(lat);
      const lngDelta = calculateLatLngDelta(lng);
      
      
    } catch (error) {
      // @ts-ignore
      const bounds = new window.google.maps.LatLngBounds();
      // @ts-ignore
      map.current?.fitBounds(bounds);
    }

    
  }, [])

  const onUnmount = React.useCallback(() => {
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
      // @ts-ignore
      const bounds = new window.google.maps.LatLngBounds(
      { lat: lat - latDelta, lng: lng - latDelta },
      { lat: lat + latDelta, lng: lng + latDelta },
      );
      // @ts-ignore
      map.current?.fitBounds(bounds);
    } else {
      console.log('DELAYING PANNING TO ', lat, lng, map.current);
      delayedPanningTimer.current = setTimeout(() => panDelayed(lat, lng), 500);
    }
  }, [isLoaded, map.current]);

  React.useEffect(() => {
    if (center) { 
      console.log({ center, coords });
      panDelayed(center.lat, center.lng);
    }
  }, [JSON.stringify(center)]);

  const [rootLayout, setRootLayout] = React.useState<LayoutRectangle>();
  return (
    !isLoaded
      ? null
      : <View
          onLayout={({ nativeEvent }) => setRootLayout(nativeEvent.layout)}
          style={{
            width,
            height,
            borderRadius: shape === "round" && rootLayout?.width
              ?  rootLayout.width / 2
              : undefined,
            overflow: 'hidden',
            position: 'absolute',
            top: position.y,
            left: position.x,
            ...containerStyle,
          }}
          pointerEvents={interactive ? undefined : "none"}
        >
          <GoogleMap
            onLoad={(component: GoogleMap) => {
              map.current = component;
              onLoad(component);
            }}
            center={coords}
            onDragEnd={() => {
              onDragEnd?.({
                // @ts-ignore
                lat: map.current.center.lat(),
                // @ts-ignore
                lng: map.current.center.lng(),
              });
            }}
            onUnmount={onUnmount}
            //provider={PROVIDER_GOOGLE}
            mapContainerStyle={{
              width: '100%',
              height: '100%',
              ...mapStyle as any,
            }}
            
            options={{
              zoom: 15,
              fullscreenControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              zoomControl: false,
              mapTypeId: "satellite"
            }}
          >
            {props.children}
          </GoogleMap>
        </View>
      );
}