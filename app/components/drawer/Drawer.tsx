import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Drawer, List } from 'react-native-paper';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import capitalize from 'lodash/capitalize';
import SkeletonContent from 'app/components/Skeleton';
import { DropzoneExtensiveFragment } from 'app/api/operations';
import InfoGrid from 'app/screens/authenticated/dropzone/load/InfoGrid';
import useRestriction from 'app/hooks/useRestriction';
import { ModerationRole, Permission } from 'app/api/schema.d';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { useDropzonesContext } from 'app/api/crud';
import { actions, useAppDispatch, useAppSelector } from '../../state';

export default function DrawerMenu() {
  const { theme, currentRouteName: routeName } = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();
  const {
    dropzone: { currentUser, dropzone, loading },
  } = useDropzoneContext();
  const { dropzones } = useDropzonesContext();

  const navigation = useNavigation();

  const canUpdateDropzone = useRestriction(Permission.UpdateDropzone);
  const canUpdatePlane = useRestriction(Permission.UpdatePlane);
  const canUpdateTicketTypes = useRestriction(Permission.UpdateTicketType);
  const canUpdateExtras = useRestriction(Permission.UpdateExtra);
  const canUpdatePermissions = useRestriction(Permission.GrantPermission);
  const canUpdateDzRigs = useRestriction(Permission.UpdateDropzoneRig);
  const canUpdateRigInspectionTemplate = useRestriction(Permission.UpdateFormTemplate);

  const shouldShowSettings =
    canUpdateDropzone ||
    canUpdatePlane ||
    canUpdateTicketTypes ||
    canUpdateExtras ||
    canUpdatePermissions ||
    canUpdateDzRigs ||
    canUpdateRigInspectionTemplate;

  return (
    <View style={{ flex: 1, paddingTop: 100 }}>
      {loading ? (
        <SkeletonContent
          containerStyle={styles.skeleton}
          isLoading
          layout={[
            { key: 'avatar', borderRadius: 25, height: 50, width: 50 },
            { key: 'role', height: 12, width: 120, marginLeft: 8, marginTop: 12 },
          ]}
        />
      ) : (
        <List.Item
          left={() =>
            !currentUser?.user?.image ? (
              <Avatar.Icon
                size={50}
                icon="account"
                color={theme.colors.primary}
                style={{ backgroundColor: theme.colors.surface }}
              />
            ) : (
              <Avatar.Image
                size={50}
                source={{ uri: currentUser?.user.image as string }}
                style={{ backgroundColor: theme.colors.surface }}
              />
            )
          }
          title={currentUser?.user?.name}
          description={`@ ${dropzone?.name}`}
          titleStyle={styles.profileAvatarTitle}
          descriptionStyle={styles.profileAvatarSubtitle}
          style={styles.profileAvatar}
          onPress={() => {
            navigation.navigate('Authenticated', {
              screen: 'LeftDrawer',
              params: {
                screen: 'Manifest',
                params: {
                  screen: 'User',
                  params: {
                    screen: 'ProfileScreen',
                    params: {
                      userId: currentUser?.id as string,
                    },
                  },
                },
              },
            });
          }}
        />
      )}

      <InfoGrid
        items={[
          {
            title: 'Role',
            value: capitalize((currentUser?.role?.name || '').replace('_', ' ')),
          },
          {
            title: 'Funds',
            value: `$${currentUser?.credits || 0}`,
          },
        ]}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Drawer.Section title="Dropzone">
          {dropzone?.currentUser?.user?.moderationRole !== ModerationRole.User ? (
            <Drawer.Item
              label="Admin"
              active={/Overview/.test(routeName || '')}
              icon="view-dashboard"
              onPress={() => {
                navigation.navigate('Authenticated', {
                  screen: 'LeftDrawer',
                  params: {
                    screen: 'Overview',
                    params: {
                      screen: 'OverviewScreen',
                    },
                  },
                });
              }}
            />
          ) : null}
          <Drawer.Item
            label="Overview"
            active={/Dashboard/.test(routeName || '')}
            icon="view-dashboard-outline"
            onPress={() => {
              navigation.navigate('Authenticated', {
                screen: 'LeftDrawer',
                params: {
                  screen: 'Overview',
                  params: {
                    screen: 'DashboardScreen',
                  },
                },
              });
            }}
          />
          <Drawer.Item
            label="Manifest"
            active={/Manifest/.test(routeName || '')}
            icon="home"
            onPress={() => {
              navigation.navigate('Authenticated', {
                screen: 'LeftDrawer',
                params: {
                  screen: 'Manifest',
                  params: {
                    screen: 'ManifestScreen',
                  },
                },
              });
            }}
          />
          <Drawer.Item
            label="Order Activity"
            active={routeName === 'DropzoneTransactionsScreen'}
            icon="cash"
            onPress={() => {
              navigation.navigate('Authenticated', {
                screen: 'LeftDrawer',
                params: {
                  screen: 'Manifest',
                  params: {
                    screen: 'Configuration',
                    params: {
                      screen: 'TransactionsScreen',
                    },
                  },
                },
              });
            }}
          />
          {shouldShowSettings ? (
            <Drawer.Item
              active={routeName === 'Settings'}
              label="Settings"
              icon="cog"
              onPress={() =>
                navigation.navigate('Authenticated', {
                  screen: 'LeftDrawer',
                  params: {
                    screen: 'Manifest',
                    params: {
                      screen: 'Configuration',
                      params: {
                        screen: 'SettingsMenuScreen',
                      },
                    },
                  },
                })
              }
            />
          ) : null}
        </Drawer.Section>
        <Drawer.Section title="Account">
          <Drawer.Item
            label="Profile"
            active={routeName === 'ProfileScreen'}
            icon="account"
            onPress={() => {
              navigation.navigate('Wizards', {
                screen: 'User',
                params: {
                  screen: 'ProfileScreen',
                  params: {
                    userId: currentUser?.id as string,
                  },
                },
              });
            }}
          />
          <Drawer.Item
            label="Equipment"
            active={routeName === 'EquipmentScreen'}
            icon="parachute"
            onPress={() => {
              navigation.navigate('Authenticated', {
                screen: 'LeftDrawer',
                params: {
                  screen: 'Manifest',
                  params: {
                    screen: 'User',
                    params: {
                      screen: 'EquipmentScreen',
                      params: { userId: currentUser?.id as string },
                    },
                  },
                },
              });
            }}
          />

          <Drawer.Item
            label="Notifications"
            active={routeName === 'NotificationsScreen'}
            icon="bell"
            onPress={() =>
              navigation.navigate('Authenticated', {
                screen: 'LeftDrawer',
                params: {
                  screen: 'Notifications',
                  params: {
                    screen: 'NotificationsScreen',
                  },
                },
              })
            }
          />
          <Drawer.Item
            label="Transactions"
            active={routeName === 'OrdersScreen'}
            icon="cash"
            onPress={() => {
              navigation.navigate('Authenticated', {
                screen: 'LeftDrawer',
                params: {
                  screen: 'Manifest',
                  params: {
                    screen: 'User',
                    params: {
                      screen: 'OrdersScreen',
                      params: { userId: currentUser?.id as string },
                    },
                  },
                },
              });
            }}
          />

          <Drawer.Item
            label="Log out"
            icon="logout"
            onPress={() => {
              dispatch(actions.global.logout());
              navigation.dispatch(DrawerActions.closeDrawer());
            }}
          />
        </Drawer.Section>

        <Drawer.Section title="Switch dropzone">
          {dropzones?.map((item) => (
            <Drawer.Item
              key={`${item?.id}-dz`}
              label={item?.name || ''}
              icon={
                item?.banner
                  ? ({ size }) => (
                      <Avatar.Image source={{ uri: item?.banner as string }} {...{ size }} />
                    )
                  : 'map-marker'
              }
              active={dropzone?.id === item?.id}
              onPress={() => {
                if (item) {
                  dispatch(actions.global.setDropzone(item as DropzoneExtensiveFragment));
                  navigation.navigate('Authenticated', {
                    screen: 'LeftDrawer',
                    params: {
                      screen: 'Manifest',
                      params: {
                        screen: 'ManifestScreen',
                      },
                    },
                  });
                }
              }}
            />
          ))}
          <Drawer.Item
            label="Create new"
            icon="plus"
            onPress={() => {
              navigation.navigate('Wizards', { screen: 'DropzoneWizardScreen' });
            }}
          />
        </Drawer.Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    backgroundColor: '#FF1414',
    flexGrow: 1,
  },
  skeleton: {
    marginLeft: 32,
    height: 50,
    width: '100%',
    paddingHorizontal: 8,
    flexDirection: 'row',
    marginBottom: 16,
  },
  profileAvatar: {
    marginLeft: 32,
    marginBottom: 16,
  },
  profileAvatarTitle: {
    fontWeight: 'bold',
    marginLeft: 4,
  },
  profileAvatarSubtitle: {
    fontSize: 12,
    marginLeft: 4,
  },
});
