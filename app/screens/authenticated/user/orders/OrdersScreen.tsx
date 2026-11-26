import { RouteProp, useRoute } from '@react-navigation/native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList, StyleSheet, View } from 'react-native';
import ProgressBar from 'app/components/ProgressBar';

import { useOperatorContext } from 'app/providers/operator/context';
import { groupBy, map } from 'lodash';
import { DateTime } from 'luxon';
import { formatDate, formatRelative } from 'app/i18n/format';
import { OrderEssentialsFragment } from 'app/api/operations';
import { useUserProfile } from 'app/api/crud';
import OrderCard from '../../../../components/orders/OrderCard';
import { useUserNavigation } from '../useUserNavigation';
import { Subheader, useTheme } from 'app/ui';
import useWalletRedirect from 'app/features/wallet/useWalletRedirect';

export type OrdersRoute = {
  OrdersScreen: {
    userId: string;
  };
};
export default function OrdersScreen() {
  const theme = useTheme();
  const {
    operator: { currentUser },
  } = useOperatorContext();
  const route = useRoute<RouteProp<OrdersRoute>>();
  const { membership, loading, refetch } = useUserProfile({
    id: (route?.params?.userId || currentUser?.id) as string,
  });

  const navigation = useUserNavigation();
  const { t } = useTranslation('common');
  const toWallet = useWalletRedirect(route?.params?.userId || currentUser?.id);
  React.useEffect(() => {
    if (membership?.user?.name && membership?.id !== currentUser?.id) {
      const [firstName] = membership.user?.name?.split(/\s/) || [];
      navigation.setOptions({ title: t('screens.transactionsOf', { name: firstName }) });
    } else {
      navigation.setOptions({ title: t('screens.yourTransactions') });
    }
  }, [currentUser?.id, membership?.id, membership?.user?.name, navigation, t]);

  if (toWallet) return null;

  return (
    <View style={{ flexGrow: 1, backgroundColor: theme.colour.surface }}>
      {loading && <ProgressBar indeterminate visible={loading} />}

      <SectionList
        sections={map(
          groupBy(
            membership?.orders?.edges,
            (e) => DateTime.fromISO(e?.node?.createdAt).startOf('day').toISO() as string
          ),
          (d, t) => {
            const date = DateTime.fromISO(t);
            const title =
              Math.trunc(DateTime.now().diff(date, 'days').days) > 7
                ? formatDate(date)
                : formatRelative(date);
            return {
              title,
              data: d,
            };
          }
        )}
        renderSectionHeader={({ section: { title } }) => <Subheader>{title}</Subheader>}
        style={styles.flatList}
        data={membership?.orders?.edges || []}
        refreshing={false}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <OrderCard
            showAvatar
            onPress={() =>
              !item?.node || !membership
                ? null
                : navigation.navigate('OrderReceiptScreen', {
                    orderId: item?.node?.id,
                    userId: membership.id,
                  })
            }
            order={item?.node as OrderEssentialsFragment}
            {...{ membership }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flatList: { flex: 1, paddingTop: 0 },
});
