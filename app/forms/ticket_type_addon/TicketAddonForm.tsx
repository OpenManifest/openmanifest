import * as React from 'react';
import { Stack, Subheader } from 'app/ui';
import { View } from 'react-native';
import { FormTextField } from 'app/components/input/text/TextField';
import { useOperatorContext } from 'app/providers/operator/context';
import {
  TicketTypeEssentialsFragment,
  TicketTypeExtraEssentialsFragment,
} from 'app/api/operations';
import { useTickets } from 'app/api/crud';
import { Control, useWatch } from 'react-hook-form';
import { ChipSelectField } from 'app/components/input/chip_select';
import { FormNumberField } from 'app/components/input/number_input';
import type { TicketTypeAddonFields } from './useForm';
import { formatCents } from 'app/utils/money';
import { useTranslation } from 'react-i18next';

interface ITicketTypeAddonFormProps {
  control: Control<TicketTypeAddonFields>;
}

export default function TicketTypeForm(props: ITicketTypeAddonFormProps) {
  const { t } = useTranslation('common');
  const { control } = props;
  const {
    operator: { operator },
  } = useOperatorContext();
  const { ticketTypes } = useTickets({ operator: operator?.id });

  const { ticketTypes: selectedTicketTypes } = useWatch({ control });
  return (
    <Stack gap="md">
      <FormTextField
        {...{ control }}
        label={t('forms.fields.name')}
        name="name"
        helperText={t('forms.ticket_type_addon.nameOfTheTicketUsers')}
      />

      <FormNumberField
        {...{ control }}
        label={t('forms.ticket_type_addon.price')}
        name="cost"
        helperText={t('forms.ticket_type_addon.costToAddThisAddon')}
      />
      <View style={{ width: '100%' }}>
        <Subheader>{t('forms.ticket_type_addon.compatibleTickets')}</Subheader>
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
            `${item.name} (${formatCents(item.costCents)})`
          }
          name="ticketTypes"
        />
      </View>
    </Stack>
  );
}
