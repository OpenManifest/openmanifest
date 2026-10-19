import * as React from 'react';
import { AccessibilityInfo, Animated, Platform, View } from 'react-native';
import { useTheme } from '../../theme';

export type SkeletonProps = {
  /** Width in dp or a percentage (default the whole width) */
  width?: number | `${number}%`;
  /** Height in dp (default one line of body text) */
  height?: number;
  /** A circle, for an avatar */
  circle?: boolean;
  /** Lines of text: each is a bar, the last a little shorter */
  lines?: number;
  testID?: string;
};

const LINE = 16;

/** Whether the system asks for less motion; the pulse stands still then */
function useReduceMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((value) => mounted && setReduce(value))
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduce);
    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);
  return reduce;
}

function Bar({
  pulse,
  width,
  height,
  circle = false,
}: {
  pulse: Animated.Value;
  width: number | `${number}%`;
  height: number;
  circle?: boolean;
}) {
  const theme = useTheme();

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius: circle ? theme.radius.pill : theme.radius.sm,
        backgroundColor: theme.colour.raised,
        opacity: pulse,
      }}
    />
  );
}

/**
 * A grey placeholder where content is loading, pulsing slowly (not at all with reduced motion). It is hidden from
 * screen readers: the screen that shows it says it is busy (`aria-busy`) or has a loading label of its own.
 */
export default function Skeleton({
  width = '100%',
  height = LINE,
  circle = false,
  lines,
  testID,
}: SkeletonProps) {
  const theme = useTheme();
  const reduce = useReduceMotion();
  const [pulse] = React.useState(() => new Animated.Value(1));
  const half = theme.motion.slow * 3;

  React.useEffect(() => {
    if (reduce) {
      pulse.setValue(1);
      return undefined;
    }
    const native = Platform.OS !== 'web';
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.5, duration: half, useNativeDriver: native }),
        Animated.timing(pulse, { toValue: 1, duration: half, useNativeDriver: native }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduce, pulse, half]);

  return (
    <View
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      testID={testID}
      style={{ gap: theme.space.sm }}
    >
      {lines ? (
        Array.from({ length: lines }, (_, i) => (
          <Bar
            key={i}
            pulse={pulse}
            width={i === lines - 1 && lines > 1 ? '60%' : width}
            height={height}
          />
        ))
      ) : (
        <Bar pulse={pulse} width={circle ? height : width} height={height} circle={circle} />
      )}
    </View>
  );
}
