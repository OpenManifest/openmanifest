import { useNavigation } from '@react-navigation/core';
import * as React from 'react';
import { SectionList } from 'react-native';
import { Card, List } from 'react-native-paper';
import enAU from 'date-fns/locale/en-AU';

import { groupBy, map } from 'lodash';
import { differenceInDays, format, formatDistance, parseISO, startOfDay } from 'date-fns';
import { DropzoneUserProfileFragment, LoadDetailsFragment } from 'app/api/operations';

import SlotCard from '../SlotCard';

export interface IJumpHistoryTab {
  dropzoneUser?: DropzoneUserProfileFragment | null;
}
export default function JumpHistoryTab(props: IJumpHistoryTab) {
  const { dropzoneUser } = props;
  const navigation = useNavigation();

  return (
    <Card style={{ marginHorizontal: 0 }} elevation={1}>
      <SectionList
        sections={map(
          groupBy(dropzoneUser?.slots?.edges, (e) =>
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
        renderSectionHeader={({ section: { title } }) => (
          <List.Subheader style={{ marginVertical: 16 }}>{title}</List.Subheader>
        )}
        style={{ flex: 1, paddingTop: 0 }}
        data={dropzoneUser?.orders?.edges || []}
        refreshing={false}
        renderItem={({ item }) =>
          !item?.node?.load ? null : (
            <SlotCard
              slot={item.node}
              onPress={() => {
                navigation.navigate('Authenticated', {
                  screen: 'Drawer',
                  params: {
                    screen: 'Manifest',
                    params: {
                      screen: 'LoadScreen',
                      params: {
                        load: item.node?.load as LoadDetailsFragment
                      }
                    }
                  }
                })
              }}
            />
          )
        }
      />
    </Card>
  );
}
