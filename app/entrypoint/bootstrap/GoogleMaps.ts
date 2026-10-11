import config from 'app/constants/expo';
import { Platform } from 'react-native';

import Geocoder from 'react-native-geocoding';

const googleMapsApiKey = Platform.select({
  ios: config?.googleMapsIos,
  android: config?.googleMapsAndroid,
  web: config?.googleMapsWeb,
});

Geocoder.init(googleMapsApiKey);
