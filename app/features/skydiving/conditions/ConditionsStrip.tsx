import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Text, useTheme } from 'app/ui';
import { formatQuantity } from 'app/i18n/format';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import type { WeatherConditionEssentialsFragment } from 'app/api/operations';

type Conditions = WeatherConditionEssentialsFragment;

export type ConditionsStripProps = {
  conditions?: Pick<Conditions, 'winds' | 'jumpRun' | 'temperatureC'> | null;
  /** Opens the screen where the conditions are changed; absent for someone who may not */
  onUpdate?(): void;
  testID?: string;
};

/**
 * The conditions of the day in one line, read-only: the wind at the highest altitude that was measured, the heading of
 * the run, the temperature on the ground. For an operator with the winds-aloft module.
 */
export default function ConditionsStrip({ conditions, onUpdate, testID }: ConditionsStripProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const units = useOperatorFormat((state) => state.units);
  const top = [...(conditions?.winds ?? [])].sort(
    (a, b) => (b.altitudeM ?? 0) - (a.altitudeM ?? 0)
  )[0];
  const parts = [
    top
      ? t('board.conditions.wind', {
          speed: formatQuantity(top.speedMps, 'speed', units),
          direction: Math.round(top.direction ?? 0),
          altitude: formatQuantity(top.altitudeM, 'altitude', units),
        })
      : null,
    typeof conditions?.jumpRun === 'number'
      ? t('board.conditions.heading', { heading: Math.round(conditions.jumpRun) })
      : null,
    typeof conditions?.temperatureC === 'number'
      ? t('board.conditions.ground', {
          temperature: formatQuantity(conditions.temperatureC, 'temperature', units),
        })
      : null,
  ].filter((part): part is string => !!part);

  return (
    <View
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: theme.space.sm,
        paddingHorizontal: theme.space.md,
        paddingVertical: theme.space.sm,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colour.raised,
      }}
    >
      <Icon name="weather-windy" size={18} tone="muted" />
      <Text variant="bodyCompact" tone={parts.length ? 'default' : 'muted'}>
        {parts.length ? parts.join(' · ') : t('board.conditions.none')}
      </Text>
      {onUpdate ? (
        <Button variant="tertiary" label={t('board.conditions.update')} onPress={onUpdate} />
      ) : null}
    </View>
  );
}
