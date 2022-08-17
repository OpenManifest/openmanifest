import { useDropzonesStatisticsQuery } from 'app/api/reflection';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { successColor, warningColor } from 'app/constants/Colors';
import { parseISO, subMonths } from 'date-fns';
import Chip from 'app/components/chips/Chip';
import { PieChart } from 'react-native-chart-kit';
import { sortBy, sumBy } from 'lodash';
import { DropzoneStatisticsFragment } from 'app/api/operations';
import Stats, { IStatsProps } from './Stats';
import LoadsByDay from './LoadsByDay';
import DropzonesTable from './DropzonesTable';

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
  const [selectedTimeRange, setTimeRange] = React.useState<TimeRange>();

  const timeRange = React.useMemo(() => {
    if (selectedTimeRange) {
      return {
        startTime: subMonths(new Date(), selectedTimeRange).toISOString(),
        endTime: new Date().toISOString(),
      };
    }
    return {
      startTime: new Date(2020, 0, 1).toISOString(),
      endTime: new Date().toISOString(),
    };
  }, [selectedTimeRange]);

  const createTimeRangeHandler = React.useCallback(
    (range?: TimeRange) => () => {
      setTimeRange(range);
    },
    []
  );

  const [selectedDropzones, setSelectedDropzones] = React.useState<DropzoneStatisticsFragment[]>();

  const { data, loading } = useDropzonesStatisticsQuery({
    variables: {
      timeRange,
    },
  });
  React.useEffect(() => {
    if (data?.dropzones?.edges?.length && selectedDropzones === undefined) {
      setSelectedDropzones(
        data.dropzones.edges.map((edge) => edge?.node as DropzoneStatisticsFragment).filter(Boolean)
      );
    }
  }, [data?.dropzones.edges, selectedDropzones]);

  const summedStatistics = React.useMemo(
    () => ({
      revenueCents: sumBy(
        selectedDropzones || [],
        (dropzone) => dropzone?.statistics?.revenueCentsCount || 0
      ),
      loadsCount: sumBy(
        selectedDropzones || [],
        (dropzone) => dropzone?.statistics?.loadsCount || 0
      ),
      cancelledLoadsCount: sumBy(
        selectedDropzones || [],
        (dropzone) => dropzone?.statistics?.cancelledLoadsCount || 0
      ),
      slotsCount: sumBy(
        selectedDropzones || [],
        (dropzone) => dropzone?.statistics?.slotsCount || 0
      ),
      pilotCount: sumBy(
        selectedDropzones || [],
        (dropzone) => dropzone?.statistics?.pilotCount || 0
      ),
      dzsoCount: sumBy(selectedDropzones || [], (dropzone) => dropzone?.statistics?.dzsoCount || 0),
      gcaCount: sumBy(selectedDropzones || [], (dropzone) => dropzone?.statistics?.gcaCount || 0),
      totalUserCount: sumBy(
        selectedDropzones || [],
        (dropzone) => dropzone?.statistics?.totalUserCount || 0
      ),
      activeUserCount: sumBy(
        selectedDropzones || [],
        (dropzone) => dropzone?.statistics?.activeUserCount || 0
      ),
      inactiveUserCount: sumBy(
        selectedDropzones || [],
        (dropzone) => dropzone?.statistics?.inactiveUserCount || 0
      ),
      loadCountByDay: (selectedDropzones || [])
        .map((dropzone) => dropzone?.statistics?.loadCountByDay || [])
        .flat(),
      slotsByJumpType: (selectedDropzones || [])
        .map((dropzone) => dropzone?.statistics?.slotsByJumpType || [])
        .flat(),
    }),
    [selectedDropzones]
  );
  return (
    <ScrollableScreen>
      <View style={styles.row}>
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
        <Stats
          title="Turn-around"
          data={
            [
              {
                label: 'Total',
                color: successColor,
                value: `$${summedStatistics?.revenueCents || 0}`,
              },
              {
                label: 'Dispatched Loads',
                value: summedStatistics?.loadsCount || 0,
              },
              {
                label: 'Cancelled Loads',
                value: summedStatistics?.cancelledLoadsCount || 0,
              },
              {
                label: 'Slots',
                value: summedStatistics?.slotsCount || 0,
              },
            ].filter(Boolean) as IStatsProps['data']
          }
        />

        <Stats
          title="Accounts"
          data={[
            { label: 'Dropzones', value: data?.dropzones.edges?.length || 0 },
            { label: 'Users', value: summedStatistics?.totalUserCount || 0 },
            {
              label: 'Active',
              value: summedStatistics?.activeUserCount || 0,
              color: successColor,
            },
            {
              label: 'Inactive',
              value: summedStatistics?.inactiveUserCount || 0,
              color: warningColor,
            },
            { label: 'Pilots', value: summedStatistics?.pilotCount || 0 },
            {
              label: 'GCA',
              value: summedStatistics?.gcaCount || 0,
            },
            {
              label: 'DZSO',
              value: summedStatistics.dzsoCount || 0,
            },
          ]}
        />
      </View>
      <View style={styles.row}>
        <Card style={{ height: 220, flex: 1 }}>
          <Card.Title title="Dispatched Loads" />
          <Card.Content style={{ height: 200, flex: 1 }}>
            <LoadsByDay
              data={summedStatistics?.loadCountByDay || []}
              startTime={timeRange?.startTime ? parseISO(timeRange?.startTime) : new Date()}
            />
          </Card.Content>
        </Card>
        <Card>
          <Card.Title title="Jump types" />
          <Card.Content>
            <PieChart
              data={sortBy(summedStatistics?.slotsByJumpType || [], 'count').map((stat) => ({
                ...stat,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                color: JUMP_TYPE_COLORS[stat?.name] || '#AAA',
                legendFontColor: '#333',
                legendFontSize: 15,
              }))}
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
      <View style={styles.row}>
        <DropzonesTable
          selected={selectedDropzones || []}
          onChangeSelected={setSelectedDropzones}
          dropzones={
            data?.dropzones?.edges?.map((edge) => edge?.node as DropzoneStatisticsFragment) || []
          }
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
