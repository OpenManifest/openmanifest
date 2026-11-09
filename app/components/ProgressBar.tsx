import * as React from 'react';
import { Animated, Easing, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'app/ui';
import { useReduceMotion } from 'app/ui/components/display/Skeleton';

type Props = {
  /** Hidden (an empty 4 dp strip, so the layout does not jump) unless true; default true */
  visible?: boolean;
  /** A bar that runs while something loads, rather than one that fills to `progress` */
  indeterminate?: boolean;
  /** 0 to 1 */
  progress?: number;
  /** The fill (default: the brand colour) */
  color?: string;
  'aria-label'?: string;
  accessibilityLabel?: string;
  testID?: string;
};

const HEIGHT = 4;
const SEGMENT = 0.3;

/**
 * The thin bar at the top of a screen while it loads. A progress bar needs a name (axe `aria-progressbar-name`):
 * "Loading" unless the caller gives one. The running segment stands still when the system asks for less motion.
 */
export default function ProgressBar({
  visible = true,
  indeterminate = false,
  progress = 0,
  color,
  testID,
  ...props
}: Props) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const label = props['aria-label'] ?? props.accessibilityLabel ?? t('loading');
  const [width, setWidth] = React.useState(0);
  const run = React.useRef(new Animated.Value(0)).current;
  const running = visible && indeterminate && !reduceMotion;

  React.useEffect(() => {
    if (!running) return undefined;
    const loop = Animated.loop(
      Animated.timing(run, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => {
      loop.stop();
      run.setValue(0);
    };
  }, [run, running]);

  const fill = color || theme.colour.brand;
  const fraction = indeterminate ? SEGMENT : Math.min(1, Math.max(0, progress));

  return (
    <View
      role="progressbar"
      aria-label={label}
      accessibilityLabel={label}
      aria-busy={visible && indeterminate}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(fraction * 100)}
      testID={testID}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ height: HEIGHT, overflow: 'hidden' }}
    >
      {visible ? (
        <Animated.View
          style={{
            height: HEIGHT,
            width: `${fraction * 100}%`,
            backgroundColor: fill,
            transform: running
              ? [
                  {
                    translateX: run.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-width * SEGMENT, width],
                    }),
                  },
                ]
              : [],
          }}
        />
      ) : null}
    </View>
  );
}
