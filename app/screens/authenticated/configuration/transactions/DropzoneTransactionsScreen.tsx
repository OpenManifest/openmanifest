import { useNavigation, useRoute } from '@react-navigation/native';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import ProgressBar from 'app/components/ProgressBar';

import { FlatList } from 'react-native-gesture-handler';
import { useSession } from 'app/state';

import { useDropzoneContext } from 'app/providers/dropzone/context';
import { useDropzoneTransactionsLazyQuery } from 'app/api/reflection';
import { useUserProfile } from 'app/api/crud';
import OrderCard from '../../../../components/orders/OrderCard';
import { useAppTheme } from 'app/theme';

export default function TransactionsScreen() {
  const { theme } = useAppTheme();
  const currentDropzoneId = useSession((session) => session.currentDropzoneId);
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
    if (currentDropzoneId) {
      fetchTransactions({
        variables: { dropzoneId: currentDropzoneId.toString() },
      });
    }
  }, [currentDropzoneId, fetchTransactions]);

  return (
    <>
      {loading && <ProgressBar color={theme.colors.primary} indeterminate visible={loading} />}

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
