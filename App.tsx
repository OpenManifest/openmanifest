import { StatusBar } from 'expo-status-bar';
import React, { Suspense } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react'
import { Provider as MaterialProvider, ActivityIndicator, ProgressBar } from "react-native-paper"
import { Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import Apollo from "./graphql/Apollo";
import { store, persistor, useAppSelector } from "./redux/store";

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Notifications from './components/notifications/Notifications';
import LinkingConfiguration from './navigation/Routes';
import RootNavigator from "./navigation/RootNavigator";




function Content() {
  const state = useAppSelector(state => state.global);
  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, flexGrow: 1 }}>
          <ProgressBar indeterminate color={state?.theme?.colors?.accent} visible />
        </View>
      }
    >
      <Apollo>
        <MaterialProvider theme={state.theme}>
          <SafeAreaProvider>
            <NavigationContainer
              linking={LinkingConfiguration}
              theme={state.theme}>
              <RootNavigator />
            </NavigationContainer>

            <StatusBar />
            <Notifications />
          </SafeAreaProvider>
        </MaterialProvider>
      </Apollo>
    </Suspense>
  )
}
export default function App() {
  const isLoadingComplete = useCachedResources();


  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <Provider store={store}>
          <PersistGate
            persistor={persistor}
            loading={
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
              </View>
          }>
            <Content />
          </PersistGate>
        </Provider>
    );
  }
}
