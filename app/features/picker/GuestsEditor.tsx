import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, IconButton, NumberField, Text, TextField, useTheme } from 'app/ui';
import { emptyGuest, guestProblem, type GuestValue } from './guests';

export type GuestsEditorProps = {
  /** Who takes them along, for the heading */
  escort: string;
  guests: GuestValue[];
  /** How many guests one escort takes */
  capacity: number;
  /** The ticket's limits ask for an age: a date of birth for each guest */
  dateOfBirth?: boolean;
  onChange(guests: GuestValue[]): void;
  testID?: string;
};

/** The guests who ride with an escort (a tandem passenger, a try dive student): a name and an exit weight for each */
export default function GuestsEditor({
  escort,
  guests,
  capacity,
  dateOfBirth = false,
  onChange,
  testID = 'picker-guests',
}: GuestsEditorProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const problem = guestProblem(guests, capacity, dateOfBirth);
  const update = (index: number, patch: Partial<GuestValue>) =>
    onChange(guests.map((guest, at) => (at === index ? { ...guest, ...patch } : guest)));

  return (
    <View
      testID={testID}
      style={{
        gap: theme.space.sm,
        padding: theme.space.md,
        borderTopWidth: 1,
        borderTopColor: theme.colour.border,
      }}
    >
      <Text variant="label">
        {t('picker.guests.title', { name: escort, count: guests.length, capacity })}
      </Text>
      {guests.map((guest, index) => (
        <View
          // The list is only added to and taken from at the end or by position: the index is the identity
          key={index}
          style={{ gap: theme.space.sm }}
          testID={`${testID}-${index}`}
        >
          <TextField
            label={t('picker.guests.name', { number: index + 1 })}
            value={guest.name}
            onChange={(name) => update(index, { name })}
            autoCapitalize="words"
            testID={`${testID}-${index}-name`}
          />
          <NumberField
            label={t('picker.guests.mass', { number: index + 1 })}
            value={guest.bodyMassKg}
            onChange={(bodyMassKg) => update(index, { bodyMassKg })}
            min={0}
            max={300}
            unit="kg"
            hideSteppers
            testID={`${testID}-${index}-mass`}
          />
          {dateOfBirth ? (
            <TextField
              label={t('picker.guests.dateOfBirth', { number: index + 1 })}
              value={guest.dateOfBirth}
              onChange={(value) => update(index, { dateOfBirth: value })}
              placeholder="YYYY-MM-DD"
              testID={`${testID}-${index}-dob`}
            />
          ) : null}
          {guests.length > 1 ? (
            <IconButton
              icon="account-remove-outline"
              aria-label={t('picker.guests.remove', { number: index + 1 })}
              onPress={() => onChange(guests.filter((_, at) => at !== index))}
              testID={`${testID}-${index}-remove`}
            />
          ) : null}
        </View>
      ))}
      {guests.length < capacity ? (
        <Button
          variant="tertiary"
          icon="account-plus-outline"
          label={t('picker.guests.add')}
          onPress={() => onChange([...guests, emptyGuest()])}
          testID={`${testID}-add`}
        />
      ) : null}
      {problem && problem !== 'count' ? (
        <Text variant="caption" tone="muted" testID={`${testID}-problem`}>
          {t(`picker.guests.problem.${problem}`)}
        </Text>
      ) : null}
    </View>
  );
}
