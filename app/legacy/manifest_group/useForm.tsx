import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import first from 'lodash/first';
import isEqual from 'lodash/isEqual';
import xorBy from 'lodash/xorBy';
import { yupResolver } from '@hookform/resolvers/yup';
import type {
  MembershipEssentialsFragment,
  MembershipProfileFragment,
  LoadDetailsFragment,
  EquipmentEssentialsFragment,
  SlotDetailsFragment,
} from 'app/api/operations';
import { useManifestGroupMutation } from 'app/api/reflection';
import type { ActivityType, SlotUser, TicketType, Extra } from 'app/api/schema.d';
import { useNotifications } from 'app/providers/notifications';
import { GuestValue, guestInputsOf, guestsError } from 'app/legacy/manifest_user/guests';

export type SlotUserWithEquipment = Omit<SlotUser, 'equipment' | 'guests'> & {
  /** Who rides with the jumper, on a ticket type that requires an escort */
  guests?: GuestValue[];
  /** What the jumper uses: one item for each kind of equipment the slot needs */
  equipment?: EquipmentEssentialsFragment[];
  avatar?: string | null;
  name?: string;
};

// Narrow shapes rather than the schema's cyclic types, which react-hook-form's path types cannot unfold
export type LoadValue = Pick<LoadDetailsFragment, 'id'> & {
  slots?: { groupNumber?: number | null }[] | null;
};
export type ActivityTypeValue = Pick<ActivityType, 'id' | 'name'>;
export type TicketTypeExtraValue = Pick<Extra, 'id' | 'name' | 'costCents'>;
export type TicketTypeValue = Pick<
  TicketType,
  'id' | 'name' | 'requiresEscort' | 'escortCapacity'
> & {
  extras?: TicketTypeExtraValue[] | null;
};

export type ManifestGroupFields = {
  load: LoadValue | null;
  activityType: ActivityTypeValue | null;
  ticketType: TicketTypeValue | null;
  extras: TicketTypeExtraValue[];
  groupNumber: number | null;
  users: SlotUserWithEquipment[];
};

export const manifestGroupValidation = yup.object({
  load: yup.object().nullable().default(null),
  activityType: yup.object().nullable().required('You must specify the type of jump'),
  ticketType: yup.object().nullable().required('You must select a ticket type to manifest'),
  extras: yup.array().default([]),
  groupNumber: yup.number().nullable().default(null),
  users: yup
    .array()
    .min(1, 'Add at least one jumper to the group')
    .test('escort-guests', function check(users) {
      const ticketType = (this.parent as ManifestGroupFields).ticketType;
      if (!ticketType?.requiresEscort) return true;
      for (const slotUser of users as SlotUserWithEquipment[]) {
        if (!slotUser.guests?.length) {
          return this.createError({ message: 'Every escort needs at least one guest' });
        }
        const message = guestsError(slotUser.guests, ticketType.escortCapacity ?? 1);
        if (message) return this.createError({ message });
      }
      return true;
    }),
});

export const EMPTY_FORM_VALUES: ManifestGroupFields = {
  load: null,
  activityType: null,
  ticketType: null,
  extras: [],
  groupNumber: null,
  users: [],
};

/** Turns members into jumpers for the group, each with the first of their equipment (or the operator's); the select of each kind adds the others */
export function toSlotUsers(
  memberships: (MembershipProfileFragment | MembershipEssentialsFragment)[]
): SlotUserWithEquipment[] {
  return memberships.map((dzUser) => {
    const profile = dzUser as MembershipProfileFragment;
    const autoSelectedEquipment = profile?.user?.equipment?.length
      ? first(profile.user.equipment)
      : first(profile.availableEquipment);

    return {
      id: Number(dzUser.id),
      equipment: autoSelectedEquipment ? [autoSelectedEquipment] : [],
      name: dzUser.user.name,
      avatar: dzUser.user.image,
      bodyMassKg: Number(dzUser?.user?.bodyMassKg),
    };
  }) as SlotUserWithEquipment[];
}

