import { useTicketTypeExtrasLazyQuery } from 'app/api/reflection';
import * as React from 'react';
import { View } from 'react-native';
import { FormTextField } from 'app/components/input/text/TextField';
import { List, Divider } from 'react-native-paper';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { TicketTypeExtraEssentialsFragment } from 'app/api/operations';
import { Control, useWatch } from 'react-hook-form';
import { AltitudeSelectField } from 'app/components/input/dropdown_select';
import { FormNumberField } from 'app/components/input/number_input';
import { SwitchField } from 'app/components/input/switch/Switch';
import { ChipSelectField } from 'app/components/input/chip_select';
import { TicketTypeFields } from './useForm';

interface ITicketTypeFormProps {
  control: Control<TicketTypeFields>;
}

export default function TicketTypeForm(props: ITicketTypeFormProps) {
  const { control } = props;
  const {
    dropzone: { dropzone },
  } = useDropzoneContext();
  const { altitude } = useWatch({ control });
  const [getTicketAddons, query] = useTicketTypeExtrasLazyQuery();
  const { data } = query;

  React.useEffect(() => {
    if (dropzone?.id) {
      getTicketAddons({ variables: { dropzoneId: dropzone?.id } });
    }
  }, [dropzone?.id, getTicketAddons]);

  const { extras: selectedAddons } = useWatch({ control });
  console.debug({ altitude });
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
        helperText="Base cost without extra ticket addons"
      />
      <View style={{ width: '100%' }}>
        <AltitudeSelectField {...{ control }} name="altitude" />

        {(!altitude || ![4000, 14000].includes(altitude)) && (
          <FormNumberField {...{ control }} label="Custom altitude" name="altitude" />
        )}

        <SwitchField
          {...{ control }}
          name="isTandem"
          label="Tandem"
          helperText="Allow also manifesting a passenger when using this ticket type"
        />

        <SwitchField
          {...{ control }}
          name="allowManifestingSelf"
          label="Public manifesting"
          helperText="Allow this ticket to be used for public manifesting, e.g not tandems"
        />
        <Divider />
        <List.Subheader>Enabled ticket add-ons</List.Subheader>
        <ChipSelectField<TicketTypeFields, 'extras'>
          {...{ control }}
          allowEmpty
          defaultValue={[]}
          isSelected={(item) =>
            selectedAddons
              ?.map(({ id }) => id)
              .includes((item as TicketTypeExtraEssentialsFragment)?.id) || false
          }
          items={(data?.extras as TicketTypeExtraEssentialsFragment[]) || []}
          renderItemLabel={(item: TicketTypeExtraEssentialsFragment) =>
            `${item.name} (${item.cost})`
          }
          name="extras"
        />
      </View>
    </>
  );
}
