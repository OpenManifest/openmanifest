import * as React from 'react';
import { Animated, Easing, Platform } from 'react-native';
import { easing, motion } from '../tokens/motion';
import { useReduceMotion } from './useReduceMotion';

/**
 * The opacity of a highlight that marks something that just changed: full when `active` turns on, then fading out over
 * `motion.highlight`, without movement. With reduced motion it does not fade: it shows while `active` and goes when
 * `active` turns off (callers turn it off after `motion.highlight`).
 */
export function useHighlight(active: boolean) {
  const reduce = useReduceMotion();
  const [opacity] = React.useState(() => new Animated.Value(active ? 1 : 0));

  React.useEffect(() => {
    if (!active) {
      opacity.setValue(0);
      return undefined;
    }
    opacity.setValue(1);
    if (reduce) return undefined;
    const fade = Animated.timing(opacity, {
      toValue: 0,
      duration: motion.highlight,
      easing: Easing.bezier(...easing.standard),
      useNativeDriver: Platform.OS !== 'web',
    });
    fade.start();
    return () => fade.stop();
  }, [active, opacity, reduce]);

  return opacity;
}
