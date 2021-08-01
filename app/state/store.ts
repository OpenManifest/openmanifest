import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-community/async-storage';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { Platform } from 'react-native';
import { persistStore, persistReducer } from 'redux-persist';
import { reducers as forms, initialState as initialStateForms } from '../components/forms/slice';
import { reducers as screens, initialState as initialStateScreens } from '../screens/slice';

import globalSlice, { initialState as initialStateGlobal } from './global';
import notificationSlice, {
  initialState as initialStateNotification,
} from '../components/notifications/slice';

export const initialState = {
  forms: initialStateForms,
  screens: initialStateScreens,
  global: initialStateGlobal,
  notifications: initialStateNotification,
} as RootState;

const persistConfig = {
  key: 'open-manifest.0.9.1',
  storage:
    // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
    Platform.OS === 'web' || false ? require('redux-persist/lib/storage').default : AsyncStorage,
  whitelist: ['global'],
};

// eslint-disable
const screenReducers = Object.keys(screens).reduce(
  // eslint-disable-next-line max-len
  (obj, key) =>
    !screens || !(key in screens)
      ? obj
      : { ...obj, [key]: screens[key as keyof typeof screens].reducer },
  {}
) as {
  [K in keyof typeof screens]: typeof screens[K]['reducer'];
};

const formReducers = Object.keys(forms).reduce(
  (obj, key) =>
    !forms || !(key in forms) ? obj : { ...obj, [key]: forms[key as keyof typeof forms].reducer },
  {}
) as {
  [K in keyof typeof forms]: typeof forms[K]['reducer'];
};

export const screenActions = Object.keys(screens).reduce(
  (obj, key) =>
    !(key in screens) ? obj : { ...obj, [key]: screens[key as keyof typeof screens].actions },
  {}
) as {
  [K in keyof typeof screens]: typeof screens[K]['actions'];
};
export const formActions = Object.keys(forms).reduce(
  (obj, key) =>
    !(key in forms) ? obj : { ...obj, [key]: forms[key as keyof typeof forms].actions },
  {}
) as {
  [K in keyof typeof forms]: typeof forms[K]['actions'];
};
// eslint-enable

export const actions = {
  forms: formActions,
  screens: screenActions,
  global: globalSlice.actions,
  notifications: notificationSlice.actions,
};

export const rootReducer = combineReducers({
  global: globalSlice.reducer,
  notifications: notificationSlice.reducer,
  screens: combineReducers(screenReducers),
  forms: combineReducers(formReducers),
});
export const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['persist/PERSIST'],
    },
  }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
