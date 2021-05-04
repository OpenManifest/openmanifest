import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

const SettingsScreen = React.lazy(() => import('../../screens/authenticated/settings/SettingsScreen'));
const TicketTypeSettingsScreen = React.lazy(() => import('../../screens/authenticated/ticket_types/TicketTypesScreen'));
const CreatePlaneScreen = React.lazy(() => import('../../screens/authenticated/planes/CreatePlaneScreen'));
const UpdatePlaneScreen = React.lazy(() => import('../../screens/authenticated/planes/UpdatePlaneScreen'));
const UpdateDropzoneScreen = React.lazy(() => import('../../screens/authenticated/dropzones/UpdateDropzoneScreen'));
const PlanesScreen = React.lazy(() => import('../../screens/authenticated/planes/PlanesScreen'));
const RigInspectionTemplateScreen = React.lazy(() => import('../../screens/authenticated/settings/RigInspectionTemplateScreen'));
const DropzoneRigsScreen = React.lazy(() => import('../../screens/authenticated/settings/DropzoneRigsScreen'));
const DropzonePermissionScreen = React.lazy(() => import('../../screens/authenticated/settings/DropzonePermissionScreen'));
const DropzoneMasterLogScreen = React.lazy(() => import('../../screens/authenticated/settings/DropzoneMasterLogScreen'));


const CreateExtraScreen = React.lazy(() => import('../../screens/authenticated/extras/CreateExtraScreen'));
const UpdateExtraScreen = React.lazy(() => import('../../screens/authenticated/extras/UpdateExtraScreen'));
const ExtrasScreen = React.lazy(() => import('../../screens/authenticated/extras/ExtrasScreen'));


import AppBar from '../AppBar';
import { Dropzone } from '../../graphql/schema';
import DatePicker from '../../components/input/date_picker/DatePicker';


export type ISettingsTabParams = {
  SettingsScreen: undefined;
  UpdateDropzoneScreen: { dropzone: Dropzone };
  TicketTypeSettingsScreen: undefined;
  CreatePlaneScreen: undefined;
  UpdatePlaneScreen: undefined;
  PlanesScreen: undefined;
  PlaneScreen: undefined;
  TicketTypesScreen: undefined;
  UpdateExtraScreen: undefined;
  CreateExtraScreen: undefined;
  ExtrasScreen: undefined;
  RigInspectionTemplateScreen: undefined;
  DropzoneRigsScreen: undefined;
  DropzonePermissionScreen: undefined;
  DropzoneMasterLogScreen: undefined;
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
      <Settings.Screen name="UpdateDropzoneScreen" component={UpdateDropzoneScreen} />
      <Settings.Screen name="PlanesScreen" component={PlanesScreen} options={{ title: "Planes"}} />
      <Settings.Screen name="CreatePlaneScreen" component={CreatePlaneScreen} options={{ title: "New plane"}} />
      <Settings.Screen name="UpdatePlaneScreen" component={UpdatePlaneScreen} options={{ title: "Edit plane"}} />
      <Settings.Screen name="TicketTypesScreen" component={TicketTypeSettingsScreen} options={{ title: "Ticket types" }} />
      <Settings.Screen name="CreateExtraScreen" component={CreateExtraScreen} options={{ title: "Create ticket add-on" }}/>
      <Settings.Screen name="UpdateExtraScreen" component={UpdateExtraScreen} options={{ title: "Update ticket add-on" }} />
      <Settings.Screen name="ExtrasScreen" component={ExtrasScreen} options={{ title: "Ticket add-ons" }} />
      <Settings.Screen name="RigInspectionTemplateScreen" component={RigInspectionTemplateScreen} options={{ title: "Rig Inspection Form" }} />
      <Settings.Screen name="DropzoneRigsScreen" component={DropzoneRigsScreen} options={{ title: "Dropzone rigs" }} />
      <Settings.Screen name="DropzonePermissionScreen" component={DropzonePermissionScreen} options={{ title: "Permissions" }} />
      <Settings.Screen
        name="DropzoneMasterLogScreen"
        component={DropzoneMasterLogScreen}
        options={{ title: "Master log"}}
        />
    </Settings.Navigator>
  );
}
