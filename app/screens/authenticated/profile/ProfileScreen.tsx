import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import * as React from 'react';
import { Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { Divider, ProgressBar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import Skeleton from 'react-native-skeleton-content';
import { Tabs, TabScreen } from 'react-native-paper-tabs';

import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { Permission } from 'app/api/schema.d';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import DropzoneUserDialog from 'app/components/dialogs/DropzoneUserDialog';
import CreditsSheet from 'app/components/dialogs/CreditsDialog/Credits';
import RigDialog from 'app/components/dialogs/Rig';
import EditUserSheet from 'app/components/dialogs/User';

import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
// eslint-disable-next-line max-len
import useDropzoneUserProfile from 'app/api/hooks/useDropzoneUserProfile';
import useRestriction from 'app/hooks/useRestriction';
import { useUpdateUserMutation } from 'app/api/reflection';

import Header from './UserInfo/Header';
import InfoGrid from './UserInfo/InfoGrid';

import UserActionsButton from './UserActions';
import EquipmentTab from './tabs/Equipment';
import JumpHistoryTab from './tabs/JumpHistory';
import TransactionsTab from './tabs/Transactions';

export default function ProfileScreen() {
  const state = useAppSelector((root) => root.global);
  const forms = useAppSelector((root) => root.forms);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { currentUser } = useCurrentDropzone();
  const route = useRoute<{ key: string; name: string; params: { userId: string } }>();

  const { dropzoneUser, loading, refetch } = useDropzoneUserProfile(
    Number(route.params.userId) || Number(currentUser?.id)
  );

  const isFocused = useIsFocused();
  const [defaultIndex, onChangeIndex] = React.useState(0);

  React.useEffect(() => navigation.setOptions({ title: 'Profile' }), [navigation]);
  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  const [mutationUpdateUser] = useUpdateUserMutation();

  React.useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          console.error('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const onPickImage = React.useCallback(async () => {
    try {
      const result = (await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.1,
        base64: true,
      })) as { base64: string };

      // Upload image
      await mutationUpdateUser({
        variables: {
          id: Number(dropzoneUser?.user?.id),
          image: `data:image/jpeg;base64,${result.base64}`,
        },
      });
    } catch (e) {
      console.log(e);
    }
  }, [dropzoneUser?.user?.id, mutationUpdateUser]);

  const canAddTransaction = useRestriction(Permission.CreateUserTransaction);
  const onCloseRigForm = React.useCallback(
    () => dispatch(actions.forms.rig.setOpen(false)),
    [dispatch]
  );

  const onUserSheetClose = React.useCallback(() => {
    dispatch(actions.forms.user.setOpen(false));
  }, [dispatch]);

  return (
    <>
      <View style={StyleSheet.absoluteFill}>
        {loading && (
          <ProgressBar color={state.theme.colors.accent} indeterminate visible={loading} />
        )}
        <ScrollableScreen
          style={{ backgroundColor: state.theme.colors.background }}
          contentContainerStyle={[styles.content, { backgroundColor: 'transparent' }]}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
        >
          <View style={styles.wrappingHeader}>
            <View style={{ width: '100%' }}>
              {!dropzoneUser ? (
                <Skeleton
                  key="profile-header"
                  containerStyle={{
                    height: 256,
                    width: '100%',
                  }}
                  isLoading
                  layout={[{ key: 'header', width: '100%', height: '100%', borderRadius: 8 }]}
                />
              ) : (
                <Header dropzoneUser={dropzoneUser} onPressAvatar={onPickImage}>
                  <InfoGrid
                    style={{ height: 80 }}
                    items={[
                      {
                        title: 'Funds',
                        value: `$${dropzoneUser?.credits || 0}`,
                        onPress: () => {
                          if (dropzoneUser && canAddTransaction) {
                            dispatch(actions.forms.credits.setOpen(dropzoneUser));
                          }
                        },
                      },
                      {
                        title: 'License',
                        value: `${dropzoneUser?.license?.name || '-'}`,
                      },
                      {
                        title: 'Exit weight',
                        value: Math.round(Number(dropzoneUser?.user?.exitWeight)).toString() || '-',
                      },
                    ]}
                  />
                  <Divider style={styles.divider} />
                </Header>
              )}
            </View>

            <Tabs
              {...{ defaultIndex, onChangeIndex }}
              mode="fixed"
              style={{ backgroundColor: state.theme.colors.surface, height: 100 }}
            >
              <TabScreen label="Jumps">
                <View style={{ height: 5, width: 5 }} />
              </TabScreen>
              <TabScreen label="Funds">
                <View style={{ height: 5, width: 5 }} />
              </TabScreen>
              <TabScreen label="Equipment">
                <View style={{ height: 5, width: 5 }} />
              </TabScreen>
            </Tabs>
          </View>
        </ScrollableScreen>
        {defaultIndex === 0 ? <JumpHistoryTab {...{ dropzoneUser }} /> : null}
        {defaultIndex === 1 ? <EquipmentTab {...{ dropzoneUser }} /> : null}
        {defaultIndex === 2 ? <TransactionsTab {...{ dropzoneUser }} /> : null}

        <RigDialog
          onClose={onCloseRigForm}
          onSuccess={() => requestAnimationFrame(() => dispatch(actions.forms.rig.setOpen(false)))}
          open={forms.rig.open}
          userId={Number(dropzoneUser?.user?.id)}
        />

        <DropzoneUserDialog
          onClose={() => dispatch(actions.forms.dropzoneUser.setOpen(false))}
          onSuccess={(user) => {
            dispatch(actions.forms.dropzoneUser.setOpen(false));
            if (currentUser?.id === dropzoneUser?.id) {
              dispatch(actions.global.setUser(user.user));
              refetch();
            }
          }}
          open={forms.dropzoneUser.open}
        />

        <CreditsSheet
          onClose={() => dispatch(actions.forms.credits.setOpen(false))}
          onSuccess={() => dispatch(actions.forms.credits.setOpen(false))}
          open={forms.credits.open}
          dropzoneUser={dropzoneUser || undefined}
        />

        <EditUserSheet
          dropzoneUserId={Number(dropzoneUser?.id)}
          onClose={onUserSheetClose}
          onSuccess={() => {
            dispatch(actions.forms.user.setOpen(false));
          }}
          open={forms.user.open}
        />
      </View>
      <UserActionsButton {...{ dropzoneUser }} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 56,
    paddingHorizontal: 0,
  },
  wrappingHeader: { width: '100%', flexDirection: 'row', flexWrap: 'wrap' },
  wrappingHeaderItem: {},
  divider: {
    height: 1,
    width: '100%',
  },
  chip: {
    margin: 1,
    backgroundColor: 'transparent',
    minHeight: 23,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  chipTitle: {
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 12,
    lineHeight: 24,
    textAlignVertical: 'center',
  },
});
