import * as React from "react";
import { Animated } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Swipeable from 'react-native-gesture-handler/Swipeable';


export interface ISwipeAction {
  label: string;
  
  backgroundColor?: string;
  onPress(): void;
}
export interface ISwipeActions {
  rightAction?: ISwipeAction;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function SwipeActions(props: ISwipeActions) {
  const { children, rightAction, disabled } = props;

  const ref = React.useRef<any>();
  const rightActions = (progress: Animated.AnimatedInterpolation, dragX: Animated.AnimatedInterpolation) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1.0, 0]
    })

    const translateX = dragX.interpolate({
      inputRange: [-150, 0],
      outputRange: [0, 10]
    });

    return (
        <TouchableOpacity
          onPress={() => {
            rightAction?.onPress();
            ref?.current?.close();
          }}
        >
          <Animated.View
            style={{
              flexGrow: 1,
              backgroundColor: rightAction?.backgroundColor,
              justifyContent: 'center',
              height: "100%",
              width: 75,
              transform: [{ translateX }]
            }}>
            <Animated.Text
              style={{
                color: 'white',
                paddingHorizontal: 10,
                fontWeight: '600',
                transform: [{ scale }]
              }}>
              {rightAction?.label}
            </Animated.Text>
          </Animated.View>
        </TouchableOpacity>
    )
   }
  return (
    <Swipeable ref={ref} enabled={!disabled} renderRightActions={rightActions} useNativeAnimations>
      { children }
    </Swipeable>
  )
}