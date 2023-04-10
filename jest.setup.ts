
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

jest.mock('@react-navigation/core', () => ({
  ...jest.requireActual('@react-navigation/core'),
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
