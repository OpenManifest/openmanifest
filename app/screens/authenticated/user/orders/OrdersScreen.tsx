import { RouteProp, useRoute } from '@react-navigation/core';
import * as React from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { List, ProgressBar } from 'react-native-paper';

import { useAppSelector } from 'app/state';

import { useDropzoneContext } from 'app/providers/dropzone/context';
import { groupBy, map } from 'lodash';
import { formatDistance, parseISO, startOfDay, differenceInDays, format } from 'date-fns';
import enAU from 'date-fns/locale/en-AU';
import { OrderEssentialsFragment } from 'app/api/operations';
import { useUserProfile } from 'app/api/crud';
import OrderCard from '../../../../components/orders/OrderCard';
import { useUserNavigation } from '../useUserNavigation';

export type OrdersRoute = {
  OrdersScreen: {
    userId: string;
  };
};
export default function OrdersScreen() {
  const state = useAppSelector((root) => root.global);
  const {
    dropzone: { currentUser },
  } = useDropzoneContext();
  const route = useRoute<RouteProp<OrdersRoute>>();
  const { dropzoneUser, loading, refetch } = useUserProfile({
    id: (route?.params?.userId || currentUser?.id) as string,
  });

  const navigation = useUserNavigation();
  React.useEffect(() => {
    if (dropzoneUser?.user?.name && dropzoneUser?.id !== currentUser?.id) {
      const [firstName] = dropzoneUser.user?.name?.split(/\s/) || [];
      navigation.setOptions({ title: `${firstName}'s Transactions` });
    } else {
      navigation.setOptions({ title: 'Your Transactions' });
    }
  }, [currentUser?.id, dropzoneUser?.id, dropzoneUser?.user?.name, navigation]);

  return (
    <View style={{ flexGrow: 1, backgroundColor: state.theme.colors.surface }}>
      {loading && (
        <ProgressBar color={state.theme.colors.primary} indeterminate visible={loading} />
      )}

      <SectionList
        sections={map(
          groupBy(dropzoneUser?.orders?.edges, (e) =>
            startOfDay(parseISO(e?.node?.createdAt)).toISOString()
          ),
          (d, t) => {
            const date = parseISO(t);
            const title =
              differenceInDays(new Date(), date) > 7
                ? format(date, 'dd MMM, yyyy')
                : formatDistance(date, new Date(), { addSuffix: true, locale: enAU });
            return {
              title,
              data: d,
            };
          }
        )}
        renderSectionHeader={({ section: { title } }) => <List.Subheader>{title}</List.Subheader>}
        style={styles.flatList}
        data={dropzoneUser?.orders?.edges || []}
        refreshing={false}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <OrderCard
            showAvatar
            onPress={() =>
              !item?.node || !dropzoneUser
                ? null
                : navigation.navigate('OrderReceiptScreen', {
                    orderId: item?.node?.id,
                    userId: dropzoneUser.id,
                  })
            }
            order={item?.node as OrderEssentialsFragment}
            {...{ dropzoneUser }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flatList: { flex: 1, paddingTop: 0 },
});
