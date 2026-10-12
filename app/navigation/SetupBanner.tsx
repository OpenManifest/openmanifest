import * as React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useOperatorContext } from 'app/providers/operator/context';
import useOpenUser from './useOpenUser';
import { Tappable, useStyles, useTheme } from 'app/ui';

const ICON_SIZE = 24;

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
  const rigs = currentUser.user?.rigs ?? [];
  const equipmentRequired = !!settings?.requireEquipment;

  const hasBodyMass = !!currentUser.user?.bodyMassKg;
  const hasEquipment = !equipmentRequired || rigs.length > 0;
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

  if (equipmentRequired && settings?.requireRigInspection && !currentUser.rigInspections?.length) {
    return { key: 'setup.inspection' };
  }
  const reserveInDate =
    !equipmentRequired ||
    rigs.some((rig) => (rig.repackExpiresAt || 0) > new Date().getTime() / 1000);
  if (!reserveInDate) return { key: 'setup.repack', toEquipment: true };

  const credits = (currentUser.creditsCents ?? 0) / 100;
  if (settings?.requireCredits && !credits) return { key: 'setup.credits' };
  return null;
}

/** The notice, in brand colours, under the header; it links to the profile or the equipment when that helps */
export default function SetupBanner() {
  const { t } = useTranslation(['common', 'terms']);
  const navigation = useNavigation();
  const openUser = useOpenUser();
  const theme = useTheme();
  const {
    operator: { currentUser },
  } = useOperatorContext();
  const notice = useSetupNotice();
  const styles = useStyles((tokens) => ({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space.sm,
      paddingHorizontal: tokens.space.lg,
      paddingVertical: tokens.space.sm,
      backgroundColor: tokens.colour.status.warning.bg,
    },
    text: {
      ...tokens.type.bodyCompact,
      color: tokens.colour.status.warning.fg,
      flexGrow: 1,
      flexShrink: 1,
    },
  }));

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
    <View role="status" style={styles.banner} testID="setup-banner">
      <Text style={styles.text}>{text}</Text>
      {wizard || notice.toEquipment ? (
        <Tappable role="button" aria-label={t('setup.open')} onPress={open}>
          <MaterialCommunityIcons
            name="open-in-new"
            size={ICON_SIZE}
            color={theme.colour.status.warning.fg}
          />
        </Tappable>
      ) : null}
    </View>
  );
}
