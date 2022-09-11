import { useNavigation } from '@react-navigation/core';
import * as React from 'react';
import { View } from 'react-native-animatable';
import { List } from 'react-native-paper';
import enAU from 'date-fns/locale/en-AU';

import { groupBy, map } from 'lodash';
import { differenceInDays, format, formatDistance, parseISO, startOfDay } from 'date-fns';
import { DropzoneUserProfileFragment } from 'app/api/operations';

import SlotCard from '../SlotCard';

export interface IJumpHistoryTab {
  tabIndex: number;
  currentTabIndex: number;
  dropzoneUser?: DropzoneUserProfileFragment | null;
}
export default function JumpHistoryTab(props: IJumpHistoryTab) {
  const { dropzoneUser, tabIndex, currentTabIndex } = props;
  const navigation = useNavigation();

  const sections = React.useMemo(
    () =>
      map(
        groupBy(dropzoneUser?.slots?.edges, (e) =>
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
      ),
    [dropzoneUser?.slots?.edges]
  );

  return (
    <View
      animation={currentTabIndex > tabIndex ? 'slideInLeft' : 'slideInRight'}
      easing="ease-in-out"
      duration={200}
      style={{ padding: 8 }}
    >
      {sections.map(({ title, data }) => (
        <>
          <List.Subheader style={{ marginTop: 16, marginBottom: 4 }}>{title}</List.Subheader>
          {data.map((item) =>
            !item?.node ? null : (
              <SlotCard
                slot={item.node}
                onPress={() => {
                  if (item?.node?.load?.id) {
                    navigation.navigate('Authenticated', {
                      screen: 'LeftDrawer',
                      params: {
                        screen: 'Manifest',
                        params: {
                          screen: 'LoadScreen',
                          params: {
                            loadId: item.node?.load?.id,
                          },
                        },
                      },
                    });
                  }
                }}
              />
            )
          )}
        </>
      ))}
    </View>
  );
}
