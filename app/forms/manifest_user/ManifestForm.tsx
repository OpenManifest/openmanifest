import * as React from 'react';
import { Divider, List } from 'react-native-paper';
import { NumberFieldType } from 'app/components/input/number_input/NumberField';
import { Control, useController, useWatch } from 'react-hook-form';
import { TicketTypeExtraEssentialsFragment } from 'app/api/operations';
import { ChipSelectField } from 'app/components/input/chip_select';
import { FormNumberField } from 'app/components/input/number_input';

import { Permission } from 'app/api/schema.d';
import { ActivityTypeChipSelectField } from 'app/components/input/chip_select/ActivityTypeChipSelect';
import { TicketTypeChipSelectField } from 'app/components/input/chip_select/TicketTypeChipSelect';
import useRestriction from 'app/hooks/useRestriction';
import { EquipmentPickerField } from 'app/components/input/dropdown_select/EquipmentPicker';
import { ManifestUserFields } from './useForm';
import { formatCents } from 'app/utils/money';
import GuestsInput from './GuestsInput';

interface IManifestFormProps {
  control: Control<ManifestUserFields>;
}
export default function ManifestForm(props: IManifestFormProps) {
  const { control } = props;

  const { id, membership, ticketType, activityType, load } = useWatch<ManifestUserFields>({
    control,
  });

  const allowedToManifestOthers = useRestriction(
    id ? Permission.UpdateUserSlot : Permission.CreateUserSlot
  );
  const { extras: selectedAddons } = useWatch({ control });
  const guests = useController({ control, name: 'guests' });

  return (
    <>
      <ActivityTypeChipSelectField
        {...{ control }}
        name="activityType"
        userId={Number(membership?.id) || null}
      />

      <TicketTypeChipSelectField
        {...{ control }}
        onlyPublicTickets={!allowedToManifestOthers}
        name="ticketType"
      />

      {!ticketType?.extras?.length ? null : <List.Subheader>Ticket addons</List.Subheader>}
      <ChipSelectField<ManifestUserFields, 'extras'>
        {...{ control }}
        allowEmpty
        defaultValue={[]}
        isSelected={(item) =>
          selectedAddons
            ?.map((addon) => addon?.id)
            .includes((item as TicketTypeExtraEssentialsFragment)?.id) || false
        }
        items={ticketType?.extras as TicketTypeExtraEssentialsFragment[]}
        renderItemLabel={(item: TicketTypeExtraEssentialsFragment) =>
          `${item.name} (${formatCents(item.costCents)})`
        }
        name="extras"
      />
      <Divider />
      {!membership ? null : (
        <EquipmentPickerField
          {...{ control }}
          loadId={load?.id ? Number(load?.id) : undefined}
          name="equipment"
          membershipId={Number(membership?.id)}
          ticketTypeId={ticketType?.id}
          activityTypeId={activityType?.id}
          tandem={!!ticketType?.requiresEscort}
        />
      )}
      <FormNumberField
        label="Exit weight"
        variant={NumberFieldType.Weight}
        {...{ control }}
        name="bodyMassKg"
      />

      {!ticketType?.requiresEscort ? null : (
        <GuestsInput
          value={guests.field.value}
          capacity={ticketType.escortCapacity ?? 1}
          error={guests.fieldState.error?.message}
          onChange={guests.field.onChange}
        />
      )}
    </>
  );
}
