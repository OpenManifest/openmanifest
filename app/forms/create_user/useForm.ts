import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  CertificationBodyEssentialsFragment,
  CertificationLevelDetailsFragment,
  RoleEssentialsFragment,
  UserEssentialsFragment,
} from 'app/api/operations';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOperatorContext } from 'app/providers/operator/context';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { camelCase, isEqual } from 'lodash';
import { useUserProfile } from 'app/api/crud';
import { useNotifications } from 'app/providers/notifications';
import withDefaults from 'app/forms/initialValues';
import i18n from 'app/i18n';

export type UserFields = {
  id?: string | null;
  name: string;
  phone?: string | null;
  certificationBodyUid?: string | null;
  nickname: string;
  email: string;
  bodyMassKg: number;
  certificationBody?: CertificationBodyEssentialsFragment;
  certificationLevel?: CertificationLevelDetailsFragment;
  role?: RoleEssentialsFragment;
};

export const ghostValidation = yup.object({
  id: yup.string().nullable().default(null),
  name: yup.string().required(() => i18n.t('forms.create_user.nameIsRequired')),
  nickname: yup.string().optional().nullable(),
  email: yup.string().required(() => i18n.t('forms.create_user.emailIsRequiredToInviteThe')),
  phone: yup.string().optional().nullable(),
  certificationBodyUid: yup.string().optional().nullable(),
  bodyMassKg: yup
    .number()
    .required(() => i18n.t('forms.create_user.exitWeightIsRequired'))
    .min(40, () => i18n.t('forms.create_user.exitWeightMustBeMoreThan'))
    .default(50),
  certificationBody: yup
    .object()
    .required(() => i18n.t('forms.create_user.certificationBodyMustBeSelected')),
  certificationLevel: yup
    .object()
    .required(() => i18n.t('forms.create_user.allJumpersMustHaveACertificationLevel')),
  role: yup.object().required(() => i18n.t('forms.create_user.youMustSelectARole')),
});

export const EMPTY_FORM_VALUES: Partial<UserFields> = {
  name: '',
  nickname: '',
  email: '',
  role: undefined,
  certificationLevel: undefined,
  bodyMassKg: 50,
  certificationBody: undefined,
  id: null,
  phone: '',
  certificationBodyUid: null,
};

export interface IUseUserFormOpts {
  initial?: Partial<UserFields>;
  onSuccess?(user: UserEssentialsFragment): void;
}

export default function useUserForm(opts: IUseUserFormOpts) {
  const { initial, onSuccess } = opts;
  const initialValues = React.useMemo(() => withDefaults(EMPTY_FORM_VALUES, initial), [initial]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<UserFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(ghostValidation),
  });
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) {
      setDefaultValues(initialValues);
    }
  }, [defaultValues, initialValues]);
  const { reset, register } = methods;
  React.useEffect(() => {
    register('id');
    register('certificationLevel');
    register('certificationBody');
    register('role');
  }, [register]);

  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { handleSubmit, setError } = methods;
  const {
    operator: { operator },
  } = useOperatorContext();
  const { create } = useUserProfile();
  const notify = useNotifications();

  const [{ loading }, createUser] = useAsyncFn(
    async (fields: UserFields) => {
      if (!operator?.id) {
        return;
      }
      const validated = await ghostValidation.validate(fields, { abortEarly: false });
      try {
        const response = await create({
          operator: Number(operator.id),
          email: validated.email,
          name: validated.name,
          bodyMassKg: validated.bodyMassKg,
          role: Number(validated.role?.id),
          certificationLevel: Number(validated?.certificationLevel?.id),
          certificationBodyNumber: validated?.certificationBodyUid,
          phone: validated?.phone,
        });
        if (response) {
          if ('fieldErrors' in response) {
            response.fieldErrors?.forEach(({ field, message }) => {
              const camelizedField = camelCase(field);
              if (Object.keys(defaultValues).includes(camelizedField)) {
                setError(camelizedField as keyof typeof defaultValues, { message });
              }
            });
          }
          if ('user' in response && response.user) {
            notify.success(`${validated.name} has been invited`);
            onSuccess?.(response.user);
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [operator?.id, setError, notify, defaultValues, create]
  );

  const { control, setValue } = methods;
  const { certificationBody, certificationLevel } = useWatch({ control });

  React.useEffect(() => {
    if (
      certificationLevel?.certificationBody &&
      certificationLevel?.certificationBody?.id !== certificationBody?.id
    ) {
      setValue(
        'certificationBody',
        certificationLevel.certificationBody as CertificationBodyEssentialsFragment
      );
    }
  }, [certificationBody?.id, certificationLevel?.certificationBody, setValue]);

  const onSubmit = React.useMemo(() => handleSubmit(createUser), [createUser, handleSubmit]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
