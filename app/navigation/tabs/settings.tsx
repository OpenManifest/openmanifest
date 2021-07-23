/* eslint-disable max-len */
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import AppBar from '../AppBar';
import { Dropzone } from '../../api/schema';

import SettingsScreen from '../../screens/authenticated/settings/SettingsScreen';

import TicketTypeSettingsScreen from '../../screens/authenticated/ticket_types/TicketTypesScreen';

import UpdateDropzoneScreen from '../../screens/authenticated/dropzones/UpdateDropzoneScreen';

import PlanesScreen from '../../screens/authenticated/planes/PlanesScreen';
import RigInspectionTemplateScreen from '../../screens/authenticated/settings/RigInspectionTemplateScreen';

import DropzoneRigsScreen from '../../screens/authenticated/settings/DropzoneRigsScreen';

import DropzonePermissionScreen from '../../screens/authenticated/settings/DropzonePermissionScreen';

import DropzoneMasterLogScreen from '../../screens/authenticated/settings/DropzoneMasterLogScreen';

import UpdateExtraScreen from '../../screens/authenticated/extras/UpdateExtraScreen';

import ExtrasScreen from '../../screens/authenticated/extras/ExtrasScreen';

export type ISettingsTabParams = {
  SettingsScreen: undefined;
  UpdateDropzoneScreen: { dropzone: Dropzone };
  TicketTypeSettingsScreen: undefined;
  PlanesScreen: undefined;
  PlaneScreen: undefined;
  TicketTypesScreen: undefined;
  UpdateExtraScreen: undefined;
  ExtrasScreen: undefined;
  RigInspectionTemplateScreen: undefined;
  DropzoneRigsScreen: undefined;
  DropzonePermissionScreen: undefined;
  DropzoneMasterLogScreen: undefined;
};

const Settings = createStackNavigator<ISettingsTabParams>();

export default function SettingsTab() {
  return (
    <Settings.Navigator
      screenOptions={{
        headerShown: true,
        header: (props) => <AppBar {...props} />,
        cardStyle: {
          flex: 1,
        },
      }}
    >
      <Settings.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Settings.Screen
        name="UpdateDropzoneScreen"
        component={UpdateDropzoneScreen}
        options={{ title: 'Basic settings' }}
      />
      <Settings.Screen name="PlanesScreen" component={PlanesScreen} options={{ title: 'Planes' }} />
      <Settings.Screen
        name="TicketTypesScreen"
        component={TicketTypeSettingsScreen}
        options={{ title: 'Ticket types' }}
      />
      <Settings.Screen
        name="UpdateExtraScreen"
        component={UpdateExtraScreen}
        options={{ title: 'Update ticket add-on' }}
      />
      <Settings.Screen
        name="ExtrasScreen"
        component={ExtrasScreen}
        options={{ title: 'Ticket add-ons' }}
      />
      <Settings.Screen
        name="RigInspectionTemplateScreen"
        component={RigInspectionTemplateScreen}
        options={{ title: 'Rig Inspection Form' }}
      />
      <Settings.Screen
        name="DropzoneRigsScreen"
        component={DropzoneRigsScreen}
        options={{ title: 'Dropzone rigs' }}
      />
      <Settings.Screen
        name="DropzonePermissionScreen"
        component={DropzonePermissionScreen}
        options={{ title: 'Permissions' }}
      />
      <Settings.Screen
        name="DropzoneMasterLogScreen"
        component={DropzoneMasterLogScreen}
        options={{ title: 'Master log' }}
      />
    </Settings.Navigator>
  );
}
