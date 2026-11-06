import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { camelCase, isEqual } from 'lodash';
import { CrewRoleEssentialsFragment } from 'app/api/operations';
import { CrewRoleScope } from 'app/api/schema.d';
import { useCrewRoles } from 'app/api/crud';
import { useNotifications } from 'app/providers/notifications';
import withDefaults from 'app/forms/initialValues';
import i18n from 'app/i18n';
import { ANYONE, crewRoleKey } from './key';

export type CrewRoleFields = {
  id?: string;
  name: string;
  scope: CrewRoleScope;
  required: boolean;
  occupiesSlot: boolean;
  /** What a member needs to fill the role; `ANYONE`: any member of the operator */
  permission: string;
};

export const crewRoleValidation = yup.object({
  id: yup.string().nullable().default(null),
  name: yup
    .string()
    .trim()
    .required(() => i18n.t('forms.crew_role.nameIsRequired')),
  scope: yup.mixed<CrewRoleScope>().oneOf(Object.values(CrewRoleScope)).required(),
  required: yup.boolean().default(false),
  occupiesSlot: yup.boolean().default(false),
  permission: yup.string().default(ANYONE),
});

export const EMPTY_FORM_VALUES: Partial<CrewRoleFields> = {
  name: '',
  scope: CrewRoleScope.Load,
  required: false,
  occupiesSlot: false,
  permission: ANYONE,
};

export interface IUseCrewRoleFormOpts {
  initial?: Partial<CrewRoleFields>;
  onSuccess?(crewRole: CrewRoleEssentialsFragment): void;
}

const FIELDS = ['name', 'scope', 'required', 'occupiesSlot', 'permission'] as const;

export default function useCrewRoleForm({ initial, onSuccess }: IUseCrewRoleFormOpts) {
  const notify = useNotifications();
  const initialValues = React.useMemo(() => withDefaults(EMPTY_FORM_VALUES, initial), [initial]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<CrewRoleFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(crewRoleValidation) as never,
  });
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) setDefaultValues(initialValues);
  }, [defaultValues, initialValues]);

  const { reset, register, handleSubmit, setError } = methods;
  React.useEffect(() => {
    register('id');
  }, [register]);
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { crewRoles, create, update } = useCrewRoles();

  const [{ loading }, onSave] = useAsyncFn(
    async (fields: CrewRoleFields) => {
      const validated = await crewRoleValidation.validate(fields, { abortEarly: false });
      const attributes = {
        name: validated.name.trim(),
        scope: validated.scope,
        required: validated.required,
        occupiesSlot: validated.occupiesSlot,
        permission: validated.permission === ANYONE ? null : validated.permission,
      };
      try {
        const response = fields.id
          ? await update(Number(fields.id), attributes)
          : await create({
              ...attributes,
              key: crewRoleKey(
                attributes.name,
                crewRoles.map((role) => role.key)
              ),
              position: crewRoles.length,
            });

        if ('fieldErrors' in response) {
          response.fieldErrors?.forEach(({ field, message }) => {
            const name = camelCase(field) === 'key' ? 'name' : camelCase(field);
            if ((FIELDS as readonly string[]).includes(name)) {
              setError(name as (typeof FIELDS)[number], { message });
            }
          });
        }
        if ('error' in response && response.error) notify.error(response.error);
        if ('crewRole' in response && response.crewRole) {
          notify.success(i18n.t('forms.crew_role.saved', { name: response.crewRole.name }));
          onSuccess?.(response.crewRole);
        }
      } catch (error) {
        if (error instanceof Error) notify.error(error.message);
      }
    },
    [setError, notify, onSuccess, create, update, crewRoles]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onSave), [handleSubmit, onSave]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
