import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';

import { FlatList } from 'react-native-gesture-handler';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import CreditsSheet from '../../../components/dialogs/CreditsDialog/Credits';

import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';
import useDropzoneUser from '../../../api/hooks/useDropzoneUser';
import { useDropzoneTransactionsLazyQuery } from '../../../api/reflection';
import OrderCard from './OrderCard';

export default function TransactionsScreen() {
  const state = useAppSelector((root) => root.global);
  const forms = useAppSelector((root) => root.forms);
  const dispatch = useAppDispatch();
  const { currentUser } = useCurrentDropzone();
  const [fetchTransactions, { data }] = useDropzoneTransactionsLazyQuery();
  const route = useRoute<{ key: string; name: string; params: { userId: string } }>();
  const { dropzoneUser, loading, refetch } = useDropzoneUser(
    Number(route?.params?.userId) || Number(currentUser?.id)
  );

  const isFocused = useIsFocused();
  const navigation = useNavigation();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  React.useEffect(() => {
    if (state.currentDropzoneId) {
      fetchTransactions({ variables: { dropzoneId: state.currentDropzoneId } });
    }
  }, [state?.currentDropzoneId, fetchTransactions]);

  return (
    <>
      {loading && <ProgressBar color={state.theme.colors.accent} indeterminate visible={loading} />}

      <FlatList
        style={styles.flatList}
        data={dropzoneUser?.orders?.edges || []}
        refreshing={false}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <OrderCard
            onPress={() => navigation.navigate('OrderScreen', { order: item.node })}
            order={item?.node}
            showAvatar
            {...{ dropzoneUser }}
          />
        )}
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
