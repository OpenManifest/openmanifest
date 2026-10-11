import * as React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import lottie, { AnimationItem } from 'lottie-web';

interface ILottieViewProps {
  source: unknown;
  style?: StyleProp<ViewStyle>;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  onAnimationFinish?(isCancelled?: boolean): void;
}

export interface ILottieViewHandle {
  play(): void;
  reset(): void;
}

/**
 * Web implementation of the `lottie-react-native` API the app uses, on top of lottie-web.
 * Replaces react-native-web-lottie, which calls `ReactDOM.findDOMNode` (removed in React 19).
 */
const LottieView = React.forwardRef<ILottieViewHandle, ILottieViewProps>(
  function LottieView(props, ref) {
    const { source, style, autoPlay, loop, speed, onAnimationFinish } = props;
    // react-native-web hands out the DOM node as the View's ref
    const container = React.useRef<View | null>(null);
    const animation = React.useRef<AnimationItem | null>(null);
    const onFinish = React.useRef(onAnimationFinish);
    onFinish.current = onAnimationFinish;

    React.useEffect(() => {
      const node = container.current as unknown as HTMLElement | null;
      if (!node) {
        return undefined;
      }
      const anim = lottie.loadAnimation({
        container: node,
        animationData: source,
        renderer: 'svg',
        loop: !!loop,
        autoplay: !!autoPlay,
      });
      if (speed) {
        anim.setSpeed(speed);
      }
      const handleComplete = () => onFinish.current?.(false);
      anim.addEventListener('complete', handleComplete);
      animation.current = anim;
      return () => {
        anim.removeEventListener('complete', handleComplete);
        anim.destroy();
        animation.current = null;
      };
    }, [source, autoPlay, loop, speed]);

    React.useImperativeHandle(
      ref,
      () => ({
        play: () => animation.current?.play(),
        reset: () => animation.current?.stop(),
      }),
      []
    );

    return <View style={style} ref={container} />;
  }
);

export default LottieView;
