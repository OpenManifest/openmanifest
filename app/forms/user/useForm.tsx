import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import camelCase from 'lodash/camelCase';
import isEqual from 'lodash/isEqual';
import { yupResolver } from '@hookform/resolvers/yup';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import type {
  MembershipDetailsFragment,
  CertificationBodyEssentialsFragment,
  CertificationLevelDetailsFragment,
} from 'app/api/operations';
import { MembershipProfileDocument, useJoinCertificationBodyMutation } from 'app/api/reflection';
import useMutationUpdateUser from 'app/api/hooks/useMutationUpdateUser';
import { useNotifications } from 'app/providers/notifications';
import i18n from 'app/i18n';

export type UserFields = {
  name: string;
  nickname: string;
  email: string;
  phone: string;
  bodyMassKg: number;
  certificationBody: CertificationBodyEssentialsFragment | null;
  certificationLevel: CertificationLevelDetailsFragment | null;
  apfNumber: string;
};

export const userValidation = yup.object({
  name: yup
    .string()
    .trim()
    .required(() => i18n.t('forms.user.nameIsRequired')),
  nickname: yup.string().default(''),
  email: yup
    .string()
    .trim()
    .email(() => i18n.t('forms.user.notAValidEmail'))
    .required(() => i18n.t('forms.user.emailIsRequired')),
  phone: yup.string().default(''),
  bodyMassKg: yup
    .number()
    .typeError(() => i18n.t('forms.user.exitWeightMustBeAValid'))
    .required(() => i18n.t('forms.user.exitWeightIsRequired'))
    .moreThan(30, () => i18n.t('forms.user.exitWeightSeemsTooLow')),
  certificationBody: yup.object().nullable().default(null),
  certificationLevel: yup.object().nullable().default(null),
  apfNumber: yup.string().default(''),
});

export const EMPTY_FORM_VALUES: UserFields = {
  name: '',
  nickname: '',
  email: '',
  phone: '',
  bodyMassKg: 60,
  certificationBody: null,
  certificationLevel: null,
  apfNumber: '',
};

/** The form values for editing an operator user: the user's details, plus the licence they hold at this operator. */
export function toFormValues(membership?: MembershipDetailsFragment | null): UserFields {
  if (!membership) {
    return EMPTY_FORM_VALUES;
  }
  const { user, certificationLevel } = membership;
  const userCertification = user?.userCertifications?.find(
    ({ certificationBody }) => certificationBody.id === certificationLevel?.certificationBody?.id
  );

  return {
    name: user?.name || '',
    nickname: user?.nickname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bodyMassKg: Number(user?.bodyMassKg) || EMPTY_FORM_VALUES.bodyMassKg,
    certificationBody: certificationLevel?.certificationBody || null,
    certificationLevel: certificationLevel || null,
    apfNumber: userCertification?.uid || '',
  };
}

export interface IUseUserFormOpts {
  membership?: MembershipDetailsFragment | null;
  onSuccess?(): void;
}

export default function useUserForm(opts: IUseUserFormOpts) {
  const { membership, onSuccess } = opts;
  const notify = useNotifications();
  const initialValues = React.useMemo(() => toFormValues(membership), [membership]);
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

  const [joinCertificationBody] = useJoinCertificationBodyMutation();
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
      refetchQueries: membership?.id
        ? [{ query: MembershipProfileDocument, variables: { membershipId: membership.id } }]
        : [],
    },
  });
  const { mutate } = mutationUpdateUser;

  const [{ loading }, onSave] = useAsyncFn(
    async (fields: UserFields) => {
      const result = await mutate({
        membership: membership?.id,
        name: fields.name,
        certificationLevel: !fields.certificationLevel?.id
          ? null
          : Number(fields.certificationLevel.id),
        phone: fields.phone,
        bodyMassKg: fields.bodyMassKg,
        email: fields.email,
      });
      if (!result || result.errors?.length || result.fieldErrors?.length) {
        return;
      }

      // TODO: Set APF number from userCertification belonging to currentOperator.certificationBody
      // and compare against that
      const selectedCertificationLevelCertificationBody =
        membership?.user?.userCertifications?.find(
          ({ certificationBody }) =>
            certificationBody.slug === fields.certificationLevel?.certificationBody?.slug
        );
      if (
        (fields.certificationLevel?.id &&
          selectedCertificationLevelCertificationBody?.certificationLevel?.id !==
            fields.certificationLevel.id) ||
        (fields.apfNumber && fields.apfNumber !== selectedCertificationLevelCertificationBody?.uid)
      ) {
        await joinCertificationBody({
          variables: {
            certificationBody:
              fields.certificationLevel?.certificationBody?.id?.toString() as string,
            uid: fields.apfNumber,
            certificationLevel: fields.certificationLevel?.id,
          },
        });
      }
      notify.success(i18n.t('forms.user.profileHasBeenUpdated'));
      onSuccess?.();
    },
    [membership, joinCertificationBody, mutate, notify, onSuccess]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onSave), [handleSubmit, onSave]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
