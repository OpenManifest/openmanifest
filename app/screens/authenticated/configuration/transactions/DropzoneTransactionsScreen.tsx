import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';

import { FlatList } from 'react-native-gesture-handler';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import CreditsSheet from 'app/components/dialogs/CreditsDialog/Credits';

import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import { useDropzoneTransactionsLazyQuery, useQueryDropzoneUserProfile } from 'app/api/reflection';
import OrderCard from '../../../../components/orders/OrderCard';

export default function TransactionsScreen() {
  const state = useAppSelector((root) => root.global);
  const forms = useAppSelector((root) => root.forms);
  const dispatch = useAppDispatch();
  const { currentUser } = useCurrentDropzone();
  const [fetchTransactions] = useDropzoneTransactionsLazyQuery();
  const route = useRoute<{ key: string; name: string; params: { userId: string } }>();
  const { data, loading, refetch } = useQueryDropzoneUserProfile({
    variables: {
      dropzoneId: Number(state.currentDropzoneId),
      dropzoneUserId: Number(route?.params?.userId) || Number(currentUser?.id),
    },
  });

  const dropzoneUser = React.useMemo(
    () => data?.dropzone?.dropzoneUser,
    [data?.dropzone?.dropzoneUser]
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
      {loading && (
        <ProgressBar color={state.theme.colors.primary} indeterminate visible={loading} />
      )}

      <FlatList
        style={styles.flatList}
        data={dropzoneUser?.orders?.edges || []}
        refreshing={false}
        onRefresh={refetch}
        renderItem={({ item }) =>
          !item?.node ? null : (
            <OrderCard
              onPress={() =>
                !item?.node
                  ? null
                  : navigation.navigate('Authenticated', {
                      screen: 'LeftDrawer',
                      params: {
                        screen: 'RightDrawer',
                        params: {
                          screen: 'Users',
                          params: {
                            screen: 'OrderReceiptScreen',
                            params: {
                              orderId: item?.node?.id,
                              userId: item?.node?.buyer?.id,
                            },
                          },
                        },
                      },
                    })
              }
              order={item?.node}
              showAvatar
              {...{ dropzoneUser }}
            />
          )
        }
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
