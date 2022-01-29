import * as React from 'react';
import { SectionList } from 'react-native';
import { Card, List } from 'react-native-paper';

import { DropzoneUserProfileFragment, OrderEssentialsFragment } from 'app/api/operations';

import { useNavigation } from '@react-navigation/core';
import { groupBy, map } from 'lodash';
import startOfDay from 'date-fns/startOfDay';
import parseISO from 'date-fns/parseISO';
import differenceInDays from 'date-fns/differenceInDays';
import format from 'date-fns/format';
import { enAU } from 'date-fns/locale';
import formatDistance from 'date-fns/formatDistance';
import OrderCard from '../../../../../components/orders/OrderCard';
import { useUserNavigation } from '../../routes';

export interface IJumpHistoryTab {
  dropzoneUser?: DropzoneUserProfileFragment | null;
}
export default function TransactionsTab(props: IJumpHistoryTab) {
  const { dropzoneUser } = props;
  const navigation = useUserNavigation();
  return (
    <Card style={{ marginHorizontal: 0 }} elevation={1}>
      <SectionList
        sections={map(
          groupBy(dropzoneUser?.orders?.edges, (e) =>
            startOfDay((e?.node?.createdAt || 0) * 1000).toISOString()
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
        // style={styles.flatList}
        data={dropzoneUser?.orders?.edges || []}
        refreshing={false}
        renderItem={({ item }) => (
          !item?.node ? null :
          <OrderCard
            showAvatar
            onPress={() => navigation.navigate('OrderReceiptScreen', { order: item?.node as Required<typeof item.node> })}
            order={item?.node as OrderEssentialsFragment}
            {...{ dropzoneUser }}
          />
        )}
      />
    </Card>
  );
}
