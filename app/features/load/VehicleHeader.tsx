import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Text } from 'app/ui';
import VehicleIcon from 'app/features/board/VehicleIcon';

export type VehicleHeaderProps = {
  title: string | null;
  kind: string | null;
  filled: number;
  capacity: number;
  testID?: string;
};

/** The heading of the places of one vehicle on a load that has several: its name and how many places are taken */
export default function VehicleHeader({
  title,
  kind,
  filled,
  capacity,
  testID = 'vehicle-header',
}: VehicleHeaderProps) {
  const { t } = useTranslation('common');

  return (
    <Row justify="between" align="center" testID={testID} padding="sm">
      <Row gap="sm" align="center">
        <VehicleIcon kind={kind} />
        <Text variant="label" role="heading" aria-level={3}>
          {title}
        </Text>
      </Row>
      <Text variant="caption" tone="muted">
        {t('forms.load.groupSeats', { count: filled, seats: capacity })}
      </Text>
    </Row>
  );
}
