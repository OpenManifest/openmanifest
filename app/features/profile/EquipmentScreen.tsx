import * as React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { EmptyState, Skeleton, useTheme } from 'app/ui';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import useTerms from 'app/i18n/useTerms';
import { useOperatorContext } from 'app/providers';
import EquipmentSection from './EquipmentSection';
import { ProfileDialogsProvider, useProfileDialogs } from './ProfileDialogs';
import useProfile, { useEquipmentActions } from './useProfile';

export type EquipmentRoute = {
  EquipmentScreen: {
    userId: string;
  };
};

/** A member's equipment on its own page (Account → Equipment, `/user/:userId/equipment`): the profile's section */
export default function EquipmentScreen() {
  const route = useRoute<RouteProp<EquipmentRoute, 'EquipmentScreen'>>();
  const {
    operator: { currentUser },
  } = useOperatorContext();
  const state = useProfile(route.params?.userId || currentUser?.id);

  return (
    <ProfileDialogsProvider membership={state.profile} onChanged={state.refresh}>
      <EquipmentContent {...state} />
    </ProfileDialogsProvider>
  );
}

function EquipmentContent({
  profile,
  abilities,
  loading,
  waiting,
  refresh,
}: ReturnType<typeof useProfile>) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const term = useTerms();
  const navigation = useNavigation();
  const {
    operator: { operator },
  } = useOperatorContext();
  const { editEquipment } = useProfileDialogs();
  const actions = useEquipmentActions(profile?.id);

  const firstName = profile?.user?.name?.split(/\s/)[0] ?? '';
  const equipment = term('equipment').toLowerCase();
  React.useEffect(() => {
    if (!profile) return;
    navigation.setOptions({
      title: abilities.self
        ? t('screens.yourEquipment', { equipment })
        : t('screens.equipmentOf', { name: firstName, equipment }),
    });
  }, [abilities.self, equipment, firstName, navigation, profile, t]);

  return (
    <ScreenContainer edges={['bottom']}>
      <ScrollView
        testID="profile-equipment-screen"
        contentContainerStyle={{
          padding: theme.space.lg,
          gap: theme.space.lg,
          paddingBottom: theme.space.xxxl,
          width: '100%',
          maxWidth: 720,
          alignSelf: 'center',
        }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        {waiting ? (
          <View style={{ gap: theme.space.md }}>
            <Skeleton height={160} />
            <Skeleton height={160} />
          </View>
        ) : !profile ? (
          <EmptyState
            testID="profile-missing"
            icon="account-question-outline"
            title={t('profile.missing.title')}
            body={t('profile.missing.body')}
          />
        ) : (
          <EquipmentSection
            equipment={profile.user.equipment ?? []}
            inspections={profile.equipmentInspections}
            kinds={operator?.equipmentKinds ?? []}
            onAdd={abilities.manageEquipment ? () => editEquipment() : undefined}
            onEdit={abilities.manageEquipment ? (item) => editEquipment(item) : undefined}
            onInspect={actions.inspect}
            inspector={abilities.inspect}
            onViewCard={actions.viewCard}
            onUploadCard={abilities.manageEquipment ? actions.uploadCard : undefined}
            uploadingId={actions.uploadingId}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
