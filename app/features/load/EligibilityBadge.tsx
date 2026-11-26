import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'app/ui';
import type { EligibilityResultEssentialsFragment } from 'app/api/operations';
import { readinessOf } from './eligibility';

export type EligibilityBadgeProps = {
  rules?: readonly EligibilityResultEssentialsFragment[] | null;
  testID?: string;
};

/** What stops a person from flying, or runs out soon, in words; nothing at all when they are ready */
export default function EligibilityBadge({
  rules,
  testID = 'eligibility-badge',
}: EligibilityBadgeProps) {
  const { t } = useTranslation('common');
  const readiness = readinessOf(rules);
  if (readiness.status === 'ready') return null;
  const rule = t(`load.rule.${readiness.result.code}`, {
    defaultValue: readiness.result.code.replace(/_/g, ' '),
  });

  return readiness.status === 'blocked' ? (
    <StatusBadge status="blocked" label={t('load.notReady', { rule })} testID={testID} />
  ) : (
    <StatusBadge status="warning" label={t('load.expiring', { rule })} testID={testID} />
  );
}
