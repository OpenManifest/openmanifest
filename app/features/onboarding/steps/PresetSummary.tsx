import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Text } from 'app/ui';
import type { IndustryTemplate } from '../wizard';

/** The lists of the summary, in the order they are shown */
const LISTS = ['crewRoles', 'ticketTypes', 'destinations', 'equipmentKinds', 'roles'] as const;

/** What a template's presets create, by name (the `presetSummary` of the industries query), and its modules */
export default function PresetSummary({ industry }: { industry: IndustryTemplate }) {
  const { t } = useTranslation(['common', 'terms']);
  const summary = industry.presetSummary;
  const vehicles = t('terms:vehicle', { count: 2 }).toLowerCase();
  const modules = industry.modules.map((name) =>
    t(`rules.module.${name}.label`, { vehicles, defaultValue: name })
  );

  return (
    <Stack gap="xs" testID="preset-summary">
      <Line label={t('onboarding.summary.modules')} names={modules} />
      {LISTS.map((list) => (
        <Line
          key={list}
          testID={`preset-${list}`}
          label={t(`onboarding.summary.${list}`)}
          names={summary[list]}
        />
      ))}
      {summary.activityTypes ? (
        <Text tone="muted">
          {t('onboarding.summary.activityTypes', { count: summary.activityTypes })}
        </Text>
      ) : null}
    </Stack>
  );
}

function Line({ label, names, testID }: { label: string; names: string[]; testID?: string }) {
  const { t } = useTranslation('common');
  return (
    <Text testID={testID}>
      <Text variant="label">{t('onboarding.summary.label', { label })}</Text>
      {names.length ? names.join(', ') : t('onboarding.summary.none')}
    </Text>
  );
}
