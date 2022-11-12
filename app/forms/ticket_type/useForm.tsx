import * as React from 'react';
import { useForm } from 'react-hook-form';
import {
  TicketTypeAddonEssentialsFragment,
  TicketTypeEssentialsFragment,
} from 'app/api/operations';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDropzoneContext } from 'app/providers';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { actions, useAppDispatch } from 'app/state';
import { isEqual } from 'lodash';
import { useTickets } from 'app/api/crud';

export type TicketTypeFields = {
  id?: string;
  name: string;
  cost: number;
  altitude: number;
  allowManifestingSelf: boolean;
  isTandem: boolean;
  extras: TicketTypeAddonEssentialsFragment[];
};

export const ticketTypeValidation = yup.object({
  id: yup.string().nullable().default(null),
  name: yup.string().required('Name is required'),
  cost: yup.number().required('Cost is required').min(0, 'Cost must be greater than 0'),
  allowManifestingSelf: yup.boolean().default(false),
  altitude: yup.number().required().default(14000),
  extras: yup.array().of(yup.object()),
  isTandem: yup.boolean().default(false),
});

export const EMPTY_FORM_VALUES: Partial<TicketTypeFields> = {
  name: '',
  cost: 30,
  allowManifestingSelf: true,
  altitude: 14000,
  extras: [],
  id: undefined,
  isTandem: false,
};

export interface IUseTicketTypeFormOpts {
  initial?: Partial<TicketTypeFields>;
  onSuccess?(ticketType: TicketTypeEssentialsFragment): void;
}

export default function useTicketTypeForm(opts: IUseTicketTypeFormOpts) {
  const { initial, onSuccess } = opts;
  const initialValues = React.useMemo(() => ({ ...EMPTY_FORM_VALUES, ...initial }), [initial]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<TicketTypeFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(ticketTypeValidation),
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
  const { createTicketType, updateTicketType } = useTickets();
  const dispatch = useAppDispatch();

  const [{ loading }, onCreateOrder] = useAsyncFn(
    async (fields: TicketTypeFields) => {
      if (!dropzone?.id) {
        return;
      }
      const validated = await ticketTypeValidation.validate(fields, { abortEarly: false });
      try {
        const response = fields.id
          ? await updateTicketType(Number(fields.id), {
              name: validated.name,
              cost: validated.cost,
              allowManifestingSelf: validated.allowManifestingSelf,
              altitude: validated.altitude,
              extraIds: (validated.extras as unknown as TicketTypeAddonEssentialsFragment[]).map(
                (e) => Number(e.id)
              ),
              isTandem: validated.isTandem,
            })
          : await createTicketType({
              name: validated.name,
              cost: validated.cost,
              allowManifestingSelf: validated.allowManifestingSelf,
              altitude: validated.altitude,
              extraIds: (validated.extras as unknown as TicketTypeAddonEssentialsFragment[])?.map(
                (e) => Number(e.id)
              ),
              isTandem: validated.isTandem,
            });

        if (response) {
          if ('fieldErrors' in response) {
            response.fieldErrors?.forEach(({ field, message }) => {
              if (Object.keys(defaultValues).includes(field)) {
                setError(field as keyof typeof defaultValues, { message });
              }
            });
          }
          if ('ticketType' in response && response.ticketType) {
            onSuccess?.(response.ticketType);
          }
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
    [dropzone?.id, setError, dispatch, onSuccess, createTicketType, updateTicketType, defaultValues]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onCreateOrder), [handleSubmit, onCreateOrder]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
