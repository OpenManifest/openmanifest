import * as React from 'react';
import { View } from 'react-native';
import { Card, Stack, Text, useTheme } from 'app/ui';

export type SectionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
};

/** One component of the gallery: a heading, and its states under it. `testID` is `gallery-<id>`. */
export default function Section({ id, title, children }: SectionProps) {
  const { space } = useTheme();

  return (
    <View testID={`gallery-${id}`} style={{ gap: space.md }}>
      <Text variant="title" role="heading" aria-level={2}>
        {title}
      </Text>
      <Card>
        <Stack gap="lg">{children}</Stack>
      </Card>
    </View>
  );
}

/** A caption over one state of a component */
export function State({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack gap="xs">
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      {children}
    </Stack>
  );
}
