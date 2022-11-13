import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import LottieView from 'app/components/LottieView';
import { isEqual, last } from 'lodash';
import lottieDoneAnimation from '../../../assets/images/finished-2.json';
import { NotificationContext } from './context';

interface INotification {
  message: string;
  variant?: 'error' | 'success' | 'info';
  action?: {
    label: string;
    onPress: () => void;
  };
}

enum AnimationState {
  opening,
  waiting,
  closed,
}

export function NotificationsProvider(props: React.PropsWithChildren<object>) {
  const { children } = props;
  const [queue, setQueue] = React.useState<INotification[]>([]);

  const successAnimation = React.useRef<LottieView>(null);
  const [animationState, setAnimationState] = React.useState<AnimationState>(AnimationState.closed);

  const notification = React.useMemo(() => queue?.[0], [queue]);
  React.useEffect(() => {
    if (animationState === AnimationState.closed && notification?.variant === 'success') {
      setAnimationState(AnimationState.opening);
    }
  }, [animationState, notification?.variant]);

  const notify = React.useCallback(
    (newNotification: INotification) => {
      if (!isEqual(last(queue), newNotification)) {
        setQueue([...queue, newNotification]);
      }
    },
    [queue]
  );

  const onHide = React.useCallback(() => {
    const [, ...newQueue] = queue;
    setQueue(newQueue);
  }, [queue]);

  const success = React.useCallback(
    (message: string, action?: { label: string; onPress: () => void }) => {
      notify({ message, variant: 'success', action });
    },
    [notify]
  );

  const error = React.useCallback(
    (message: string, action?: { label: string; onPress: () => void }) => {
      notify({ message, variant: 'error', action });
    },
    [notify]
  );

  const info = React.useCallback(
    (message: string, action?: { label: string; onPress: () => void }) => {
      notify({ message, variant: 'info', action });
    },
    [notify]
  );

  const onAnimationFinish = React.useCallback(() => {
    setAnimationState(AnimationState.waiting);
    setTimeout(() => {
      onHide();
      setAnimationState(AnimationState.closed);
    }, 200);
  }, [onHide]);

  React.useEffect(() => {
    if (notification) {
      Toast.show({
        onHide,
        text1: notification.message,
        type: notification.variant || 'success',
      });
      if (notification.variant === 'error') {
        console.error(notification.message);
      }
    }
  }, [notification, onHide]);

  const context = React.useMemo(
    () => ({ notify, success, error, info }),
    [error, info, notify, success]
  );

  return (
    <NotificationContext.Provider value={context}>
      {children}
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
            {...{ onAnimationFinish }}
            ref={successAnimation}
            style={styles.animation}
            source={lottieDoneAnimation as unknown as string}
          />
        </View>
      )}
      <Toast autoHide visibilityTime={4000} position="bottom" type="success" />
    </NotificationContext.Provider>
  );
}

const styles = StyleSheet.create({
  animation: {
    height: 300,
    width: 300,
  },
});
