import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { LoadDetailsFragment } from 'app/api/operations';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useManifestContext } from 'app/api/crud/useManifest/Context';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useManifestValidator from 'app/hooks/useManifestValidator';
import { actions, useAppDispatch } from 'app/state';
import { isEqual } from 'lodash';
import { LoadState } from 'app/api/schema.d';

export type LoadFields = Required<
  Pick<LoadDetailsFragment, 'gca' | 'pilot' | 'maxSlots' | 'plane' | 'isOpen'>
> &
  Pick<LoadDetailsFragment, 'name'> & { id?: string | null };

export const loadValidation = yup.object({
  name: yup.string().nullable().default(null),
  gca: yup.object().required('You must select a GCA'),
  pilot: yup.object().required('Every load needs a pilot'),
  plane: yup.object().required('You cant create a load without an aircraft'),
  original: yup.object().nullable(),
  maxSlots: yup.number().required('You must specify max slots').default(0),
  id: yup.string().nullable(),
  isOpen: yup.boolean().default(true),
});

export const EMPTY_FORM_VALUES: Partial<LoadFields> = {
  id: undefined,
  gca: null,
  pilot: null,
  plane: undefined,
  maxSlots: 0,
  name: null,
};

export interface IUseManifestFormOpts {
  initial?: Partial<LoadFields>;
  onSuccess?(load: LoadDetailsFragment): void;
}

export default function useManifestForm(opts: IUseManifestFormOpts) {
  const { initial, onSuccess } = opts;
  const initialValues = React.useMemo(() => ({ ...EMPTY_FORM_VALUES, ...initial }), [initial]);
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

  const { control, reset, setValue } = methods;
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { handleSubmit, setError } = methods;
  const { createLoad } = useManifestContext();
  const { canManifest } = useManifestValidator();
  const dispatch = useAppDispatch();

  const { plane } = useWatch<LoadFields>({ control });

  React.useEffect(() => {
    if (plane?.maxSlots) {
      setValue('maxSlots', plane.maxSlots);
    }
  }, [plane?.maxSlots, setValue]);

  const [{ loading }, onManifest] = useAsyncFn(
    async (fields: LoadFields) => {
      try {
        await canManifest();
        const validatedFields = loadValidation.validateSync(fields);

        const response = await createLoad({
          gca: Number(validatedFields.gca?.id),
          state: LoadState.Open,
          pilot: Number(validatedFields.pilot?.id),
          plane: Number(validatedFields.plane?.id),
          maxSlots: Number(validatedFields.maxSlots),
          name: validatedFields.name,
        });

        if ('fieldErrors' in response) {
          response.fieldErrors?.forEach(({ field, message }) => {
            setError(field as keyof LoadFields, { type: 'custom', message });
          });
        }
        if ('load' in response) {
          onSuccess?.(response.load);
        }
      } catch (error) {
        if (error instanceof Error) {
          dispatch(
            actions.notifications.showSnackbar({
              message: error.message,
              variant: 'error',
            })
          );
        }
      }
    },
    [createLoad]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onManifest), [handleSubmit, onManifest]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
