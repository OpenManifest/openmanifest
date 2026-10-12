import { useOperatorsStatisticsQuery } from 'app/api/reflection';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import * as React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { successColor, warningColor } from 'app/constants/Colors';
import { parseISO, subMonths } from 'date-fns';
import Chip from 'app/components/chips/Chip';
import { sumBy } from 'lodash';
import { OperatorStatisticsFragment } from 'app/api/operations';
import { Card } from 'react-native-paper';
import { OperatorsProvider } from 'app/api/crud';
import { OperatorState } from 'app/api/schema.d';
import Stats, { IStatsProps } from './statistics/Stats';
import LoadsByDay from './statistics/LoadsByDay';
import OperatorsTable from './OperatorsTable';
import JumpTypePieChart from './statistics/JumpTypePieChart';

enum TimeRange {
  AllTime = 0,
  ThreeMonths = 3,
  SixMonths = 6,
  Year = 12,
}

function AdminOverviewPage() {
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

  const [selectedOperators, setSelectedOperators] = React.useState<OperatorStatisticsFragment[]>();

  const { data } = useOperatorsStatisticsQuery({
    variables: {
      timeRange,
    },
  });
  React.useEffect(() => {
    if (data?.operators?.edges?.length && selectedOperators === undefined) {
      setSelectedOperators(
        data.operators.edges.map((edge) => edge?.node as OperatorStatisticsFragment).filter(Boolean)
      );
    }
  }, [data?.operators.edges, selectedOperators]);

  const summedStatistics = React.useMemo(
    () => ({
      revenueCents: sumBy(
        selectedOperators || [],
        (operator) => operator?.statistics?.revenueCentsCount || 0
      ),
      loadsCount: sumBy(
        selectedOperators || [],
        (operator) => operator?.statistics?.loadsCount || 0
      ),
      cancelledLoadsCount: sumBy(
        selectedOperators || [],
        (operator) => operator?.statistics?.cancelledLoadsCount || 0
      ),
      slotsCount: sumBy(
        selectedOperators || [],
        (operator) => operator?.statistics?.slotsCount || 0
      ),
      pilotCount: sumBy(
        selectedOperators || [],
        (operator) => operator?.statistics?.pilotCount || 0
      ),
      dzsoCount: sumBy(selectedOperators || [], (operator) => operator?.statistics?.dzsoCount || 0),
      gcaCount: sumBy(selectedOperators || [], (operator) => operator?.statistics?.gcaCount || 0),
      totalUserCount: sumBy(
        selectedOperators || [],
        (operator) => operator?.statistics?.totalUserCount || 0
      ),
      activeUserCount: sumBy(
        selectedOperators || [],
        (operator) => operator?.statistics?.activeUserCount || 0
      ),
      inactiveUserCount: sumBy(
        selectedOperators || [],
        (operator) => operator?.statistics?.inactiveUserCount || 0
      ),
      loadCountByDay: (selectedOperators || []).flatMap(
        (operator) => operator?.statistics?.loadCountByDay || []
      ),
      slotsByJumpType: (selectedOperators || []).flatMap(
        (operator) => operator?.statistics?.slotsByJumpType || []
      ),
    }),
    [selectedOperators]
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
        <Stats
          title="Turn-around"
          columns={Platform.OS === 'web' ? undefined : 2}
          data={
            [
              {
                label: 'Total',
                color: successColor,
                value: `$${summedStatistics?.revenueCents || 0}`,
              },
              {
                label: 'Dispatched',
                value: summedStatistics?.loadsCount || 0,
              },
              {
                label: 'Cancelled',
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
          columns={Platform.OS === 'web' ? undefined : 3}
          data={[
            { label: 'Dropzones', value: data?.operators.edges?.length || 0 },
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
      <View style={StyleSheet.flatten([styles.row, styles.statistics])}>
        <LoadsByDay
          style={styles.dispatchedLoadsCard}
          data={summedStatistics?.loadCountByDay || []}
          startTime={
            timeRange?.startTime ? parseISO(timeRange?.startTime) : subMonths(new Date(), 6)
          }
        />

        <JumpTypePieChart
          style={styles.jumpTypesCard}
          data={summedStatistics?.slotsByJumpType || []}
        />
      </View>
      <View style={StyleSheet.flatten([styles.row, styles.table])}>
        <OperatorsTable
          selected={selectedOperators || []}
          onChangeSelected={setSelectedOperators}
          operators={
            data?.operators?.edges?.map((edge) => edge?.node as OperatorStatisticsFragment) || []
          }
        />
      </View>
    </ScrollableScreen>
  );
}

export default function AdminOverviewPageWrapper() {
  return (
    <OperatorsProvider
      state={[
        OperatorState.Archived,
        OperatorState.InReview,
        OperatorState.Private,
        OperatorState.Public,
      ]}
    >
      <AdminOverviewPage />
    </OperatorsProvider>
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
    width: Platform.OS === 'web' ? undefined : '100%',
    flex: Platform.OS === 'web' ? 3 / 4 : undefined,
    marginVertical: 4,
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
