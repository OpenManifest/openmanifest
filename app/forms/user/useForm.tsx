import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import camelCase from 'lodash/camelCase';
import isEqual from 'lodash/isEqual';
import { yupResolver } from '@hookform/resolvers/yup';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import type {
  DropzoneUserDetailsFragment,
  FederationEssentialsFragment,
  LicenseDetailsFragment,
} from 'app/api/operations';
import { DropzoneUserProfileDocument, useJoinFederationMutation } from 'app/api/reflection';
import useMutationUpdateUser from 'app/api/hooks/useMutationUpdateUser';
import { useNotifications } from 'app/providers/notifications';

export type UserFields = {
  name: string;
  nickname: string;
  email: string;
  phone: string;
  exitWeight: number;
  federation: FederationEssentialsFragment | null;
  license: LicenseDetailsFragment | null;
  apfNumber: string;
};

export const userValidation = yup.object({
  name: yup.string().trim().required('Name is required'),
  nickname: yup.string().default(''),
  email: yup.string().trim().email('Not a valid email').required('Email is required'),
  phone: yup.string().default(''),
  exitWeight: yup
    .number()
    .typeError('Exit weight must be a valid number')
    .required('Exit weight is required')
    .moreThan(30, 'Exit weight seems too low?'),
  federation: yup.object().nullable().default(null),
  license: yup.object().nullable().default(null),
  apfNumber: yup.string().default(''),
});

export const EMPTY_FORM_VALUES: UserFields = {
  name: '',
  nickname: '',
  email: '',
  phone: '',
  exitWeight: 60,
  federation: null,
  license: null,
  apfNumber: '',
};

/** The form values for editing a dropzone user: the user's details, plus the licence they hold at this dropzone. */
export function toFormValues(dropzoneUser?: DropzoneUserDetailsFragment | null): UserFields {
  if (!dropzoneUser) {
    return EMPTY_FORM_VALUES;
  }
  const { user, license } = dropzoneUser;
  const userFederation = user?.userFederations?.find(
    ({ federation }) => federation.id === license?.federation?.id
  );

  return {
    name: user?.name || '',
    nickname: user?.nickname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    exitWeight: Number(user?.exitWeight) || EMPTY_FORM_VALUES.exitWeight,
    federation: license?.federation || null,
    license: license || null,
    apfNumber: userFederation?.uid || '',
  };
}

export interface IUseUserFormOpts {
  dropzoneUser?: DropzoneUserDetailsFragment | null;
  onSuccess?(): void;
}

export default function useUserForm(opts: IUseUserFormOpts) {
  const { dropzoneUser, onSuccess } = opts;
  const notify = useNotifications();
  const initialValues = React.useMemo(() => toFormValues(dropzoneUser), [dropzoneUser]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<UserFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(userValidation) as never,
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

  const [joinFederation] = useJoinFederationMutation();
  const mutationUpdateUser = useMutationUpdateUser({
    onSuccess: () => null,
    onFieldError: (field, message) => {
      const name = camelCase(field);
      if (name in EMPTY_FORM_VALUES) {
        setError(name as keyof UserFields, { type: 'server', message });
      }
    },
    onError: (error) => notify.error(error),
    mutation: {
      refetchQueries: dropzoneUser?.id
        ? [{ query: DropzoneUserProfileDocument, variables: { dropzoneUserId: dropzoneUser.id } }]
        : [],
    },
  });
  const { mutate } = mutationUpdateUser;

  const [{ loading }, onSave] = useAsyncFn(
    async (fields: UserFields) => {
      const result = await mutate({
        dropzoneUser: dropzoneUser?.id,
        name: fields.name,
        license: !fields.license?.id ? null : Number(fields.license.id),
        phone: fields.phone,
        exitWeight: fields.exitWeight,
        email: fields.email,
      });
      if (!result || result.errors?.length || result.fieldErrors?.length) {
        return;
      }

      // TODO: Set APF number from userFederation belonging to currentDropzone.federation
      // and compare against that
      const selectedLicenseFederation = dropzoneUser?.user?.userFederations?.find(
        ({ federation }) => federation.slug === fields.license?.federation?.slug
      );
      if (
        (fields.license?.id && selectedLicenseFederation?.license?.id !== fields.license.id) ||
        (fields.apfNumber && fields.apfNumber !== selectedLicenseFederation?.uid)
      ) {
        await joinFederation({
          variables: {
            federation: fields.license?.federation?.id?.toString() as string,
            uid: fields.apfNumber,
            license: fields.license?.id,
          },
        });
      }
      notify.success('Profile has been updated');
      onSuccess?.();
    },
    [dropzoneUser, joinFederation, mutate, notify, onSuccess]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onSave), [handleSubmit, onSave]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
