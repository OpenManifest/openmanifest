import * as React from 'react';
import { View } from 'react-native';
import { FormTextField } from 'app/components/input/text/TextField';
import { List } from 'react-native-paper';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import {
  TicketTypeEssentialsFragment,
  TicketTypeExtraEssentialsFragment,
} from 'app/api/operations';
import { useTickets } from 'app/api/crud';
import { Control, useWatch } from 'react-hook-form';
import { ChipSelectField } from 'app/components/input/chip_select';
import { FormNumberField } from 'app/components/input/number_input';
import type { TicketTypeAddonFields } from './useForm';

interface ITicketTypeAddonFormProps {
  control: Control<TicketTypeAddonFields>;
}

export default function TicketTypeForm(props: ITicketTypeAddonFormProps) {
  const { control } = props;
  const {
    dropzone: { dropzone },
  } = useDropzoneContext();
  const { ticketTypes } = useTickets({ dropzone: dropzone?.id });

  const { ticketTypes: selectedTicketTypes } = useWatch({ control });
  return (
    <>
      <FormTextField
        {...{ control }}
        label="Name"
        name="name"
        helperText="Name of the ticket users will see"
      />

      <FormNumberField
        {...{ control }}
        label="Price"
        name="cost"
        helperText="Cost to add this addon to a ticket"
      />
      <View style={{ width: '100%' }}>
        <List.Subheader>Compatible tickets</List.Subheader>
        <ChipSelectField<TicketTypeAddonFields, 'ticketTypes'>
          {...{ control }}
          allowEmpty
          defaultValue={[]}
          isSelected={(item) =>
            selectedTicketTypes
              ?.map(({ id }) => id)
              .includes((item as TicketTypeEssentialsFragment)?.id) || false
          }
          items={ticketTypes as TicketTypeEssentialsFragment[]}
          renderItemLabel={(item: TicketTypeExtraEssentialsFragment) =>
            `${item.name} (${item.cost})`
          }
          name="ticketTypes"
        />
      </View>
    </>
  );
}
