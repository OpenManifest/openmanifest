import * as React from 'react';
import { View } from 'react-native';
import { Text, useTheme, type TextTone } from 'app/ui';
import Section from 'app/features/profile/Section';

export type Stat = { key: string; label: string; value: string; tone?: TextTone };

export type StatGroupProps = {
  title: string;
  stats: Stat[];
  testID: string;
};

/** A few figures under one heading, side by side where there is room: the value large, what it counts under it */
export default function StatGroup({ title, stats, testID }: StatGroupProps) {
  const theme = useTheme();

  return (
    <Section title={title} testID={testID}>
      <View
        role="list"
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.space.lg,
          rowGap: theme.space.md,
        }}
      >
        {stats.map((stat) => (
          <View
            key={stat.key}
            role="listitem"
            aria-label={`${stat.label}: ${stat.value}`}
            testID={`${testID}-${stat.key}`}
            style={{ minWidth: theme.space.xxxl * 2, flexGrow: 1, gap: theme.space.xs }}
          >
            <Text variant="title" tone={stat.tone} testID={`${testID}-${stat.key}-value`}>
              {stat.value}
            </Text>
            <Text variant="caption" tone="muted">
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </Section>
  );
}
