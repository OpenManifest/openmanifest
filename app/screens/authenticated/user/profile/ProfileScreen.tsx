import { RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import * as React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Chip, Divider, ProgressBar } from 'react-native-paper';
import Skeleton from 'app/components/Skeleton';

import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { Permission } from 'app/api/schema.d';
import DropzoneUserDialog from 'app/components/dialogs/DropzoneUserDialog';
import CreditsSheet from 'app/components/dialogs/CreditsDialog/Credits';
import RigDialog from 'app/components/dialogs/Rig';
import EditUserSheet from 'app/components/dialogs/User';

import useImagePicker from 'app/hooks/useImagePicker';
import { useDropzoneContext } from 'app/api/crud/useDropzone';
// eslint-disable-next-line max-len
import useDropzoneUserProfile from 'app/api/hooks/useDropzoneUserProfile';
import useRestriction from 'app/hooks/useRestriction';
import { useUpdateUserMutation } from 'app/api/reflection';

import { errorColor, successColor } from 'app/constants/Colors';
import { format } from 'date-fns';
import Header from './UserInfo/Header';
import InfoGrid from './UserInfo/InfoGrid';

import UserActionsButton from './UserActions';
import TabBar, { ProfileTab } from './tabs';

export type ProfileRoute = {
  ProfileScreen: {
    userId: string;
  };
};
export default function ProfileScreen() {
  const state = useAppSelector((root) => root.global);
  const forms = useAppSelector((root) => root.forms);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { currentUser } = useDropzoneContext();
  const route = useRoute<RouteProp<ProfileRoute>>();

  const { dropzoneUser, loading, refetch } = useDropzoneUserProfile(
    Number(route.params.userId) || Number(currentUser?.id)
  );
  const pickImage = useImagePicker();
  const isFocused = useIsFocused();
  const [defaultIndex, onChangeIndex] = React.useState(1);
  const onClickAccessAndMembership = React.useCallback(() => {
    if (!dropzoneUser) {
      return;
    }
    dispatch(actions.forms.dropzoneUser.setOpen(dropzoneUser));
  }, [dispatch, dropzoneUser]);
  const headerRight = React.useCallback(
    () =>
      !currentUser?.expiresAt ? null : (
        <Chip
          onPress={onClickAccessAndMembership}
          style={{
            marginRight: 16,
            height: 24,
            backgroundColor:
              currentUser.expiresAt * 1000 < new Date().getTime() ? errorColor : successColor,
          }}
          textStyle={{ color: 'white', marginTop: 0 }}
        >
          {format(currentUser.expiresAt * 1000, 'dd/MM/yy')}
        </Chip>
      ),
    [currentUser?.expiresAt, onClickAccessAndMembership]
  );

  React.useEffect(() => navigation.setOptions({ title: 'Profile' }), [navigation]);
  React.useEffect(() => {
    if (isFocused) {
      navigation.setOptions({
        headerRight,
      });
      refetch();
    }
  }, [headerRight, isFocused, navigation, refetch]);

  const [mutationUpdateUser] = useUpdateUserMutation();

  const onPickImage = React.useCallback(async () => {
    try {
      const base64 = await pickImage();

      if (base64) {
        // Upload image
        await mutationUpdateUser({
          variables: {
            id: Number(dropzoneUser?.user?.id),
            image: `data:image/jpeg;base64,${base64}`,
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
  }, [dropzoneUser?.user?.id, mutationUpdateUser, pickImage]);

  const canAddTransaction = useRestriction(Permission.CreateUserTransaction);
  const onCloseRigForm = React.useCallback(
    () => dispatch(actions.forms.rig.setOpen(false)),
    [dispatch]
  );

  const onUserSheetClose = React.useCallback(() => {
    dispatch(actions.forms.user.setOpen(false));
  }, [dispatch]);

  const getContent = React.useCallback(
    ({ index }: { index: number }) => {
      if (index === 0) {
        return <TabBar onChange={onChangeIndex} />;
      }
      if (dropzoneUser) {
        return <ProfileTab active={defaultIndex} {...{ dropzoneUser }} />;
      }
      return null;
    },
    [defaultIndex, dropzoneUser]
  );
  return (
    <>
      <View style={StyleSheet.absoluteFill}>
        {loading && (
          <ProgressBar color={state.theme.colors.primary} indeterminate visible={loading} />
        )}
        <FlatList
          style={{ backgroundColor: state.theme.colors.background }}
          contentContainerStyle={[styles.content, { backgroundColor: 'transparent' }]}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
          keyExtractor={(_, idx) => `profile-${idx}`}
          ListHeaderComponent={() => (
            <View style={styles.wrappingHeader}>
              <View style={{ width: '100%' }}>
                {!dropzoneUser ? (
                  <Skeleton
                    key="profile-header"
                    containerStyle={{
                      height: 256,
                      width: 300,
                    }}
                    isLoading
                    layout={[{ key: 'header', width: 300, height: 100, borderRadius: 8 }]}
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
                          value:
                            Math.round(Number(dropzoneUser?.user?.exitWeight)).toString() || '-',
                        },
                      ]}
                    />
                    <Divider style={styles.divider} />
                  </Header>
                )}
              </View>
            </View>
          )}
          renderItem={getContent}
          data={[null, null]}
        />

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
      <UserActionsButton {...{ dropzoneUser }} visible={isFocused} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    // flexGrow: 1,
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
