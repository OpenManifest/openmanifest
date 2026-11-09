import * as React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { IconButton, useStyles, type Theme } from 'app/ui';

const MARKER_SIZE = 60;

/** The pin in the middle of the map (map-marker while dragging) */
export function CentreMarker({ dragging }: { dragging: boolean }) {
  const styles = useStyles(stylesFor);
  return (
    <MaterialCommunityIcons
      pointerEvents="none"
      size={MARKER_SIZE}
      style={styles.marker}
      name={dragging ? 'map-marker' : 'map-marker-check-outline'}
      aria-hidden
    />
  );
}

/** The coordinates over the top of the map and the "my location" button: map text on a halo, whatever the scheme */
export function MapControls(props: {
  latitude?: number | null;
  longitude?: number | null;
  opacity: Animated.Value;
  onMyLocation(): void;
}) {
  const { latitude, longitude, opacity, onMyLocation } = props;
  const { t } = useTranslation('common');
  const styles = useStyles(stylesFor);

  return (
    <>
      <View style={styles.myLocation}>
        <IconButton
          icon="crosshairs-gps"
          aria-label={t('operatorWizard.myLocation')}
          onPress={onMyLocation}
        />
      </View>
      <View style={styles.titleContainer} pointerEvents="none">
        <Animated.Text style={[styles.coordinates, { opacity }]}>
          {!latitude || !longitude ? null : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
        </Animated.Text>
      </View>
    </>
  );
}

const stylesFor = (theme: Theme) => ({
  marker: {
    color: theme.colour.map.text,
    textShadowColor: theme.colour.map.halo,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    zIndex: 10,
  },
  markerFixed: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  titleContainer: {
    position: 'absolute' as const,
    top: theme.space.xxl,
    left: 0,
    width: '100%' as const,
    paddingHorizontal: theme.space.lg,
    alignItems: 'center' as const,
  },
  coordinates: {
    ...theme.type.title,
    marginTop: theme.space.lg,
    textAlign: 'center' as const,
    color: theme.colour.map.text,
    textShadowColor: theme.colour.map.halo,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  myLocation: {
    position: 'absolute' as const,
    bottom: '30%' as const,
    right: theme.space.xxl,
    backgroundColor: theme.colour.surface,
    borderRadius: theme.radius.pill,
    padding: theme.space.xs,
  },
});

/** Lays the centre marker over the middle of the map */
export function CentreMarkerLayer({ dragging }: { dragging: boolean }) {
  const styles = useStyles(stylesFor);
  return (
    <View style={styles.markerFixed} pointerEvents="none">
      <CentreMarker dragging={dragging} />
    </View>
  );
}
