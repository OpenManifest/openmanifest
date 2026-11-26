import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  FieldError,
  Icon,
  ListRow,
  Skeleton,
  Stack,
  Subheader,
  Text,
  type IconName,
} from 'app/ui';
import { groupIndustries, type IndustryTemplate } from '../wizard';
import type { StepProps } from './types';
import PresetSummary from './PresetSummary';

type Props = StepProps & {
  industries: IndustryTemplate[];
  loading: boolean;
  onPick(industry: IndustryTemplate): void;
};

/**
 * The first question: what the operator does. Templates in groups (air, water, land, other); the one picked shows what
 * it starts with. Once the operator exists its template cannot change, so the choice is fixed.
 */
export default function IndustryStep({
  values,
  errors,
  industries,
  loading,
  onPick,
  industry,
}: Props) {
  const { t } = useTranslation('common');
  const locked = !!values.id;

  if (loading && !industries.length) return <Skeleton lines={6} />;

  return (
    <Stack gap="md">
      {locked ? <Text tone="muted">{t('onboarding.industryLocked')}</Text> : null}
      {groupIndustries(industries).map(({ group, industries: inGroup }) => (
        <Stack key={group} gap="xs" testID={`industry-group-${group}`}>
          <Subheader>{t(`onboarding.groups.${group}`)}</Subheader>
          <Card padding="none">
            {inGroup.map((template) => {
              const selected = values.industry === template.slug;
              return (
                <ListRow
                  key={template.slug}
                  testID={`industry-${template.slug.toLowerCase()}`}
                  title={template.name}
                  supporting={template.description}
                  leading={<Icon name={template.icon as IconName} tone="muted" />}
                  trailing={selected ? <Icon name="check" tone="brand" /> : null}
                  selected={selected}
                  disabled={locked && !selected}
                  onPress={() => onPick(template)}
                />
              );
            })}
          </Card>
        </Stack>
      ))}
      <FieldError>{errors.industry}</FieldError>
      {industry ? (
        <Card testID="industry-preview">
          <Stack gap="sm">
            <Text variant="label">{t('onboarding.startsWith', { name: industry.name })}</Text>
            <PresetSummary industry={industry} />
          </Stack>
        </Card>
      ) : null}
    </Stack>
  );
}
