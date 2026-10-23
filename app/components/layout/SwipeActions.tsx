import * as React from 'react';
import { Animated } from 'react-native';
import { Tappable, useTheme } from 'app/ui';
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
  const theme = useTheme();

  const ref = React.useRef<Swipeable | null>(null);
  const rightActions = (
    progress: Animated.AnimatedInterpolation<string | number>,
    dragX: Animated.AnimatedInterpolation<string | number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1.0, 0],
    });

    const translateX = dragX.interpolate({
      inputRange: [-150, 0],
      outputRange: [0, 10],
    });

    return (
      <Tappable
        role="button"
        aria-label={rightAction?.label ?? ''}
        minTarget={false}
        onPress={() => {
          rightAction?.onPress();
          ref?.current?.close();
        }}
        style={{ height: '100%' }}
      >
        <Animated.View
          style={{
            flexGrow: 1,
            backgroundColor: rightAction?.backgroundColor,
            justifyContent: 'center',
            height: '100%',
            width: 75,
            transform: [{ translateX }],
          }}
        >
          <Animated.Text
            style={{
              color: theme.colour.map.text,
              paddingHorizontal: theme.space.sm,
              fontWeight: '600',
              transform: [{ scale }],
            }}
          >
            {rightAction?.label}
          </Animated.Text>
        </Animated.View>
      </Tappable>
    );
  };
  return (
    <Swipeable
      // @ts-ignore
      ref={ref}
      enabled={!disabled}
      renderRightActions={rightActions}
      useNativeAnimations
    >
      {children}
    </Swipeable>
  );
}
