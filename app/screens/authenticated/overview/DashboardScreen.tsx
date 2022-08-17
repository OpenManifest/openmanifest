import { useDropzoneStatisticsQuery } from 'app/api/reflection';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { successColor, warningColor } from 'app/constants/Colors';
import { subMonths } from 'date-fns';
import { EventAccessLevel, EventLevel, ModerationRole, Permission } from 'app/api/schema.d';
import Chip from 'app/components/chips/Chip';
import { PieChart } from 'react-native-chart-kit';
import { sortBy } from 'lodash';
import ActivityFeed from 'app/components/activity/ActivityFeed';
import { useDropzoneContext } from 'app/api/crud/useDropzone';
import { ActivityQueryVariables } from 'app/api/operations';
import useRestriction from 'app/hooks/useRestriction';
import { useNavigation } from '@react-navigation/core';
import Stats, { IStatsProps } from './Stats';
import LoadsByDay from './LoadsByDay';

const JUMP_TYPE_COLORS = {
  angle: '#AA0000',
  cam: '#FFAA00',
  ws: '#AAFF00',
  hnp: '#ABABFF',
  hp: '#BAFFBA',
  fs: '#DD00FF',
  freefly: '#00ABFF',
};

enum TimeRange {
  AllTime = 0,
  ThreeMonths = 3,
  SixMonths = 6,
  Year = 12,
}

export default function DashboardPage() {
  const { dropzone } = useDropzoneContext();

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
      dropzoneId: Number(dropzone?.id),
      timeRange,
    },
  });

  const createTimeRangeHandler = React.useCallback(
    (range?: TimeRange) => () => {
      setTimeRange(range);
    },
    []
  );
  const navigation = useNavigation();
  const onViewAdminOverview = React.useCallback(() => {
    navigation.navigate('Authenticated', {
      screen: 'LeftDrawer',
      params: {
        screen: 'Overview',
        params: {
          screen: 'OverviewScreen',
        },
      },
    });
  }, [navigation]);

  return (
    <ScrollableScreen>
      <View style={styles.row}>
        {dropzone?.currentUser?.user?.moderationRole !== ModerationRole.User ? (
          <Button onPress={onViewAdminOverview}>View all</Button>
        ) : null}
        <Chip selected={!selectedTimeRange} onPress={createTimeRangeHandler()}>
          All time
        </Chip>
        <Chip
          selected={selectedTimeRange === TimeRange.ThreeMonths}
          onPress={createTimeRangeHandler(TimeRange.ThreeMonths)}
        >
          Last 3 months
        </Chip>
        <Chip
          selected={selectedTimeRange === TimeRange.SixMonths}
          onPress={createTimeRangeHandler(TimeRange.SixMonths)}
        >
          Last 6 months
        </Chip>
        <Chip
          selected={selectedTimeRange === TimeRange.Year}
          onPress={createTimeRangeHandler(TimeRange.Year)}
        >
          Last 12 months
        </Chip>
      </View>
      <View style={styles.row}>
        {canViewStatistics && (
          <Stats
            title="Turn-around"
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
                  label: 'Dispatched Loads',
                  value: data?.dropzone?.statistics?.loadsCount || 0,
                },
                {
                  label: 'Cancelled Loads',
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
        <View style={styles.row}>
          <Card style={{ height: 220, flex: 1 }}>
            <Card.Title title="Dispatched Loads" />
            <Card.Content style={{ height: 200, flex: 1 }}>
              <LoadsByDay
                data={data?.dropzone?.statistics?.loadCountByDay || []}
                startTime={timeRange?.startTime}
              />
            </Card.Content>
          </Card>
          <Card>
            <Card.Title title="Jump types" />
            <Card.Content>
              <PieChart
                data={sortBy(data?.dropzone?.statistics?.slotsByJumpType || [], 'count').map(
                  (stat) => ({
                    ...stat,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    color: JUMP_TYPE_COLORS[stat?.name] || '#AAA',
                    legendFontColor: '#333',
                    legendFontSize: 15,
                  })
                )}
                width={300}
                height={150}
                chartConfig={{
                  backgroundColor: '#e26a00',
                  backgroundGradientFrom: '#fb8c00',
                  backgroundGradientTo: '#ffa726',
                  decimalPlaces: 2, // optional, defaults to 2dp
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#ffa726',
                  },
                  backgroundGradientFromOpacity: 0,
                  backgroundGradientToOpacity: 0.5,
                  strokeWidth: 2, // optional, default 3
                  barPercentage: 0.5,
                  useShadowColorFromDataset: false,
                }}
                accessor="count"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[0, 0]}
                absolute
              />
            </Card.Content>
          </Card>
        </View>
      )}
      <View style={styles.row}>
        <ActivityFeed
          {...activityVariables}
          {...{ timeRange }}
          onChange={onChangeActivityVariables}
          dropzone={Number(dropzone?.id)}
        />
      </View>
    </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
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
