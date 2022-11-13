import * as React from 'react';
import { Divider, List, Switch, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import useRestriction from 'app/hooks/useRestriction';
import { DropzoneState, DropzoneStateEvent, Permission } from 'app/api/schema.d';
import { useDropzoneContext } from 'app/providers';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { useDropzonesContext } from 'app/api/crud';
import { useNotifications } from 'app/providers/notifications';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const notify = useNotifications();
  const {
    dropzone: { dropzone },
  } = useDropzoneContext();

  const theme = useTheme();

  const canUpdateDropzone = useRestriction(Permission.UpdateDropzone);
  const canUpdateRigInspectionTemplate = useRestriction(Permission.UpdateFormTemplate);

  const { updateVisibility } = useDropzonesContext();
  const onChangeVisibility = React.useCallback(
    async (event: DropzoneStateEvent) => {
      if (!dropzone?.id) {
        return;
      }
      const result = await updateVisibility(dropzone.id, event);

      if ('error' in result && result.error) {
        notify.error(result.error);
      }
    },
    [dropzone?.id, notify, updateVisibility]
  );

  return (
    <ScrollableScreen contentContainerStyle={{ backgroundColor: theme.colors.surface }}>
      <List.Section title="Dropzone" style={{ width: '100%' }}>
        {!canUpdateDropzone ? null : (
          <List.Item
            title="Configuration"
            right={() => <List.Icon color={theme.colors.text} icon="chevron-right" />}
            onPress={() =>
              !dropzone
                ? null
                : navigation.navigate('Authenticated', {
                    screen: 'LeftDrawer',
                    params: {
                      screen: 'Manifest',
                      params: {
                        screen: 'Configuration',
                        params: {
                          screen: 'DropzoneSettingsScreen',
                          params: {
                            dropzone,
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
          right={() => <List.Icon color={theme.colors.text} icon="chevron-right" />}
          left={() => <List.Icon color={theme.colors.text} icon="lock" />}
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'LeftDrawer',
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
          right={() => <List.Icon color={theme.colors.text} icon="chevron-right" />}
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'LeftDrawer',
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
          right={() => <List.Icon color={theme.colors.text} icon="chevron-right" />}
          description="Dropzone rigs, e.g tandems and student rigs"
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'LeftDrawer',
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
          right={() => <List.Icon color={theme.colors.text} icon="chevron-right" />}
          left={() => <List.Icon color={theme.colors.text} icon="check" />}
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'LeftDrawer',
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
          right={() => <List.Icon color={theme.colors.text} icon="chevron-right" />}
          description="View historic data for daily operations"
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'LeftDrawer',
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
        <Divider />
        {!canUpdateDropzone ? null : (
          <List.Item
            title={
              {
                [DropzoneState.Archived]: 'Re-open dropzone',
                [DropzoneState.Public]: 'Go offline',
                [DropzoneState.Private]: 'Go live',
                [DropzoneState.InReview]: 'Awaiting review',
              }[dropzone?.status || DropzoneState.Private]
            }
            left={() => (
              <List.Icon
                color={theme.colors.text}
                icon={
                  {
                    [DropzoneState.Archived]: 'archive',
                    [DropzoneState.Public]: 'check',
                    [DropzoneState.Private]: 'upload',
                    [DropzoneState.InReview]: 'progress-upload',
                  }[dropzone?.status || DropzoneState.Private] as IconSource
                }
              />
            )}
            right={() => (
              <Switch
                value={[DropzoneState.Public, DropzoneState.InReview].includes(
                  dropzone?.status || DropzoneState.Private
                )}
                disabled={dropzone?.status === DropzoneState.InReview}
                onValueChange={(value) => {
                  onChangeVisibility(
                    value ? DropzoneStateEvent.RequestPublication : DropzoneStateEvent.Unpublish
                  );
                }}
              />
            )}
            onPress={() => {
              switch (dropzone?.status) {
                case DropzoneState.Archived:
                  return onChangeVisibility(DropzoneStateEvent.Publish);
                case DropzoneState.Private:
                  return onChangeVisibility(DropzoneStateEvent.RequestPublication);
                case DropzoneState.Public:
                case DropzoneState.InReview:
                  return onChangeVisibility(DropzoneStateEvent.Unpublish);
                default:
                  return null;
              }
            }}
            description={
              {
                [DropzoneState.Archived]:
                  'Your dropzone has been archived and is not visible to users',
                [DropzoneState.Public]: 'Your dropzone is available to the public',
                [DropzoneState.Private]:
                  'Request a review to make your dropzone available to all users',
                [DropzoneState.InReview]:
                  'You may be contacted to verify the legitimacy of your dropzone.',
              }[dropzone?.status || DropzoneState.Private]
            }
            descriptionNumberOfLines={4}
          />
        )}
      </List.Section>

      <List.Section title="Tickets" style={{ width: '100%' }}>
        <List.Item
          right={() => <List.Icon color={theme.colors.text} icon="chevron-right" />}
          title="Ticket types"
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'LeftDrawer',
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
          right={() => <List.Icon color={theme.colors.text} icon="chevron-right" />}
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'LeftDrawer',
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
