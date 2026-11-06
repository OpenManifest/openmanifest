import * as React from 'react';
import { View } from 'react-native';
import { Row, Text, useTheme } from 'app/ui';

export type SectionProps = {
  title: string;
  /** Beside the heading: the section's button (add, edit) */
  action?: React.ReactNode;
  /** The rows run to the edges of the card (a list); otherwise the content is padded */
  list?: boolean;
  testID: string;
  children?: React.ReactNode;
};

/** A section of the profile: a card headed by its name (a level 2 heading) with its action beside it */
export default function Section({ title, action, list = false, testID, children }: SectionProps) {
  const theme = useTheme();

  return (
    <View
      testID={testID}
      style={{
        backgroundColor: theme.colour.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colour.border,
        paddingVertical: theme.space.md,
        gap: theme.space.sm,
      }}
    >
      {/* The heading lines up with the rows of a list, which carry their own padding */}
      <Row justify="between" align="center" gap="md" wrap>
        <View style={{ flex: 1, paddingLeft: theme.space.lg, minWidth: 0 }}>
          <Text variant="title" role="heading" aria-level={2}>
            {title}
          </Text>
        </View>
        {action ? <View style={{ paddingRight: theme.space.lg }}>{action}</View> : null}
      </Row>
      <View style={list ? undefined : { paddingHorizontal: theme.space.lg, gap: theme.space.sm }}>
        {children}
      </View>
    </View>
  );
}

export type FactProps = {
  label: string;
  value: string;
  /** Beside the value: its status */
  trailing?: React.ReactNode;
  testID?: string;
};

/** One fact of a section: what it is, muted, and its value */
export function Fact({ label, value, trailing, testID }: FactProps) {
  return (
    <Row justify="between" align="center" gap="md" wrap testID={testID}>
      <Text tone="muted">{label}</Text>
      <Row gap="sm" align="center" wrap>
        <Text testID={testID ? `${testID}-value` : undefined}>{value}</Text>
        {trailing}
      </Row>
    </Row>
  );
}
