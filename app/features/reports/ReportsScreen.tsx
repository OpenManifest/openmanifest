import * as React from 'react';
import { useTranslation } from 'react-i18next';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import FormColumn, { FORM_COLUMN_WIDE_MAX_WIDTH } from 'app/components/layout/FormColumn';
import { useOperatorStatisticsQuery } from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useOperatorContext } from 'app/providers/operator/context';
import useTerms from 'app/i18n/useTerms';
import { useTheme } from 'app/ui';
import BarList from './BarList';
import EventFeed from './EventFeed';
import RangePicker from './RangePicker';
import StatGroup from './StatGroup';
import { barsByMonth, barsByName, timeRangeOf, totalsOf, type RangeKey } from './reports';
import { monthLabel, useMemberStats, useRoleStats, useTurnaround } from './useStats';

/**
 * Reports (More → Reports): how the operator is doing over a period. The turnaround, the crew and members, loads by month
 * and places by activity as bar lists, and what happened. Money only for those who may see the revenue.
 */
export default function ReportsScreen() {
  const { t } = useTranslation('common');
  const term = useTerms();
  const theme = useTheme();
  const {
    operator: { operator },
  } = useOperatorContext();
  const [range, setRange] = React.useState<RangeKey>('all');
  const timeRange = React.useMemo(() => timeRangeOf(range), [range]);
  const canSeeStatistics = useRestriction(Permission.ViewStatistics);
  const canSeeRevenue = useRestriction(Permission.ViewRevenue);

  const { data } = useOperatorStatisticsQuery({
    variables: { operatorId: String(operator?.id), timeRange },
    skip: !operator?.id,
  });
  const statistics = data?.operator?.statistics;
  const totals = totalsOf(statistics);
  const turnaround = useTurnaround(totals, canSeeRevenue);
  const roles = useRoleStats(totals);
  const members = useMemberStats(totals);

  return (
    <ScreenContainer edges={['bottom']} testID="reports">
      <FormColumn
        maxWidth={FORM_COLUMN_WIDE_MAX_WIDTH}
        contentContainerStyle={{ paddingTop: theme.space.lg, gap: theme.space.lg }}
      >
        <RangePicker value={range} onChange={setRange} />
        {canSeeStatistics ? (
          <StatGroup
            title={t('reports.turnaround')}
            stats={turnaround}
            testID="reports-turnaround"
          />
        ) : null}
        <StatGroup title={t('reports.roles.title')} stats={roles} testID="reports-roles" />
        {canSeeStatistics ? (
          <>
            <StatGroup title={term('member', 2)} stats={members} testID="reports-members" />
            <BarList
              title={t('reports.loadsByMonth', { loads: term('load', 2) })}
              bars={barsByMonth(statistics?.loadCountByDay ?? [], monthLabel)}
              empty={t('reports.noLoads', { loads: term('load', 2).toLowerCase() })}
              testID="reports-loads"
            />
            <BarList
              title={t('reports.byActivity', {
                slots: term('slot', 2),
                activity: term('activity').toLowerCase(),
              })}
              bars={barsByName(statistics?.slotsByActivityType ?? [])}
              empty={t('reports.noSlots', { slots: term('slot', 2).toLowerCase() })}
              testID="reports-activities"
            />
          </>
        ) : null}
        <EventFeed operatorId={operator?.id} timeRange={timeRange} timeZone={operator?.timeZone} />
      </FormColumn>
    </ScreenContainer>
  );
}
