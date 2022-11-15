import * as React from 'react';
import { useForm } from 'react-hook-form';
import { PlaneEssentialsFragment } from 'app/api/operations';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import useAsyncFn from 'react-use/lib/useAsyncFn';

import { isEqual } from 'lodash';
import { useAircrafts } from 'app/api/crud/useAircrafts';
import { useNotifications } from 'app/providers/notifications';

export type AircraftFields = {
  id?: string;
  name?: string;
  registration: string;
  minSlots?: number;
  maxSlots: number;
  basicEmptyWeight?: number;
  maxTakeOffWeight?: number;

  // FIXME: Should be AVGAS/Jetfuel
  fuelType?: string;
};

export const aircraftValidation = yup.object({
  id: yup.string().nullable().default(null),
  name: yup.string().nullable().default(null),
  registration: yup.string().required('Registration is required'),
  minSlots: yup.number().integer().default(1).min(1, 'Minimum slots must be greater than 0'),
  maxSlots: yup
    .number()
    .integer()
    .required('Maximum slots is required')
    .min(1, 'Maximum slots must be greater than 0'),
  basicEmptyWeight: yup.number().default(0).min(0, 'Basic empty weight must be greater than 0'),
  maxTakeOffWeight: yup
    .number()
    .default(0)
    .min(0, 'Maximum take off weight must be greater than 0'),
  fuelType: yup.string().nullable().default(null),
});

export const EMPTY_FORM_VALUES: Partial<AircraftFields> = {
  name: '',
  registration: '',
  minSlots: 1,
  maxSlots: 4,
  basicEmptyWeight: 0,
  maxTakeOffWeight: 0,
  fuelType: undefined,
};

export interface IUseAircraftFormOpts {
  initial?: Partial<AircraftFields>;
  onSuccess?(aircraft: PlaneEssentialsFragment): void;
}

export default function useAircraftForm(opts: IUseAircraftFormOpts) {
  const { initial, onSuccess } = opts;
  const notify = useNotifications();
  const initialValues = React.useMemo(() => ({ ...EMPTY_FORM_VALUES, ...initial }), [initial]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<AircraftFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(aircraftValidation),
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
    dropzone: { dropzone },
  } = useDropzoneContext();
  const { create, update } = useAircrafts();

  const [{ loading }, onCreateOrder] = useAsyncFn(
    async (fields: AircraftFields) => {
      if (!dropzone?.id) {
        return;
      }
      const validated = await aircraftValidation.validate(fields, { abortEarly: false });
      try {
        const response = fields.id
          ? await update(Number(fields.id), {
              name: validated.name,
              dropzoneId: Number(dropzone?.id),
              maxSlots: validated.maxSlots,
              minSlots: validated.minSlots,
              registration: validated.registration,
            })
          : await create({
              name: validated.name,
              dropzoneId: Number(dropzone?.id),
              maxSlots: validated.maxSlots,
              minSlots: validated.minSlots,
              registration: validated.registration,
            });

        if (response) {
          if ('fieldErrors' in response) {
            response.fieldErrors?.forEach(({ field, message }) => {
              switch (field) {
                case 'name':
                case 'maxSlots':
                case 'minSlots':
                case 'registration':
                  setError(field, { message });
                  break;
                default:
                  break;
              }
            });
          }
          if ('aircraft' in response && response.aircraft) {
            notify.success('Aircraft saved');
            onSuccess?.(response.aircraft);
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [dropzone?.id, setError, notify, onSuccess, create, update]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onCreateOrder), [handleSubmit, onCreateOrder]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
