import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useOperatorContext } from 'app/providers/operator/context';
import useOpenUser from './useOpenUser';
import { Banner } from 'app/ui';

/** What the signed-in member still has to do before they can manifest at this operator, if anything */
export function useSetupNotice(): {
  key: string;
  params?: Record<string, string>;
  toEquipment?: boolean;
} | null {
  const {
    operator: { currentUser, loading, operator },
  } = useOperatorContext();

  if (loading || !currentUser) return null;
  const settings = operator?.settings;
  const equipment = currentUser.user?.equipment ?? [];
  const equipmentRequired = !!settings?.requireEquipment;

  const hasBodyMass = !!currentUser.user?.bodyMassKg;
  const hasEquipment = !equipmentRequired || equipment.length > 0;
  if (!hasBodyMass || !hasEquipment) {
    return {
      key:
        !hasBodyMass && !hasEquipment
          ? 'setup.profileBoth'
          : !hasBodyMass
            ? 'setup.profileMass'
            : 'setup.profileEquipment',
    };
  }
  const membershipInDate =
    !settings?.requireMembership ||
    (!!currentUser.expiresAt && currentUser.expiresAt > new Date().getTime() / 1000);
  if (!membershipInDate) return { key: 'setup.membership' };

  if (
    equipmentRequired &&
    settings?.requireEquipmentInspection &&
    !currentUser.equipmentInspections?.length
  ) {
    return { key: 'setup.inspection' };
  }
  const reserveInDate =
    !equipmentRequired ||
    equipment.some((equipment) => (equipment.serviceDueAt || 0) > new Date().getTime() / 1000);
  if (!reserveInDate) return { key: 'setup.repack', toEquipment: true };

  const credits = (currentUser.creditsCents ?? 0) / 100;
  if (settings?.requireCredits && !credits) return { key: 'setup.credits' };
  return null;
}

/** The notice, in the warning colours, under the header; it links to the profile or the equipment when that helps */
export default function SetupBanner() {
  const { t } = useTranslation(['common', 'terms']);
  const navigation = useNavigation();
  const openUser = useOpenUser();
  const {
    operator: { currentUser },
  } = useOperatorContext();
  const notice = useSetupNotice();
  if (!notice) return null;
  const wizard = notice.key.startsWith('setup.profile');
  const open = () => {
    if (!currentUser) return;
    if (wizard)
      navigation.navigate('Wizards', {
        screen: 'UserWizardScreen',
        params: { membershipId: currentUser.id },
      } as never);
    else if (notice.toEquipment) {
      openUser('EquipmentScreen', { userId: currentUser.id });
    }
  };
  const text = t(notice.key, { equipment: t('terms:equipment', { count: 1 }).toLowerCase() });

  return (
    <Banner
      tone="warning"
      message={text}
      action={wizard || notice.toEquipment ? { label: t('setup.open'), onPress: open } : undefined}
      testID="setup-banner"
    />
  );
}
