import * as React from 'react';
import { View } from 'react-native-animatable';
import { List } from 'react-native-paper';

import { DropzoneUserProfileFragment, OrderEssentialsFragment } from 'app/api/operations';

import { groupBy, map } from 'lodash';
import startOfDay from 'date-fns/startOfDay';
import parseISO from 'date-fns/parseISO';
import differenceInDays from 'date-fns/differenceInDays';
import format from 'date-fns/format';
import { enAU } from 'date-fns/locale';
import formatDistance from 'date-fns/formatDistance';
import OrderCard from '../../../../../components/orders/OrderCard';
import { useUserNavigation } from '../../useUserNavigation';

export interface IJumpHistoryTab {
  dropzoneUser?: DropzoneUserProfileFragment | null;
  tabIndex: number;
  currentTabIndex: number;
}
export default function TransactionsTab(props: IJumpHistoryTab) {
  const { dropzoneUser, tabIndex, currentTabIndex } = props;
  const navigation = useUserNavigation();
  const sections = React.useMemo(
    () =>
      map(
        groupBy(dropzoneUser?.orders?.edges, (e) =>
          startOfDay(parseISO(e?.node?.createdAt || new Date().toISOString())).toISOString()
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
      ),
    [dropzoneUser?.orders?.edges]
  );
  return (
    <View
      animation={currentTabIndex > tabIndex ? 'slideInLeft' : 'slideInRight'}
      easing="ease-in-out"
      duration={200}
    >
      {sections.map(({ title, data }) => (
        <>
          <List.Subheader style={{ marginTop: 16, marginBottom: 4 }}>{title}</List.Subheader>
          {data.map((item) =>
            !item?.node ? null : (
              <OrderCard
                showAvatar
                onPress={() =>
                  item?.node?.id &&
                  dropzoneUser &&
                  navigation.navigate('OrderReceiptScreen', {
                    orderId: item?.node?.id,
                    userId: dropzoneUser?.id,
                  })
                }
                order={item?.node as OrderEssentialsFragment}
                {...{ dropzoneUser }}
              />
            )
          )}
        </>
      ))}
    </View>
  );
}
