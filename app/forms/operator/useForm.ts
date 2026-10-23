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
import {
  OperatorEssentialsFragment,
  CertificationBodyEssentialsFragment,
} from 'app/api/operations';
import useRestriction from 'app/hooks/useRestriction';
import i18n from 'app/i18n';

/** Who the operator is and how it looks (Setup → Branding); its rules have a page of their own (`app/features/setup`) */
export type OperatorFields = Required<
  Pick<
    OperatorInput,
    'name' | 'banner' | 'lat' | 'lng' | 'primaryColor' | 'secondaryColor' | 'requestPublication'
  > & {
    id: number;
    /** The certification bodies the operator accepts */
    certificationBodies: CertificationBodyEssentialsFragment[];
  }
>;

export const operatorValidation = yup.object({
  name: yup.string().nullable().default(null),
  certificationBodies: yup
    .array()
    .of(yup.object())
    .min(1, () => i18n.t('forms.operator.yourDropzoneMustBePartOf'))
    .required(() => i18n.t('forms.operator.yourDropzoneMustBePartOf')),
  lat: yup.number().nullable(),
  lng: yup.number().nullable(),
  primaryColor: yup.string(),
});

export const EMPTY_FORM_VALUES: Partial<OperatorFields> = {
  id: undefined,
  certificationBodies: [],
  lat: null,
  lng: null,
  primaryColor: null,
};

export interface IUseManifestFormOpts {
  initial?: Partial<OperatorFields>;
  onSuccess?(operator: OperatorEssentialsFragment): void;
}

export default function useOperatorForm(opts: IUseManifestFormOpts) {
  const { initial, onSuccess } = opts;
  const notify = useNotifications();
  const {
    operator: { operator },
  } = useOperatorContext();
  const initialValues = React.useMemo(
    () => ({
      ...EMPTY_FORM_VALUES,
      id: operator?.id ? Number(operator?.id) : undefined,
      lat: operator?.lat || undefined,
      lng: operator?.lng || undefined,
      certificationBodies: operator?.certificationBodies ?? [],
      name: operator?.name || undefined,
      primaryColor: operator?.primaryColor || undefined,
      secondaryColor: operator?.secondaryColor || undefined,
      ...initial,
    }),
    [
      initial,
      operator?.name,
      operator?.primaryColor,
      operator?.secondaryColor,
      operator?.id,
      operator?.lat,
      operator?.lng,
      operator?.certificationBodies,
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
          banner,
          certificationBodies,
          primaryColor,
          lat,
          lng,
          name,
          requestPublication,
          secondaryColor,
        } = fields;

        // The rules (the settings) are left as they are: the Rules page saves them
        const response = await update({
          banner,
          certificationBodyIds: certificationBodies?.map(({ id }) => Number(id)),
          primaryColor,
          lat,
          lng,
          name: name ?? operator?.name ?? '',
          requestPublication,
          secondaryColor,
        });

        if ('fieldErrors' in response) {
          response.fieldErrors?.forEach(({ field, message }) => {
            setError(camelCase(field) as keyof OperatorFields, { type: 'custom', message });
          });
        }
        if ('operator' in response) {
          notify.success(i18n.t('forms.operator.yourChangesHaveBeenSaved'));
          onSuccess?.(response.operator);
        }
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [update, setError, canUpdateOperator, notify, onSuccess, operator?.name]
  );

  const onSubmit = React.useMemo(
    () => handleSubmit(onUpdate, console.error),
    [handleSubmit, onUpdate]
  );

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
