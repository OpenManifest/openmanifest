import { useRoute } from '@react-navigation/native';
import useOpenUser from 'app/navigation/useOpenUser';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import ProgressBar from 'app/components/ProgressBar';

import { FlatList } from 'react-native-gesture-handler';
import { useSession } from 'app/state';

import { useOperatorContext } from 'app/providers/operator/context';
import { useOperatorTransactionsLazyQuery } from 'app/api/reflection';
import { useUserProfile } from 'app/api/crud';
import OrderCard from '../../../../components/orders/OrderCard';
import { useAppTheme } from 'app/theme';

export default function TransactionsScreen() {
  const { theme } = useAppTheme();
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const {
    operator: { currentUser },
  } = useOperatorContext();
  const [fetchTransactions] = useOperatorTransactionsLazyQuery();
  const route = useRoute<{ key: string; name: string; params: { userId: string } }>();
  const { membership, loading, refetch } = useUserProfile({
    id: route?.params?.userId || currentUser?.id,
  });

  const openUser = useOpenUser();

  React.useEffect(() => {
    if (currentOperatorId) {
      fetchTransactions({
        variables: { operatorId: currentOperatorId.toString() },
      });
    }
  }, [currentOperatorId, fetchTransactions]);

  return (
    <>
      {loading && <ProgressBar color={theme.colors.primary} indeterminate visible={loading} />}

      <FlatList
        style={styles.flatList}
        data={membership?.orders?.edges || []}
        refreshing={false}
        onRefresh={refetch}
        keyExtractor={(item) => `transaction-${item?.node?.id}`}
        renderItem={({ item }) =>
          !item?.node ? null : (
            <OrderCard
              onPress={() =>
                !item?.node?.id
                  ? null
                  : openUser('OrderReceiptScreen', {
                      orderId: item?.node?.id as string,
                      userId: item?.node?.buyer?.id as string,
                    })
              }
              order={item?.node}
              showAvatar
              {...{ membership }}
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
