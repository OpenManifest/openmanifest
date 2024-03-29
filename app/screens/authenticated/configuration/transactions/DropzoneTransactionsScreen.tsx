import { useNavigation, useRoute } from '@react-navigation/core';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';

import { FlatList } from 'react-native-gesture-handler';
import { useAppSelector } from 'app/state';

import { useDropzoneContext } from 'app/providers/dropzone/context';
import { useDropzoneTransactionsLazyQuery } from 'app/api/reflection';
import { useUserProfile } from 'app/api/crud';
import OrderCard from '../../../../components/orders/OrderCard';

export default function TransactionsScreen() {
  const state = useAppSelector((root) => root.global);
  const {
    dropzone: { currentUser },
  } = useDropzoneContext();
  const [fetchTransactions] = useDropzoneTransactionsLazyQuery();
  const route = useRoute<{ key: string; name: string; params: { userId: string } }>();
  const { dropzoneUser, loading, refetch } = useUserProfile({
    id: route?.params?.userId || currentUser?.id,
  });

  const navigation = useNavigation();

  React.useEffect(() => {
    if (state.currentDropzoneId) {
      fetchTransactions({
        variables: { dropzoneId: state.currentDropzoneId?.toString() as string },
      });
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
        keyExtractor={(item) => `transaction-${item?.node?.id}`}
        renderItem={({ item }) =>
          !item?.node ? null : (
            <OrderCard
              onPress={() =>
                !item?.node?.id
                  ? null
                  : navigation.navigate('Authenticated', {
                      screen: 'LeftDrawer',
                      params: {
                        screen: 'Manifest',
                        params: {
                          screen: 'User',
                          params: {
                            screen: 'OrderReceiptScreen',
                            params: {
                              orderId: item?.node?.id as string,
                              userId: item?.node?.buyer?.id as string,
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
    </>
  );
}

const styles = StyleSheet.create({
  flatList: { flex: 1, paddingTop: 0 },
});
