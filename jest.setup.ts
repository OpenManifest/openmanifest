import { cleanup, configure } from '@testing-library/react-native';

import '@testing-library/jest-dom';
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// react-native-maps 1.27 is TurboModule-only and throws on import without the native module; render the map as a View.
jest.mock('react-native-maps', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require('react-native');
  const MapView = React.forwardRef((props: Record<string, unknown>, ref: unknown) =>
    React.createElement(View, { ...props, ref })
  );
  const Marker = (props: Record<string, unknown>) => React.createElement(View, props);
  return {
    __esModule: true,
    default: MapView,
    MapView,
    Marker,
    Callout: Marker,
    Circle: Marker,
    Polyline: Marker,
    Polygon: Marker,
    PROVIDER_GOOGLE: 'google',
    PROVIDER_DEFAULT: null,
  };
});

jest.mock('react-native-keyboard-controller', () =>
  jest.requireActual('react-native-keyboard-controller/jest')
);

// The `BaseButton` mock in react-native-gesture-handler 2.28 renders `<View />` instead of its children, which empties
// every gesture-handler TouchableOpacity (its content sits inside a BaseButton). Use the React Native touchables.
jest.mock('react-native-gesture-handler', () => {
  const actual = jest.requireActual('react-native-gesture-handler');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const {
    TouchableOpacity,
    TouchableHighlight,
    TouchableWithoutFeedback,
  } = require('react-native');
  return { ...actual, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback };
});

declare const global: { __reanimatedWorkletInit: ReturnType<typeof jest.fn> };

global.__reanimatedWorkletInit = jest.fn();

afterEach(cleanup);

// Testing Library 13 skips elements that are hidden from accessibility (Paper and bottom sheets mark whole subtrees
// `no-hide-descendants`, and fade items in from opacity 0). The tests were written against the older default.
configure({ defaultIncludeHiddenElements: true });

// Reanimated's mock loads the real worklets package, which needs its native module
jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'));

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

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));

// React Native 0.71's jest setup mocks AccessibilityInfo.addEventListener without a return value, so react-native-paper 4
// falls back to the removed `removeEventListener` when its Provider unmounts. Return a real subscription.
jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => {
  const actual = jest.requireActual(
    'react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo'
  );
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
// (Relative paths: expo-asset's package `exports` hide its build files from bare specifiers.)
jest.mock('./node_modules/expo-asset/build/ExpoAsset.js', () => ({
  ...jest.requireActual('./node_modules/expo-asset/build/ExpoAsset.js'),
  downloadAsync: jest.fn(async (uri: string) => uri),
}));
