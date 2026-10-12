import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import camelCase from 'lodash/camelCase';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOperatorContext } from 'app/providers/operator/context';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { isEqual } from 'lodash';
import { OperatorInput, Permission } from 'app/api/schema.d';
import { useNotifications } from 'app/providers/notifications';
import { OperatorEssentialsFragment, FederationEssentialsFragment } from 'app/api/operations';
import { useFederationsQuery } from 'app/api/reflection';
import useRestriction from 'app/hooks/useRestriction';

export type OperatorFields = Required<
  Omit<OperatorInput, 'settings' | 'federation' | 'id'> &
    OperatorInput['settings'] & { id: number; federation: FederationEssentialsFragment | null }
>;

export const operatorValidation = yup.object({
  name: yup.string().nullable().default(null),
  federation: yup.object().required('Your dropzone must be part of a federation'),
  lat: yup.number().nullable(),
  lng: yup.number().nullable(),
  primaryColor: yup.string(),
  requireRigInspection: yup.boolean(),
  requireLicense: yup.boolean(),
  requireCredits: yup.boolean(),
  requireMembership: yup.boolean(),
  allowNegativeCredits: yup.boolean(),
  allowManifestBypass: yup.boolean(),
  allowDoubleManifesting: yup.boolean(),
  allowSelfManifest: yup.boolean(),
});

export const EMPTY_FORM_VALUES: Partial<OperatorFields> = {
  id: undefined,
  federation: null,
  lat: null,
  lng: null,
  primaryColor: null,
  requireRigInspection: true,
  requireMembership: true,
  allowNegativeCredits: false,
  allowManifestBypass: false,
  allowSelfManifest: true,
  requireCredits: true,
  requireLicense: true,
};

export interface IUseManifestFormOpts {
  initial?: Partial<OperatorFields>;
  onSuccess?(operator: OperatorEssentialsFragment): void;
}

export default function useOperatorForm(opts: IUseManifestFormOpts) {
  const { initial, onSuccess } = opts;
  const notify = useNotifications();
  const { data } = useFederationsQuery();
  const {
    operator: { operator },
  } = useOperatorContext();
  const initialValues = React.useMemo(
    () => ({
      ...EMPTY_FORM_VALUES,
      id: operator?.id ? Number(operator?.id) : undefined,
      lat: operator?.lat || undefined,
      lng: operator?.lng || undefined,
      federation: operator?.federation || data?.federations?.[0] || undefined,
      name: operator?.name || undefined,
      primaryColor: operator?.primaryColor || undefined,
      secondaryColor: operator?.secondaryColor || undefined,
      allowManifestBypass: operator?.settings?.allowManifestBypass,
      allowNegativeCredits: operator?.settings?.allowNegativeCredits,
      allowDoubleManifesting: operator?.settings?.allowDoubleManifesting,
      allowSelfManifest: operator?.settings?.allowSelfManifest ?? true,
      requireCredits: operator?.settings?.requireCredits,
      requireLicense: operator?.settings?.requireLicense,
      requireMembership: operator?.settings?.requireMembership,
      requireRigInspection: operator?.settings?.requireRigInspection,
      isCreditSystemEnabled: operator?.isCreditSystemEnabled,
      requireEquipment: operator?.settings?.requireEquipment,
      ...initial,
    }),
    [
      initial,
      operator?.name,
      data?.federations,
      operator?.primaryColor,
      operator?.secondaryColor,
      operator?.settings?.allowManifestBypass,
      operator?.settings?.allowNegativeCredits,
      operator?.settings?.allowDoubleManifesting,
      operator?.settings?.allowSelfManifest,
      operator?.settings?.requireCredits,
      operator?.settings?.requireLicense,
      operator?.settings?.requireMembership,
      operator?.settings?.requireRigInspection,
      operator?.isCreditSystemEnabled,
      operator?.id,
      operator?.lat,
      operator?.lng,
      operator?.federation,
      operator?.settings?.requireEquipment,
    ]
  );

  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<OperatorFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(operatorValidation),
  });
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) {
      setDefaultValues(initialValues);
    }
  }, [defaultValues, initialValues]);

  const { reset } = methods;
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { handleSubmit, setError } = methods;
  const {
    operator: { update },
  } = useOperatorContext();
  const canUpdateOperator = useRestriction(Permission.UpdateOperator);

  const [{ loading }, onUpdate] = useAsyncFn(
    async (fields: OperatorFields) => {
      try {
        if (!canUpdateOperator) {
          return { error: "You don't have permission to update this dropzone" };
        }
        // Throws when the fields are invalid
        operatorValidation.validateSync(fields);
        const {
          id,
          banner,
          isCreditSystemEnabled,
          federation,
          primaryColor,
          lat,
          lng,
          name,
          requestPublication,
          secondaryColor,
          isPublic,
          ...settings
        } = fields;

        const response = await update({
          banner,
          federation: federation?.id ? Number(federation?.id) : undefined,
          primaryColor,
          lat,
          lng,
          name,
          requestPublication,
          isCreditSystemEnabled,
          isPublic,
          settings,
        });

        if ('fieldErrors' in response) {
          response.fieldErrors?.forEach(({ field, message }) => {
            setError(camelCase(field) as keyof OperatorFields, { type: 'custom', message });
          });
        }
        if ('operator' in response) {
          notify.success('Your changes have been saved');
          onSuccess?.(response.operator);
        }
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [update, setError, canUpdateOperator, notify, onSuccess]
  );

  const onSubmit = React.useMemo(
    () => handleSubmit(onUpdate, console.error),
    [handleSubmit, onUpdate]
  );

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