/** Adds the members that are not in the group yet and removes the ones that are */
export function toggleSlotUsers(
  current: SlotUserWithEquipment[],
  memberships: (MembershipProfileFragment | MembershipEssentialsFragment)[]
): SlotUserWithEquipment[] {
  return xorBy(current, toSlotUsers(memberships), 'id');
}

export interface IManifestGroupInitial {
  load?: LoadDetailsFragment | null;
  /** The slots of the group being edited */
  slots?: SlotDetailsFragment[];
  /** Members to start the group with */
  users?: (MembershipProfileFragment | MembershipEssentialsFragment)[];
}

export function toFormValues(initial: IManifestGroupInitial): ManifestGroupFields {
  const { load, slots, users } = initial;
  if (!load) {
    return EMPTY_FORM_VALUES;
  }
  const firstSlot = slots?.find(Boolean);

  return {
    ...EMPTY_FORM_VALUES,
    load,
    ...(slots
      ? {
          users: slots.map((slot) => ({
            id: Number(slot.membership?.id),
            equipment: slot.equipment,
            bodyMassKg: Number(slot.bodyMassKg),
          })) as SlotUserWithEquipment[],
          activityType: (firstSlot?.activityType as ActivityTypeValue) ?? null,
          groupNumber: firstSlot?.groupNumber || null,
          extras: (firstSlot?.extras as TicketTypeExtraValue[]) || [],
        }
      : {}),
    ...(users ? { users: toSlotUsers(users) } : {}),
  };
}

/** Server field names, as the API reports them */
const FIELD_OF_SERVER_FIELD: Record<string, keyof ManifestGroupFields> = {
  activity_type: 'activityType',
  activity_type_id: 'activityType',
  load: 'load',
  credits: 'extras',
  extras: 'extras',
  extra_ids: 'extras',
  ticket_type: 'ticketType',
};

export interface IUseManifestGroupFormOpts extends IManifestGroupInitial {
  onSuccess?(): void;
}

export default function useManifestGroupForm(opts: IUseManifestGroupFormOpts) {
  const { load, slots, users, onSuccess } = opts;
  const notify = useNotifications();
  const initialValues = React.useMemo(
    () => toFormValues({ load, slots, users }),
    [load, slots, users]
  );
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<ManifestGroupFields>({
    defaultValues,
    mode: 'onSubmit',
    resolver: yupResolver(manifestGroupValidation) as never,
  });
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) {
      setDefaultValues(initialValues);
    }
  }, [defaultValues, initialValues]);

  const { reset, handleSubmit, setError } = methods;
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const [mutationCreateSlots, { loading }] = useManifestGroupMutation();

  const onSave = React.useCallback(
    async (fields: ManifestGroupFields) => {
      try {
        const result = await mutationCreateSlots({
          variables: {
            activityType: fields.activityType?.id,
            ticketType: fields.ticketType?.id,
            groupNumber: fields.groupNumber || null,
            extras: fields.extras?.map(({ id }) => id),
            load: fields.load?.id,
            userGroup: fields.users.map(({ id, bodyMassKg, equipment, guests }) => ({
              id,
              equipment: equipment?.length ? equipment.map((item) => item.id) : undefined,
              bodyMassKg,
              guests: fields.ticketType?.requiresEscort ? guestInputsOf(guests) : undefined,
            })),
          },
        });
        const payload = result.data?.createSlots;

        payload?.fieldErrors?.forEach(({ field, message }) => {
          const name = FIELD_OF_SERVER_FIELD[field];
          if (name) {
            setError(name, { type: 'server', message });
          }
        });
        if (payload?.errors?.length) {
          notify.error(payload.errors[0]);
          return;
        }
        if (!payload?.fieldErrors?.length) {
          requestAnimationFrame(() => onSuccess?.());
        }
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [mutationCreateSlots, notify, onSuccess, setError]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onSave), [handleSubmit, onSave]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
