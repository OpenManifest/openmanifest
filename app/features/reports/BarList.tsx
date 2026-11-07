import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, Text, useTheme } from 'app/ui';
import Section from 'app/features/profile/Section';
import { barPercent, type Bar } from './reports';

export type BarListProps = {
  title: string;
  bars: Bar[];
  /** What the list says when there is nothing to count */
  empty: string;
  testID: string;
};

/**
 * A chart that works everywhere: one row per value, its name, a bar as long as its share of the largest and the count.
 * The bars are drawn from tokens; the rows read as "name: count" to a screen reader.
 */
export default function BarList({ title, bars, empty, testID }: BarListProps) {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const max = Math.max(0, ...bars.map((bar) => bar.count));

  return (
    <Section title={title} testID={testID}>
      {bars.length === 0 ? (
        <EmptyState testID={`${testID}-empty`} icon="chart-bar" title={empty} />
      ) : (
        <View role="list" style={{ gap: theme.space.sm }}>
          {bars.map((bar) => (
            <View
              key={bar.key}
              role="listitem"
              aria-label={t('reports.bar', { label: bar.label, count: bar.count })}
              testID={`${testID}-${bar.key}`}
              style={{ gap: theme.space.xs }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: theme.space.sm,
                }}
              >
                <View style={{ flexShrink: 1 }}>
                  <Text variant="bodyCompact" numberOfLines={1}>
                    {bar.label}
                  </Text>
                </View>
                <Text variant="bodyCompact" tone="muted" testID={`${testID}-${bar.key}-count`}>
                  {String(bar.count)}
                </Text>
              </View>
              <View
                style={{
                  height: theme.space.sm,
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colour.raised,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${barPercent(bar.count, max)}%`,
                    backgroundColor: theme.colour.brand,
                    borderRadius: theme.radius.pill,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </Section>
  );
}
