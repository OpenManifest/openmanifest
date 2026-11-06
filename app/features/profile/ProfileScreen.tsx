import * as React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, Overlay, Row, Skeleton, Text, useTheme } from 'app/ui';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import useBreakpoint from 'app/components/layout/useBreakpoint';
import { PeopleDocument, useArchiveUserMutation, useUpdateUserMutation } from 'app/api/reflection';
import type { MembershipDetailsFragment } from 'app/api/operations';
import useImagePicker from 'app/hooks/useImagePicker';
import useOpenUser from 'app/navigation/useOpenUser';
import { useManifestContext, useOperatorContext } from 'app/providers';
import { useNotifications } from 'app/providers/notifications';
import ReadyChecklist from 'app/features/today/ReadyChecklist';
import CertificationsSection from './CertificationsSection';
import EquipmentSection from './EquipmentSection';
import FundsSection from './FundsSection';
import LoadsSection from './LoadsSection';
import MembershipSection from './MembershipSection';
import { ProfileDialogsProvider, useProfileDialogs } from './ProfileDialogs';
import ProfileSummary from './ProfileSummary';
import {
  fixOf,
  inspectionOf,
  profileRules,
  slotsOf,
  type Fix,
  type Profile,
  type ProfileRule,
} from './profile';
import useProfile, { useEquipmentActions, useOpenBoard } from './useProfile';

export type ProfileRoute = {
  ProfileScreen: {
    userId: string;
  };
};

/** The step of the guided form where the certifications start */
const CERTIFICATION_STEP = 3;

/**
 * A member's profile: who they are and whether they can fly with the fix for what is wrong, then their loads, funds,
 * certifications and qualifications, equipment and membership. One column on a phone, two on a wide window. A member
 * always has their own (even without `readUser`); staff act on others by their permissions.
 */
export default function ProfileScreen() {
  const route = useRoute<RouteProp<ProfileRoute, 'ProfileScreen'>>();
  const {
    operator: { currentUser },
  } = useOperatorContext();
  const id = route.params?.userId || currentUser?.id;
  const state = useProfile(id);

  return (
    <ProfileDialogsProvider membership={state.profile} onChanged={state.refresh}>
      <ProfileContent {...state} />
    </ProfileDialogsProvider>
  );
}

