import * as React from 'react';
import { List, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import useRestriction from '../../../hooks/useRestriction';
import { Permission } from '../../../api/schema.d';
import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { data } = useCurrentDropzone();
  const theme = useTheme();

  const canUpdateDropzone = useRestriction(Permission.UpdateDropzone);
  const canUpdateRigInspectionTemplate = useRestriction(Permission.UpdateFormTemplate);

  return (
    <ScrollableScreen>
      <List.Section title="Dropzone" style={{ width: '100%' }}>
        {!canUpdateDropzone ? null : (
          <List.Item
            title="Configuration"
            onPress={() =>
              !data?.dropzone ? null : navigation.navigate('Authenticated', {
                screen: 'Drawer',
                params: {
                  screen: 'Manifest',
                  params: {
                    screen: 'UpdateDropzoneScreen',
                    params: {
                      dropzone: data?.dropzone,
                    }
                  }
                }
              })
            }
            left={() => <List.Icon color={theme.colors.text} icon="information-outline" />}
            description="Set up name, branding and other settings"
          />
        )}
        <List.Item
          title="Permissions"
          left={() => <List.Icon color={theme.colors.text} icon="lock" />}
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'Drawer',
              params: {
                screen: 'Manifest',
                params: {
                  screen: 'DropzonePermissionScreen'
                }
              }
            })
          }
        />
        <List.Item
          title="Aircrafts"
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'Drawer',
              params: {
                screen: 'Manifest',
                params: {
                  screen: 'PlanesScreen'
                }
              }
            })
          }
          left={() => <List.Icon color={theme.colors.text} icon="airplane" />}
        />
        <List.Item
          title="Rigs"
          left={() => <List.Icon color={theme.colors.text} icon="parachute" />}
          description="Dropzone rigs, e.g tandems and student rigs"
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'Drawer',
              params: {
                screen: 'Manifest',
                params: {
                  screen: 'DropzoneRigsScreen'
                }
              }
            })
          }
        />
        <List.Item
          disabled={!canUpdateRigInspectionTemplate}
          title="Rig Inspection Template"
          left={() => <List.Icon color={theme.colors.text} icon="check" />}
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'Drawer',
              params: {
                screen: 'Manifest',
                params: {
                  screen: 'RigInspectionTemplateScreen'
                }
              }
            })
          }
        />
        <List.Item
          title="Master Log"
          left={() => <List.Icon color={theme.colors.text} icon="parachute" />}
          description="View historic data for daily operations"
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'Drawer',
              params: {
                screen: 'Manifest',
                params: {
                  screen: 'DropzoneMasterLogScreen'
                }
              }
            })
          }
        />
      </List.Section>

      <List.Section title="Tickets" style={{ width: '100%' }}>
        <List.Item
          title="Ticket types"
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'Drawer',
              params: {
                screen: 'Manifest',
                params: {
                  screen: 'TicketTypesScreen'
                }
              }
            })
          }
          left={() => <List.Icon color={theme.colors.text} icon="ticket" />}
          description="Manage ticket prices and accessibility"
        />
        <List.Item
          title="Ticket add-ons"
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'Drawer',
              params: {
                screen: 'Manifest',
                params: {
                  screen: 'ExtrasScreen'
                }
              }
            })
          }
          left={() => <List.Icon color={theme.colors.text} icon="plus" />}
          description="Supplementary tickets like coach, camera, night jumpi"
        />
      </List.Section>
    </ScrollableScreen>
  );
}
