
import { cleanup } from '@testing-library/react-native';

import '@testing-library/jest-dom';
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

declare const global: { __reanimatedWorkletInit: ReturnType<typeof jest.fn> };

global.__reanimatedWorkletInit = jest.fn();

afterEach(cleanup);

jest.mock('react-native-reanimated', () => {
  return {
    ...jest.requireActual('react-native-reanimated/mock'),
  };
});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => jest.fn(),
  useIsFocused: jest.fn().mockReturnValue(false),
}));

// Mock redux-persist
jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist');
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers),
  };
});

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));

// React Native 0.71's jest setup mocks AccessibilityInfo.addEventListener without a return value, so react-native-paper 4
// falls back to the removed `removeEventListener` when its Provider unmounts. Return a real subscription.
jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => {
  const actual = jest.requireActual('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo');
  const AccessibilityInfo = (actual && actual.default) || actual;
  return {
    __esModule: true,
    default: { ...AccessibilityInfo, addEventListener: jest.fn(() => ({ remove: jest.fn() })) },
  };
});

// Animations that outlive a test would lazily require react-native's `bezier` module after the environment is torn
// down, which crashes the worker. Load it now.
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('react-native').Easing.ease(0.5);

// expo-asset downloads assets through expo-file-system, whose jest mock returns undefined (asset names, fonts and
// images are requested while the screens render).
jest.mock('expo-asset/build/PlatformUtils', () => ({
  ...jest.requireActual('expo-asset/build/PlatformUtils'),
  downloadAsync: jest.fn(async (uri: string) => uri),
}));

// jest-expo's auto-mock of the ExpoFontLoader native module returns undefined from getLoadedFonts(), but expo-font 13
// iterates over the result when an icon component is constructed.
jest.mock('expo-font/build/ExpoFontLoader', () => ({
  __esModule: true,
  default: {
    getLoadedFonts: () => [],
    loadAsync: jest.fn(async () => undefined),
    unloadAllAsync: jest.fn(async () => undefined),
    unloadAsync: jest.fn(async () => undefined),
  },
}));
