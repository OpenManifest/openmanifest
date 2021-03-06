import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAppSelector, useAppDispatch } from 'app/state';
import LottieView from '../LottieView';
import slice from './slice';
import lottieDoneAnimation from '../../../assets/images/finished-2.json';

const { actions } = slice;

enum AnimationState {
  opening,
  waiting,
  closed,
}
function Notifications() {
  const state = useAppSelector((root) => root.notifications);
  const dispatch = useAppDispatch();
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
      if (notification.variant === 'error') {
        console.error(notification.message);
      }
    }
  }, [dispatch, notification]);

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
            speed={1.2}
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
      <Toast autoHide visibilityTime={4000} position="bottom" type="success" />
    </>
  );
}

const styles = StyleSheet.create({
  animation: {
    height: 300,
    width: 300,
  },
});
export default Notifications;
