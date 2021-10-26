import * as React from 'react';
import { Snackbar } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAppSelector, useAppDispatch } from '../../state';
import slice from './slice';
import usePalette from '../../hooks/usePalette';
import lottieDoneAnimation from '../../../assets/images/finished.json';

const { actions } = slice;

enum AnimationState {
  opening,
  waiting,
  closed,
}
const Notifications = () => {
  const state = useAppSelector((root) => root.notifications);
  const dispatch = useAppDispatch();
  const palette = usePalette();
  const successAnimation = React.useRef<LottieView>(null);
  const [animationState, setAnimationState] = React.useState<AnimationState>(AnimationState.closed);

  const notification = React.useMemo(
    () => (state.queue.length ? state.queue[0] : null),
    [state.queue]
  );
  React.useEffect(() => {
    if (animationState === AnimationState.closed && notification?.variant === 'success') {
      setAnimationState(AnimationState.opening);
    }
  }, [animationState, notification?.variant]);

  React.useEffect(() => {
    if (notification) {
      Toast.show({
        onHide: () => dispatch(actions.hideSnackbar()),
        text1: notification.message,
        type: notification.variant || 'success',
      });
    }
  }, [dispatch, notification]);

  const variantStyle = {
    info: { backgroundColor: palette.info },
    success: { backgroundColor: palette.success },
    error: { backgroundColor: palette.error },
    warning: { backgroundColor: palette.warning },
  };

  return (
    <>
      {animationState === AnimationState.opening && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          pointerEvents="none"
        >
          <LottieView
            loop={false}
            autoPlay
            onAnimationFinish={() => {
              setAnimationState(AnimationState.waiting);
              setTimeout(() => {
                dispatch(actions.hideSnackbar());
                setAnimationState(AnimationState.closed);
              }, 200);
            }}
            ref={successAnimation}
            style={styles.animation}
            source={lottieDoneAnimation as unknown as string}
          />
        </View>
      )}
      <Toast
        ref={(ref) => Toast.setRef(ref)}
        autoHide
        visibilityTime={4000}
        position="bottom"
        type="success"
      />
    </>
  );
};

const styles = StyleSheet.create({
  animation: {
    height: 420,
    width: 420,
  },
});
export default Notifications;
