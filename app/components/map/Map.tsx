import * as React from 'react';
import { View, ViewStyle } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { calculateLatLngDelta } from '../../utils/calculateLatLngDelta';

interface IMapProps {
  width: number | string;
  height: number | string;
  position?: {
    x: number;
    y: number;
  };
  coords?: {
    lat: number;
    lng: number;
  };
  shape?: 'round' | 'square';

  children?: React.ReactNode;
  interactive?: boolean;
  center?: { lat: number; lng: number };
  mapStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  onChange?(region: Region): void;
  onDragStart?(): void;
  onDragEnd?(coords: { lat: number; lng: number }): void;
}
function MapNative(props: IMapProps) {
  const { width, height, position, coords, center, shape, interactive, onChange, onDragStart, onDragEnd, children } =
    props;
  const { containerStyle, mapStyle } = props;
  const map = React.useRef<MapView>();
  const region = coords
    ? {
        latitude: coords.lat,
        longitude: coords.lng,
        latitudeDelta: calculateLatLngDelta(coords.lat),
        longitudeDelta: calculateLatLngDelta(coords.lat)
      }
    : undefined;

  const [isDragging, setDragging] = React.useState(false);

  React.useEffect(() => {
    if (center?.lat && center?.lng && map.current) {
      map.current?.animateCamera({
        center: { latitude: center.lat, longitude: center.lng }
      });
    }
  }, [center?.lat, center?.lng]);
  return (
    <View
      style={{
        width,
        height,

        // @ts-ignore Width is always a number here but must have string/number type for crossenv
        borderRadius: shape === 'round' ? width / 2 : undefined,
        overflow: 'hidden',
        ...(position?.y && position?.x
          ? {
              position: 'absolute',
              top: position.y,
              left: position.x
            }
          : {}),
        ...(containerStyle || {})
      }}
    >
      <MapView
        // @ts-ignore
        ref={map}
        provider={PROVIDER_GOOGLE}
        style={{
          width: '100%',
          height: '100%',
          ...(mapStyle || {})
        }}
        initialRegion={region}
        region={region}
        onRegionChange={() => {
          if (isDragging) {
            return;
          }
          setDragging(true);
          onDragStart?.();
        }}
        onRegionChangeComplete={(newRegion) => {
          onChange?.(newRegion);
          onDragEnd?.({ lat: newRegion.latitude, lng: newRegion.longitude });
        }}
        focusable={!!interactive}
        pointerEvents={interactive ? undefined : 'none'}
        mapType="hybrid"
      />
      {children}
    </View>
  );
}

export default MapNative;
