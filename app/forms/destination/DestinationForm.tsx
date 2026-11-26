import * as React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { DestinationKind } from 'app/api/schema.d';
import { FormTextField } from 'app/components/input/text/TextField';
import { FormNumberField } from 'app/components/input/number_input';
import { FormSegmented, FormSelect, Stack } from 'app/ui';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import useTerms from 'app/i18n/useTerms';
import { UNIT_SYMBOLS, unitOf } from 'app/i18n/units';
import { DestinationFields } from './useForm';
import type { RankOption } from './ranks';

const ANYONE = '';

export interface IDestinationFormProps {
  control: Control<DestinationFields>;
  /** The kinds the operator may create (the destinations module of its template) */
  kinds: DestinationKind[];
  /** The ranks a place can ask for (the operator's certifications module); none: the field does not show */
  ranks?: RankOption[];
}

export default function DestinationForm({ control, kinds, ranks = [] }: IDestinationFormProps) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const kind = useWatch({ control, name: 'kind' });
  const units = useOperatorFormat((state) => state.units);

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
          name="altitude"
          label={t('forms.destination.altitude')}
          unit={UNIT_SYMBOLS[unitOf('altitude', units)]}
          step={500}
          min={0}
        />
      ) : null}
      {kind === DestinationKind.Site && units.depth ? (
        <FormNumberField
          {...{ control }}
          name="maxDepth"
          testID="destination-max-depth"
          label={t('forms.destination.maxDepth')}
          unit={UNIT_SYMBOLS[unitOf('depth', units)]}
          step={1}
          min={0}
        />
      ) : null}
      {kind !== DestinationKind.Altitude && ranks.length ? (
        <FormSelect
          {...{ control }}
          name="minCertificationRank"
          testID="destination-min-rank"
          label={t('forms.destination.minCertification', {
            certification: term('certification').toLowerCase(),
          })}
          helperText={t('forms.destination.minCertificationHelp')}
          options={[{ value: ANYONE, label: t('forms.destination.anyone') }, ...ranks]}
        />
      ) : null}
    </Stack>
  );
}
