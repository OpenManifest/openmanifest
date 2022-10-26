import Appsignal from '@appsignal/javascript';
import Constants from 'expo-constants';
import ExpoManifest from 'app/constants/expo';
import { Platform } from 'react-native';

const AppSignalClient = new Appsignal({
  key: ExpoManifest?.extra?.appSignalApiKey,
  namespace: Platform.OS,
  revision: Constants.expoConfig?.version,
  ignoreErrors: [],
});

export default AppSignalClient;
