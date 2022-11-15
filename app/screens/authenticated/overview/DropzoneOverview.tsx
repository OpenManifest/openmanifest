import { useDropzoneStatisticsQuery } from 'app/api/reflection';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import * as React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { successColor, warningColor } from 'app/constants/Colors';
import { subMonths } from 'date-fns';
import { EventAccessLevel, EventLevel, Permission } from 'app/api/schema.d';
import Chip from 'app/components/chips/Chip';
import ActivityFeed from 'app/components/activity/Container';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { ActivityQueryVariables } from 'app/api/operations';
import useRestriction from 'app/hooks/useRestriction';
import { Card } from 'react-native-paper';
import Stats, { IStatsProps } from './statistics/Stats';
import LoadsByDay from './statistics/LoadsByDay';
import JumpTypePieChart from './statistics/JumpTypePieChart';

enum TimeRange {
  AllTime = 0,
  ThreeMonths = 3,
  SixMonths = 6,
  Year = 12,
}

export default function DashboardPage() {
  const {
    dropzone: { dropzone },
  } = useDropzoneContext();

  const [selectedTimeRange, setTimeRange] = React.useState<TimeRange>();
  const canViewAdminActivity = useRestriction(Permission.ViewAdminActivity);
  const canViewSystemActivity = useRestriction(Permission.ViewSystemActivity);
  const canViewRevenue = useRestriction(Permission.ViewStatistics);
  const canViewStatistics = useRestriction(Permission.ViewRevenue);

  const timeRange = React.useMemo(() => {
    if (selectedTimeRange) {
      return {
        startTime: subMonths(new Date(), selectedTimeRange),
        endTime: new Date().toISOString(),
      };
    }
    return undefined;
  }, [selectedTimeRange]);

  const [activityVariables, setActivityVariables] = React.useState<ActivityQueryVariables>({
    levels: [
      canViewSystemActivity && EventLevel.Debug,
      canViewSystemActivity && EventLevel.Error,
      EventLevel.Info,
    ].filter(Boolean) as EventLevel[],
    accessLevels: [
      canViewSystemActivity && EventAccessLevel.System,
      EventAccessLevel.User,
      canViewAdminActivity && EventAccessLevel.Admin,
    ].filter(Boolean) as EventAccessLevel[],
    timeRange,
  });

  const onChangeActivityVariables = React.useCallback(
    (vars: ActivityQueryVariables) => setActivityVariables({ ...activityVariables, ...vars }),
    [activityVariables]
  );

  const { data } = useDropzoneStatisticsQuery({
    variables: {
      dropzoneId: dropzone?.id?.toString() as string,
      timeRange,
    },
    skip: !dropzone?.id,
  });

  const createTimeRangeHandler = React.useCallback(
    (range?: TimeRange) => () => {
      setTimeRange(range);
    },
    []
  );
  return (
    <ScrollableScreen stickyHeaderIndices={[0]}>
      <Card style={styles.controls}>
        <Card.Content style={{ flexDirection: 'row' }}>
          <Chip
            small={Platform.OS !== 'web'}
            selected={!selectedTimeRange}
            onPress={createTimeRangeHandler()}
          >
            All time
          </Chip>
          <Chip
            small={Platform.OS !== 'web'}
            selected={selectedTimeRange === TimeRange.ThreeMonths}
            onPress={createTimeRangeHandler(TimeRange.ThreeMonths)}
          >
            3 months
          </Chip>
          <Chip
            small={Platform.OS !== 'web'}
            selected={selectedTimeRange === TimeRange.SixMonths}
            onPress={createTimeRangeHandler(TimeRange.SixMonths)}
          >
            6 months
          </Chip>
          <Chip
            small={Platform.OS !== 'web'}
            selected={selectedTimeRange === TimeRange.Year}
            onPress={createTimeRangeHandler(TimeRange.Year)}
          >
            12 months
          </Chip>
        </Card.Content>
      </Card>
      <View style={StyleSheet.flatten([styles.row, styles.turnaround])}>
        {canViewStatistics && (
          <Stats
            title="Turn-around"
            columns={Platform.OS === 'web' ? undefined : 4}
            data={
              [
                canViewRevenue
                  ? {
                      label: 'Total',
                      color: successColor,
                      value: `$${data?.dropzone?.statistics?.revenueCentsCount || 0}`,
                    }
                  : undefined,
                {
                  label: 'Dispatched',
                  value: data?.dropzone?.statistics?.loadsCount || 0,
                },
                {
                  label: 'Cancelled',
                  value: data?.dropzone?.statistics?.cancelledLoadsCount || 0,
                },
                {
                  label: 'Slots',
                  value: data?.dropzone?.statistics?.slotsCount || 0,
                },
              ].filter(Boolean) as IStatsProps['data']
            }
          />
        )}

        <Stats
          title="Roles"
          data={[
            { label: 'Pilots', value: data?.dropzone?.statistics?.pilotCount || 0 },
            {
              label: 'GCA',
              value: data?.dropzone?.statistics?.gcaCount || 0,
            },
            {
              label: 'DZSO',
              value: data?.dropzone?.statistics.dzsoCount || 0,
            },
          ]}
        />
        {canViewStatistics && (
          <Stats
            title="Users"
            data={[
              { label: 'Total', value: data?.dropzone?.statistics?.totalUserCount || 0 },
              {
                label: 'Active',
                value: data?.dropzone?.statistics?.activeUserCount || 0,
                color: successColor,
              },
              {
                label: 'Inactive',
                value: data?.dropzone?.statistics?.inactiveUserCount || 0,
                color: warningColor,
              },
            ]}
          />
        )}
      </View>
      {canViewStatistics && (
        <View style={StyleSheet.flatten([styles.row, styles.statistics])}>
          <LoadsByDay
            style={styles.dispatchedLoadsCard}
            data={data?.dropzone?.statistics?.loadCountByDay || []}
            startTime={timeRange?.startTime || subMonths(new Date(), 6)}
          />
          <JumpTypePieChart
            style={styles.jumpTypesCard}
            data={data?.dropzone?.statistics?.slotsByJumpType || []}
          />
        </View>
      )}
      <View style={StyleSheet.flatten([styles.row, styles.table])}>
        <ActivityFeed
          {...activityVariables}
          {...{ timeRange }}
          onChange={onChangeActivityVariables}
          dropzone={dropzone?.id}
        />
      </View>
    </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
  controls: {
    width: '100%',
    alignItems: 'center',
  },
  turnaround: {
    width: '100%',
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 8,
    justifyContent: 'space-between',
    flexWrap: Platform.OS === 'web' ? 'wrap' : 'nowrap',
  },
  statistics: {
    width: '100%',
    gap: 8,
    flexWrap: 'wrap',
  },
  table: {
    width: '100%',
    flex: 8,
  },

  dispatchedLoadsCard: {
    height: 300,
    marginVertical: 4,
    width: Platform.OS === 'web' ? undefined : '100%',
    flex: Platform.OS === 'web' ? 3 / 4 : undefined,
  },
  jumpTypesCard: {
    height: 300,
    marginVertical: 4,
    width: Platform.OS === 'web' ? undefined : '100%',
    flex: Platform.OS === 'web' ? 1 / 4 : undefined,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    flexWrap: 'wrap-reverse',
  },
  statistic: {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 8,
    marginHorizontal: 8,
  },
  divider: {
    height: '100%',
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#FAFAFA',
  },
  value: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  valueText: {
    fontSize: 16,
  },
});
