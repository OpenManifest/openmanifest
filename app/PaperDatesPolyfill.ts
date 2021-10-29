/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
import { Platform } from 'react-native';

const isAndroid = Platform.OS === 'android';
const isHermesEnabled = false;

// in your index.js file
if (isHermesEnabled || isAndroid) {
  require('@formatjs/intl-getcanonicallocales/polyfill');
  require('@formatjs/intl-locale/polyfill');

  require('@formatjs/intl-pluralrules/polyfill');
  require('@formatjs/intl-pluralrules/locale-data/en');

  require('@formatjs/intl-displaynames/polyfill');
  require('@formatjs/intl-displaynames/locale-data/en');

  require('@formatjs/intl-listformat/polyfill');
  require('@formatjs/intl-listformat/locale-data/en');

  require('@formatjs/intl-numberformat/polyfill');
  require('@formatjs/intl-numberformat/locale-data/en');

  require('@formatjs/intl-relativetimeformat/polyfill');
  require('@formatjs/intl-relativetimeformat/locale-data/en');

  require('@formatjs/intl-datetimeformat/polyfill');
  require('@formatjs/intl-datetimeformat/locale-data/en');

  require('@formatjs/intl-datetimeformat/add-golden-tz');

  // https://formatjs.io/docs/polyfills/intl-datetimeformat/#default-timezone

  if ('__setDefaultTimeZone' in Intl.DateTimeFormat) {
    //  Are you using Expo, use this instead of previous 2 lines
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Intl.DateTimeFormat.__setDefaultTimeZone(require('expo-localization').timezone);
  }
}
