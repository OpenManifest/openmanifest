import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, Row, Tappable, Text, useTheme } from 'app/ui';

export type FreePlacesProps = {
  count: number;
  /** Opens the picker; absent for someone who may not manifest */
  onPress?(): void;
  testID?: string;
};

/** The places that are still free, as one row: "6 free places". It opens the picker to fill one. */
export default function FreePlaces({ count, onPress, testID = 'free-places' }: FreePlacesProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const slots = String(t('terms:slot', { count })).toLowerCase();
  const label = t('common:load.freePlaces', { count, slots });

  const content = (
    <Row gap="md" align="center">
      <Icon
        name={onPress ? 'plus-circle-outline' : 'seat-outline'}
        size={22}
        tone={onPress ? 'brand' : 'muted'}
      />
      <Text tone={onPress ? 'brand' : 'muted'}>{label}</Text>
    </Row>
  );
  if (!onPress) {
    return (
      <Row testID={testID} padding="md">
        {content}
      </Row>
    );
  }
  return (
    <Tappable
      role="button"
      aria-label={label}
      testID={testID}
      onPress={onPress}
      style={{
        padding: theme.space.md,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: theme.colour.border,
      }}
    >
      {content}
    </Tappable>
  );
}
