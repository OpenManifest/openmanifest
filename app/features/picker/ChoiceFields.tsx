import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Select, useTheme } from 'app/ui';
import { formatDestination, formatMoney } from 'app/i18n/format';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import type { TicketOption } from './choices';

export type ChoiceFieldsProps = {
  tickets: readonly TicketOption[];
  activities: readonly { id: string; name?: string | null }[];
  /** Where the slot can go, when the operator has several places to go (the destinations module) */
  destinations?: readonly {
    id: string;
    name?: string | null;
    kind?: string | null;
    altitudeM?: number | null;
  }[];
  ticketTypeId: string | null;
  activityTypeId: string | null;
  destinationId?: string | null;
  onChange(choice: {
    ticketTypeId?: string;
    activityTypeId?: string;
    destinationId?: string;
  }): void;
  testID?: string;
};

/** The ticket and the type of jump for a slot, starting from the last ones: a pick from what the operator has */
export default function ChoiceFields({
  tickets,
  activities,
  destinations = [],
  ticketTypeId,
  activityTypeId,
  destinationId = null,
  onChange,
  testID = 'picker-choice',
}: ChoiceFieldsProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const units = useOperatorFormat((state) => state.units);

  return (
    <View style={{ gap: theme.space.sm }}>
      <Select
        label={t('terms:ticket', { count: 1 })}
        testID={`${testID}-ticket`}
        value={ticketTypeId}
        onChange={(value) => onChange({ ticketTypeId: value })}
        options={tickets.map(({ id, name, costCents }) => ({
          value: id,
          label: costCents ? `${name} · ${formatMoney(costCents)}` : name,
        }))}
      />
      <Select
        label={t('terms:activity', { count: 1 })}
        testID={`${testID}-activity`}
        value={activityTypeId}
        onChange={(value) => onChange({ activityTypeId: value })}
        options={activities.map(({ id, name }) => ({ value: id, label: name ?? '' }))}
      />
      {destinations.length ? (
        <Select
          label={t('common:picker.destination')}
          testID={`${testID}-destination`}
          value={destinationId}
          placeholder={t('common:picker.destinationNone')}
          onChange={(value) => onChange({ destinationId: value })}
          options={destinations.map((destination) => ({
            value: destination.id,
            label: formatDestination(destination, units) || destination.name || '',
          }))}
        />
      ) : null}
    </View>
  );
}
