import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, IconButton, List } from 'react-native-paper';
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
      <List.Subheader>{term('guest', capacity)}</List.Subheader>
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
              accessibilityLabel={`Remove ${term('guest').toLowerCase()}`}
              onPress={() => onChange(guests.filter((_, at) => at !== index))}
            />
          </View>
          <List.Accordion
            title="More details"
            left={(left) => <List.Icon {...left} icon="card-account-details-outline" />}
          >
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
          </List.Accordion>
        </View>
      ))}
      {guests.length < capacity ? (
        <Button
          icon="account-plus"
          mode="text"
          testID="add-guest"
          onPress={() => onChange([...guests, { ...EMPTY_GUEST }])}
        >
          {`Add ${term('guest').toLowerCase()}`}
        </Button>
      ) : null}
      {error ? <HelperText type="error">{error}</HelperText> : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  rowFirst: { flex: 2 / 4, marginRight: 4 },
  rowLast: { flex: 2 / 4 },
});
