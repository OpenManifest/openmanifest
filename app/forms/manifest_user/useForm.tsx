import * as React from 'react';
import { useForm } from 'react-hook-form';
import { SlotExhaustiveFragment } from 'app/api/operations';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useManifestContext } from 'app/api/crud/useManifest/useManifest';
import { useAsyncFn } from 'react-use';
import useManifestValidator from 'app/hooks/useManifestValidator';
import { actions, useAppDispatch } from 'app/state';
import { isEqual } from 'lodash';

export type ManifestUserFields = Pick<
  SlotExhaustiveFragment,
  | 'jumpType'
  // | 'load'
  | 'ticketType'
  | 'rig'
  | 'dropzoneUser'
  | 'exitWeight'
  | 'extras'
  | 'groupNumber'
  | 'passengerExitWeight'
  | 'passengerName'
> & { id?: string; load?: { id: string } };

export const manifestUserValidation = yup.object().shape({
  load: yup.object().required(),
  exitWeight: yup.number().required('Please specify exit weight').min(0).max(300),
  rig: yup.object().required('You cant manifest without a rig').nullable(),
  jumpType: yup.object().required('Jump type is required').nullable(),
  ticketType: yup.object().required('Ticket is required to manifest').nullable(),
  original: yup.object().nullable(),
  extras: yup.array().of(yup.object()).nullable(),
});

export const EMPTY_FORM_VALUES: ManifestUserFields = {
  id: undefined,
  load: undefined,
  exitWeight: 50,
  rig: null,
  ticketType: null,
  jumpType: null,
  passengerExitWeight: null,
  passengerName: null,
  extras: null,
  groupNumber: 0,
};

export interface IUseManifestFormOpts {
  initial?: Partial<ManifestUserFields>;
  onSuccess?(): void;
}

export default function useManifestForm(opts: IUseManifestFormOpts) {
  const { initial, onSuccess } = opts;
  const initialValues = React.useMemo(() => ({ ...EMPTY_FORM_VALUES, ...initial }), [initial]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<ManifestUserFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(manifestUserValidation),
  });
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) {
      setDefaultValues(initialValues);
    }
  }, [defaultValues, initialValues]);

  React.useEffect(() => {
    methods.reset(defaultValues);
  }, [defaultValues, methods]);

  const { handleSubmit, setError } = methods;
  const { manifestUser } = useManifestContext();
  const { canManifest } = useManifestValidator();
  const dispatch = useAppDispatch();

  const [{ loading }, onManifest] = useAsyncFn(
    async (fields: ManifestUserFields) => {
      try {
        await canManifest();

        const response = await manifestUser({
          jumpType: fields.jumpType?.id,
          extras: fields.extras?.map(({ id }) => id),
          load: fields?.load?.id,
          rig: !fields.rig?.id ? undefined : fields.rig?.id,
          ticketType: fields.ticketType?.id,
          dropzoneUser: fields.dropzoneUser?.id,
          exitWeight: fields.exitWeight,
          ...(!fields.ticketType?.isTandem
            ? {}
            : {
                passengerName: fields.passengerName,
                passengerExitWeight: fields.passengerExitWeight,
              }),
        });

        if ('fieldErrors' in response) {
          response.fieldErrors?.forEach(({ field, message }) => {
            setError(field as keyof ManifestUserFields, { type: 'custom', message });
          });
        }
        if ('slot' in response) {
          onSuccess?.();
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
    [manifestUser]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onManifest), [handleSubmit, onManifest]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
