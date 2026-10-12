import * as React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RotationGestureHandler } from 'react-native-gesture-handler';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { mapDegreesToDirections } from '../../../utils/mapDegreesToDirection';
import { calculateLatLngDelta } from '../../../utils/calculateLatLngDelta';
import { useTheme } from 'app/ui';
import useJumpRunRotation from './useJumpRunRotation';
import useJumpRunStyles from './useJumpRunStyles';

interface IJumpRunSelectorProps {
  title?: string;
  value: number;
  latitude: number;
  longitude: number;
  onChange?(val: number): void;
}

export default function JumpRunSelector(props: IJumpRunSelectorProps) {
  const theme = useTheme();
  const styles = useJumpRunStyles('native');
  const { latitude, longitude, value, onChange } = props;
  const { guide, isDragging, jumpRun, layout, vehicle, rotation } = useJumpRunRotation(value);
  const { height: MAP_HEIGHT, width: MAP_WIDTH } = layout.dimensions;
  const CENTER_Y = layout.dimensions.height / 2;
  const CENTER_X = layout.dimensions.width / 2;
  const hypothenuse = Math.hypot(MAP_WIDTH, MAP_HEIGHT);

  React.useEffect(() => {
    if (!isDragging && jumpRun !== value) {
      onChange?.(jumpRun);
    }
  }, [jumpRun, isDragging, onChange, value]);

  return (
    <RotationGestureHandler {...rotation}>
      <View style={StyleSheet.absoluteFill} {...layout}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          region={{
            latitude,
            longitude,
            latitudeDelta: calculateLatLngDelta(latitude),
            longitudeDelta: calculateLatLngDelta(latitude),
          }}
          focusable={false}
          renderToHardwareTextureAndroid
          pointerEvents="none"
          mapType="hybrid"
        />
        <View
          style={{
            ...StyleSheet.absoluteFill,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          pointerEvents="box-only"
        >
          <Animated.View
            style={{
              height: hypothenuse,
              width: isDragging ? 2 : 10,
              backgroundColor: theme.colour.map.guide,
              opacity: vehicle.opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 1],
              }),
              transform: [
                {
                  rotate: guide.rotation.interpolate({
                    inputRange: [-100, 100],
                    outputRange: ['-100rad', '100rad'],
                  }),
                },
              ],
            }}
          />
          {!layout.dimensions?.width ? null : (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: vehicle.position.interpolate({
                    inputRange: [-hypothenuse / 2, 0, hypothenuse / 2],
                    outputRange: [0.0, 1.0, 0.0],
                  }),
                  transform: [
                    {
                      rotate: guide.rotation.interpolate({
                        inputRange: [-100, 100],
                        outputRange: ['-100rad', '100rad'],
                      }),
                    },
                    {
                      translateY: vehicle.position,
                    },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons name="airplane" size={40} color={theme.colour.map.text} />
            </Animated.View>
          )}
          <Animated.Text
            style={[
              styles.degreeLabel,
              {
                opacity: vehicle.opacity,
                top: CENTER_Y - 75,
                left: CENTER_X - 100,
              },
            ]}
          >
            {Math.round(jumpRun)}
          </Animated.Text>
        </View>

        <Animated.Text
          style={[
            styles.bottomDegreeLabel,
            {
              opacity: vehicle.opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ]}
        >
          {`${Math.round(jumpRun)}° (${mapDegreesToDirections(jumpRun)})`}
        </Animated.Text>
      </View>
    </RotationGestureHandler>
  );
}
