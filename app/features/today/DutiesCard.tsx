import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Row, Text, useTheme } from 'app/ui';
import type { LoadDetailsFragment } from 'app/api/operations';
import type { Duty } from './today';

export type DutiesCardProps = {
  duties: readonly Duty<LoadDetailsFragment>[];
  testID?: string;
};

/** What a crew member is down to do today: their role on each load that has not finished */
export default function DutiesCard({ duties, testID = 'today-duties' }: DutiesCardProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  if (!duties.length) return null;

  return (
    <View
      testID={testID}
      style={{
        gap: theme.space.sm,
        padding: theme.space.lg,
        backgroundColor: theme.colour.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colour.border,
      }}
    >
      <Text variant="title" role="heading" aria-level={2}>
        {t('common:today.duties.title')}
      </Text>
      {duties.map(({ key, load, role }) => (
        <Row key={key} gap="md" align="center">
          <Icon name="badge-account-horizontal-outline" size={20} tone="muted" />
          <Text testID={`${testID}-${key}`}>
            {t('common:today.duties.row', {
              role,
              load: t('common:loadNumber', {
                load: t('terms:load', { count: 1 }),
                number: load.loadNumber,
              }),
            })}
          </Text>
        </Row>
      ))}
    </View>
  );
}
