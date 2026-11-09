import * as React from 'react';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import { UNIT_SYMBOLS, fromSi, toSi, unitOf } from 'app/i18n/units';
import UiNumberField, {
  type NumberFieldProps as UiNumberFieldProps,
} from 'app/ui/components/form/NumberField';

export enum NumberFieldType {
  Cash = 'cash',
  Weight = 'weight',
}

type INumberFieldProps = Omit<UiNumberFieldProps, 'label' | 'onChange' | 'unit' | 'prefix'> & {
  label?: string;
  /** What the number is: a price (the currency sign before it), a weight (the operator's mass unit after it) */
  variant?: NumberFieldType | null;
  unit?: string;
  /** Called with each number within min and max; text that is not a number, and an emptied field, call nothing */
  onChange(newValue: number): void;
  /** Ignored: kept so existing call sites compile */
  mode?: 'flat' | 'outlined';
};

const UNIT: Partial<Record<NumberFieldType, string>> = {
  [NumberFieldType.Weight]: 'kg',
};

const round1 = (value: number) => Math.round(value * 10) / 10;

/** "$", "NZ$", "€": what goes before a price in the currency of the operator */
function currencySymbol(currency: string) {
  return (
    new Intl.NumberFormat('en-AU', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value ?? currency
  );
}

/**
 * The number field of the design system under the props this one has always had. A weight is a number of kilograms to the
 * form and the API, and is shown and typed in the operator's mass unit; a price has the symbol of the operator's currency.
 */
export default function NumberField({
  label,
  variant,
  unit,
  onChange,
  mode: _mode,
  step = 0.5,
  value,
  ...rest
}: INumberFieldProps) {
  const units = useOperatorFormat((state) => state.units);
  const currency = useOperatorFormat((state) => state.currency);
  const massUnit = unitOf('mass', units);
  const isWeight = variant === NumberFieldType.Weight;
  const toShown = (kg: number) => (isWeight ? round1(fromSi('mass', kg, massUnit)) : kg);
  const fromShown = (shown: number) =>
    isWeight ? Math.round(toSi('mass', shown, massUnit) * 100) / 100 : shown;
  const shownUnit = isWeight ? UNIT_SYMBOLS[massUnit] : variant ? UNIT[variant] : undefined;

  return (
    <UiNumberField
      {...rest}
      value={value == null ? value : toShown(value)}
      min={rest.min == null ? undefined : toShown(rest.min)}
      max={rest.max == null ? undefined : toShown(rest.max)}
      step={step}
      label={label ?? ''}
      unit={unit ?? shownUnit}
      prefix={variant === NumberFieldType.Cash ? currencySymbol(currency) : undefined}
      onChange={(next) => {
        if (next == null) return;
        onChange(
          Math.min(
            rest.max ?? Number.POSITIVE_INFINITY,
            Math.max(rest.min ?? Number.NEGATIVE_INFINITY, fromShown(next))
          )
        );
      }}
    />
  );
}
