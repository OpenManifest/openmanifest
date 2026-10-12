import * as React from 'react';
import { useForm } from 'react-hook-form';
import { SlotExhaustiveFragment, TicketTypeDetailsFragment } from 'app/api/operations';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useManifestContext } from 'app/providers/manifest/context';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useManifestValidator from 'app/hooks/useManifestValidator';
import isEqual from 'lodash/isEqual';
import { useNotifications } from 'app/providers/notifications';
import { useOperatorContext } from 'app/providers/operator/context';
import camelCase from 'lodash/camelCase';
import withDefaults from 'app/forms/initialValues';

export type ManifestUserFields = Pick<
  SlotExhaustiveFragment,
  | 'activityType'
  // | 'load'
  | 'rig'
  | 'membership'
  | 'bodyMassKg'
  | 'extras'
  | 'groupNumber'
  | 'guestBodyMassKg'
  | 'guestName'
> & { id?: string; load?: { id: string }; ticketType: TicketTypeDetailsFragment | null };

export const EMPTY_FORM_VALUES: ManifestUserFields = {
  id: undefined,
  load: undefined,
  bodyMassKg: 50,
  rig: null,
  ticketType: null,
  activityType: null,
  guestBodyMassKg: null,
  guestName: null,
  extras: null,
  groupNumber: 0,
};

export interface IUseManifestFormOpts {
  initial?: Partial<ManifestUserFields>;
  onSuccess?(): void;
}

export default function useManifestForm(opts: IUseManifestFormOpts) {
  const { initial, onSuccess } = opts;
  const initialValues = React.useMemo(() => withDefaults(EMPTY_FORM_VALUES, initial), [initial]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const notify = useNotifications();
  const {
    operator: { operator },
  } = useOperatorContext();
  const manifestUserValidation = yup.object().shape({
    load: yup.object().required(),
    bodyMassKg: yup.number().required('Please specify exit weight').min(0).max(300),
    rig: yup
      .object()
      .nullable()
      .when({
        is: () => !!operator?.settings?.requireEquipment,
        then: yup.object().required('You cant manifest without a rig').nullable(),
        otherwise: yup.object().nullable(),
      }),
    activityType: yup.object().required('Jump type is required').nullable(),
    ticketType: yup.object().required('Ticket is required to manifest').nullable(),
    original: yup.object().nullable(),
    extras: yup.array().of(yup.object()).nullable(),
  });
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
  const {
    manifest: { manifestUser },
  } = useManifestContext();
  const { canManifest } = useManifestValidator();

  const [{ loading }, onManifest] = useAsyncFn(
    async (fields: ManifestUserFields) => {
      try {
        // await canManifest();

        const response = await manifestUser({
          activityType: fields.activityType?.id,
          extras: fields.extras?.map(({ id }) => id),
          load: fields?.load?.id,
          rig: !fields.rig?.id ? undefined : fields.rig?.id,
          ticketType: fields.ticketType?.id,
          membership: fields.membership?.id,
          bodyMassKg: fields.bodyMassKg,
          ...(!fields.ticketType?.isTandem
            ? {}
            : {
                guestName: fields.guestName,
                guestBodyMassKg: fields.guestBodyMassKg,
              }),
        });

        if ('fieldErrors' in response) {
          response.fieldErrors?.forEach(({ field, message }) => {
            console.debug('Error in field', field, message);
            setError(camelCase(field) as keyof ManifestUserFields, { type: 'custom', message });
          });
        }
        if ('error' in response && response.error) {
          notify.error(response.error);
        }
        if ('slot' in response) {
          notify.success(`${fields.membership?.user?.name} has been added to the load`);
          onSuccess?.();
        }
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [manifestUser, notify]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onManifest), [handleSubmit, onManifest]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
