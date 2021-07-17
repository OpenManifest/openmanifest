import * as React from "react";
import { Animated, Dimensions, LayoutChangeEvent, LayoutRectangle, StyleSheet, useWindowDimensions, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GestureEvent, PanGestureHandler, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import { calculateAngle } from "../../utils/calculateAngle";
import { mapDegreesToDirections } from "../../utils/mapDegreesToDirection";
import MapView from 'react-native-maps';
import { calculateLatLngDelta } from "../../utils/calculateLatLngDelta";
import { getPointOnCircle } from "../../utils/calculateCoordinatesByAngle";

const { width, height } = Dimensions.get('window');

interface IJumpRunSelectorProps {
  value: number;
  latitude: number;
  longitude: number;
  onChange?(val: number): void
}

const MAP_SIZE_PERCENTAGE = 1.0;
export default function JumpRunSelector(props: IJumpRunSelectorProps) {
  const [rootLayout, setRootLayout] = React.useState<LayoutRectangle>({
    x: 0,
    y: 0,
    height: 0,
    width: 0,
  });
  const MAP_SIZE = rootLayout.width * MAP_SIZE_PERCENTAGE;
  const CENTER_Y = (rootLayout.height / 2) - 75;
  const CENTER_X = (rootLayout.width / 2) - 100;

  const { latitude, longitude, value, onChange } = props;
  const [isDragging, setDragging] = React.useState(false);
  const [jumpRun, setJumpRun] = React.useState(value || 0);
  const [origin, setOrigin] = React.useState<LayoutRectangle & { originX: number, originY: number }>({
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    originX: 0,
    originY: 0,
  });
  
  const rotation = React.useRef(
    new Animated.Value(jumpRun)
  );
  const opacity = React.useRef(
    new Animated.Value(0)
  );

  React.useEffect(() => {
    if (!isDragging) {
      setJumpRun(value);
    }
  }, [value]);

  /** ANIMATIONS **/
  const planePosition = React.useRef(new Animated.Value(0));
  const planeAnimation = React.useRef(Animated.loop(
    Animated.timing(planePosition.current, {
      duration: 3000,
      toValue: -400,
      useNativeDriver: true
    }), {
      resetBeforeIteration: true
    }
  ));

  const onGestureEvent = React.useCallback((e: GestureEvent<PanGestureHandlerEventPayload>) => {
    // Stop plane animation
    planePosition.current.setValue(0);
    planeAnimation.current.stop();

    // Reset coordinates
    planeAnimation.current.reset();
    const { nativeEvent } = e;
    const { x, y } = nativeEvent;

    // Current position on circle
    const currentCoordinates = {
      x,
      y,
    };

    const angle = calculateAngle({ x: origin.originX, y: origin.originY }, currentCoordinates)
    // Find the angle between these coordinates:
    rotation.current.setValue(angle);
    
    setJumpRun(angle);
  }, [setJumpRun, origin]);

  const onMountRotatableView = React.useCallback((event: LayoutChangeEvent) => {
    const layout = event.nativeEvent.layout;
    setOrigin({
      ...layout,
      // Center of spinny thing
      originX: layout.x + (rootLayout.width / 2),
      originY: layout.y + (rootLayout.height / 2)
    });
  }, []);

  const planeStartPosition = getPointOnCircle({
    x: origin.originX,
    y: origin.originY,
    degrees: jumpRun,
    offsetX: -20,
    offsetY: -20,
    radius: MAP_SIZE / 2
  });

 
  return (
    <PanGestureHandler
      onBegan={() => {
        setDragging(true);
        Animated.timing(opacity.current, {
          duration: 350, 
          toValue: 1,
          useNativeDriver: true
        }).start()
      }}
      onEnded={() => {
        setDragging(false);
        Animated.timing(opacity.current, {
          duration: 350, 
          toValue: 0,
          useNativeDriver: true
        }).start();
        planeAnimation.current.start();
        onChange(jumpRun);
      }}
      {...{ onGestureEvent } }
    >
      <View style={{ width: '100%', height: '100%', backgroundColor: 'red', alignItems: "center" }} onLayout={(layout) => setRootLayout(layout.nativeEvent.layout)}>
        <Animated.Text
          style={[styles.title, {    
            marginBottom: 4,        
            opacity: opacity.current.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            })
          }]}
        >
          JUMP RUN
        </Animated.Text>

        <View
          style={{
            width: MAP_SIZE,
            height: MAP_SIZE,
            borderRadius: MAP_SIZE,
            overflow: 'hidden',
            position: 'absolute',
            top: origin.y,
            left: origin.x,
          }}
        >
        <MapView
          style={{
            width: '100%',
            height: '100%',
          }}
          region={{
            latitude,
            longitude,
            latitudeDelta: calculateLatLngDelta(latitude),
            longitudeDelta: calculateLatLngDelta(latitude),
          }}
          focusable={false}
          pointerEvents="none"
          mapType="satellite"
        />
        </View>

        <Animated.View
          onLayout={onMountRotatableView}
          style={[styles.iconContainer, {
            width: rootLayout.width * MAP_SIZE_PERCENTAGE,
            height: rootLayout.width * MAP_SIZE_PERCENTAGE,
            transform: [{
              rotate: rotation.current.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg']
              })
            }]
          }]}
        >
          <Animated.View
            style={{
              height: MAP_SIZE,
              width: 2,
              backgroundColor: '#FF1414',
              opacity: opacity.current.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 1]
              }),
              transform: [{
                scaleX: opacity.current.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 1]
                }),
              }]
            }}
          />
        </Animated.View>
        { !rootLayout?.width ? null : <Animated.View
          style={[{
            position: 'absolute',
            width: 40,
            height: 40,
            top: planeStartPosition.y,
            left: planeStartPosition.x,
            opacity: planePosition.current.interpolate({
              inputRange: [-400, -200, 400],
              outputRange: [0.0, 1.0, 0.0],
            }),
            transform: [{
              rotate: rotation.current.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg']
              }),
            }, {
              translateY: planePosition.current,
            }]
          }]}
        >
          <MaterialCommunityIcons
            name={"airplane"}
            size={40}
            color="#ffffff"
          />
        </Animated.View>}
        <Animated.Text
          style={[styles.degreeLabel, {
            opacity: opacity.current,
            top: CENTER_Y,
            left: CENTER_X,
          }]}
        >
          {Math.round(jumpRun)}
        </Animated.Text>

        <Animated.Text
          style={[styles.bottomDegreeLabel, {
            opacity: opacity.current.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            })
          }]}
        >
          {Math.round(jumpRun)}&deg; ({mapDegreesToDirections(jumpRun)})
        </Animated.Text>
      </View>
    </PanGestureHandler>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    alignItems: "center",
    paddingLeft: 0,
    paddingRight: 0,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: 'white',
    left: 0,
    width: "100%",
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
    bottom: 50,
    left: 0,
    width: "100%",
    textAlign: 'center',
    textShadowColor: 'rgba(15, 15, 15, 0.5)',
    textShadowRadius: 10,
    textShadowOffset: {
      width: 2,
      height: 2,
    },
  },

  content: {
    width: "100%",
    flexDirection: "column",
  },
  iconContainer: {
    borderWidth: 10,
    borderRadius: width / 2,
    borderStyle: 'solid',
    borderColor: 'pink',
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },

  
});