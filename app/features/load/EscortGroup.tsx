import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Avatar, Text, useTheme } from 'app/ui';
import type { SlotDetailsFragment } from 'app/api/operations';
import PlaceRow, { type PlaceRowProps } from './PlaceRow';

export type EscortGroupProps = PlaceRowProps;

/**
 * An escort and the guests who ride with them: the guests sit under the escort's row, indented, with the operator's word
 * for a guest. They are changed through the escort's place, so they have no menu of their own.
 */
export default function EscortGroup({ slot, testID = 'slot-row', ...props }: EscortGroupProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const guests = slot.guestSlots ?? [];
  const guestTerm = String(t('terms:guest', { count: 1 }));

  return (
    <View testID={`${testID}-escort`}>
      <PlaceRow slot={slot} testID={testID} joined={guests.length > 0} {...props} />
      {guests.map((guestSlot, index) => (
        <View
          key={guestSlot.id}
          testID={`${testID}-guest`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space.md,
            paddingVertical: theme.space.sm,
            paddingLeft: theme.space.xxxl,
            paddingRight: theme.space.md,
            backgroundColor: theme.colour.surface,
            borderBottomLeftRadius: index === guests.length - 1 ? theme.radius.md : 0,
          }}
        >
          <Avatar name={guestSlot.guest?.name ?? guestTerm} size="sm" />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1}>{guestSlot.guest?.name}</Text>
            <Text variant="caption" tone="muted">
              {guestTerm}
              {guestSlot.bodyMassKg ? ` · ${guestSlot.bodyMassKg} kg` : ''}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export type { SlotDetailsFragment };
