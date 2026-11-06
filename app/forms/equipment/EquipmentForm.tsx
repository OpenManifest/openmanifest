import * as React from 'react';
import { Control, useController, useWatch } from 'react-hook-form';

import TextInput, { FormTextField } from 'app/components/input/text/TextField';
import DatePicker from 'app/components/input/date_picker';
import ChipSelect from 'app/components/input/chip_select/ChipSelect';
import type { EquipmentKindEssentialsFragment } from 'app/api/operations';
import { useTranslation } from 'react-i18next';
import useTerms from 'app/i18n/useTerms';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import { UNIT_SYMBOLS, unitOf } from 'app/i18n/units';
import { FieldError, Stack, Subheader } from 'app/ui';
import { EquipmentFields } from './useForm';
import {
  attributesFor,
  fromInputText,
  humanize,
  labelOf,
  schemaOf,
  toInputText,
  type AttributeSpec,
} from './attributes';

export interface IEquipmentFormProps {
  control: Control<EquipmentFields>;
  /** The kinds the item can be of, and the one it is */
  kinds: EquipmentKindEssentialsFragment[];
  kind?: EquipmentKindEssentialsFragment;
  /** An item of the operator (its screens show every attribute) rather than a member's own */
  operatorOwned: boolean;
  /** Choose the kind: for a new item, when there is more than one */
  canChooseKind?: boolean;
}

function AttributeField(props: {
  control: Control<EquipmentFields>;
  name: string;
  spec: AttributeSpec;
}) {
  const { control, name, spec } = props;
  const units = useOperatorFormat((state) => state.units);
  const { field, fieldState } = useController({ name: `attributes.${name}` as const, control });
  const label = labelOf(name, spec);

  if (spec.type === 'enum') {
    return (
      <Stack gap="xs">
        <Subheader>{label}</Subheader>
        <ChipSelect<string>
          items={spec.values ?? []}
          renderItemLabel={humanize}
          value={[String(field.value ?? spec.default ?? '')].filter(Boolean)}
          onChange={([chosen]) => field.onChange(chosen)}
        />
        <FieldError>{fieldState.error?.message || ''}</FieldError>
      </Stack>
    );
  }

  if (spec.type === 'date') {
    return (
      <>
        <DatePicker
          label={label}
          value={field.value ? new Date(String(field.value)).getTime() / 1000 : 0}
          onChange={(seconds) =>
            field.onChange(new Date(seconds * 1000).toISOString().slice(0, 10))
          }
        />
        <FieldError>{fieldState.error?.message || ''}</FieldError>
      </>
    );
  }

  const numeric = spec.type === 'integer' || spec.type === 'decimal';
  const unitSymbol = spec.unit ? UNIT_SYMBOLS[unitOf(spec.unit, units)] : null;
  return (
    <TextInput
      label={unitSymbol ? `${label} (${unitSymbol})` : label}
      error={fieldState.error?.message}
      value={toInputText(spec, field.value, units)}
      keyboardType={numeric ? 'decimal-pad' : 'default'}
      onChangeText={(text) => field.onChange(fromInputText(spec, text, units))}
    />
  );
}

export default function EquipmentForm(props: IEquipmentFormProps) {
  const { t } = useTranslation(['common', 'terms']);
  const term = useTerms();
  const { control, kinds, kind, operatorOwned, canChooseKind } = props;
  const { field: kindId } = useController({ name: 'kindId', control });
  const { field: serviceDueAt, fieldState: serviceState } = useController({
    name: 'serviceDueAt',
    control,
  });
  const attributes = attributesFor(schemaOf(kind?.attributeSchema), { operatorOwned });
  // Re-rendered when the item changes its kind
  useWatch({ control, name: 'kindId' });

  return (
    <Stack gap="md">
      {canChooseKind && kinds.length > 1 ? (
        <ChipSelect<EquipmentKindEssentialsFragment>
          items={kinds}
          renderItemLabel={(item) => item.name}
          value={kind ? [kind] : []}
          isSelected={(item) => item.id === kindId.value}
          onChange={([chosen]) => (chosen ? kindId.onChange(chosen.id) : null)}
        />
      ) : null}
      <FormTextField
        {...{ control }}
        name="name"
        label={t('forms.fields.name')}
        helperText={t('forms.equipment.youCanGiveYourEquipment', {
          equipment: term('equipment').toLowerCase(),
        })}
      />
      <FormTextField
        {...{ control }}
        name="make"
        label={t('forms.equipment.make')}
        helperText={t('forms.equipment.eGJavelinMirage')}
      />
      <FormTextField
        {...{ control }}
        name="model"
        label={t('forms.fields.model')}
        helperText={t('forms.equipment.eGG41')}
      />
      <FormTextField {...{ control }} name="serial" label={t('forms.equipment.serial')} />

      {attributes.map(([name, spec]) => (
        <AttributeField key={name} {...{ control, name, spec }} />
      ))}

      {kind?.serviceIntervalDays ? (
        <>
          <DatePicker
            value={serviceDueAt.value || new Date().getTime() / 1000}
            onChange={serviceDueAt.onChange}
            label={term('service_due')}
          />
          <FieldError>{serviceState.error?.message || ''}</FieldError>
        </>
      ) : null}
    </Stack>
  );
}
