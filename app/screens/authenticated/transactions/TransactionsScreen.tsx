import { useIsFocused, useNavigation } from '@react-navigation/core';
import * as React from 'react';
import { RefreshControl, StyleSheet, Text } from 'react-native';
import { DataTable, ProgressBar } from 'react-native-paper';
import format from 'date-fns/format';

import { FlatList } from 'react-native-gesture-handler';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import CreditsSheet from '../../../components/dialogs/CreditsDialog/Credits';

import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';
import useDropzoneUser from '../../../api/hooks/useDropzoneUser';
import TransactionCard from './TransactionCard';

export default function ProfileScreen() {
  const state = useAppSelector((root) => root.global);
  const forms = useAppSelector((root) => root.forms);
  const dispatch = useAppDispatch();
  const { currentUser } = useCurrentDropzone();
  const { dropzoneUser, loading, refetch } = useDropzoneUser(
    currentUser?.id ? Number(currentUser.id) : undefined
  );

  const isFocused = useIsFocused();
  const navigation = useNavigation();
  React.useEffect(() => navigation.setOptions({ title: 'Transactions' }), [navigation]);

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  return (
    <>
      {loading && <ProgressBar color={state.theme.colors.accent} indeterminate visible={loading} />}

      <FlatList
        style={styles.flatList}
        data={dropzoneUser?.transactions?.edges || []}
        refreshing={false}
        onRefresh={refetch}
        renderItem={({ item }) => <TransactionCard transaction={item.node} />}
      />

      <CreditsSheet
        onClose={() => dispatch(actions.forms.credits.setOpen(false))}
        onSuccess={() => dispatch(actions.forms.credits.setOpen(false))}
        open={forms.credits.open}
        dropzoneUser={dropzoneUser || undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  flatList: { flex: 1, paddingTop: 0 },
});
