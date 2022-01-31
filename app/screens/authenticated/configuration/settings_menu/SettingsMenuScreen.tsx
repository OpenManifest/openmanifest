import * as React from 'react';
import { Divider, List, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import useRestriction from 'app/hooks/useRestriction';
import { Permission } from 'app/api/schema.d';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import { DropzoneEssentialsFragment } from 'app/api/operations';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { data } = useCurrentDropzone();
  const theme = useTheme();

  const canUpdateDropzone = useRestriction(Permission.UpdateDropzone);
  const canUpdateRigInspectionTemplate = useRestriction(Permission.UpdateFormTemplate);

  return (
    <ScrollableScreen contentContainerStyle={{ backgroundColor: theme.colors.surface }}>
      <List.Section title="Dropzone" style={{ width: '100%' }}>
        {!canUpdateDropzone ? null : (
          <List.Item
            title="Configuration"
            onPress={() =>
              !data?.dropzone
                ? null
                : navigation.navigate('Authenticated', {
                    screen: 'Drawer',
                    params: {
                      screen: 'Manifest',
                      params: {
                        screen: 'Configuration',
                        params: {
                          screen: 'DropzoneSettingsScreen',
                          params: {
                            dropzone: data?.dropzone as DropzoneEssentialsFragment,
                          },
                        },
                      },
                    },
                  })
            }
            left={() => <List.Icon color={theme.colors.text} icon="information-outline" />}
            description="Set up name, branding and other settings"
          />
        )}
        <Divider />
        <List.Item
          title="Permissions"
          description="Grant or revoke access to define who can do what at this dropzone"
          left={() => <List.Icon color={theme.colors.text} icon="lock" />}
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'Drawer',
              params: {
                screen: 'Manifest',
                params: {
                  screen: 'Configuration',
                  params: {
                    screen: 'PermissionScreen',
                  },
                },
              },
            })
          }
        />
        <Divider />
        <List.Item
          title="Aircrafts"
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'Drawer',
              params: {
                screen: 'Manifest',
                params: {
                  screen: 'Configuration',
                  params: {
                    screen: 'AircraftsScreen',
                  },
                },
              },
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
                  screen: 'Configuration',
                  params: {
                    screen: 'DropzoneRigsScreen',
                  },
                },
              },
            })
          }
        />
        <Divider />
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
                  screen: 'Configuration',
                  params: {
                    screen: 'RigInspectionTemplateScreen',
                  },
                },
              },
            })
          }
        />
        <Divider />
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
                  screen: 'Configuration',
                  params: {
                    screen: 'MasterLogScreen',
                  },
                },
              },
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
                  screen: 'Configuration',
                  params: {
                    screen: 'TicketTypesScreen',
                  },
                },
              },
            })
          }
          left={() => <List.Icon color={theme.colors.text} icon="ticket" />}
          description="Manage ticket prices and accessibility"
        />
        <Divider />
        <List.Item
          title="Ticket add-ons"
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'Drawer',
              params: {
                screen: 'Manifest',
                params: {
                  screen: 'Configuration',
                  params: {
                    screen: 'ExtrasScreen',
                  },
                },
              },
            })
          }
          left={() => <List.Icon color={theme.colors.text} icon="plus" />}
          description="Supplementary tickets like coach, camera, night jumpi"
        />
      </List.Section>
    </ScrollableScreen>
  );
}
