import * as React from 'react';
import { useForm } from 'react-hook-form';
import {
  TicketTypeAddonEssentialsFragment,
  TicketTypeEssentialsFragment,
} from 'app/api/operations';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOperatorContext } from 'app/providers/operator/context';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { camelCase, isEqual } from 'lodash';
import { useTickets } from 'app/api/crud';
import { useNotifications } from 'app/providers/notifications';
import { toCents } from 'app/utils/money';
import withDefaults from 'app/forms/initialValues';
import i18n from 'app/i18n';

export type TicketTypeFields = {
  id?: string;
  name: string;
  cost: number;
  /** The id of the destination slots of this ticket go to by default */
  defaultDestinationId: string | null;
  allowManifestingSelf: boolean;
  /** A slot takes guests who ride with its member, the escort */
  requiresEscort: boolean;
  /** Who the ticket takes, as typed: whole numbers, or nothing for no limit */
  minAge: string;
  maxAge: string;
  minBodyMassKg: string;
  maxBodyMassKg: string;
  /** The most guests for each escort */
  escortCapacity: number;
  extras: TicketTypeAddonEssentialsFragment[];
};

const LIMIT = /^(\d+(\.\d+)?)?$/;
const NUMBER_MESSAGE = () => i18n.t('forms.ticket_type.limitMustBeANumber');

export const ticketTypeValidation = yup.object({
  id: yup.string().nullable().default(null),
  name: yup.string().required(() => i18n.t('forms.ticket_type.nameIsRequired')),
  cost: yup
    .number()
    .required(() => i18n.t('forms.ticket_type.costIsRequired'))
    .min(0, () => i18n.t('forms.ticket_type.costMustBeGreaterThan0')),
  allowManifestingSelf: yup.boolean().default(false),
  defaultDestinationId: yup.string().nullable().default(null),
  extras: yup.array().of(yup.object()),
  requiresEscort: yup.boolean().default(false),
  minAge: yup.string().default('').matches(LIMIT, NUMBER_MESSAGE),
  maxAge: yup.string().default('').matches(LIMIT, NUMBER_MESSAGE),
  minBodyMassKg: yup.string().default('').matches(LIMIT, NUMBER_MESSAGE),
  maxBodyMassKg: yup.string().default('').matches(LIMIT, NUMBER_MESSAGE),
  escortCapacity: yup.number().integer().min(1).default(1),
});

export const EMPTY_FORM_VALUES: Partial<TicketTypeFields> = {
  name: '',
  cost: 30,
  allowManifestingSelf: true,
  defaultDestinationId: null,
  extras: [],
  id: undefined,
  requiresEscort: false,
  escortCapacity: 1,
  minAge: '',
  maxAge: '',
  minBodyMassKg: '',
  maxBodyMassKg: '',
};

/** The limits typed in, as the API takes them: only those that were filled in */
function toParticipantLimits(fields: {
  minAge?: string;
  maxAge?: string;
  minBodyMassKg?: string;
  maxBodyMassKg?: string;
}) {
  const entries = {
    min_age: fields.minAge,
    max_age: fields.maxAge,
    min_body_mass_kg: fields.minBodyMassKg,
    max_body_mass_kg: fields.maxBodyMassKg,
  };
  return Object.fromEntries(
    Object.entries(entries)
      .filter(([, value]) => value !== '' && value != null)
      .map(([key, value]) => [key, Number(value)])
  );
}

/** The API takes the id as a number; no destination is `null`, which clears it on update */
function toDestinationId(id?: string | null) {
  return id ? Number(id) : null;
}

export interface IUseTicketTypeFormOpts {
  initial?: Partial<TicketTypeFields>;
  onSuccess?(ticketType: TicketTypeEssentialsFragment): void;
}

export default function useTicketTypeForm(opts: IUseTicketTypeFormOpts) {
  const { initial, onSuccess } = opts;
  const initialValues = React.useMemo(() => withDefaults(EMPTY_FORM_VALUES, initial), [initial]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<TicketTypeFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(ticketTypeValidation),
  });
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) {
      setDefaultValues(initialValues);
    }
  }, [defaultValues, initialValues]);
  const { reset, register } = methods;
  React.useEffect(() => {
    register('id');
    register('defaultDestinationId');
  }, [register]);

  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { handleSubmit, setError } = methods;
  const {
    operator: { operator },
  } = useOperatorContext();
  const { createTicketType, updateTicketType } = useTickets();
  const notify = useNotifications();

  const [{ loading }, onCreateOrder] = useAsyncFn(
    async (fields: TicketTypeFields) => {
      if (!operator?.id) {
        return;
      }
      const validated = await ticketTypeValidation.validate(fields, { abortEarly: false });
      try {
        const response = fields.id
          ? await updateTicketType(Number(fields.id), {
              name: validated.name,
              costCents: toCents(validated.cost),
              allowManifestingSelf: validated.allowManifestingSelf,
              defaultDestinationId: toDestinationId(validated.defaultDestinationId),
              extraIds: (validated.extras as unknown as TicketTypeAddonEssentialsFragment[]).map(
                (e) => Number(e.id)
              ),
              requiresEscort: validated.requiresEscort,
              participantLimits: toParticipantLimits(validated),
              escortCapacity: validated.requiresEscort ? validated.escortCapacity : 1,
            })
          : await createTicketType({
              name: validated.name,
              costCents: toCents(validated.cost),
              allowManifestingSelf: validated.allowManifestingSelf,
              defaultDestinationId: toDestinationId(validated.defaultDestinationId),
              extraIds: (validated.extras as unknown as TicketTypeAddonEssentialsFragment[])?.map(
                (e) => Number(e.id)
              ),
              requiresEscort: validated.requiresEscort,
              participantLimits: toParticipantLimits(validated),
              escortCapacity: validated.requiresEscort ? validated.escortCapacity : 1,
            });

        if (response) {
          if ('fieldErrors' in response) {
            response.fieldErrors?.forEach(({ field, message }) => {
              const camelizedField = camelCase(field);
              if (Object.keys(defaultValues).includes(camelizedField)) {
                setError(camelizedField as keyof typeof defaultValues, { message });
              }
            });
          }
          if ('ticketType' in response && response.ticketType) {
            notify.success(i18n.t('forms.ticket_type.ticketSaved'));
            onSuccess?.(response.ticketType);
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [operator?.id, setError, notify, onSuccess, createTicketType, updateTicketType, defaultValues]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onCreateOrder), [handleSubmit, onCreateOrder]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
