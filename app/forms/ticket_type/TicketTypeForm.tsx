import { useTicketTypeExtrasLazyQuery } from 'app/api/reflection';
import * as React from 'react';
import { View } from 'react-native';
import { FormTextField } from 'app/components/input/text/TextField';
import { useOperatorContext } from 'app/providers/operator/context';
import { TicketTypeExtraEssentialsFragment } from 'app/api/operations';
import { Control, useWatch } from 'react-hook-form';
import { DestinationSelectField } from 'app/components/input/destination_select';
import { FormNumberField } from 'app/components/input/number_input';
import { SwitchField } from 'app/components/input/switch/Switch';
import { ChipSelectField } from 'app/components/input/chip_select';
import { TicketTypeFields } from './useForm';
import { formatCents } from 'app/utils/money';
import { useTranslation } from 'react-i18next';
import useTerms from 'app/i18n/useTerms';
import { destinationsModule } from 'app/utils/destinations';
import { limitsModule } from 'app/utils/limits';
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
  const term = useTerms();
  const destinations = destinationsModule(operator?.modules as Record<string, unknown>);
  const limits = limitsModule(operator?.modules as Record<string, unknown>);
  const [getTicketAddons, query] = useTicketTypeExtrasLazyQuery();
  const { data } = query;

  React.useEffect(() => {
    if (operator?.id) {
      getTicketAddons({ variables: { operatorId: operator?.id } });
    }
  }, [operator?.id, getTicketAddons]);

  const { extras: selectedAddons, requiresEscort } = useWatch({ control });
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
        {destinations ? (
          <DestinationSelectField
            {...{ control }}
            name="defaultDestinationId"
            label={t('forms.ticket_type.defaultDestination', {
              destination: term('destination').toLowerCase(),
            })}
            allowNone
          />
        ) : null}

        <SwitchField
          {...{ control }}
          name="requiresEscort"
          label={t('forms.ticket_type.requiresEscort', { escort: term('escort').toLowerCase() })}
          helperText={t('forms.ticket_type.allowAlsoManifestingGuests', {
            guests: term('guest', 2).toLowerCase(),
            escort: term('escort').toLowerCase(),
          })}
        />
        {requiresEscort ? (
          <FormNumberField
            {...{ control }}
            label={t('forms.ticket_type.escortCapacity', {
              guests: term('guest', 2).toLowerCase(),
              escort: term('escort').toLowerCase(),
            })}
            name="escortCapacity"
          />
        ) : null}

        {limits?.age ? (
          <>
            <FormTextField {...{ control }} label={t('forms.ticket_type.minAge')} name="minAge" />
            <FormTextField {...{ control }} label={t('forms.ticket_type.maxAge')} name="maxAge" />
          </>
        ) : null}
        {limits?.mass ? (
          <>
            <FormTextField
              {...{ control }}
              label={t('forms.ticket_type.minBodyMassKg')}
              name="minBodyMassKg"
            />
            <FormTextField
              {...{ control }}
              label={t('forms.ticket_type.maxBodyMassKg')}
              name="maxBodyMassKg"
            />
          </>
        ) : null}

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
