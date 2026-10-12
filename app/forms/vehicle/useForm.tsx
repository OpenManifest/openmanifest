import * as React from 'react';
import { useForm } from 'react-hook-form';
import { VehicleEssentialsFragment } from 'app/api/operations';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOperatorContext } from 'app/providers/operator/context';
import useAsyncFn from 'react-use/lib/useAsyncFn';

import { camelCase, isEqual } from 'lodash';
import { useVehicles } from 'app/api/crud/useVehicles';
import { useNotifications } from 'app/providers/notifications';
import withDefaults from 'app/forms/initialValues';

export type VehicleFields = {
  id?: string;
  name?: string;
  registration: string;
  minCapacity?: number;
  capacity: number;
  basicEmptyWeight?: number;
  maxDepartWeight?: number;

  // FIXME: Should be AVGAS/Jetfuel
  fuelType?: string;
};

export const vehicleValidation = yup.object({
  id: yup.string().nullable().default(null),
  name: yup.string().nullable().default(null),
  registration: yup.string().required('Registration is required'),
  minCapacity: yup.number().integer().default(1).min(1, 'Minimum slots must be greater than 0'),
  capacity: yup
    .number()
    .integer()
    .required('Maximum slots is required')
    .min(1, 'Maximum slots must be greater than 0'),
  basicEmptyWeight: yup.number().default(0).min(0, 'Basic empty weight must be greater than 0'),
  maxDepartWeight: yup.number().default(0).min(0, 'Maximum take off weight must be greater than 0'),
  fuelType: yup.string().nullable().default(null),
});

export const EMPTY_FORM_VALUES: Partial<VehicleFields> = {
  name: '',
  registration: '',
  minCapacity: 1,
  capacity: 4,
  basicEmptyWeight: 0,
  maxDepartWeight: 0,
  fuelType: undefined,
};

export interface IUseVehicleFormOpts {
  initial?: Partial<VehicleFields>;
  onSuccess?(vehicle: VehicleEssentialsFragment): void;
}

export default function useVehicleForm(opts: IUseVehicleFormOpts) {
  const { initial, onSuccess } = opts;
  const notify = useNotifications();
  const initialValues = React.useMemo(() => withDefaults(EMPTY_FORM_VALUES, initial), [initial]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<VehicleFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(vehicleValidation),
    shouldUnregister: false,
  });
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) {
      setDefaultValues(initialValues);
    }
  }, [defaultValues, initialValues]);

  const { reset, register } = methods;
  React.useEffect(() => {
    register('id');
  }, [register]);
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { handleSubmit, setError } = methods;
  const {
    operator: { operator },
  } = useOperatorContext();
  const { create, update } = useVehicles();

  const [{ loading }, onCreateOrder] = useAsyncFn(
    async (fields: VehicleFields) => {
      if (!operator?.id) {
        return;
      }
      const validated = await vehicleValidation.validate(fields, { abortEarly: false });
      try {
        const response = fields.id
          ? await update(Number(fields.id), {
              name: validated.name,
              operatorId: Number(operator?.id),
              capacity: validated.capacity,
              minCapacity: validated.minCapacity,
              registration: validated.registration,
            })
          : await create({
              name: validated.name,
              operatorId: Number(operator?.id),
              capacity: validated.capacity,
              minCapacity: validated.minCapacity,
              registration: validated.registration,
            });

        if (response) {
          if ('fieldErrors' in response) {
            response.fieldErrors?.forEach(({ field, message }) => {
              const camelizedField = camelCase(field);
              switch (camelizedField) {
                case 'name':
                case 'capacity':
                case 'minCapacity':
                case 'registration':
                  setError(camelizedField, { message });
                  break;
                default:
                  break;
              }
            });
          }
          if ('vehicle' in response && response.vehicle) {
            notify.success('Aircraft saved');
            onSuccess?.(response.vehicle);
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [operator?.id, setError, notify, onSuccess, create, update]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onCreateOrder), [handleSubmit, onCreateOrder]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
