import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Divider, List } from 'react-native-paper';
import { NumberFieldType } from 'app/components/input/number_input/NumberField';
import { Control, useWatch } from 'react-hook-form';
import { TicketTypeExtraEssentialsFragment } from 'app/api/operations';
import { ChipSelectField } from 'app/components/input/chip_select';
import { FormNumberField } from 'app/components/input/number_input';

import { Permission } from 'app/api/schema.d';
import { JumpTypeChipSelectField } from 'app/components/input/chip_select/JumpTypeChipSelect';
import { TicketTypeChipSelectField } from 'app/components/input/chip_select/TicketTypeChipSelect';
import useRestriction from 'app/hooks/useRestriction';
import { RigSelectField } from 'app/components/input/dropdown_select/RigSelect';
import { ManifestUserFields } from './useForm';

interface IManifestFormProps {
  control: Control<ManifestUserFields>;
}
export default function ManifestForm(props: IManifestFormProps) {
  const { control } = props;

  const { id, dropzoneUser, ticketType, load } = useWatch<ManifestUserFields>({ control });

  const allowedToManifestOthers = useRestriction(
    id ? Permission.UpdateUserSlot : Permission.CreateUserSlot
  );
  const { extras: selectedAddons } = useWatch({ control });

  return (
    <>
      <JumpTypeChipSelectField
        {...{ control }}
        name="jumpType"
        userId={Number(dropzoneUser?.id) || null}
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
          `${item.name} ($${item.cost})`
        }
        name="extras"
      />
      <Divider />
      {!dropzoneUser ? null : (
        <RigSelectField
          {...{ control }}
          loadId={load?.id ? Number(load?.id) : undefined}
          name="rig"
          label="Equipment"
          dropzoneUserId={Number(dropzoneUser?.id)}
        />
      )}
      <FormNumberField
        label="Exit weight"
        variant={NumberFieldType.Weight}
        {...{ control }}
        name="exitWeight"
      />

      {!ticketType?.isTandem ? null : (
        <>
          <List.Subheader>Passenger</List.Subheader>
          <FormTextField {...{ control }} label="Passenger name" name="passengerName" />

          <FormNumberField
            {...{ control }}
            label="Passenger exit weight"
            name="passengerExitWeight"
          />
        </>
      )}
    </>
  );
}
