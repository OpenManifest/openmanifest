import { useIsFocused, useNavigation } from '@react-navigation/core';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';

import { FlatList } from 'react-native-gesture-handler';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import { Permission } from '../../../api/schema.d';
import RigDialog from '../../../components/dialogs/Rig';

import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';
import useDropzoneUser from '../../../api/hooks/useDropzoneUser';
import useRestriction from '../../../hooks/useRestriction';
import RigCard from './RigCard';

export default function ProfileScreen() {
  const forms = useAppSelector((root) => root.forms);
  const dispatch = useAppDispatch();
  const { currentUser } = useCurrentDropzone();
  const navigation = useNavigation();
  React.useEffect(() => navigation.setOptions({ title: 'Equipment' }), [navigation]);

  const { dropzoneUser, loading, refetch } = useDropzoneUser(Number(currentUser?.id));

  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  const canUpdateUser = useRestriction(Permission.UpdateUser);
  return (
    <>
      <FlatList
        data={dropzoneUser?.user?.rigs || []}
        numColumns={1}
        style={{ flex: 1 }}
        refreshing={loading}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <RigCard
            onSuccessfulImageUpload={refetch}
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
        style={styles.fab}
        visible={canUpdateUser}
        small
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
