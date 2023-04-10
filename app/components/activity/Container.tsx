import { useActivityDetailsLazyQuery } from 'app/api/reflection';
import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, List } from 'react-native-paper';
import { EventLevel, EventAccessLevel, Permission } from 'app/api/schema.d';
import { ActivityEssentialsFragment, ActivityQueryVariables } from 'app/api/operations';
import useRestriction from 'app/hooks/useRestriction';
import { isEqual, uniqBy } from 'lodash';
import ChipSelect from '../input/chip_select/ChipSelect';
import Feed from './Feed';

interface IActivityFeedContainerProps extends ActivityQueryVariables {
  onChange(variables: Partial<ActivityQueryVariables>): void;
}

export default function ActivityFeedContainer(props: IActivityFeedContainerProps) {
  const { dropzone, accessLevels, levels, timeRange, onChange } = props;
  const canViewAdminActivity = useRestriction(Permission.ViewAdminActivity);
  const canViewSystemActivity = useRestriction(Permission.ViewSystemActivity);
  const canViewUserActivity = useRestriction(Permission.ViewUserActivity);

  const variables: ActivityQueryVariables = React.useMemo(
    () => ({
      dropzone,
      levels,
      accessLevels,
      timeRange
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
      query?.fetchMore({ variables: { after: query?.data?.activity?.pageInfo?.endCursor } }).then((result) => {
        query?.updateQuery((prev) => ({
          ...prev,
          activity: {
            ...prev?.activity,
            ...result?.data?.activity,
            pageInfo: result?.data?.activity?.pageInfo,
            edges: uniqBy(
              [...(prev.activity.edges || []), ...(result?.data?.activity?.edges || [])],
              (edge) => edge?.node?.id
            )
          }
        }));
      });
    }
  }, [query]);

  const onChangeEventLevel = React.useCallback(
    (newLevels: EventLevel[]) =>
      onChange({
        levels: newLevels
      }),
    [onChange]
  );

  const onChangeAccessLevel = React.useCallback(
    (newAccessLevels: EventAccessLevel[]) => {
      onChange({
        accessLevels: newAccessLevels
      });
    },
    [onChange]
  );

  console.debug({ accessLevels, timeRange, levels });

  return (
    <Card style={{ width: '100%' }}>
      <Card.Title title="Events" />
      <Card.Content style={{ paddingHorizontal: 0 }}>
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
                    canViewSystemActivity && EventAccessLevel.System
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
                    canViewAdminActivity && EventLevel.Error
                  ].filter(Boolean) as EventLevel[]
                }
                onChange={onChangeEventLevel}
                value={(levels || []) as EventLevel[]}
                renderItemLabel={(value) =>
                  Object.keys(EventLevel).find((key) => EventLevel[key as keyof typeof EventLevel] === value)
                }
              />
            </View>
          </View>
        )}

        <Feed
          data={
            query?.data?.activity?.edges?.map((edge) => edge?.node as ActivityEssentialsFragment) ||
            ([] as ActivityEssentialsFragment[])
          }
          {...{ onFetchMore }}
        />
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
    marginHorizontal: 8,
    marginBottom: 16
  }
});
