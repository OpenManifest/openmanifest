import * as React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { DataTable, HelperText } from 'react-native-paper';
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
    <>
      <DataTable.Row
        style={{
          borderLeftColor: LEVEL_COLORS[event?.level || 'info'],
          borderLeftWidth: 5,
        }}
        {...{ onPress }}
      >
        <DataTable.Cell style={styles.avatarCell}>
          <UserAvatar
            size={20}
            name={event?.createdBy?.user?.name || 'System'}
            image={event?.createdBy?.user?.image || undefined}
          />
          <HelperText type="info">{format(parseISO(event.createdAt), 'dd MMM, HH:mm')}</HelperText>
        </DataTable.Cell>
        <DataTable.Cell style={styles.levelCell}>
          <HelperText type="info">{event?.level}</HelperText>
        </DataTable.Cell>
        <DataTable.Cell style={styles.messageCell}>{event?.message}</DataTable.Cell>
      </DataTable.Row>
      {!expanded ? null : (
        <DataTable.Row
          style={{
            borderLeftColor: LEVEL_COLORS[event?.level || 'info'],
            borderLeftWidth: 5,
          }}
        >
          <DataTable.Cell style={styles.avatarCell}>{null}</DataTable.Cell>
          <DataTable.Cell style={styles.levelCell}>{null}</DataTable.Cell>
          <DataTable.Cell style={styles.messageCell}>{event?.details}</DataTable.Cell>
        </DataTable.Row>
      )}
    </>
  );
}
export default function Feed(props: IActivityFeedProps) {
  const { data, onFetchMore } = props;

  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title style={styles.avatarCell}>Time</DataTable.Title>
        <DataTable.Title style={styles.levelCell}>Level</DataTable.Title>
        <DataTable.Title style={styles.messageCell}>Message</DataTable.Title>
      </DataTable.Header>
      <FlatList
        {...{ data }}
        renderItem={({ item }) =>
          !item ? null : <FeedItem key={`event-log-row=${item?.id}`} event={item} />
        }
        onEndReached={onFetchMore}
        onEndReachedThreshold={1}
      />
    </DataTable>
  );
}

const styles = StyleSheet.create({
  avatarCell: {
    flex: 1,
  },
  levelCell: {
    flex: 1,
  },
  messageCell: {
    flex: 4,
  },
});
