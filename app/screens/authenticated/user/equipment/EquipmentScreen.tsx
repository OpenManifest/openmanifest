import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';

import { FlatList } from 'react-native-gesture-handler';
import createUseDialog from 'app/providers/hooks/useDialog';
import type { RigEssentialsFragment } from 'app/api/operations';
import { Permission } from 'app/api/schema.d';
import RigDialog from 'app/forms/rig';

import { useDropzoneContext } from 'app/providers/dropzone/context';
import useRestriction from 'app/hooks/useRestriction';
import { useUserProfile } from 'app/api/crud';
import RigCard from './RigCard';
import { useAppTheme } from 'app/theme';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';

export type EquipmentRoute = {
  EquipmentScreen: {
    userId: string;
  };
};
const useRigDialog = createUseDialog<{ rig?: RigEssentialsFragment }>();

export default function EquipmentScreen() {
  const { theme } = useAppTheme();
  const rigDialog = useRigDialog();
  const {
    dropzone: { currentUser },
  } = useDropzoneContext();
  const navigation = useNavigation();

  const route = useRoute<RouteProp<EquipmentRoute, 'EquipmentScreen'>>();

  const { dropzoneUser, loading } = useUserProfile({
    id: (route?.params?.userId || currentUser?.id) as string,
  });

  React.useEffect(() => {
    if (dropzoneUser?.user?.name && dropzoneUser?.id !== currentUser?.id) {
      const [firstName] = dropzoneUser.user?.name.split(/\s/) || [];
      navigation.setOptions({ title: `${firstName}'s Equipment` });
    } else {
      navigation.setOptions({ title: 'Your Equipment' });
    }
  }, [currentUser?.id, dropzoneUser?.id, dropzoneUser?.user?.name, navigation]);
  const canUpdateUser = useRestriction(Permission.UpdateUser);
  return (
    <>
      <FlatList
        data={dropzoneUser?.user?.rigs || []}
        numColumns={1}
        style={{ flex: 1 }}
        refreshing={loading}
        keyExtractor={(item) => `rig-${item?.id}`}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <RigCard
            {...{ dropzoneUser }}
            // onSuccessfulImageUpload={refetch}
            rig={item}
            rigInspection={dropzoneUser?.rigInspections?.find(
              (insp) => insp.rig?.id === item.id && insp.isOk
            )}
            onPress={() => {
              rigDialog.open({ rig: item });
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
        onPress={() => rigDialog.open({})}
        label="Add rig"
      />

      <RigDialog
        onClose={rigDialog.close}
        open={rigDialog.visible}
        rig={rigDialog.state?.rig}
        userId={Number(dropzoneUser?.user?.id)}
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
