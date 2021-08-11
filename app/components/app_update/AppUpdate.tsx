import * as React from 'react';
import * as Update from 'expo-updates';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Button } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { actions, useAppDispatch } from '../../state';

interface IAppUpdateProps {
  children: React.ReactNode;
}

export default function AppUpdate(props: IAppUpdateProps) {
  const { children } = props;
  const [overlay, setOverlay] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const animation = React.useRef<LottieView>(null);
  const dispatch = useAppDispatch();

  const isUpdateAvailable = React.useCallback(async () => {
    if (Platform.OS === 'web') {
      return;
    }
    const { isAvailable } = await Update.checkForUpdateAsync();

    if (isAvailable) {
      setOverlay(true);
    }
  }, []);

  const onUpdate = React.useCallback(async () => {
    if (Platform.OS === 'web') {
      return;
    }
    animation.current?.play();
    const { isNew } = await Update.fetchUpdateAsync();
    if (isNew) {
      await Update.reloadAsync();
      setLoading(false);
      setOverlay(false);
      dispatch(actions.notifications.showSnackbar({ message: 'New version installed' }));
    }
  }, [dispatch]);

  React.useEffect(() => {
    isUpdateAvailable();
  }, [isUpdateAvailable]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {overlay && (
        <BlurView tint="dark" style={styles.blur} intensity={80}>
          <Text style={styles.title}>A new update is available</Text>
          <LottieView
            ref={animation}
            style={{
              width: 120,
              height: 120,
            }}
            // eslint-disable-next-line global-require
            source={require('../../../assets/images/loading.json')}
          />
          <Button
            disabled={loading}
            loading={loading}
            color="#FFFFFF"
            style={styles.button}
            mode="outlined"
            onPress={() => onUpdate()}
          >
            Click to update
          </Button>
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  blur: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: '400',
    position: 'absolute',
    top: 100,
  },
  button: {
    position: 'absolute',
    bottom: 100,
    borderColor: 'white',
    borderRadius: 20,
  },
});