function ProfileContent({
  profile,
  abilities,
  loading,
  waiting,
  refresh,
  hasMoreSlots,
  moreSlots,
}: ReturnType<typeof useProfile>) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const expanded = useBreakpoint() === 'expanded';
  const navigation = useNavigation();
  const openUser = useOpenUser();
  const openBoard = useOpenBoard();
  const notify = useNotifications();
  const pickImage = useImagePicker();
  const {
    operator: { operator },
  } = useOperatorContext();
  const { dialogs } = useManifestContext();
  const { editUser, editMembership, editEquipment } = useProfileDialogs();
  const equipmentActions = useEquipmentActions(profile?.id);
  const [updateUser] = useUpdateUserMutation();
  const [archiveUser, { loading: removing }] = useArchiveUserMutation();
  const [confirmingRemove, setConfirmingRemove] = React.useState(false);

  if (waiting) {
    return (
      <ScreenContainer edges={['bottom']}>
        <View style={{ padding: theme.space.lg, gap: theme.space.md }} testID="profile-loading">
          <Skeleton height={160} />
          <Skeleton height={200} />
          <Skeleton height={120} />
        </View>
      </ScreenContainer>
    );
  }
  if (!profile) {
    return (
      <ScreenContainer edges={['bottom']}>
        <EmptyState
          testID="profile-missing"
          icon="account-question-outline"
          title={t('profile.missing.title')}
          body={t('profile.missing.body')}
        />
      </ScreenContainer>
    );
  }

  const member: Profile = profile;
  const name = member.user.name ?? '';
  const equipment = member.user.equipment ?? [];
  const openWizard = (index?: number) =>
    navigation.navigate('Wizards', {
      screen: 'UserWizardScreen',
      params: { index, membershipId: member.id },
    } as never);
  const addCredit = () =>
    dialogs.credits.open({ membership: member as unknown as MembershipDetailsFragment });
  const openWallet = () =>
    navigation.navigate('Authenticated', {
      screen: 'Wallet',
      params: { screen: 'WalletScreen' },
    } as never);

  const fixes: Record<Fix, () => void> = {
    details: editUser,
    membership: editMembership,
    credit: addCredit,
    wallet: openWallet,
    wizard: () => openWizard(),
    equipment: () => {
      const uninspected = equipment.find(
        (item) => !inspectionOf(item.id, member.equipmentInspections)
      );
      if (!equipment.length && abilities.manageEquipment) editEquipment();
      else if (uninspected) equipmentActions.inspect(uninspected);
      else if (abilities.manageEquipment && equipment[0]) editEquipment(equipment[0]);
    },
  };
  const fixFor = (rule: Pick<ProfileRule, 'code' | 'problem'>) =>
    fixOf(rule.problem || rule.code, abilities) ?? fixOf(rule.code, abilities);

  const changePhoto = async () => {
    const base64 = await pickImage().catch(() => undefined);
    if (!base64) return;
    try {
      const { data } = await updateUser({
        variables: { membership: member.id, image: `data:image/jpeg;base64,${base64}` },
      });
      const error = data?.updateUser?.errors?.[0];
      if (error) notify.error(error);
    } catch {
      notify.error(t('profile.photoFailed'));
    }
  };

  const remove = async () => {
    try {
      const { data } = await archiveUser({
        variables: { id: Number(member.id) },
        refetchQueries: [PeopleDocument],
      });
      const error = data?.deleteUser?.errors?.[0];
      if (error) {
        notify.error(error);
        return;
      }
      setConfirmingRemove(false);
      notify.success(t('profile.remove.done', { name }));
      if (navigation.canGoBack()) navigation.goBack();
      else openUser('UserListScreen', undefined);
    } catch (error) {
      if (error instanceof Error) notify.error(error.message);
    }
  };

  const summary = (
    <ProfileSummary
      profile={member}
      abilities={abilities}
      onEditDetails={editUser}
      onEditMembership={editMembership}
      onWizard={() => openWizard()}
      onRemove={() => setConfirmingRemove(true)}
      onChangePhoto={abilities.editDetails ? changePhoto : undefined}
    />
  );
  const ready = (
    <ReadyChecklist
      testID="profile-ready"
      title={abilities.self ? t('profile.ready.self') : t('profile.ready.other', { name })}
      rules={profileRules(member.eligibility.rules)}
      canFix={(rule) => !!fixFor(rule)}
      onFix={(rule) => {
        const fix = fixFor(rule);
        if (fix) fixes[fix]();
      }}
    />
  );
  const loads = (
    <LoadsSection
      slots={slotsOf(member)}
      self={abilities.self}
      timeZone={operator?.timeZone}
      hasMore={hasMoreSlots}
      loadingMore={loading}
      onMore={moreSlots}
      onBoard={openBoard}
      onOpen={(slot) =>
        navigation.navigate('Authenticated', {
          screen: 'Manifest',
          params: { screen: 'LoadScreen', params: { loadId: slot.load.id } },
        } as never)
      }
    />
  );
  const funds = (
    <FundsSection
      creditsCents={member.creditsCents}
      onAddCredit={abilities.addCredit ? addCredit : undefined}
      onWallet={abilities.self && !abilities.readTransactions ? openWallet : undefined}
      onTransactions={
        abilities.readTransactions
          ? () => openUser('OrdersScreen', { userId: member.id })
          : undefined
      }
    />
  );
  const certifications = (
    <CertificationsSection
      certifications={member.user.userCertifications ?? []}
      currentId={member.userCertification?.id}
      onUpdate={abilities.editDetails ? () => openWizard(CERTIFICATION_STEP) : undefined}
    />
  );
  const equipmentSection = (
    <EquipmentSection
      equipment={equipment}
      inspections={member.equipmentInspections}
      kinds={operator?.equipmentKinds ?? []}
      onAdd={abilities.manageEquipment ? () => editEquipment() : undefined}
      onEdit={abilities.manageEquipment ? (item) => editEquipment(item) : undefined}
      onInspect={equipmentActions.inspect}
      inspector={abilities.inspect}
      onViewCard={equipmentActions.viewCard}
      onUploadCard={abilities.manageEquipment ? equipmentActions.uploadCard : undefined}
      uploadingId={equipmentActions.uploadingId}
    />
  );
  const membership = (
    <MembershipSection
      roleName={member.role?.name}
      expiresAt={member.expiresAt}
      permissions={member.permissions}
      timeZone={operator?.timeZone}
      onEdit={abilities.editMembership ? editMembership : undefined}
    />
  );

  return (
    <ScreenContainer edges={['bottom']}>
      <ScrollView
        testID="profile"
        contentContainerStyle={{
          padding: theme.space.lg,
          gap: theme.space.lg,
          paddingBottom: theme.space.xxxl,
        }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        {expanded ? (
          <View style={{ flexDirection: 'row', gap: theme.space.lg, alignItems: 'flex-start' }}>
            <View style={{ flex: 1, gap: theme.space.lg }} testID="profile-column-main">
              {summary}
              {ready}
              {funds}
              {membership}
            </View>
            <View style={{ flex: 1, gap: theme.space.lg }} testID="profile-column-side">
              {loads}
              {certifications}
              {equipmentSection}
            </View>
          </View>
        ) : (
          <View style={{ gap: theme.space.lg }}>
            {summary}
            {ready}
            {loads}
            {funds}
            {certifications}
            {equipmentSection}
            {membership}
          </View>
        )}
      </ScrollView>

      <Overlay
        open={confirmingRemove}
        onClose={() => setConfirmingRemove(false)}
        title={t('profile.remove.title', { name })}
        presentation="dialog"
        testID="profile-remove"
        footer={
          <Row gap="sm" justify="end">
            <Button
              variant="secondary"
              label={t('profile.remove.keep')}
              onPress={() => setConfirmingRemove(false)}
            />
            <Button
              variant="destructive"
              label={t('profile.remove.confirm')}
              loading={removing}
              testID="profile-remove-yes"
              onPress={remove}
            />
          </Row>
        }
      >
        <Text>{t('profile.remove.body', { name })}</Text>
      </Overlay>
    </ScreenContainer>
  );
}
