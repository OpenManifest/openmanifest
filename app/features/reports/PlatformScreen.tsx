import * as React from 'react';
import { useTranslation } from 'react-i18next';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import FormColumn, { FORM_COLUMN_WIDE_MAX_WIDTH } from 'app/components/layout/FormColumn';
import { useOperatorsStatisticsQuery, useUpdateVisibilityMutation } from 'app/api/reflection';
import type { OperatorStatisticsFragment } from 'app/api/operations';
import type { OperatorState } from 'app/api/schema.d';
import useTerms from 'app/i18n/useTerms';
import { useNotifications } from 'app/providers/notifications';
import { useTheme } from 'app/ui';
import BarList from './BarList';
import OperatorList from './OperatorList';
import RangePicker from './RangePicker';
import StatGroup from './StatGroup';
import { monthLabel, useMemberStats, useRoleStats, useTurnaround } from './useStats';
import {
  STATE_EVENT,
  barsByMonth,
  barsByName,
  sumTotals,
  timeRangeOf,
  toggled,
  type RangeKey,
} from './reports';

/**
 * Platform (More → Platform, moderators only): every operator's figures added up over a period, and the list of
 * operators, where a moderator changes an operator's state and chooses which operators the figures count.
 */
export default function PlatformScreen() {
  const { t } = useTranslation('common');
  const term = useTerms();
  const theme = useTheme();
  const notify = useNotifications();
  const [range, setRange] = React.useState<RangeKey>('all');
  const timeRange = React.useMemo(() => timeRangeOf(range), [range]);
  const { data } = useOperatorsStatisticsQuery({ variables: { timeRange } });
  const [updateVisibility] = useUpdateVisibilityMutation();
  const [saving, setSaving] = React.useState<string>();

  const operators = (data?.operators?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node): node is OperatorStatisticsFragment => !!node);
  // Every operator counts until a moderator takes one out
  const [excluded, setExcluded] = React.useState<string[]>([]);
  const counted = operators.filter((operator) => !excluded.includes(operator.id));
  const totals = sumTotals(counted.map((operator) => operator.statistics));
  const turnaround = useTurnaround(totals, true);
  const roles = useRoleStats(totals);
  const members = useMemberStats(totals);

  const onChangeState = React.useCallback(
    async (operator: OperatorStatisticsFragment, state: OperatorState) => {
      const event = STATE_EVENT[state];
      if (state === operator.status || !event) return;
      setSaving(operator.id);
      try {
        const { data: result } = await updateVisibility({
          variables: { operator: operator.id, event },
        });
        const error = result?.updateVisibility?.errors?.[0];
        if (error) notify.error(error);
        else notify.success(t('platform.stateChanged', { name: operator.name }));
      } catch (error) {
        notify.error(error instanceof Error ? error.message : String(error));
      } finally {
        setSaving(undefined);
      }
    },
    [notify, t, updateVisibility]
  );

  return (
    <ScreenContainer edges={['bottom']} testID="platform">
      <FormColumn
        maxWidth={FORM_COLUMN_WIDE_MAX_WIDTH}
        contentContainerStyle={{ paddingTop: theme.space.lg, gap: theme.space.lg }}
      >
        <RangePicker value={range} onChange={setRange} />
        <StatGroup
          title={t('reports.turnaround')}
          stats={[
            {
              key: 'operators',
              label: term('operator', 2),
              value: t('platform.countedOf', { counted: counted.length, total: operators.length }),
            },
            ...turnaround,
          ]}
          testID="platform-turnaround"
        />
        <StatGroup
          title={term('member', 2)}
          stats={[...members, ...roles]}
          testID="platform-members"
        />
        <BarList
          title={t('reports.loadsByMonth', { loads: term('load', 2) })}
          bars={barsByMonth(
            counted.flatMap((operator) => operator.statistics?.loadCountByDay ?? []),
            monthLabel
          )}
          empty={t('reports.noLoads', { loads: term('load', 2).toLowerCase() })}
          testID="platform-loads"
        />
        <BarList
          title={t('reports.byActivity', {
            slots: term('slot', 2),
            activity: term('activity').toLowerCase(),
          })}
          bars={barsByName(
            counted.flatMap((operator) => operator.statistics?.slotsByActivityType ?? [])
          )}
          empty={t('reports.noSlots', { slots: term('slot', 2).toLowerCase() })}
          testID="platform-activities"
        />
        <OperatorList
          operators={operators}
          counted={counted.map((operator) => operator.id)}
          onToggleCounted={(id) => setExcluded((current) => toggled(current, id))}
          onChangeState={onChangeState}
          saving={saving}
        />
      </FormColumn>
    </ScreenContainer>
  );
}
