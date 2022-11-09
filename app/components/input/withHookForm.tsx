import * as React from 'react';
import { Controller, ControllerProps, FieldValues, Path } from 'react-hook-form';

interface IMinimalHookFormProps<V> {
  error?: string | null;
  value?: V;
  onChange?(value: V): void;
}

export function withHookForm<BaseProps extends object, Value = unknown>(
  Component: React.ComponentType<BaseProps>
) {
  return function WithHookForm<Fields extends FieldValues, TName extends Path<Fields>>(
    props: Omit<BaseProps, 'value' | 'onChange' | 'error'> &
      Pick<ControllerProps<Fields, TName>, 'control' | 'name' | 'rules' | 'defaultValue'>
  ) {
    const { control, name, rules, defaultValue, ...rest } = props;

    return (
      <Controller
        {...{ control, name, rules }}
        render={({ field: { onChange, onBlur, value }, formState: { errors } }) => (
          <Component
            {...(rest as BaseProps)}
            {...{ value, onChange, onBlur }}
            error={errors?.[name]?.message}
          />
        )}
      />
    );
  };
}
