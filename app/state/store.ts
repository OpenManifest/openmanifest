import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { Platform } from 'react-native';
import omit from 'lodash/omit';
import { persistStore, persistReducer, createMigrate } from 'redux-persist';
import type { PersistedState } from 'redux-persist';
import { reducers as forms, initialState as initialStateForms } from '../components/forms/slice';

import globalSlice, { initialState as initialStateGlobal } from './global';

export const initialState = {
  forms: initialStateForms,
  global: initialStateGlobal,
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

type FormReducers = {
  [K in keyof typeof forms]: (typeof forms)[K]['reducer'];
};

type FormActions = {
  [K in keyof typeof forms]: (typeof forms)[K]['actions'];
};

const formReducers = Object.keys(forms).reduce(
  (obj, key) =>
    !forms || !(key in forms) ? obj : { ...obj, [key]: forms[key as keyof typeof forms].reducer },
  {}
) as FormReducers;
export const formActions = Object.keys(forms).reduce(
  (obj, key) =>
    !(key in forms) ? obj : { ...obj, [key]: forms[key as keyof typeof forms].actions },
  {}
) as FormActions;
// eslint-enable

export const actions = {
  forms: formActions,
  global: globalSlice.actions,
};

export const rootReducer = combineReducers({
  global: globalSlice.reducer,
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
