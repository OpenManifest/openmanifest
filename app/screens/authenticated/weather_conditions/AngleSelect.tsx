import * as React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { createWorklet, useAnimatedGestureHandler, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring } from 'react-native-reanimated';

const { concat, interpolate } = Animated;

export default function AngleSelect(){
  const x = useSharedValue(0);
  const startX = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      startX.value = x.value;
    },
    onActive: (event, ctx) => {
      x.value = startX.value + event.translationX;
    },
    onEnd: (_) => {
      x.value = withSpring(0);
    },
  });


  const animatedStyle = useAnimatedStyle(() => {
    'worklet'
    const value = interpolate(x.value, [0, width], [0, 360]);
    const rotate = concat(value, 'deg');
    return {
    transform: [{
        rotate
      }]
    };
  });

  const { width } = useWindowDimensions();

  return (
    <PanGestureHandler
        onGestureEvent={(event) => {
            switch (event.nativeEvent.state) {
                case State.ACTIVE:
                    x.value = startX.value + event.nativeEvent.translationX;
                    break;
                case State.BEGAN:
                    startX.value = x.value;
                    break;
                case State.END:
                    x.value = withSpring(0);
                    break;
            }
        }}
    >
    <View style={styles.container}>

      <Animated.View style={animatedStyle}>
        <View style={styles.box} />
      </Animated.View>
    </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: "white"
  }
})