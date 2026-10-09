import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { Platform } from 'react-native';
import omit from 'lodash/omit';
import { persistStore, persistReducer, createMigrate } from 'redux-persist';
import type { PersistedState } from 'redux-persist';
import { reducers as forms, initialState as initialStateForms } from '../components/forms/slice';
import { reducers as screens, initialState as initialStateScreens } from '../screens/slice';
import imageViewerSlice, {
  initialState as imageViewerState,
} from '../components/dialogs/ImageViewer/slice';

import globalSlice, { initialState as initialStateGlobal } from './global';

export const initialState = {
  forms: initialStateForms,
  screens: initialStateScreens,
  global: initialStateGlobal,
  imageViewer: imageViewerState,
} as RootState;

/** Fields the `global` slice used to hold that are derived elsewhere now (Apollo and the theme hook) */
const REMOVED_GLOBAL_KEYS = [
  'currentUser',
  'currentDropzone',
  'permissions',
  'theme',
  'palette',
  'isDarkMode',
];

/**
 * Version 1 drops the snapshots and theme from the persisted `global` slice. The credentials, dropzone id and push
 * token stay in the blob on purpose: the session store migrates from them on first start (`migrateFromReduxPersist`),
 * which races with this rehydration, and P4.8 deletes the blob when redux-persist goes.
 */
export const persistMigrations = {
  1: (state: PersistedState) =>
    state && {
      ...state,
      global: omit((state as unknown as { global?: object }).global ?? {}, REMOVED_GLOBAL_KEYS),
    },
};

const persistConfig = {
  key: 'open-manifest.0.9.1',
  version: 1,
  migrate: createMigrate(persistMigrations as never, { debug: false }),
  storage:
    Platform.OS === 'web' || false ? require('redux-persist/lib/storage').default : AsyncStorage,
  whitelist: ['global'],
};

type ScreenReducers = {
  [K in keyof typeof screens]: (typeof screens)[K]['reducer'];
};

type FormReducers = {
  [K in keyof typeof forms]: (typeof forms)[K]['reducer'];
};

type ScreenActions = {
  [K in keyof typeof screens]: (typeof screens)[K]['actions'];
};

type FormActions = {
  [K in keyof typeof forms]: (typeof forms)[K]['actions'];
};

const screenReducers = Object.keys(screens).reduce(
  (obj, key) =>
    !screens || !(key in screens)
      ? obj
      : { ...obj, [key]: screens[key as keyof typeof screens].reducer },
  {}
) as ScreenReducers;

const formReducers = Object.keys(forms).reduce(
  (obj, key) =>
    !forms || !(key in forms) ? obj : { ...obj, [key]: forms[key as keyof typeof forms].reducer },
  {}
) as FormReducers;
export const screenActions = Object.keys(screens).reduce(
  (obj, key) =>
    !(key in screens) ? obj : { ...obj, [key]: screens[key as keyof typeof screens].actions },
  {}
) as ScreenActions;
export const formActions = Object.keys(forms).reduce(
  (obj, key) =>
    !(key in forms) ? obj : { ...obj, [key]: forms[key as keyof typeof forms].actions },
  {}
) as FormActions;
// eslint-enable

export const actions = {
  forms: formActions,
  screens: screenActions,
  global: globalSlice.actions,
  imageViewer: imageViewerSlice.actions,
};

export const rootReducer = combineReducers({
  global: globalSlice.reducer,
  imageViewer: imageViewerSlice.reducer,
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
    immutableCheck: false,
  }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
