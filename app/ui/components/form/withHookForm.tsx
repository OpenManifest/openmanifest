import * as React from 'react';
import { Controller, type ControllerProps, type FieldValues, type Path } from 'react-hook-form';

/**
 * Makes `Component` a form field: `control` and `name` instead of `value`, `onChange` and `error`. The validation message
 * of the field becomes its `error`, which the component announces to screen readers.
 */
export function withHookForm<Props extends object>(Component: React.ComponentType<Props>) {
  return function WithHookForm<Fields extends FieldValues, TName extends Path<Fields>>(
    props: Omit<Props, 'value' | 'onChange' | 'onBlur' | 'error'> &
      Pick<ControllerProps<Fields, TName>, 'control' | 'name' | 'rules'>
  ) {
    const { control, name, rules, ...rest } = props;

    return (
      <Controller
        {...{ control, name, rules }}
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Component
            {...(rest as unknown as Props)}
            {...({ value, onBlur, onChange, error: fieldState?.error?.message } as object)}
          />
        )}
      />
    );
  };
}
