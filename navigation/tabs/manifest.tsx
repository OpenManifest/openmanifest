import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { useAppSelector } from '../../redux';

const ManifestScreen = React.lazy(() => import('../../screens/authenticated/manifest/ManifestScreen'));
const LoadScreen = React.lazy(() => import('../../screens/authenticated/load/LoadScreen'));
const CreateLoadScreen = React.lazy(() => import('../../screens/authenticated/load/CreateLoadScreen'));
import AppBar from '../AppBar';


export type IManifestTabParams = {
  DropzoneScreen: undefined;
  LoadScreen: undefined;
  CreateLoadScreen: undefined;
}

const Manifest = createStackNavigator<IManifestTabParams>();

export default function ManifestTab() {
  const globalState = useAppSelector(state => state.global);
  return (
    <Manifest.Navigator
      screenOptions={{
        headerShown: !!(globalState.credentials && globalState.currentDropzone),
        header: (props) => <AppBar {...props} />,
        cardStyle: {
          flex: 1
        }
      }}
    >
      <Manifest.Screen name="DropzoneScreen" component={ManifestScreen} options={{ title: "Manifest" }} />
      <Manifest.Screen name="LoadScreen" component={LoadScreen} options={{ title: "Loads" }}/>
      <Manifest.Screen name="CreateLoadScreen" component={CreateLoadScreen} options={{ title: "Create load" }}/>
    </Manifest.Navigator>
  );
}
