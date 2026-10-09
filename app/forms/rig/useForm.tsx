import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import camelCase from 'lodash/camelCase';
import isEqual from 'lodash/isEqual';
import { yupResolver } from '@hookform/resolvers/yup';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import type { RigEssentialsFragment } from 'app/api/operations';
import useMutationCreateRig from 'app/api/hooks/useMutationCreateRig';
import useMutationUpdateRig from 'app/api/hooks/useMutationUpdateRig';
import { useNotifications } from 'app/providers/notifications';

export type RigFields = {
  name: string;
  make: string;
  model: string;
  serial: string;
  canopySize: number | null;
  rigType: string;
  /** Reserve repack expiry, in seconds since the epoch */
  repackExpiresAt: number | null;
};

export const rigValidation = yup.object({
  name: yup.string().default(''),
  make: yup.string().default(''),
  model: yup.string().default(''),
  serial: yup.string().default(''),
  canopySize: yup
    .number()
    .typeError('Canopy size must be a valid number')
    .nullable()
    .min(0, 'Canopy size must be a valid number')
    .default(null),
  rigType: yup.string().default('sport'),
  repackExpiresAt: yup.number().nullable().default(null),
});

export const EMPTY_FORM_VALUES: RigFields = {
  name: '',
  make: '',
  model: '',
  serial: '',
  canopySize: null,
  rigType: 'sport',
  repackExpiresAt: null,
};

export function toFormValues(rig?: RigEssentialsFragment | null): RigFields {
  if (!rig) {
    return EMPTY_FORM_VALUES;
  }
  return {
    name: rig.name || '',
    make: rig.make || '',
    model: rig.model || '',
    serial: rig.serial || '',
    canopySize: rig.canopySize ?? null,
    rigType: rig.rigType || 'sport',
    repackExpiresAt: rig.repackExpiresAt ?? null,
  };
}

export interface IUseRigFormOpts {
  /** The rig being edited; a new rig when absent */
  rig?: RigEssentialsFragment | null;
  userId?: number;
  dropzoneId?: number;
  onSuccess?(): void;
}

export default function useRigForm(opts: IUseRigFormOpts) {
  const { rig, userId, dropzoneId, onSuccess } = opts;
  const notify = useNotifications();
  const initialValues = React.useMemo(() => toFormValues(rig), [rig]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<RigFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(rigValidation) as never,
  });
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) {
      setDefaultValues(initialValues);
    }
  }, [defaultValues, initialValues]);

  const { reset, handleSubmit, setError } = methods;
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const handlers = {
    onSuccess: () => null,
    onFieldError: (field: string, message: string) => {
      const name = camelCase(field);
      if (name in EMPTY_FORM_VALUES) {
        setError(name as keyof RigFields, { type: 'server', message });
      }
    },
    onError: (message: string) => notify.error(message),
  };
  const updateRig = useMutationUpdateRig(handlers);
  const createRig = useMutationCreateRig(handlers);

  const [{ loading }, onSave] = useAsyncFn(
    async (fields: RigFields) => {
      const attributes = {
        ...fields,
        userId: userId ? Number(userId) : null,
        dropzoneId: dropzoneId ? Number(dropzoneId) : null,
      };
      const result = rig?.id
        ? await updateRig.mutate({ id: Number(rig.id), ...attributes })
        : await createRig.mutate(attributes);

      if (result && !result.errors?.length && !result.fieldErrors?.length) {
        onSuccess?.();
      }
    },
    [rig?.id, userId, dropzoneId, updateRig.mutate, createRig.mutate, onSuccess]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onSave), [handleSubmit, onSave]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
