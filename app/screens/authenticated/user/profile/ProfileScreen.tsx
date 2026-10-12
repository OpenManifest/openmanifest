import { RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Chip, Divider } from 'react-native-paper';
import ProgressBar from 'app/components/ProgressBar';
import Skeleton from 'app/components/Skeleton';

import useImagePicker from 'app/hooks/useImagePicker';
import { useOperatorContext, useManifestContext } from 'app/providers';
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
import { formatCents } from 'app/utils/money';
import { formatQuantity } from 'app/i18n/format';

export type ProfileRoute = {
  ProfileScreen: {
    userId: string;
  };
};
export default function ProfileScreen() {
  const {
    operator: { currentUser },
  } = useOperatorContext();
  const route = useRoute<RouteProp<ProfileRoute>>();

  const { membership, loading } = useUserProfile({
    id: route.params.userId || currentUser?.id,
  });

  return (
    <ProfileDialogsProvider {...{ membership }}>
      <ProfileScreenContent {...{ membership, loading }} />
    </ProfileDialogsProvider>
  );
}

function ProfileScreenContent(props: {
  membership?: ReturnType<typeof useUserProfile>['membership'];
  loading: boolean;
}) {
  const { membership, loading } = props;
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const {
    operator: { currentUser },
  } = useOperatorContext();
  const { editMembership } = useProfileDialogs();
  const pickImage = useImagePicker();
  const isFocused = useIsFocused();
  const [defaultIndex, onChangeIndex] = React.useState(1);
  const onClickAccessAndMembership = React.useCallback(() => {
    if (!membership) {
      return;
    }
    editMembership();
  }, [membership, editMembership]);
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

  const { t } = useTranslation(['common', 'terms']);
  React.useEffect(() => navigation.setOptions({ title: t('screens.user') }), [navigation, t]);
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
            membership: membership?.id,
            image: `data:image/jpeg;base64,${base64}`,
          },
        });
      }
    } catch {}
  }, [membership?.id, mutationUpdateUser, pickImage]);

  const { dialogs } = useManifestContext();

  const openWizard = useProfileWizard();

  const getContent = React.useCallback(
    ({ index }: { index: number }) => {
      if (index === 0) {
        return <TabBar onChange={onChangeIndex} />;
      }
      if (membership) {
        return <ProfileTab active={defaultIndex} {...{ membership }} />;
      }
      return null;
    },
    [defaultIndex, membership]
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
                {!membership ? (
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
                  <Header membership={membership} onPressAvatar={onPickImage}>
                    <InfoGrid
                      style={{ minHeight: 80 }}
                      items={[
                        {
                          title: 'Funds',
                          value: formatCents(membership?.creditsCents),
                          onPress: () => {
                            dialogs.credits.open({ membership });
                          },
                        },
                        {
                          title: t('terms:certification', { count: 1 }),
                          value: `${membership?.certificationLevel?.name || '-'}`,
                          onPress: () => {
                            openWizard(5);
                          },
                        },
                        {
                          title: 'Exit weight',
                          onPress: () => {
                            openWizard(9);
                          },
                          value: membership?.user?.bodyMassKg
                            ? formatQuantity(Number(membership.user.bodyMassKg), 'mass')
                            : '-',
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
      <UserActionsButton {...{ membership }} visible={isFocused} />
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
