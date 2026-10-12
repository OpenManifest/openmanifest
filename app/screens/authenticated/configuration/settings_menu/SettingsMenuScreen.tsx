import * as React from 'react';
import { Divider, List, Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import useRestriction from 'app/hooks/useRestriction';
import { OperatorState, OperatorStateEvent, Permission } from 'app/api/schema.d';
import { useOperatorContext } from 'app/providers/operator/context';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { useOperatorsContext } from 'app/api/crud/useOperators';
import { useNotifications } from 'app/providers/notifications';
import { ColorSchemePreference, usePreferences } from 'app/state/preferences';
import { useAppTheme } from 'app/theme';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const notify = useNotifications();
  const {
    operator: { operator },
  } = useOperatorContext();

  const { theme } = useAppTheme();

  const canUpdateOperator = useRestriction(Permission.UpdateOperator);
  const canUpdateEquipmentInspectionTemplate = useRestriction(Permission.UpdateFormTemplate);

  const { updateVisibility } = useOperatorsContext();
  const onChangeVisibility = React.useCallback(
    async (event: OperatorStateEvent) => {
      if (!operator?.id) {
        return;
      }
      const result = await updateVisibility(operator.id, event);

      if ('error' in result && result.error) {
        notify.error(result.error);
      }
    },
    [operator?.id, notify, updateVisibility]
  );

  return (
    <ScrollableScreen contentContainerStyle={{ backgroundColor: theme.colors.surface }}>
      <List.Section title="Dropzone" style={{ width: '100%' }}>
        {!canUpdateOperator ? null : (
          <List.Item
            title="Configuration"
            right={() => <List.Icon color={theme.colors.text} icon="chevron-right" />}
            onPress={() =>
              !operator
                ? null
                : navigation.navigate('Authenticated', {
                      screen: 'Manifest',
                      params: {
                        screen: 'Configuration',
                        params: {
                          screen: 'OperatorSettingsScreen',
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
                screen: 'Manifest',
                params: {
                  screen: 'Configuration',
                  params: {
                    screen: 'PermissionScreen',
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
                screen: 'Manifest',
                params: {
                  screen: 'Configuration',
                  params: {
                    screen: 'VehiclesScreen',
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
                screen: 'Manifest',
                params: {
                  screen: 'Configuration',
                  params: {
                    screen: 'OperatorRigsScreen',
                  },
                },
              })
          }
        />
        <Divider />
        <List.Item
          disabled={!canUpdateEquipmentInspectionTemplate}
          title="Rig Inspection Template"
          right={() => <List.Icon color={theme.colors.text} icon="chevron-right" />}
          left={() => <List.Icon color={theme.colors.text} icon="clipboard-check-outline" />}
          onPress={() =>
            navigation.navigate('Authenticated', {
                screen: 'Manifest',
                params: {
                  screen: 'Configuration',
                  params: {
                    screen: 'RigInspectionTemplateScreen',
                  },
                },
              })
          }
        />
        {!canUpdateOperator ? null : (
          <>
            <Divider />
            <List.Item
              title="Master Log"
              left={() => <List.Icon color={theme.colors.text} icon="parachute" />}
              right={() => <List.Icon color={theme.colors.text} icon="chevron-right" />}
              description="View historic data for daily operations"
              onPress={() =>
                navigation.navigate('Authenticated', {
                    screen: 'Manifest',
                    params: {
                      screen: 'Configuration',
                      params: {
                        screen: 'DailyLogScreen',
                      },
                    },
                  })
              }
            />
          </>
        )}
        <Divider />
        {!canUpdateOperator ? null : (
          <List.Item
            title={
              {
                [OperatorState.Archived]: 'Re-open dropzone',
                [OperatorState.Public]: 'Go offline',
                [OperatorState.Private]: 'Go live',
                [OperatorState.InReview]: 'Awaiting review',
              }[operator?.status || OperatorState.Private]
            }
            left={() => (
              <List.Icon
                color={theme.colors.text}
                icon={
                  {
                    [OperatorState.Archived]: 'archive',
                    [OperatorState.Public]: 'check',
                    [OperatorState.Private]: 'upload',
                    [OperatorState.InReview]: 'progress-upload',
                  }[operator?.status || OperatorState.Private] as IconSource
                }
              />
            )}
            right={() => (
              <Switch
                value={[OperatorState.Public, OperatorState.InReview].includes(
                  operator?.status || OperatorState.Private
                )}
                disabled={operator?.status === OperatorState.InReview}
                onValueChange={(value) => {
                  onChangeVisibility(
                    value ? OperatorStateEvent.RequestPublication : OperatorStateEvent.Unpublish
                  );
                }}
              />
            )}
            onPress={() => {
              switch (operator?.status) {
                case OperatorState.Archived:
                  return onChangeVisibility(OperatorStateEvent.Publish);
                case OperatorState.Private:
                  return onChangeVisibility(OperatorStateEvent.RequestPublication);
                case OperatorState.Public:
                case OperatorState.InReview:
                  return onChangeVisibility(OperatorStateEvent.Unpublish);
                default:
                  return null;
              }
            }}
            description={
              {
                [OperatorState.Archived]:
                  'Your dropzone has been archived and is not visible to users',
                [OperatorState.Public]: 'Your dropzone is available to the public',
                [OperatorState.Private]:
                  'Request a review to make your dropzone available to all users',
                [OperatorState.InReview]:
                  'You may be contacted to verify the legitimacy of your dropzone.',
              }[operator?.status || OperatorState.Private]
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
                screen: 'Manifest',
                params: {
                  screen: 'Configuration',
                  params: {
                    screen: 'TicketTypesScreen',
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
                screen: 'Manifest',
                params: {
                  screen: 'Configuration',
                  params: {
                    screen: 'ExtrasScreen',
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
