import * as React from 'react';
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  View,
} from 'react-native';
import isEqual from 'lodash/isEqual';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getPointOnCircle } from 'app/utils/calculateCoordinatesByAngle';
import Map from 'app/components/map/Map';

const { width } = Dimensions.get('window');

interface IJumpRunMapProps {
  jumpRun: number;
  lat?: number | null;
  lng?: number | null;
}

const MAP_SIZE_PERCENTAGE = 1.0;
function JumpRunMap(props: IJumpRunMapProps) {
  const { lat, lng } = props;
  const [rootLayout, setRootLayout] = React.useState<LayoutRectangle>({
    x: 0,
    y: 0,
    height: 0,
    width: 0,
  });
  const MAP_SIZE = rootLayout.width * MAP_SIZE_PERCENTAGE;
  const CENTER_Y = rootLayout.height / 2;
  const CENTER_X = rootLayout.width / 2;

  const { jumpRun } = props;
  const [origin, setOrigin] = React.useState<
    LayoutRectangle & { originX: number; originY: number }
  >({
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    originX: 0,
    originY: 0,
  });

  const opacity = React.useRef(new Animated.Value(0));

  /** ANIMATIONS * */
  const planePosition = React.useRef(new Animated.Value(0));
  const planeAnimation = React.useRef(
    Animated.loop(
      Animated.timing(planePosition.current, {
        duration: 3000,
        toValue: -400,
        useNativeDriver: true,
      }),
      {
        resetBeforeIteration: true,
      }
    )
  );

  const onMountRotatableView = React.useCallback(
    (event: LayoutChangeEvent) => {
      const { layout } = event.nativeEvent;
      setOrigin({
        ...layout,
        // Center of spinny thing
        originX: layout.x + rootLayout.width / 2,
        originY: layout.y + rootLayout.height / 2,
      });
    },
    [rootLayout.height, rootLayout.width]
  );

  React.useEffect(() => {
    'worklet';

    planeAnimation.current.start();
  }, []);

  const animate = () => {
    'worklet';

    planeAnimation.current.stop();
    planeAnimation.current.reset();
    planeAnimation.current.start();
  };

  React.useEffect(() => {
    animate();
  }, [jumpRun]);

  const planeStartPosition = getPointOnCircle({
    x: origin.x,
    y: origin.y,
    degrees: jumpRun,
    offsetX: 0,
    offsetY: 0,
    radius: rootLayout.height / 2,
  });

  const position = React.useMemo(() => ({ x: 0, y: 0 }), []);
  const coords = React.useMemo(() => (lat && lng ? { lat, lng } : undefined), [lat, lng]);

  return (
    <View
      onLayout={({ nativeEvent }) => setRootLayout(nativeEvent.layout)}
      style={{ width: '100%', height: '100%' }}
    >
      <View
        style={{
          width: MAP_SIZE,
          height: MAP_SIZE,
          borderRadius: MAP_SIZE / 2,
          overflow: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <Map
          coords={coords}
          center={coords}
          height={MAP_SIZE}
          width={MAP_SIZE}
          position={position}
          interactive={false}
        />
      </View>

      <Animated.View
        onLayout={onMountRotatableView}
        style={[
          styles.iconContainer,
          {
            width: MAP_SIZE,
            height: MAP_SIZE,
            position: 'absolute',
            top: 0,
            left: 0,
            transform: [
              {
                rotate: `${jumpRun}deg`,
              },
            ],
          },
        ]}
      >
        <Animated.View
          style={{
            height: MAP_SIZE - 6,
            width: 1,
            backgroundColor: '#FF1414',
            opacity: opacity.current.interpolate({
              inputRange: [0, 1],
              outputRange: [0.6, 1],
            }),
            transform: [
              {
                scaleX: opacity.current.interpolate({
                  inputRange: [0, 1],
                  outputRange: [3, 1],
                }),
              },
            ],
          }}
        />
      </Animated.View>
      {!rootLayout?.width ? null : (
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 20,
              height: 20,
              top: planeStartPosition.y,
              left: planeStartPosition.x,
              opacity: planePosition.current.interpolate({
                inputRange: [-MAP_SIZE, -MAP_SIZE / 2, MAP_SIZE],
                outputRange: [0.0, 1.0, 0.0],
              }),
              transform: [
                {
                  rotate: `${jumpRun}deg`,
                },
                {
                  translateY: planePosition.current,
                },
              ],
            },
          ]}
        >
          <MaterialCommunityIcons name="airplane" size={20} color="#ffffff" />
        </Animated.View>
      )}
      <Animated.Text
        style={[
          styles.degreeLabel,
          {
            opacity: opacity.current,
            top: CENTER_Y,
            left: CENTER_X,
          },
        ]}
      >
        {Math.round(jumpRun)}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    alignItems: 'center',
    paddingLeft: 0,
    paddingRight: 0,
  },

  degreeLabel: {
    width: 200,
    height: 120,
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

  content: {
    width: '100%',
    flexDirection: 'column',
  },
  iconContainer: {
    borderWidth: 2,
    borderRadius: width / 2,
    borderStyle: 'solid',
    borderColor: 'white',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(JumpRunMap, (a, b) => isEqual(a, b));
