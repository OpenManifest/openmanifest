import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import SettingsScreen from '../../screens/authenticated/settings/SettingsScreen';
import DropzoneSettingsScreen from '../../screens/authenticated/settings/DropzoneSettingsScreen';
import TicketTypeSettingsScreen from '../../screens/authenticated/ticket_types/TicketTypesScreen';
import CreatePlaneScreen from '../../screens/authenticated/planes/CreatePlaneScreen';
import UpdatePlaneScreen from '../../screens/authenticated/planes/UpdatePlaneScreen';
import UpdateDropzoneScreen from '../../screens/authenticated/dropzones/UpdateDropzoneScreen';
import PlanesScreen from '../../screens/authenticated/planes/PlanesScreen';

import CreateTicketTypeScreen from '../../screens/authenticated/ticket_types/CreateTicketTypeScreen';
import UpdateTicketTypeScreen from '../../screens/authenticated/ticket_types/UpdateTicketTypeScreen';

import CreateExtraScreen from '../../screens/authenticated/extras/CreateExtraScreen';
import UpdateExtraScreen from '../../screens/authenticated/extras/UpdateExtraScreen';
import ExtrasScreen from '../../screens/authenticated/extras/ExtrasScreen';


import AppBar from '../AppBar';
import { Dropzone } from '../../graphql/schema';


export type ISettingsTabParams = {
  SettingsScreen: undefined;
  DropzoneSettingsScreen: undefined;
  UpdateDropzoneScreen: { dropzone: Dropzone };
  TicketTypeSettingsScreen: undefined;
  CreatePlaneScreen: undefined;
  UpdatePlaneScreen: undefined;
  PlanesScreen: undefined;
  PlaneScreen: undefined;
  TicketTypesScreen: undefined;
  CreateTicketTypeScreen: undefined;
  UpdateTicketTypeScreen: undefined;
  UpdateExtraScreen: undefined;
  CreateExtraScreen: undefined;
  ExtrasScreen: undefined;
}

const Settings = createStackNavigator<ISettingsTabParams>();

export default function SettingsTab() {
  return (
    <Settings.Navigator
      screenOptions={{
        headerShown: true,
        header: (props) => <AppBar {...props} />,
        cardStyle: {
          flex: 1
        }
      }}
    >
      <Settings.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: "Settings" }} />
      <Settings.Screen name="DropzoneSettingsScreen" component={DropzoneSettingsScreen} />
      <Settings.Screen name="UpdateDropzoneScreen" component={UpdateDropzoneScreen} />
      <Settings.Screen name="PlanesScreen" component={PlanesScreen} options={{ title: "Planes"}} />
      <Settings.Screen name="CreatePlaneScreen" component={CreatePlaneScreen} options={{ title: "New plane"}} />
      <Settings.Screen name="UpdatePlaneScreen" component={UpdatePlaneScreen} options={{ title: "Edit plane"}} />
      <Settings.Screen name="TicketTypesScreen" component={TicketTypeSettingsScreen} options={{ title: "Ticket types" }} />
      <Settings.Screen name="CreateTicketTypeScreen" component={CreateTicketTypeScreen} options={{ title: "New ticket type" }} />
      <Settings.Screen name="UpdateTicketTypeScreen" component={UpdateTicketTypeScreen} options={{ title: "Edit ticket type" }}/>
      <Settings.Screen name="CreateExtraScreen" component={CreateExtraScreen} options={{ title: "Create ticket add-on" }}/>
      <Settings.Screen name="UpdateExtraScreen" component={UpdateExtraScreen} options={{ title: "Update ticket add-on" }} />
      <Settings.Screen name="ExtrasScreen" component={ExtrasScreen} options={{ title: "Ticket add-ons" }} />
    </Settings.Navigator>
  );
}
