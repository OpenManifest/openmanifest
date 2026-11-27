import * as React from 'react';
import { Row, Icon, Text } from 'app/ui';
import { formatDestination } from 'app/i18n/format';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import type { LoadDetailsFragment } from 'app/api/operations';

export type DestinationLabelProps = {
  destinations?: LoadDetailsFragment['destinations'] | null;
  testID?: string;
};

/** Where a load goes: "14k", "Reef 2 · Wreck", whatever the operator's destinations are; nothing when it has none */
export default function DestinationLabel({ destinations, testID }: DestinationLabelProps) {
  const units = useOperatorFormat((state) => state.units);
  const label = (destinations ?? [])
    .map((destination) => formatDestination(destination, units))
    .filter(Boolean)
    .join(' · ');
  if (!label) return null;

  return (
    <Row gap="xs" align="center">
      <Icon name="map-marker-outline" size={16} tone="muted" />
      <Text variant="bodyCompact" tone="muted" testID={testID}>
        {label}
      </Text>
    </Row>
  );
}
