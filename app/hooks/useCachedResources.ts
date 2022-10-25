import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import * as inter from '@expo-google-fonts/inter';
import * as roboto from '@expo-google-fonts/roboto';

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);

  const [fontsLoaded] = Font.useFonts({
    Inter_400Regular: inter.Inter_400Regular,
    Inter_500Medium: inter.Inter_500Medium,
    Inter_700Bold: inter.Inter_700Bold,
    Roboto_400Regular: roboto.Roboto_400Regular,
    Roboto_500Medium: roboto.Roboto_500Medium,
    Roboto_700Bold: roboto.Roboto_700Bold,
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    ...MaterialIcons.font,
  });

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          ...MaterialCommunityIcons.font,
          ...MaterialIcons.font,
          // eslint-disable-next-line global-require
          'space-mono': require('../../assets/fonts/SpaceMono-Regular.ttf'),
        });
        setLoadingComplete(true);
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete && fontsLoaded;
}
