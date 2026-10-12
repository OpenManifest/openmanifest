import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import isEqual from 'lodash/isEqual';
import { yupResolver } from '@hookform/resolvers/yup';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import type { MembershipEssentialsFragment, RoleEssentialsFragment } from 'app/api/operations';
import { useUpdateMembershipMutation } from 'app/api/reflection';
import { useNotifications } from 'app/providers/notifications';

export type MembershipFields = {
  role: RoleEssentialsFragment | null;
  /** Membership expiry, in seconds since the epoch */
  expiresAt: number | null;
};

export const membershipValidation = yup.object({
  role: yup.object().nullable().required('User must have an access level'),
  expiresAt: yup.number().nullable().required('Membership expiry must be set'),
});

export const EMPTY_FORM_VALUES: MembershipFields = { role: null, expiresAt: null };

export function toFormValues(membership?: MembershipEssentialsFragment | null) {
  return {
    role: membership?.role || null,
    expiresAt: membership?.expiresAt ?? null,
  } satisfies MembershipFields;
}

/** Server field names, as the API reports them */
const FIELD_OF_SERVER_FIELD: Record<string, keyof MembershipFields> = {
  user_role: 'role',
  expires_at: 'expiresAt',
};

export interface IUseMembershipFormOpts {
  membership?: MembershipEssentialsFragment | null;
  onSuccess?(membership: MembershipEssentialsFragment): void;
}

export default function useMembershipForm(opts: IUseMembershipFormOpts) {
  const { membership, onSuccess } = opts;
  const notify = useNotifications();
  const initialValues = React.useMemo(() => toFormValues(membership), [membership]);
  const [defaultValues, setDefaultValues] = React.useState<MembershipFields>(initialValues);

  const methods = useForm<MembershipFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(membershipValidation) as never,
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

  const [mutationUpdateMembership, { loading }] = useUpdateMembershipMutation();

  const [, onSave] = useAsyncFn(
    async (fields: MembershipFields) => {
      try {
        const response = await mutationUpdateMembership({
          variables: {
            membershipId: membership?.id as string,
            attributes: {
              userRoleId: Number(fields.role?.id),
              expiresAt: fields.expiresAt,
            },
          },
        });
        const result = response.data?.updateMembership;

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
        if (!result?.fieldErrors?.length && result?.membership) {
          onSuccess?.(result.membership);
        }
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [membership?.id, mutationUpdateMembership, notify, onSuccess, setError]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onSave), [handleSubmit, onSave]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
