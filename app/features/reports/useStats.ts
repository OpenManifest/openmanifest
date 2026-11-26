import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { formatMoney } from 'app/i18n/format';
import useTerms from 'app/i18n/useTerms';
import type { Stat } from './StatGroup';
import type { Totals } from './reports';

/** The month of a `YYYY-MM` key as people read it: "Oct 2026" */
export const monthLabel = (month: string) =>
  DateTime.fromFormat(month, 'yyyy-MM').toFormat('LLL yyyy');

/** The figures of the turnaround: money (for those who may see it), loads and places */
export function useTurnaround(totals: Totals, showRevenue: boolean): Stat[] {
  const { t } = useTranslation('common');
  const term = useTerms();
  return [
    ...(showRevenue
      ? [
          {
            key: 'revenue',
            label: t('reports.revenue'),
            value: formatMoney(totals.revenueCents),
            tone: 'ok' as const,
          },
        ]
      : []),
    {
      key: 'loads',
      label: t('reports.dispatched', { loads: term('load', 2) }),
      value: String(totals.loads),
    },
    { key: 'cancelled', label: t('reports.cancelled'), value: String(totals.cancelledLoads) },
    { key: 'slots', label: term('slot', 2), value: String(totals.slots) },
  ];
}

/** Who may act in the crew roles that the counts know */
export function useRoleStats(totals: Totals): Stat[] {
  const { t } = useTranslation('common');
  return [
    { key: 'pilots', label: t('reports.roles.pilots'), value: String(totals.pilots) },
    { key: 'gca', label: t('reports.roles.groundControl'), value: String(totals.groundControl) },
    {
      key: 'dutyOfficers',
      label: t('reports.roles.dutyOfficers'),
      value: String(totals.dutyOfficers),
    },
  ];
}

/** The members: all, active and inactive */
export function useMemberStats(totals: Totals): Stat[] {
  const { t } = useTranslation('common');
  const term = useTerms();
  return [
    { key: 'users', label: term('member', 2), value: String(totals.users) },
    { key: 'active', label: t('reports.active'), value: String(totals.activeUsers), tone: 'ok' },
    {
      key: 'inactive',
      label: t('reports.inactive'),
      value: String(totals.inactiveUsers),
      tone: 'warning',
    },
  ];
}
