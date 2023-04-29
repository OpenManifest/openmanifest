import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  FederationEssentialsFragment,
  LicenseDetailsFragment,
  RoleEssentialsFragment,
  UserEssentialsFragment,
} from 'app/api/operations';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { camelCase, isEqual } from 'lodash';
import { useUserProfile } from 'app/api/crud';
import { useNotifications } from 'app/providers/notifications';

export type UserFields = {
  id?: string | null;
  name: string;
  phone?: string | null;
  federationUid?: string | null;
  nickname: string;
  email: string;
  exitWeight: number;
  federation?: FederationEssentialsFragment;
  license?: LicenseDetailsFragment;
  role?: RoleEssentialsFragment;
};

export const ghostValidation = yup.object({
  id: yup.string().nullable().default(null),
  name: yup.string().required('Name is required'),
  nickname: yup.string().optional().nullable(),
  email: yup.string().required('Email is required to invite the user'),
  phone: yup.string().optional().nullable(),
  federationUid: yup.string().optional().nullable(),
  exitWeight: yup
    .number()
    .required('Exit weight is required')
    .min(40, 'Exit weight must be more than 40kg')
    .default(50),
  federation: yup.object().required('Federation must be selected'),
  license: yup.object().required('All jumpers must have a license'),
  role: yup.object().required('You must select a role'),
});

export const EMPTY_FORM_VALUES: Partial<UserFields> = {
  name: '',
  nickname: '',
  email: '',
  role: undefined,
  license: undefined,
  exitWeight: 50,
  federation: undefined,
  id: null,
  phone: '',
  federationUid: null,
};

export interface IUseUserFormOpts {
  initial?: Partial<UserFields>;
  onSuccess?(user: UserEssentialsFragment): void;
}

export default function useUserForm(opts: IUseUserFormOpts) {
  const { initial, onSuccess } = opts;
  const initialValues = React.useMemo(() => ({ ...EMPTY_FORM_VALUES, ...initial }), [initial]);
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
    register('license');
    register('federation');
    register('role');
  }, [register]);

  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { handleSubmit, setError } = methods;
  const {
    dropzone: { dropzone },
  } = useDropzoneContext();
  const { create } = useUserProfile();
  const notify = useNotifications();

  const [{ loading }, createUser] = useAsyncFn(
    async (fields: UserFields) => {
      if (!dropzone?.id) {
        return;
      }
      const validated = await ghostValidation.validate(fields, { abortEarly: false });
      try {
        const response = await create({
          dropzone: Number(dropzone.id),
          email: validated.email,
          name: validated.name,
          exitWeight: validated.exitWeight,
          role: Number(validated.role?.id),
          license: Number(validated?.license?.id),
          federationNumber: validated?.federationUid,
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
    [dropzone?.id, setError, notify, defaultValues, create]
  );

  const { control, setValue } = methods;
  const { federation, license } = useWatch({ control });

  React.useEffect(() => {
    if (license?.federation && license?.federation?.id !== federation?.id) {
      setValue('federation', license.federation as FederationEssentialsFragment);
    }
  }, [federation?.id, license?.federation, setValue]);

  const onSubmit = React.useMemo(() => handleSubmit(createUser), [createUser, handleSubmit]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
