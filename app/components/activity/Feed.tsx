import * as React from 'react';
import { FlatList, View } from 'react-native';
import { List, Text, Caption } from 'react-native-paper';
import UserAvatar from 'app/components/UserAvatar';
import { format, parseISO } from 'date-fns';
import { EventLevel } from 'app/api/schema.d';
import { ActivityEssentialsFragment, ActivityQueryVariables } from 'app/api/operations';

const LEVEL_COLORS = {
  [EventLevel.Debug]: '#AF00FF',
  [EventLevel.Error]: '#FF1515',
  [EventLevel.Info]: '#15A0FF',
};

interface IActivityFeedProps extends ActivityQueryVariables {
  data: ActivityEssentialsFragment[];
  onFetchMore(): void;
}

function FeedItem(props: { event?: ActivityEssentialsFragment | null }) {
  const { event } = props;
  const [expanded, setExpanded] = React.useState(false);

  const onPress = React.useCallback(() => {
    if (event?.details) {
      setExpanded(!expanded);
    }
  }, [event?.details, expanded]);

  if (!event) {
    return null;
  }

  return (
    <List.Item
      title={
        <View style={{ justifyContent: 'space-between', flexDirection: 'row', width: '100%' }}>
          <Caption>{event?.level}</Caption>
          <Caption>{format(parseISO(event.createdAt), 'dd MMM, HH:mm')}</Caption>
        </View>
      }
      description={event?.message}
      left={() => (
        <UserAvatar
          size={20}
          name={event?.createdBy?.user?.name || 'System'}
          image={event?.createdBy?.user?.image || undefined}
        />
      )}
      style={{
        borderLeftColor: LEVEL_COLORS[event?.level || 'info'],
        borderLeftWidth: 5,
      }}
      {...{ onPress }}
    />
  );
}
export default function Feed(props: IActivityFeedProps) {
  const { data, onFetchMore } = props;

  return (
    <FlatList
      {...{ data }}
      renderItem={({ item }) =>
        !item ? null : <FeedItem key={`event-log-row-${item?.id}`} event={item} />
      }
      keyExtractor={(item) => `event-log-item-${item?.id}`}
      onEndReached={onFetchMore}
      onEndReachedThreshold={1}
    />
  );
}
