import { useTicketTypeExtrasLazyQuery } from 'app/api/reflection';
import * as React from 'react';
import { View } from 'react-native';
import { FormTextField } from 'app/components/input/text/TextField';
import { useOperatorContext } from 'app/providers/operator/context';
import { TicketTypeExtraEssentialsFragment } from 'app/api/operations';
import { Control, useWatch } from 'react-hook-form';
import { AltitudeSelectField } from 'app/components/input/dropdown_select';
import { FormNumberField } from 'app/components/input/number_input';
import { SwitchField } from 'app/components/input/switch/Switch';
import { ChipSelectField } from 'app/components/input/chip_select';
import { TicketTypeFields } from './useForm';
import { formatCents } from 'app/utils/money';
import { useTranslation } from 'react-i18next';
import { Divider, Stack, Subheader } from 'app/ui';

interface ITicketTypeFormProps {
  control: Control<TicketTypeFields>;
}

export default function TicketTypeForm(props: ITicketTypeFormProps) {
  const { t } = useTranslation('common');
  const { control } = props;
  const {
    operator: { operator },
  } = useOperatorContext();
  const { altitude } = useWatch({ control });
  const [getTicketAddons, query] = useTicketTypeExtrasLazyQuery();
  const { data } = query;

  React.useEffect(() => {
    if (operator?.id) {
      getTicketAddons({ variables: { operatorId: operator?.id } });
    }
  }, [operator?.id, getTicketAddons]);

  const { extras: selectedAddons } = useWatch({ control });
  return (
    <Stack gap="md">
      <FormTextField
        {...{ control }}
        label={t('forms.fields.name')}
        name="name"
        helperText={t('forms.ticket_type.nameOfTheTicketUsers')}
      />

      <FormNumberField
        {...{ control }}
        label={t('forms.ticket_type.price')}
        name="cost"
        helperText={t('forms.ticket_type.baseCostWithoutExtraTicket')}
      />
      <View style={{ width: '100%' }}>
        <AltitudeSelectField {...{ control }} name="altitude" />

        {(!altitude || ![4000, 14000].includes(altitude)) && (
          <FormNumberField
            {...{ control }}
            label={t('forms.ticket_type.customAltitude')}
            name="altitude"
          />
        )}

        <SwitchField
          {...{ control }}
          name="isTandem"
          label={t('forms.ticket_type.tandem')}
          helperText={t('forms.ticket_type.allowAlsoManifestingAPassenger')}
        />

        <SwitchField
          {...{ control }}
          name="allowManifestingSelf"
          label={t('forms.ticket_type.publicManifesting')}
          helperText={t('forms.ticket_type.allowThisTicketToBe')}
        />
        <Divider />
        <Subheader>{t('forms.ticket_type.enabledTicketAddOns')}</Subheader>
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
            `${item.name} (${formatCents(item.costCents)})`
          }
          name="extras"
        />
      </View>
    </Stack>
  );
}
