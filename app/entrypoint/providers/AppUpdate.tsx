import * as React from 'react';
import * as Update from 'expo-updates';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Button } from 'react-native-paper';
import * as Device from 'expo-device';

// eslint-disable-next-line camelcase
import * as fonts from '@expo-google-fonts/roboto';
import LottieView from 'app/components/LottieView';
import { actions, useAppDispatch } from 'app/state';

interface IAppUpdateProps {
  children: React.ReactNode;
}

export default function AppUpdate(props: IAppUpdateProps) {
  const { children } = props;
  const { useFonts, __metadata__, ...rest } = fonts;
  const [fontsLoaded] = fonts.useFonts({
    ...rest,
  });

  const [overlay, setOverlay] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const animation = React.useRef<LottieView>(null);
  const dispatch = useAppDispatch();

  const onUpdate = React.useCallback(async () => {
    if (Platform.OS === 'web' || !Device.isDevice) {
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
  const isUpdateAvailable = React.useCallback(async () => {
    if (Platform.OS === 'web' || !Device.isDevice) {
      return;
    }
    const { isAvailable } = await Update.checkForUpdateAsync();

    if (isAvailable) {
      onUpdate();
    }
  }, [onUpdate]);

  React.useEffect(() => {
    isUpdateAvailable();
  }, [isUpdateAvailable]);

  if (!fontsLoaded) {
    return null;
  }
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
