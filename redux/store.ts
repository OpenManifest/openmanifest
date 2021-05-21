import { combineReducers, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import { Platform } from "react-native";
import AsyncStorage from '@react-native-community/async-storage';



import { persistStore, persistReducer } from "redux-persist";


import globalSlice, { initialState as initialStateGlobal } from "./global";
import notificationSlice, { initialState as initialStateNotification } from "../components/notifications/slice";

import loginSlice, { initialState as initialStateLogin } from "../screens/unauthenticated/login/slice";
import manifestSlice, { initialState as initialStateManifest } from "../screens/authenticated/manifest/slice";
import signUpSlice, { initialState as initialStateSignup } from "../screens/unauthenticated/signup/slice";
import usersSlice, { initialState as initialStateUsers } from "../screens/authenticated/users/slice";
import dropzoneFormSlice, { initialState as initialStateDropzoneForm } from "../components/forms/dropzone/slice";
import planeFormSlice, { initialState as initialStatePlaneForm } from "../components/forms/plane/slice";
import ticketTypeFormSlice, { initialState as initialStateTicketTypeForm } from "../components/forms/ticket_type/slice";
import extraFormSlice, { initialState as initialStateExtraForm } from "../components/forms/extra/slice";
import loadFormSlice, { initialState as initialStateLoadForm } from "../components/forms/load/slice";
import slotFormSlice, { initialState as initialStateSlotForm } from "../components/forms/slot/slice";
import userFormSlice, { initialState as initialStateUserForm } from "../components/forms/user/slice";
import dropzoneUserFormSlice, { initialState as initialStateDropzoneUserForm } from "../components/forms/dropzone_user/slice";
import rigFormSlice, { initialState as initialStateRigForm } from "../components/forms/rig/slice";
import rigInspectionFormSlice, { initialState as initialStateRigInspectionForm } from "../components/forms/rig_inspection/slice";
import rigInspectionTemplateSlice, { initialState as initialStateRigInspectionTemplateForm } from "../components/forms/rig_inspection_template/slice";
import creditsFormSlice, { initialState as initialStateCreditsForm } from "../components/forms/credits/slice";
import slotsMultipleFormSlice, { initialState as initialStateSlotsMultipleForm } from "../components/forms/slots_multiple/slice";

export const initialState = {
  creditsForm: initialStateCreditsForm,
  dropzoneForm: initialStateDropzoneForm,
  dropzoneUserForm: initialStateDropzoneUserForm,
  extraForm: initialStateExtraForm,
  global: initialStateGlobal,
  loadForm: initialStateLoadForm,
  login: initialStateLogin,
  manifest: initialStateManifest,
  notifications: initialStateNotification,
  planeForm: initialStatePlaneForm,
  rigForm: initialStateRigForm,
  rigInspectionForm: initialStateRigInspectionForm,
  rigInspectionTemplate: initialStateRigInspectionTemplateForm,
  signup: initialStateSignup,
  slotForm: initialStateSlotForm,
  slotsMultipleForm: initialStateSlotsMultipleForm,
  ticketTypeForm: initialStateTicketTypeForm,
  userForm: initialStateUserForm,
  usersScreen: initialStateUsers,
} as RootState;

// Re-export actions:
export const { actions: loginActions } = loginSlice;
export const { actions: manifestActions } = manifestSlice;
export const { actions: signUpActions } = signUpSlice;
export const { actions: globalActions } = globalSlice;
export const { actions: usersActions } = usersSlice;
export const { actions: snackbarActions } = notificationSlice;
export const { actions: planeForm } = planeFormSlice;
export const { actions: dropzoneForm } = dropzoneFormSlice;
export const { actions: ticketTypeForm } = ticketTypeFormSlice;
export const { actions: extraForm } = extraFormSlice;
export const { actions: loadForm } = loadFormSlice;
export const { actions: slotForm } = slotFormSlice;
export const { actions: userForm } = userFormSlice;
export const { actions: dropzoneUserForm } = dropzoneUserFormSlice;
export const { actions: rigForm } = rigFormSlice;
export const { actions: rigInspectionForm } = rigInspectionFormSlice;
export const { actions: rigInspectionTemplateForm } = rigInspectionTemplateSlice;
export const { actions: creditsForm } = creditsFormSlice;
export const { actions: slotsMultipleForm } = slotsMultipleFormSlice;

const persistConfig = {
  key: 'root',
  storage: Platform.OS === "web" || false ? require('redux-persist/lib/storage').default : AsyncStorage,
  whitelist: ["global", "notifications"],
};


export const rootReducer = combineReducers({
    global: globalSlice.reducer,
    notifications: notificationSlice.reducer,
    login: loginSlice.reducer,
    signup: signUpSlice.reducer,
    dropzoneForm: dropzoneFormSlice.reducer,
    planeForm: planeFormSlice.reducer,
    ticketTypeForm: ticketTypeFormSlice.reducer,
    extraForm: extraFormSlice.reducer,
    loadForm: loadFormSlice.reducer,
    slotForm: slotFormSlice.reducer,
    slotsMultipleForm: slotsMultipleFormSlice.reducer,
    manifest: manifestSlice.reducer,
    userForm: userFormSlice.reducer,
    dropzoneUserForm: dropzoneUserFormSlice.reducer,
    rigForm: rigFormSlice.reducer,
    rigInspectionForm: rigInspectionFormSlice.reducer,
    rigInspectionTemplate: rigInspectionTemplateSlice.reducer,
    usersScreen: usersSlice.reducer,
    creditsForm: creditsFormSlice.reducer,
  });

export const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ["persist/PERSIST"],
    },
  })
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

