// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';
import 'react-native-gesture-handler/jestSetup';

declare const global: { __reanimatedWorkletInit: ReturnType<typeof jest.fn> };

global.__reanimatedWorkletInit = jest.fn();

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
