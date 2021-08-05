import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Drawer, List, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import {
  DrawerActions,
  getFocusedRouteNameFromRoute,
  NavigationState,
  useNavigation,
  useNavigationState,
  useRoute,
} from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import capitalize from 'lodash/capitalize';
import SkeletonContent from 'react-native-skeleton-content';
import InfoGrid from '../../screens/authenticated/load/InfoGrid';
import useRestriction from '../../hooks/useRestriction';
import { Permission } from '../../api/schema.d';
import useCurrentDropzone from '../../api/hooks/useCurrentDropzone';
import useQueryDropzones from '../../api/hooks/useQueryDropzones';
import { actions, useAppDispatch } from '../../state';

export default function DrawerMenu() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { currentUser, dropzone, loading } = useCurrentDropzone();
  const { data } = useQueryDropzones({
    onError: (err) => console.error(err),
  });

  const navigation = useNavigation();
  const route = useRoute();
  const routeName = getFocusedRouteNameFromRoute(route);
  const navState = navigation.dangerouslyGetState();
  const subNavState = navState.routes[navState.index].state;
  // eslint-disable-next-line
  // @ts-ignore
  const subNavRoutes = subNavState?.routes[subNavState?.index];
  const subNavSubState = subNavRoutes?.state;
  let subRouteName = subNavState && getFocusedRouteNameFromRoute(subNavRoutes);
  subRouteName = subRouteName || subNavSubState?.routes[0].name;

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
    <View style={{ flex: 1 }}>
      <LinearGradient
        start={{ x: 0.0, y: 0.25 }}
        end={{ x: 0.5, y: 1.0 }}
        style={styles.profileHeader}
        colors={[theme.colors.accent, theme.colors.primary]}
      >
        {loading ? (
          <SkeletonContent
            containerStyle={{
              height: 50,
              width: '100%',
              paddingHorizontal: 8,
              flexDirection: 'row',
              marginBottom: 16,
            }}
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
                screen: 'Authenticated',
                params: {
                  screen: 'Manifest',
                  params: {
                    screen: 'ProfileScreen',
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
      </LinearGradient>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Drawer.Section title="Account">
          <Drawer.Item
            label="Manifest"
            active={/Manifest/.test(subRouteName || '')}
            icon="home"
            onPress={() => {
              navigation.navigate('Authenticated', {
                screen: 'Authenticated',
                params: {
                  screen: 'ManifestScreen',
                },
              });
            }}
          />
          <Drawer.Item
            label="Profile"
            active={subRouteName === 'ProfileScreen'}
            icon="account"
            onPress={() => {
              navigation.navigate('Authenticated', {
                screen: 'Authenticated',
                params: {
                  screen: 'Manifest',
                  params: {
                    screen: 'ProfileScreen',
                  },
                },
              });
            }}
          />
          <Drawer.Item
            label="Equipment"
            active={subRouteName === 'EquipmentScreen'}
            icon="parachute"
            onPress={() => {
              navigation.navigate('Authenticated', {
                screen: 'Authenticated',
                params: {
                  screen: 'Manifest',
                  params: {
                    screen: 'EquipmentScreen',
                  },
                },
              });
            }}
          />
          <Drawer.Item
            label="Notifications"
            active={subRouteName === 'Notifications'}
            icon="bell"
            onPress={() =>
              navigation.navigate('Authenticated', {
                screen: 'Authenticated',
                params: {
                  screen: 'Notifications',
                },
              })
            }
          />
          <Drawer.Item
            label="Transactions"
            active={subRouteName === 'TransactionsScreen'}
            icon="cash"
            onPress={() => {
              navigation.navigate('Authenticated', {
                screen: 'Authenticated',
                params: {
                  screen: 'Manifest',
                  params: {
                    screen: 'TransactionsScreen',
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
                  screen: 'Authenticated',
                  params: {
                    screen: 'Manifest',
                    params: {
                      screen: 'SettingsScreen',
                    },
                  },
                })
              }
            />
          ) : null}
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
          {data?.edges?.map((edge) => (
            <Drawer.Item
              key={`${edge?.node?.id}-dz`}
              label={edge?.node?.name || ''}
              icon="map-marker"
              active={dropzone?.id === edge?.node?.id}
              onPress={() => {
                if (edge?.node) {
                  dispatch(actions.global.setDropzone(edge.node));
                  navigation.navigate('Authenticated', {
                    screen: 'Authenticated',
                  });
                }
              }}
            />
          ))}
          <Drawer.Item
            label="Create new"
            icon="plus"
            onPress={() => {
              navigation.navigate('DropzoneSetupScreen');
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
    paddingTop: 80,
    paddingHorizontal: 8,
    marginBottom: 24,
  },

  profileAvatar: {
    marginBottom: 16,
  },
  profileAvatarTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  profileAvatarSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});
