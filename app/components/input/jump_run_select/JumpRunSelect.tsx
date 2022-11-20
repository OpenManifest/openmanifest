import * as React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RotationGestureHandler } from 'react-native-gesture-handler';
import MapView from 'react-native-maps';
import { mapDegreesToDirections } from '../../../utils/mapDegreesToDirection';
import { calculateLatLngDelta } from '../../../utils/calculateLatLngDelta';
import useJumpRunRotation from './useJumpRunRotation';

interface IJumpRunSelectorProps {
  title?: string;
  value: number;
  latitude: number;
  longitude: number;
  onChange?(val: number): void;
}

export default function JumpRunSelector(props: IJumpRunSelectorProps) {
  const { latitude, longitude, value, onChange, title } = props;
  const { guide, isDragging, jumpRun, layout, plane, rotation } = useJumpRunRotation(value);
  const { height: MAP_HEIGHT, width: MAP_WIDTH } = layout.dimensions;
  const CENTER_Y = layout.dimensions.height / 2;
  const CENTER_X = layout.dimensions.width / 2;
  const hypothenuse = Math.hypot(MAP_WIDTH, MAP_HEIGHT);

  React.useEffect(() => {
    if (!isDragging && jumpRun !== value) {
      console.debug('Updating jumprun to', jumpRun);
      onChange?.(jumpRun);
    }
  }, [jumpRun, isDragging, onChange, value]);

  return (
    <RotationGestureHandler {...rotation}>
      <View style={StyleSheet.absoluteFill} {...layout}>
        {title && (
          <Animated.Text
            style={[
              styles.title,
              {
                marginBottom: 4,
                opacity: plane.opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              },
            ]}
          >
            {title}
          </Animated.Text>
        )}
        <MapView
          style={StyleSheet.absoluteFill}
          region={{
            latitude,
            longitude,
            latitudeDelta: calculateLatLngDelta(latitude),
            longitudeDelta: calculateLatLngDelta(latitude),
          }}
          focusable={false}
          pointerEvents="none"
          mapType="satellite"
        >
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Animated.View
              style={{
                height: hypothenuse,
                width: isDragging ? 2 : 10,
                backgroundColor: '#FF1414',
                opacity: plane.opacity.interpolate({
                  inputRange: [-100, 100],
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
                    opacity: plane.position.interpolate({
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
                        translateY: plane.position,
                      },
                    ],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  style={{ transform: [{ rotate: '-45deg' }] }}
                  name="airplane"
                  size={40}
                  color="#ffffff"
                />
              </Animated.View>
            )}
            <Animated.Text
              style={[
                styles.degreeLabel,
                {
                  opacity: plane.opacity,
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
                opacity: plane.opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              },
            ]}
          >
            {Math.round(jumpRun)}&deg; ({mapDegreesToDirections(jumpRun)})
          </Animated.Text>
        </MapView>
      </View>
    </RotationGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    alignItems: 'center',
    paddingLeft: 0,
    paddingRight: 0,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: 'white',
    left: 0,
    width: '100%',
    paddingBottom: 40,
    textAlign: 'center',
    textShadowColor: 'rgba(15, 15, 15, 0.5)',
    textShadowRadius: 10,
    textShadowOffset: {
      width: 2,
      height: 2,
    },
  },
  degreeLabel: {
    width: 200,
    height: 120,
    left: 0,
    top: '50%',
    textAlign: 'center',
    textShadowColor: 'rgba(15, 15, 15, 0.5)',
    textShadowRadius: 10,
    textShadowOffset: {
      width: 2,
      height: 2,
    },
    fontSize: 100,
    color: 'white',
    position: 'absolute',
  },
  bottomDegreeLabel: {
    fontSize: 50,
    fontWeight: 'bold',
    color: 'white',
    position: 'absolute',
    top: 100,
    left: 0,
    width: '100%',
    textAlign: 'center',
    textShadowColor: 'rgba(15, 15, 15, 0.5)',
    textShadowRadius: 10,
    textShadowOffset: {
      width: 2,
      height: 2,
    },
  },

  content: {
    width: '100%',
    flexDirection: 'column',
  },
});
