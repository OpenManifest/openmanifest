import * as React from 'react';
import { Animated, LayoutChangeEvent, LayoutRectangle } from 'react-native';
import {
  GestureEvent,
  RotationGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler';
import { isDevice } from 'expo-device';

function radiansToDegrees(radians: number) {
  let degrees = radians * (180 / Math.PI);
  if (degrees < 0) {
    degrees = 360 + degrees;
  }
  return Math.floor(degrees % 360);
}

function degreesToRadians(degrees: number) {
  return Math.floor((degrees % 360) * (Math.PI / 180));
}

export default function useJumpRunRotation(value: number) {
  const [rootLayout, setRootLayout] = React.useState<LayoutRectangle>({
    x: 0,
    y: 0,
    height: 0,
    width: 0,
  });
  const { height: MAP_HEIGHT, width: MAP_WIDTH } = rootLayout;

  const hypothenuse = Math.hypot(MAP_WIDTH, MAP_HEIGHT);
  const [isDragging, setDragging] = React.useState(false);
  const [jumpRun, setJumpRun] = React.useState(value || 0);

  const rotation = React.useRef(new Animated.Value(degreesToRadians(jumpRun)));
  const opacity = React.useRef(new Animated.Value(0));

  /** ANIMATIONS * */
  const planePosition = React.useRef(new Animated.Value(hypothenuse || 0));
  const planeAnimation = React.useRef<Animated.CompositeAnimation>();

  React.useEffect(() => {
    planeAnimation.current = Animated.loop(
      Animated.timing(planePosition.current, {
        duration: 6000,
        toValue: -hypothenuse / 2,
        useNativeDriver: true,
      }),
      {
        resetBeforeIteration: true,
      }
    );
  }, [hypothenuse]);

  React.useEffect(() => {
    rotation.current.addListener(({ value: rotationValue }) => {
      setJumpRun(radiansToDegrees(rotationValue));
    });
  }, []);

  React.useEffect(() => {
    if (!isDragging && jumpRun !== value) {
      console.debug('Setting jump run from initial value ', value, ', was ', jumpRun);
    }
  }, [isDragging, jumpRun, value]);

  const lastRotation = React.useRef(0);
  const rotationGestureEvent = React.useRef(
    Animated.event([{ nativeEvent: { rotation: rotation.current } }], { useNativeDriver: isDevice })
  );

  const onHandlerStateChange = React.useCallback(
    (e: GestureEvent<RotationGestureHandlerEventPayload>) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (e.nativeEvent.oldState === State.ACTIVE) {
        console.debug({ lastRotation: lastRotation.current, rotation: e.nativeEvent.rotation });
        lastRotation.current += e.nativeEvent.rotation;
        rotation.current.setOffset(lastRotation.current);
        rotation.current.setValue(0);
        console.debug({
          lastRotation: lastRotation.current,
          lastRotationDegrees: radiansToDegrees(lastRotation.current),
        });
      }
    },
    []
  );

  const onBegan = React.useCallback(() => {
    setDragging(true);
    planePosition.current.setValue(hypothenuse / 2);
    Animated.timing(opacity.current, {
      duration: 350,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [hypothenuse]);
  const onEnded = React.useCallback(() => {
    setDragging(false);
    Animated.timing(opacity.current, {
      duration: 350,
      toValue: 0,
      useNativeDriver: true,
    }).start();
    planePosition.current.setValue(hypothenuse / 2);
    planeAnimation.current?.start();
  }, [hypothenuse]);

  const onLayout = React.useCallback((e: LayoutChangeEvent) => {
    setRootLayout(e.nativeEvent.layout);
  }, []);

  return {
    jumpRun,
    layout: { onLayout, dimensions: rootLayout },
    rotation: {
      onGestureEvent: rotationGestureEvent.current,
      onHandlerStateChange,
      onEnded,
      onBegan,
    },
    guide: {
      hypothenuse,
      rotation: rotation.current,
    },
    plane: {
      position: planePosition.current,
      opacity: opacity.current,
      animation: planeAnimation.current,
    },
    isDragging,
  };
}
