import { RouteProp, useNavigation, useRoute } from '@react-navigation/core';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';

import { FlatList } from 'react-native-gesture-handler';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { Permission } from 'app/api/schema.d';
import RigDialog from 'app/components/dialogs/Rig';

import { useDropzoneContext } from 'app/providers/dropzone/context';
import useRestriction from 'app/hooks/useRestriction';
import { useUserProfile } from 'app/api/crud';
import RigCard from './RigCard';

export type EquipmentRoute = {
  EquipmentScreen: {
    userId: string;
  };
};
export default function EquipmentScreen() {
  const globalState = useAppSelector((root) => root.global);
  const forms = useAppSelector((root) => root.forms);
  const dispatch = useAppDispatch();
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
              dispatch(actions.forms.rig.setOpen(item));
            }}
          />
        )}
      />

      <FAB
        small
        style={[styles.fab, { backgroundColor: globalState.theme.colors.primary }]}
        visible={canUpdateUser}
        icon="plus"
        onPress={() => dispatch(actions.forms.rig.setOpen(true))}
        label="Add rig"
      />

      <RigDialog
        onClose={() => dispatch(actions.forms.rig.setOpen(false))}
        onSuccess={() => requestAnimationFrame(() => dispatch(actions.forms.rig.setOpen(false)))}
        open={forms.rig.open}
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
