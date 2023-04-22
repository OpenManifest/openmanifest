import { useCallback, useState } from 'react';
import { DeepPartial, FieldPath, FieldValues, Merge, useForm as useHookForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import concat from 'lodash/concat';
import { useMemo } from '../react';

export interface IUseFormOpts<T extends FieldValues> {
  validation?: yup.ObjectSchema<T>;
  initial?: DeepPartial<T>;
  onSubmit(fields: T): Promise<void> | void;
  onSuccess?(): void | Promise<void>;
}
export interface IUseFormReturn<T extends FieldValues> extends ReturnType<typeof useHookForm<T>> {
  loading: boolean;
  onSubmit(): Promise<void>;
}

export function useForm<T extends FieldValues>(opts: IUseFormOpts<T>): IUseFormReturn<T> {
  const { onSubmit: onOuterSubmit, onSuccess, validation, initial } = opts;
  const [loading, setLoading] = useState(false);
  const form = useHookForm<T>({
    resolver: validation ? yupResolver(validation) : undefined,
    defaultValues: initial || undefined,
  });

  const { handleSubmit } = form;

  const onSubmit = useMemo(() =>
    handleSubmit(
      async (fields: T) => {
        setLoading(true);
        try {
          await onOuterSubmit(fields);
          onSuccess?.();
        } finally {
          setLoading(false);
        }
      }), [handleSubmit, onOuterSubmit, onSuccess]);

  return useMemo(() => ({ ...form, loading, onSubmit }), [form, loading, onSubmit]);
}

