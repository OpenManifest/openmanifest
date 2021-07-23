import * as React from "react";
import { Animated, Dimensions, LayoutChangeEvent, LayoutRectangle, StyleSheet, useWindowDimensions, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GestureEvent, PanGestureHandler, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import { calculateAngle } from "../../../utils/calculateAngle";
import { mapDegreesToDirections } from "../../../utils/mapDegreesToDirection";
import MapView from 'react-native-maps';
import { calculateLatLngDelta } from "../../../utils/calculateLatLngDelta";
import { getPointOnCircle } from "../../../utils/calculateCoordinatesByAngle";


interface IJumpRunSelectorProps {
  title?: string;
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
  const { height: MAP_HEIGHT, width: MAP_WIDTH } = rootLayout;
  const CENTER_Y = (rootLayout.height / 2);
  const CENTER_X = (rootLayout.width / 2);

  const hypothenuse = Math.hypot(MAP_WIDTH, MAP_HEIGHT);

  const { latitude, longitude, value, onChange, title } = props;
  const [isDragging, setDragging] = React.useState(false);
  const [jumpRun, setJumpRun] = React.useState(value || 0);

  
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
  const planePosition = React.useRef(new Animated.Value(hypothenuse));
  const planeAnimation = React.useRef<Animated.CompositeAnimation>();

  React.useEffect(() => {
    planeAnimation.current = Animated.loop(
      Animated.timing(planePosition.current, {
        duration: 6000,
        toValue: -hypothenuse/2,
        useNativeDriver: true
      }), {
        resetBeforeIteration: true
      }
    );
  }, [hypothenuse])

  const onGestureEvent = React.useCallback((e: GestureEvent<PanGestureHandlerEventPayload>) => {
    // Stop plane animation
    planeAnimation.current?.stop();
    // Reset coordinates
    planeAnimation.current?.reset();
    const { nativeEvent } = e;
    const { x, y } = nativeEvent;

    // Current position on circle
    const currentCoordinates = {
      x,
      y,
    };

    const angle = calculateAngle({ x: rootLayout.x/2, y: rootLayout.y/2 }, currentCoordinates)
    // Find the angle between these coordinates:
    rotation.current.setValue(angle);
    
    requestAnimationFrame(() => setJumpRun(angle));
  }, [setJumpRun, JSON.stringify(rootLayout)]);



  return (
    <PanGestureHandler
      onBegan={() => {
        setDragging(true);
        planePosition.current.setValue(hypothenuse/2);
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
        planePosition.current.setValue(hypothenuse/2);
        planeAnimation.current?.start();
        onChange(jumpRun);
      }}
      {...{ onGestureEvent } }
    >
      <View style={StyleSheet.absoluteFill} onLayout={(layout) => setRootLayout(layout.nativeEvent.layout)}>
        {title && (
          <Animated.Text
            style={[styles.title, {    
              marginBottom: 4,        
              opacity: opacity.current.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              })
            }]}
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
          <View style={{...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center"}}>
          <Animated.View
            style={{
              height: hypothenuse,
              width: isDragging ? 2 : 10,
              backgroundColor: '#FF1414',
              opacity: opacity.current.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 1]
              }),
              transform: [{
                rotate: rotation.current.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg']
                }),
              }]
            }}
            
          />
        { !rootLayout?.width ? null : <Animated.View
          style={[{
            position: 'absolute',
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: planePosition.current.interpolate({
              inputRange: [-hypothenuse/2, 0, hypothenuse/2],
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
            top: CENTER_Y - 75,
            left: CENTER_X - 100,
          }]}
        >
          {Math.round(jumpRun)}
        </Animated.Text>
        </View>

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
        </MapView>
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
    left: 0,
    top: "50%",
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
  
  
});