import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, FieldError, Icon, IconButton, Subheader, Tappable, Text, useTheme } from 'app/ui';
import TextInput from 'app/components/input/text/TextField';
import NumberField, { NumberFieldType } from 'app/components/input/number_input/NumberField';
import useTerms from 'app/i18n/useTerms';
import { EMPTY_GUEST, GuestValue } from './guests';

export interface IGuestsInputProps {
  value?: GuestValue[] | null;
  /** The most guests for each escort (the ticket type's `escortCapacity`) */
  capacity: number;
  error?: string | null;
  onChange(guests: GuestValue[]): void;
}

/** A section that opens and closes under its title: the personal details of a guest */
function Details({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  return (
    <View>
      <Tappable
        role="button"
        aria-label={title}
        aria-expanded={open}
        onPress={() => setOpen(!open)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}
      >
        <Icon name="card-account-details-outline" tone="muted" />
        <View style={{ flex: 1 }}>
          <Text>{title}</Text>
        </View>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} tone="muted" />
      </Tappable>
      {open ? children : null}
    </View>
  );
}

/**
 * The guests who ride with an escort: a name and an exit weight each, and the personal details of a booking participant
 * under "More details". Up to `capacity` guests; a skydiving tandem takes one.
 */
export default function GuestsInput(props: IGuestsInputProps) {
  const { value, capacity, error, onChange } = props;
  const term = useTerms();
  const guests = React.useMemo(() => value ?? [], [value]);

  const update = React.useCallback(
    (index: number, changes: Partial<GuestValue>) =>
      onChange(guests.map((guest, at) => (at === index ? { ...guest, ...changes } : guest))),
    [guests, onChange]
  );

  return (
    <>
      <Subheader>{term('guest', capacity)}</Subheader>
      {guests.map((guest, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <View key={`guest-${index}`} testID={`guest-${index}`}>
          <View style={styles.row}>
            <View style={styles.rowFirst}>
              <TextInput
                mode="flat"
                value={guest.name}
                onChangeText={(name: string) => update(index, { name })}
                label={`${term('guest')} name`}
                testID={`guest-name-${index}`}
              />
            </View>
            <View style={styles.rowLast}>
              <NumberField
                value={guest.bodyMassKg ?? 0}
                onChange={(bodyMassKg) => update(index, { bodyMassKg })}
                variant={NumberFieldType.Weight}
              />
            </View>
            <IconButton
              icon="close"
              aria-label={`Remove ${term('guest').toLowerCase()}`}
              onPress={() => onChange(guests.filter((_, at) => at !== index))}
            />
          </View>
          <Details title="More details">
            <TextInput
              mode="flat"
              value={guest.email ?? ''}
              onChangeText={(email: string) => update(index, { email })}
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              mode="flat"
              value={guest.phone ?? ''}
              onChangeText={(phone: string) => update(index, { phone })}
              label="Phone"
              keyboardType="phone-pad"
            />
            <TextInput
              mode="flat"
              value={guest.dateOfBirth ?? ''}
              onChangeText={(dateOfBirth: string) => update(index, { dateOfBirth })}
              label="Date of birth (YYYY-MM-DD)"
            />
            <TextInput
              mode="flat"
              value={guest.emergencyContact ?? ''}
              onChangeText={(emergencyContact: string) => update(index, { emergencyContact })}
              label="Emergency contact"
            />
          </Details>
        </View>
      ))}
      {guests.length < capacity ? (
        <Button
          icon="account-plus"
          variant="tertiary"
          testID="add-guest"
          label={`Add ${term('guest').toLowerCase()}`}
          onPress={() => onChange([...guests, { ...EMPTY_GUEST }])}
        />
      ) : null}
      <FieldError>{error}</FieldError>
    </>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  rowFirst: { flex: 2 / 4, marginRight: 4 },
  rowLast: { flex: 2 / 4 },
});
