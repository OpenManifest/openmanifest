import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';

import { FlatList } from 'react-native-gesture-handler';
import createUseDialog from 'app/providers/hooks/useDialog';
import type { EquipmentEssentialsFragment } from 'app/api/operations';
import { Permission } from 'app/api/schema.d';
import EquipmentDialog from 'app/forms/equipment';

import { useOperatorContext } from 'app/providers/operator/context';
import useRestriction from 'app/hooks/useRestriction';
import { useUserProfile } from 'app/api/crud';
import EquipmentCard from './EquipmentCard';
import { useAppTheme } from 'app/theme';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';

export type EquipmentRoute = {
  EquipmentScreen: {
    userId: string;
  };
};
const useEquipmentDialog = createUseDialog<{ equipment?: EquipmentEssentialsFragment }>();

export default function EquipmentScreen() {
  const { theme } = useAppTheme();
  const equipmentDialog = useEquipmentDialog();
  const {
    operator: { currentUser },
  } = useOperatorContext();
  const navigation = useNavigation();

  const route = useRoute<RouteProp<EquipmentRoute, 'EquipmentScreen'>>();

  const { membership, loading } = useUserProfile({
    id: (route?.params?.userId || currentUser?.id) as string,
  });

  const { t } = useTranslation(['common', 'terms']);
  React.useEffect(() => {
    if (membership?.user?.name && membership?.id !== currentUser?.id) {
      const [firstName] = membership.user?.name.split(/\s/) || [];
      navigation.setOptions({
        title: t('common:screens.equipmentOf', {
          name: firstName,
          equipment: t('terms:equipment', { count: 1 }).toLowerCase(),
        }),
      });
    } else {
      navigation.setOptions({
        title: t('common:screens.yourEquipment', {
          equipment: t('terms:equipment', { count: 1 }).toLowerCase(),
        }),
      });
    }
  }, [currentUser?.id, membership?.id, membership?.user?.name, navigation, t]);
  const canUpdateUser = useRestriction(Permission.UpdateUser);
  return (
    <>
      <FlatList
        data={membership?.user?.equipment || []}
        numColumns={1}
        style={{ flex: 1 }}
        refreshing={loading}
        keyExtractor={(item) => `equipment-${item?.id}`}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <EquipmentCard
            {...{ membership }}
            // onSuccessfulImageUpload={refetch}
            equipment={item}
            equipmentInspection={membership?.equipmentInspections?.find(
              (insp) => insp.equipment?.id === item.id && insp.isOk
            )}
            onPress={() => {
              equipmentDialog.open({ equipment: item });
            }}
          />
        )}
      />

      <FAB
        labelMaxFontSizeMultiplier={CHROME_MAX_FONT_SIZE_MULTIPLIER}
        small
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        visible={canUpdateUser}
        icon="plus"
        onPress={() => equipmentDialog.open({})}
        label="Add rig"
      />

      <EquipmentDialog
        onClose={equipmentDialog.close}
        open={equipmentDialog.visible}
        equipment={equipmentDialog.state?.equipment}
        userId={Number(membership?.user?.id)}
      />
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
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
