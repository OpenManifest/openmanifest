import * as React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { DestinationKind } from 'app/api/schema.d';
import { FormTextField } from 'app/components/input/text/TextField';
import { FormNumberField } from 'app/components/input/number_input';
import { FormSegmented, Stack } from 'app/ui';
import { DestinationFields } from './useForm';

export interface IDestinationFormProps {
  control: Control<DestinationFields>;
  /** The kinds the operator may create (the destinations module of its template) */
  kinds: DestinationKind[];
}

export default function DestinationForm({ control, kinds }: IDestinationFormProps) {
  const { t } = useTranslation('common');
  const kind = useWatch({ control, name: 'kind' });

  return (
    <Stack gap="md">
      <FormTextField {...{ control }} name="name" label={t('forms.destination.name')} />
      {kinds.length > 1 ? (
        <FormSegmented
          {...{ control }}
          name="kind"
          label={t('forms.destination.kind')}
          options={kinds.map((value) => ({ value, label: t(`forms.destination.kinds.${value}`) }))}
        />
      ) : null}
      {kind === DestinationKind.Altitude ? (
        <FormNumberField
          {...{ control }}
          name="altitudeFt"
          label={t('forms.destination.altitudeFt')}
          unit="ft"
          step={500}
          min={0}
        />
      ) : null}
    </Stack>
  );
}
