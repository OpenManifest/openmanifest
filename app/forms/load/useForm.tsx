import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { LoadDetailsFragment } from 'app/api/operations';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useManifestContext } from 'app/providers/manifest/context';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { camelCase, isEqual } from 'lodash';
import { LoadState, LoadVehicleRole } from 'app/api/schema.d';
import { VehicleEssentialsFragment } from 'app/api/operations';
import { useOperatorContext } from 'app/providers/operator/context';
import { moduleEnabled } from 'app/utils/modules';
import { useNotifications } from 'app/providers/notifications';
import withDefaults from 'app/forms/initialValues';
import i18n from 'app/i18n';

export type LoadFields = Required<
  Pick<LoadDetailsFragment, 'gca' | 'pilot' | 'maxSlots' | 'vehicle' | 'isOpen'>
> &
  Pick<LoadDetailsFragment, 'name'> & {
    id?: string | null;
    /** The places the load visits, in order (operators with per-load destinations) */
    destinationIds: string[];
    /** The vehicles of the load and what they do (operators with the multi_vehicle module); `vehicle` is the first that carries */
    vehicleRoles: { vehicle: VehicleEssentialsFragment; role: LoadVehicleRole }[];
  };

export const loadValidation = yup.object({
  name: yup.string().nullable().default(null),
  gca: yup.object().required(() => i18n.t('forms.load.youMustSelectAGca')),
  pilot: yup.object().required(() => i18n.t('forms.load.everyLoadNeedsAPilot')),
  vehicle: yup.object().required(() => i18n.t('forms.load.youCantCreateALoadWithout')),
  original: yup.object().nullable(),
  maxSlots: yup
    .number()
    .required(() => i18n.t('forms.load.youMustSpecifyMaxSlots'))
    .default(0),
  id: yup.string().nullable(),
  isOpen: yup.boolean().default(true),
  destinationIds: yup.array().of(yup.string().required()).default([]),
  vehicleRoles: yup.array().default([]),
});

export const EMPTY_FORM_VALUES: Partial<LoadFields> = {
  id: undefined,
  gca: null,
  pilot: null,
  vehicle: undefined,
  maxSlots: 0,
  name: null,
  destinationIds: [],
  vehicleRoles: [],
};

export interface IUseManifestFormOpts {
  initial?: Partial<LoadFields>;
  onSuccess?(load: LoadDetailsFragment): void;
}

export default function useManifestForm(opts: IUseManifestFormOpts) {
  const { initial, onSuccess } = opts;
  const notify = useNotifications();
  const initialValues = React.useMemo(() => withDefaults(EMPTY_FORM_VALUES, initial), [initial]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<LoadFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(loadValidation),
  });
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) {
      setDefaultValues(initialValues);
    }
  }, [defaultValues, initialValues]);

  const { control, reset, setValue, getValues } = methods;
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { handleSubmit, setError } = methods;
  const {
    manifest: { createLoad },
  } = useManifestContext();

  const {
    operator: { operator },
  } = useOperatorContext();
  const multiVehicle = moduleEnabled(operator?.modules, 'multi_vehicle');
  const { vehicle, vehicleRoles } = useWatch<LoadFields>({ control });

  // The watched list is a new array on every render: the effect below depends on what is in it
  const rolesKey = (vehicleRoles ?? []).map((row) => `${row?.vehicle?.id}:${row?.role}`).join(',');

  // With several vehicles the load takes the first that carries as its vehicle, and the seats of all that carry
  React.useEffect(() => {
    if (!multiVehicle) return;
    const carrying = (getValues('vehicleRoles') ?? []).filter(
      ({ role }) => role === LoadVehicleRole.Carrying
    );
    setValue('vehicle', (carrying[0]?.vehicle ?? undefined) as LoadFields['vehicle'], {
      shouldValidate: true,
    });
    if (carrying.length) {
      setValue(
        'maxSlots',
        carrying.reduce((sum, { vehicle: carrier }) => sum + (carrier?.capacity ?? 0), 0)
      );
    }
  }, [multiVehicle, rolesKey, setValue, getValues]);

  React.useEffect(() => {
    if (!multiVehicle && vehicle?.capacity) {
      setValue('maxSlots', vehicle.capacity);
    }
  }, [multiVehicle, vehicle?.capacity, setValue]);

  const [{ loading }, onManifest] = useAsyncFn(
    async (fields: LoadFields) => {
      try {
        const validatedFields = loadValidation.validateSync(fields);

        const response = await createLoad({
          gca: validatedFields.gca?.id,
          state: LoadState.Open,
          pilot: validatedFields.pilot?.id,
          vehicle: multiVehicle ? undefined : validatedFields.vehicle?.id,
          vehicles: multiVehicle
            ? (validatedFields.vehicleRoles as LoadFields['vehicleRoles']).map(
                ({ vehicle: carrier, role }) => ({ vehicleId: carrier.id, role })
              )
            : undefined,
          maxSlots: Number(validatedFields.maxSlots),
          name: validatedFields.name,
          destinationIds: validatedFields.destinationIds?.length
            ? validatedFields.destinationIds.map(Number)
            : undefined,
        });

        if ('error' in response && response.error) {
          // Errors of the load as a whole, e.g. "Every load must have a GCA"
          notify.error(response.error);
        }
        if ('fieldErrors' in response) {
          response.fieldErrors?.forEach(({ field, message }) => {
            const camelizedField = camelCase(field);
            setError(camelizedField as keyof LoadFields, { type: 'custom', message });
          });
        }
        if ('load' in response) {
          notify.success(
            i18n.t('forms.load.addedToTheBoard', { number: response.load?.loadNumber })
          );
          onSuccess?.(response.load);
        }
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [createLoad, notify, setError, onSuccess, multiVehicle]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onManifest), [handleSubmit, onManifest]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
