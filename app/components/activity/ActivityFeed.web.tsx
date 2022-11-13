import { useActivityDetailsLazyQuery } from 'app/api/reflection';
import * as React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, DataTable, HelperText, List } from 'react-native-paper';
import UserAvatar from 'app/components/UserAvatar';
import { format, parseISO } from 'date-fns';
import { EventLevel, EventAccessLevel, Permission } from 'app/api/schema.d';
import { ActivityEssentialsFragment, ActivityQueryVariables } from 'app/api/operations';
import useRestriction from 'app/hooks/useRestriction';
import { isEqual, uniqBy } from 'lodash';
import ChipSelect from '../input/chip_select/ChipSelect';

const LEVEL_COLORS = {
  [EventLevel.Debug]: '#AF00FF',
  [EventLevel.Error]: '#FF1515',
  [EventLevel.Info]: '#15A0FF',
};

interface IActivityFeedProps extends ActivityQueryVariables {
  onChange(variables: Partial<ActivityQueryVariables>): void;
}

function EventTableRow(props: { event?: ActivityEssentialsFragment | null }) {
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
export default function ActivityFeed(props: IActivityFeedProps) {
  const { dropzone, accessLevels, levels, timeRange, onChange } = props;
  const canViewAdminActivity = useRestriction(Permission.ViewAdminActivity);
  const canViewSystemActivity = useRestriction(Permission.ViewSystemActivity);
  const canViewUserActivity = useRestriction(Permission.ViewUserActivity);

  const variables: ActivityQueryVariables = React.useMemo(
    () => ({
      dropzone,
      levels,
      accessLevels,
      timeRange,
    }),
    [accessLevels, dropzone, levels, timeRange]
  );

  const [getActivity, query] = useActivityDetailsLazyQuery();

  React.useEffect(() => {
    if (!isEqual(query?.variables, variables)) {
      getActivity({ variables });
    }
  }, [getActivity, query?.variables, variables]);

  const onFetchMore = React.useCallback(() => {
    if (
      query?.data?.activity?.pageInfo?.hasNextPage &&
      !query?.loading &&
      query?.data?.activity?.pageInfo?.endCursor !== query?.variables?.after
    ) {
      query
        ?.fetchMore({ variables: { after: query?.data?.activity?.pageInfo?.endCursor } })
        .then((result) => {
          query?.updateQuery((prev) => ({
            ...prev,
            activity: {
              ...prev?.activity,
              ...result?.data?.activity,
              pageInfo: result?.data?.activity?.pageInfo,
              edges: uniqBy(
                [...(prev.activity.edges || []), ...(result?.data?.activity?.edges || [])],
                'node.id'
              ),
            },
          }));
        });
    }
  }, [query]);

  const onChangeEventLevel = React.useCallback(
    (newLevels: EventLevel[]) =>
      onChange({
        levels: newLevels,
      }),
    [onChange]
  );

  const onChangeAccessLevel = React.useCallback(
    (newAccessLevels: EventAccessLevel[]) => {
      onChange({
        accessLevels: newAccessLevels,
      });
    },
    [onChange]
  );

  return (
    <Card style={{ width: '100%' }}>
      <Card.Title title="Events" />
      <Card.Content>
        {(canViewAdminActivity || canViewSystemActivity) && (
          <View style={styles.controls}>
            <View>
              <List.Subheader>Event Type</List.Subheader>
              <ChipSelect
                allowEmpty
                items={
                  [
                    canViewAdminActivity && EventAccessLevel.Admin,
                    canViewUserActivity && EventAccessLevel.User,
                    canViewSystemActivity && EventAccessLevel.System,
                  ].filter(Boolean) as EventAccessLevel[]
                }
                onChange={onChangeAccessLevel}
                value={(accessLevels || []) as EventAccessLevel[]}
                renderItemLabel={(value) =>
                  Object.keys(EventAccessLevel).find(
                    (key) => EventAccessLevel[key as keyof typeof EventAccessLevel] === value
                  )
                }
              />
            </View>

            <View>
              <List.Subheader>Event Level</List.Subheader>
              <ChipSelect
                allowEmpty
                items={
                  [
                    canViewUserActivity && EventLevel.Info,
                    canViewSystemActivity && EventLevel.Debug,
                    canViewAdminActivity && EventLevel.Error,
                  ].filter(Boolean) as EventLevel[]
                }
                onChange={onChangeEventLevel}
                value={(levels || []) as EventLevel[]}
                renderItemLabel={(value) =>
                  Object.keys(EventLevel).find(
                    (key) => EventLevel[key as keyof typeof EventLevel] === value
                  )
                }
              />
            </View>
          </View>
        )}
        <DataTable>
          <DataTable.Header>
            <DataTable.Title style={styles.avatarCell}>Time</DataTable.Title>
            <DataTable.Title style={styles.levelCell}>Level</DataTable.Title>
            <DataTable.Title style={styles.messageCell}>Message</DataTable.Title>
          </DataTable.Header>
          <FlatList
            data={query?.data?.activity?.edges?.map((edge) => edge?.node)}
            renderItem={({ item }) =>
              !item ? null : <EventTableRow key={`event-log-row=${item?.id}`} event={item} />
            }
            onEndReached={onFetchMore}
            onEndReachedThreshold={1}
          />
        </DataTable>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
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
