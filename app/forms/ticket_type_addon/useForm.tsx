import * as React from 'react';
import { useForm } from 'react-hook-form';
import {
  TicketTypeAddonDetailsFragment,
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

export type TicketTypeAddonFields = {
  id?: string;
  name: string;
  cost: number;
  ticketTypes: TicketTypeEssentialsFragment[];
};

export const ticketAddonValidation = yup.object({
  id: yup.string().nullable().default(null),
  name: yup.string().required('Name is required'),
  cost: yup.number().required('Cost is required').min(0, 'Cost must be greater than 0'),
  allowManifestingSelf: yup.boolean().default(false),
  altitude: yup.number().required().default(14000),
  ticketTypes: yup.array().of(yup.object()),
  isTandem: yup.boolean().default(false),
});

export const EMPTY_FORM_VALUES: Partial<TicketTypeAddonFields> = {
  name: '',
  cost: 30,
  ticketTypes: [],
  id: undefined,
};

export interface IUseTicketTypeFormOpts {
  initial?: Partial<TicketTypeAddonFields>;
  onSuccess?(ticketTypeAddon: TicketTypeAddonDetailsFragment): void;
}

export default function useTicketTypeForm(opts: IUseTicketTypeFormOpts) {
  const { initial, onSuccess } = opts;
  const initialValues = React.useMemo(() => ({ ...EMPTY_FORM_VALUES, ...initial }), [initial]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<TicketTypeAddonFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(ticketAddonValidation),
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
  const { createTicketTypeAddon, updateTicketTypeAddon } = useTickets();
  const dispatch = useAppDispatch();

  const [{ loading }, onSave] = useAsyncFn(
    async (fields: TicketTypeAddonFields) => {
      if (!dropzone?.id) {
        return;
      }
      const validated = await ticketAddonValidation.validate(fields, { abortEarly: false });
      try {
        const response = fields.id
          ? await updateTicketTypeAddon(Number(fields.id), {
              name: validated.name,
              cost: validated.cost,
              ticketTypeIds: (
                validated.ticketTypes as unknown as TicketTypeAddonEssentialsFragment[]
              )?.map((e) => Number(e.id)),
            })
          : await createTicketTypeAddon({
              name: validated.name,
              cost: validated.cost,
              ticketTypeIds: (
                validated.ticketTypes as unknown as TicketTypeAddonEssentialsFragment[]
              )?.map((e) => Number(e.id)),
            });

        if (response) {
          if ('fieldErrors' in response) {
            response.fieldErrors?.forEach(({ field, message }) => {
              if (Object.keys(defaultValues).includes(field)) {
                setError(field as keyof typeof defaultValues, { message });
              }
            });
          }
          if ('ticketTypeAddon' in response && response.ticketTypeAddon) {
            onSuccess?.(response.ticketTypeAddon);
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
    [
      dropzone?.id,
      setError,
      dispatch,
      onSuccess,
      createTicketTypeAddon,
      updateTicketTypeAddon,
      defaultValues,
    ]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onSave), [handleSubmit, onSave]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
