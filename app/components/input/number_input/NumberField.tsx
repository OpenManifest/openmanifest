import * as React from 'react';
import UiNumberField, {
  type NumberFieldProps as UiNumberFieldProps,
} from 'app/ui/components/form/NumberField';

export enum NumberFieldType {
  Cash = 'cash',
  Weight = 'weight',
  CanopySize = 'canopySize',
}

type INumberFieldProps = Omit<UiNumberFieldProps, 'label' | 'onChange' | 'unit' | 'prefix'> & {
  label?: string;
  /** What the number is: a price ($ before it), a weight (kg after it) or a canopy size (ft after it) */
  variant?: NumberFieldType | null;
  unit?: string;
  /** Called with each number within min and max; text that is not a number, and an emptied field, call nothing */
  onChange(newValue: number): void;
  /** Ignored: kept so existing call sites compile */
  mode?: 'flat' | 'outlined';
};

const UNIT: Partial<Record<NumberFieldType, string>> = {
  [NumberFieldType.Weight]: 'kg',
  [NumberFieldType.CanopySize]: 'ft',
};

/** The number field of the design system under the props this one has always had */
export default function NumberField({
  label,
  variant,
  unit,
  onChange,
  mode: _mode,
  step = 0.5,
  ...rest
}: INumberFieldProps) {
  return (
    <UiNumberField
      {...rest}
      step={step}
      label={label ?? ''}
      unit={unit ?? (variant ? UNIT[variant] : undefined)}
      prefix={variant === NumberFieldType.Cash ? '$' : undefined}
      onChange={(next) => {
        if (next == null) return;
        onChange(
          Math.min(
            rest.max ?? Number.POSITIVE_INFINITY,
            Math.max(rest.min ?? Number.NEGATIVE_INFINITY, next)
          )
        );
      }}
    />
  );
}
