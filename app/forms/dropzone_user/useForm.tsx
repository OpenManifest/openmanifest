import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import isEqual from 'lodash/isEqual';
import { yupResolver } from '@hookform/resolvers/yup';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import type { DropzoneUserEssentialsFragment, RoleEssentialsFragment } from 'app/api/operations';
import { useUpdateDropzoneUserMutation } from 'app/api/reflection';
import { useNotifications } from 'app/providers/notifications';

export type DropzoneUserFields = {
  role: RoleEssentialsFragment | null;
  /** Membership expiry, in seconds since the epoch */
  expiresAt: number | null;
};

export const dropzoneUserValidation = yup.object({
  role: yup.object().nullable().required('User must have an access level'),
  expiresAt: yup.number().nullable().required('Membership expiry must be set'),
});

export const EMPTY_FORM_VALUES: DropzoneUserFields = { role: null, expiresAt: null };

export function toFormValues(dropzoneUser?: DropzoneUserEssentialsFragment | null) {
  return {
    role: dropzoneUser?.role || null,
    expiresAt: dropzoneUser?.expiresAt ?? null,
  } satisfies DropzoneUserFields;
}

/** Server field names, as the API reports them */
const FIELD_OF_SERVER_FIELD: Record<string, keyof DropzoneUserFields> = {
  user_role: 'role',
  expires_at: 'expiresAt',
};

export interface IUseDropzoneUserFormOpts {
  dropzoneUser?: DropzoneUserEssentialsFragment | null;
  onSuccess?(dropzoneUser: DropzoneUserEssentialsFragment): void;
}

export default function useDropzoneUserForm(opts: IUseDropzoneUserFormOpts) {
  const { dropzoneUser, onSuccess } = opts;
  const notify = useNotifications();
  const initialValues = React.useMemo(() => toFormValues(dropzoneUser), [dropzoneUser]);
  const [defaultValues, setDefaultValues] = React.useState<DropzoneUserFields>(initialValues);

  const methods = useForm<DropzoneUserFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(dropzoneUserValidation) as never,
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

  const [mutationUpdateDropzoneUser, { loading }] = useUpdateDropzoneUserMutation();

  const [, onSave] = useAsyncFn(
    async (fields: DropzoneUserFields) => {
      try {
        const response = await mutationUpdateDropzoneUser({
          variables: {
            dropzoneUserId: dropzoneUser?.id as string,
            attributes: {
              userRoleId: Number(fields.role?.id),
              expiresAt: fields.expiresAt,
            },
          },
        });
        const result = response.data?.updateDropzoneUser;

        result?.fieldErrors?.forEach(({ field, message }) => {
          const name = FIELD_OF_SERVER_FIELD[field];
          if (name) {
            setError(name, { type: 'server', message });
          }
        });
        if (result?.errors?.length) {
          notify.error(result.errors[0]);
          return;
        }
        if (!result?.fieldErrors?.length && result?.dropzoneUser) {
          onSuccess?.(result.dropzoneUser);
        }
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [dropzoneUser?.id, mutationUpdateDropzoneUser, notify, onSuccess, setError]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onSave), [handleSubmit, onSave]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
