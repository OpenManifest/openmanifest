import * as React from 'react';
import { View } from 'react-native-animatable';
import { List } from 'react-native-paper';

import { DropzoneUserProfileFragment, OrderEssentialsFragment } from 'app/api/operations';

import { groupBy, map } from 'lodash';
import { DateTime, Duration } from 'luxon';
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
          DateTime.fromISO(e?.node?.createdAt).startOf('day').toISO()
        ),
        (d, t) => {
          const date = DateTime.fromISO(t);
          const title =
            date.diffNow('days') > Duration.fromDurationLike({ days: 7 })
              ? date.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
              : date.toRelative({ locale: 'au', round: true, style: 'long' });
          return {
            title: date.startOf('day').hasSame(DateTime.local(), 'day') ? 'Today' : title,
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
