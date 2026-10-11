import { RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import * as React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Chip, Divider } from 'react-native-paper';
import ProgressBar from 'app/components/ProgressBar';
import Skeleton from 'app/components/Skeleton';

import useImagePicker from 'app/hooks/useImagePicker';
import { useDropzoneContext, useManifestContext } from 'app/providers';
import { useUpdateUserMutation } from 'app/api/reflection';

import { errorColor, successColor } from 'app/constants/Colors';
import { format } from 'date-fns';
import useProfileWizard from 'app/hooks/navigation/useProfileWizard';
import { useUserProfile } from 'app/api/crud';
import Header from './UserInfo/Header';
import InfoGrid from './UserInfo/InfoGrid';

import UserActionsButton from './UserActions';
import { ProfileDialogsProvider, useProfileDialogs } from './ProfileDialogs';
import TabBar, { ProfileTab } from './tabs';
import { useAppTheme } from 'app/theme';

export type ProfileRoute = {
  ProfileScreen: {
    userId: string;
  };
};
export default function ProfileScreen() {
  const {
    dropzone: { currentUser },
  } = useDropzoneContext();
  const route = useRoute<RouteProp<ProfileRoute>>();

  const { dropzoneUser, loading } = useUserProfile({
    id: route.params.userId || currentUser?.id,
  });

  return (
    <ProfileDialogsProvider {...{ dropzoneUser }}>
      <ProfileScreenContent {...{ dropzoneUser, loading }} />
    </ProfileDialogsProvider>
  );
}

function ProfileScreenContent(props: {
  dropzoneUser?: ReturnType<typeof useUserProfile>['dropzoneUser'];
  loading: boolean;
}) {
  const { dropzoneUser, loading } = props;
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const {
    dropzone: { currentUser },
  } = useDropzoneContext();
  const { editMembership } = useProfileDialogs();
  const pickImage = useImagePicker();
  const isFocused = useIsFocused();
  const [defaultIndex, onChangeIndex] = React.useState(1);
  const onClickAccessAndMembership = React.useCallback(() => {
    if (!dropzoneUser) {
      return;
    }
    editMembership();
  }, [dropzoneUser, editMembership]);
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
    }
  }, [headerRight, isFocused, navigation]);

  const [mutationUpdateUser] = useUpdateUserMutation();

  const onPickImage = React.useCallback(async () => {
    try {
      const base64 = await pickImage();

      if (base64) {
        // Upload image
        await mutationUpdateUser({
          variables: {
            dropzoneUser: dropzoneUser?.id,
            image: `data:image/jpeg;base64,${base64}`,
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
  }, [dropzoneUser?.id, mutationUpdateUser, pickImage]);

  const { dialogs } = useManifestContext();

  const openWizard = useProfileWizard();

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
        {loading && <ProgressBar color={theme.colors.primary} indeterminate visible={loading} />}
        <FlatList
          style={{ backgroundColor: theme.colors.background }}
          contentContainerStyle={[styles.content, { backgroundColor: 'transparent' }]}
          refreshControl={<RefreshControl refreshing={loading} />}
          keyExtractor={(_, idx) => `profile-${idx}`}
          ListHeaderComponent={() => (
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
                    layout={[{ key: 'header', width: '100%', height: 256, borderRadius: 8 }]}
                  />
                ) : (
                  <Header dropzoneUser={dropzoneUser} onPressAvatar={onPickImage}>
                    <InfoGrid
                      style={{ minHeight: 80 }}
                      items={[
                        {
                          title: 'Funds',
                          value: `$${dropzoneUser?.credits || 0}`,
                          onPress: () => {
                            dialogs.credits.open({ dropzoneUser });
                          },
                        },
                        {
                          title: 'License',
                          value: `${dropzoneUser?.license?.name || '-'}`,
                          onPress: () => {
                            openWizard(5);
                          },
                        },
                        {
                          title: 'Exit weight',
                          onPress: () => {
                            openWizard(9);
                          },
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
