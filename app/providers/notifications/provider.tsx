import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast, useTheme } from 'app/ui';
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

/** How long a message stays: longer when there is something to press */
const VISIBLE_MS = 4000;
const VISIBLE_WITH_ACTION_MS = 8000;

enum AnimationState {
  opening = 0,
  waiting = 1,
  closed = 2,
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
    if (!notification) return undefined;
    if (notification.variant === 'error') {
      console.error(notification.message);
    }
    const timer = setTimeout(onHide, notification.action ? VISIBLE_WITH_ACTION_MS : VISIBLE_MS);
    return () => clearTimeout(timer);
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
            ...StyleSheet.absoluteFill,
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
      <ToastLayer notification={notification} onDismiss={onHide} />
    </NotificationContext.Provider>
  );
}

/** The current message, centred above the bottom edge (and above the tab bar on a phone) */
function ToastLayer({
  notification,
  onDismiss,
}: {
  notification?: INotification;
  onDismiss(): void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  if (!notification) return null;
  const clearance =
    theme.breakpoint === 'compact' ? theme.density.touchTarget + theme.space.xxxl : theme.space.lg;

  return (
    <View
      pointerEvents="box-none"
      style={{
        ...StyleSheet.absoluteFill,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: theme.space.lg,
        paddingBottom: insets.bottom + clearance,
      }}
    >
      <Toast
        message={notification.message}
        tone={
          notification.variant === 'error'
            ? 'error'
            : notification.variant === 'info'
              ? 'info'
              : 'success'
        }
        action={
          notification.action
            ? {
                label: notification.action.label,
                onPress: () => {
                  notification.action?.onPress();
                  onDismiss();
                },
              }
            : undefined
        }
        onDismiss={onDismiss}
        testID="toast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  animation: {
    height: 300,
    width: 300,
  },
});
