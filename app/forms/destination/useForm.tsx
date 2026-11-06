import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { camelCase, isEqual } from 'lodash';
import { DestinationEssentialsFragment } from 'app/api/operations';
import { DestinationKind } from 'app/api/schema.d';
import { useDestinations } from 'app/api/crud';
import { useOperatorContext } from 'app/providers/operator/context';
import { useNotifications } from 'app/providers/notifications';
import withDefaults from 'app/forms/initialValues';
import { activeUnits } from 'app/i18n/operatorFormat';
import { toSi, unitOf } from 'app/i18n/units';
import i18n from 'app/i18n';

export type DestinationFields = {
  id?: string;
  name: string;
  kind: DestinationKind;
  /** The height of an altitude, in the operator's altitude unit (the API takes metres) */
  altitude?: number | null;
};

export const destinationValidation = yup.object({
  id: yup.string().nullable().default(null),
  name: yup.string().required(() => i18n.t('forms.destination.nameIsRequired')),
  kind: yup.mixed<DestinationKind>().oneOf(Object.values(DestinationKind)).required(),
  altitude: yup
    .number()
    .nullable()
    .when('kind', {
      is: DestinationKind.Altitude,
      then: (schema) =>
        schema
          .required(() => i18n.t('forms.destination.altitudeIsRequired'))
          .min(1, () => i18n.t('forms.destination.altitudeIsRequired')),
    }),
});

export const EMPTY_FORM_VALUES: Partial<DestinationFields> = {
  name: '',
  kind: DestinationKind.Altitude,
  altitude: null,
};

export interface IUseDestinationFormOpts {
  initial?: Partial<DestinationFields>;
  onSuccess?(destination: DestinationEssentialsFragment): void;
}

export default function useDestinationForm(opts: IUseDestinationFormOpts) {
  const { initial, onSuccess } = opts;
  const notify = useNotifications();
  const initialValues = React.useMemo(() => withDefaults(EMPTY_FORM_VALUES, initial), [initial]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<DestinationFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(destinationValidation),
  });
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) {
      setDefaultValues(initialValues);
    }
  }, [defaultValues, initialValues]);

  const { reset, register, handleSubmit, setError } = methods;
  React.useEffect(() => {
    register('id');
  }, [register]);
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const {
    operator: { operator },
  } = useOperatorContext();
  const { create, update } = useDestinations();

  const [{ loading }, onSave] = useAsyncFn(
    async (fields: DestinationFields) => {
      if (!operator?.id) {
        return;
      }
      const validated = await destinationValidation.validate(fields, { abortEarly: false });
      const isAltitude = validated.kind === DestinationKind.Altitude;
      const attributes = {
        name: validated.name,
        kind: validated.kind,
        altitudeM: isAltitude
          ? Math.round(
              toSi('altitude', Number(validated.altitude), unitOf('altitude', activeUnits())) * 100
            ) / 100
          : undefined,
      };
      try {
        const response = fields.id
          ? await update(Number(fields.id), attributes)
          : await create(attributes);

        if ('fieldErrors' in response) {
          response.fieldErrors?.forEach(({ field, message }) => {
            const camelizedField = camelCase(field);
            if (['name', 'kind'].includes(camelizedField)) {
              setError(camelizedField as 'name' | 'kind', { message });
            }
          });
        }
        if ('error' in response && response.error) {
          notify.error(response.error);
        }
        if ('destination' in response && response.destination) {
          notify.success(i18n.t('forms.destination.saved', { name: response.destination.name }));
          onSuccess?.(response.destination);
        }
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [operator?.id, setError, notify, onSuccess, create, update]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onSave), [handleSubmit, onSave]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
