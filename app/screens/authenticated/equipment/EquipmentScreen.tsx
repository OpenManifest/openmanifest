import { useIsFocused } from '@react-navigation/core';
import * as React from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import { DataTable, FAB, IconButton, ProgressBar } from 'react-native-paper';
import format from 'date-fns/format';

import { successColor, warningColor } from '../../../constants/Colors';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import { Permission } from '../../../api/schema.d';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import RigDialog from '../../../components/dialogs/Rig';

import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';
import useDropzoneUser from '../../../api/hooks/useDropzoneUser';
import useRestriction from '../../../hooks/useRestriction';

export default function ProfileScreen() {
  const state = useAppSelector((root) => root.global);
  const forms = useAppSelector((root) => root.forms);
  const dispatch = useAppDispatch();
  const { currentUser } = useCurrentDropzone();

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
      {loading && <ProgressBar color={state.theme.colors.accent} indeterminate visible={loading} />}
      <ScrollableScreen
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
      >
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Container</DataTable.Title>
            <DataTable.Title numeric>Repack due</DataTable.Title>
            <DataTable.Title numeric>Canopy size</DataTable.Title>
            <DataTable.Title numeric>Inspected</DataTable.Title>
          </DataTable.Header>

          {dropzoneUser?.user?.rigs?.map((rig) => (
            <DataTable.Row
              key={`rig-${rig?.id}`}
              onPress={() => {
                dispatch(actions.forms.rig.setOpen(rig));
              }}
              pointerEvents="none"
            >
              <DataTable.Cell>
                {[rig?.make, rig?.model, `#${rig?.serial}`].join(' ')}
              </DataTable.Cell>
              <DataTable.Cell numeric>
                {rig?.repackExpiresAt ? format(rig.repackExpiresAt * 1000, 'yyyy/MM/dd') : '-'}
              </DataTable.Cell>
              <DataTable.Cell numeric>{`${rig?.canopySize}`}</DataTable.Cell>
              <DataTable.Cell numeric>
                <IconButton
                  icon={
                    dropzoneUser?.rigInspections?.some(
                      (insp) => insp.rig?.id === rig.id && insp.isOk
                    )
                      ? 'eye-check'
                      : 'eye-minus'
                  }
                  color={
                    dropzoneUser?.rigInspections?.some(
                      (insp) => insp.rig?.id === rig.id && insp.isOk
                    )
                      ? successColor
                      : warningColor
                  }
                />
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
        <FAB
          style={styles.fab}
          visible={canUpdateUser}
          small
          icon="plus"
          onPress={() => dispatch(actions.forms.rig.setOpen(true))}
          label="Add rig"
        />
      </ScrollableScreen>

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
