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
  RigEssentialsFragment,
  SlotDetailsFragment,
} from 'app/api/operations';
import { useManifestGroupMutation } from 'app/api/reflection';
import type { ActivityType, SlotUser, TicketType, Extra } from 'app/api/schema.d';
import { useNotifications } from 'app/providers/notifications';

export type SlotUserWithRig = Omit<SlotUser, 'rig'> & {
  rigId?: number | null;
  rig?: RigEssentialsFragment | null;
  avatar?: string | null;
  name?: string;
};

// Narrow shapes rather than the schema's cyclic types, which react-hook-form's path types cannot unfold
export type LoadValue = Pick<LoadDetailsFragment, 'id'> & {
  slots?: { groupNumber?: number | null }[] | null;
};
export type ActivityTypeValue = Pick<ActivityType, 'id' | 'name'>;
export type TicketTypeExtraValue = Pick<Extra, 'id' | 'name' | 'costCents'>;
export type TicketTypeValue = Pick<TicketType, 'id' | 'name' | 'isTandem'> & {
  extras?: TicketTypeExtraValue[] | null;
};

export type ManifestGroupFields = {
  load: LoadValue | null;
  activityType: ActivityTypeValue | null;
  ticketType: TicketTypeValue | null;
  extras: TicketTypeExtraValue[];
  groupNumber: number | null;
  users: SlotUserWithRig[];
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
    .test('tandem-guests', 'You cant manifest tandems without passengers', function check(users) {
      const isTandem = !!(this.parent as ManifestGroupFields).ticketType?.isTandem;
      return !isTandem || (users as SlotUserWithRig[]).every((slotUser) => !!slotUser.guestName);
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

/** Turns members into jumpers for the group, each with the first of their rigs (or the operator's) */
export function toSlotUsers(
  memberships: (MembershipProfileFragment | MembershipEssentialsFragment)[]
): SlotUserWithRig[] {
  return memberships.map((dzUser) => {
    const profile = dzUser as MembershipProfileFragment;
    const autoSelectedRig = profile?.user?.rigs?.length
      ? first(profile.user.rigs)
      : first(profile.availableRigs);

    return {
      id: Number(dzUser.id),
      rigId: autoSelectedRig?.id ? Number(autoSelectedRig.id) : null,
      rig: autoSelectedRig,
      name: dzUser.user.name,
      avatar: dzUser.user.image,
      bodyMassKg: Number(dzUser?.user?.bodyMassKg),
    };
  }) as SlotUserWithRig[];
}

/** Adds the members that are not in the group yet and removes the ones that are */
export function toggleSlotUsers(
  current: SlotUserWithRig[],
  memberships: (MembershipProfileFragment | MembershipEssentialsFragment)[]
): SlotUserWithRig[] {
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
            rigId: slot.rig?.id ? Number(slot.rig.id) : null,
            rig: slot.rig,
            bodyMassKg: Number(slot.bodyMassKg),
          })) as SlotUserWithRig[],
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
            userGroup: fields.users.map(
              ({ id, bodyMassKg, rigId, rig, guestName, guestBodyMassKg }) => ({
                id,
                rig: rigId?.toString() || rig?.id || undefined,
                bodyMassKg,
                guestName,
                guestBodyMassKg,
              })
            ),
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
