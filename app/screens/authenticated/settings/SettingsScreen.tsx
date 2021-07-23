import * as React from 'react';
import { List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import { useAppSelector } from '../../../state';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import useRestriction from '../../../hooks/useRestriction';
import { Permission } from '../../../api/schema.d';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const state = useAppSelector((root) => root.global);

  const canUpdateDropzone = useRestriction(Permission.UpdateDropzone);
  const canUpdateRigInspectionTemplate = useRestriction(Permission.UpdateFormTemplate);

  return (
    <ScrollableScreen>
      <List.Section title="Dropzone" style={{ width: '100%' }}>
        {!canUpdateDropzone ? null : (
          <List.Item
            title="Configuration"
            onPress={() =>
              navigation.navigate('UpdateDropzoneScreen', {
                dropzone: state.currentDropzone,
              })
            }
            left={() => <List.Icon color="#000" icon="information-outline" />}
            description="Set up name, branding and other settings"
          />
        )}
        <List.Item
          title="Permissions"
          left={() => <List.Icon color="#000" icon="lock" />}
          onPress={() => navigation.navigate('DropzonePermissionScreen')}
        />
        <List.Item
          title="Aircrafts"
          onPress={() => navigation.navigate('PlanesScreen')}
          left={() => <List.Icon color="#000" icon="airplane" />}
        />
        <List.Item
          title="Rigs"
          left={() => <List.Icon color="#000" icon="parachute" />}
          description="Dropzone rigs, e.g tandems and student rigs"
          onPress={() => navigation.navigate('DropzoneRigsScreen')}
        />
        <List.Item
          disabled={!canUpdateRigInspectionTemplate}
          title="Rig Inspection Template"
          left={() => <List.Icon color="#000" icon="check" />}
          onPress={() => navigation.navigate('RigInspectionTemplateScreen')}
        />
        <List.Item
          title="Master Log"
          left={() => <List.Icon color="#000" icon="parachute" />}
          description="View historic data for daily operations"
          onPress={() => navigation.navigate('DropzoneMasterLogScreen')}
        />
      </List.Section>

      <List.Section title="Tickets" style={{ width: '100%' }}>
        <List.Item
          title="Ticket types"
          onPress={() => navigation.navigate('TicketTypesScreen')}
          left={() => <List.Icon color="#000" icon="ticket" />}
          description="Manage ticket prices and accessibility"
        />
        <List.Item
          title="Ticket add-ons"
          onPress={() => navigation.navigate('ExtrasScreen')}
          left={() => <List.Icon color="#000" icon="plus" />}
          description="Supplementary tickets like coach, camera, night jumpi"
        />
      </List.Section>
    </ScrollableScreen>
  );
}
