import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import { HelperText, Divider, Chip, List } from 'react-native-paper';
import uniqBy from 'lodash/uniqBy';
import { useAllowedActivityTypesQuery } from 'app/api/reflection';
import { useSession } from 'app/state';
import useRestriction from 'app/hooks/useRestriction';
import { ActivityType, Permission } from 'app/api/schema.d';
import type { EquipmentEssentialsFragment } from 'app/api/operations';
import ChipSelect from 'app/components/input/chip_select/ChipSelect';
import UserEquipmentCard from './UserEquipmentCard';
import GroupPicker from './GroupPicker';
import {
  ManifestGroupFields,
  SlotUserWithEquipment,
  TicketTypeExtraValue,
  TicketTypeValue,
} from './useForm';
import { formatCents } from 'app/utils/money';

interface IUserCardProps {
  slotUser: SlotUserWithEquipment;
}

function UserCard(props: IUserCardProps) {
  const { slotUser } = props;
  const { control, setValue, getValues } = useFormContext<ManifestGroupFields>();
  const ticketType = useWatch({ control, name: 'ticketType' });
  const activityType = useWatch({ control, name: 'activityType' });
  const isTandem = !!ticketType?.isTandem;

  /** Changes this jumper, or removes them when `changes` is null */
  const update = React.useCallback(
    (changes: Partial<SlotUserWithEquipment> | null) => {
      const users = getValues('users');
      setValue(
        'users',
        changes
          ? users.map((user) => (user.id === slotUser.id ? { ...slotUser, ...changes } : user))
          : users.filter((user) => user.id !== slotUser.id),
        { shouldDirty: true, shouldValidate: true }
      );
    },
    [getValues, setValue, slotUser]
  );

  const onChangeBodyMassKg = React.useCallback(
    (bodyMassKg: number) => update({ bodyMassKg }),
    [update]
  );
  const onRemove = React.useCallback(() => update(null), [update]);
  const onChangeEquipment = React.useCallback(
    (equipment: EquipmentEssentialsFragment[]) => update({ equipment }),
    [update]
  );
  const onChangeGuestName = React.useCallback(
    (guestName: string) => update({ guestName }),
    [update]
  );
  const onChangeGuestWeight = React.useCallback(
    (guestBodyMassKg: number) => update({ guestBodyMassKg }),
    [update]
  );

  return (
    <UserEquipmentCard
      key={`user-equipment-card-${slotUser.id}`}
      membershipId={slotUser.id?.toString()}
      selectedEquipment={slotUser.equipment}
      bodyMassKg={slotUser.bodyMassKg}
      {...{
        onChangeBodyMassKg,
        onRemove,
        onChangeEquipment,
        onChangeGuestName,
        onChangeGuestWeight,
      }}
      {...{ isTandem }}
      ticketTypeId={ticketType?.id}
      activityTypeId={activityType?.id}
      guestName={slotUser.guestName}
      guestWeight={slotUser.guestBodyMassKg}
    />
  );
}

/** The jump, ticket and jumpers of a group. Needs to be inside the group form's `FormProvider`. */
export default function ManifestGroupForm() {
  const { control } = useFormContext<ManifestGroupFields>();
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const canManifestOthers = useRestriction(Permission.CreateUserSlot);

  const users = useWatch({ control, name: 'users' });
  const load = useWatch({ control, name: 'load' });
  const { field: activityType, fieldState: activityTypeState } = useController({
    name: 'activityType',
    control,
  });
  const { field: ticketType, fieldState: ticketTypeState } = useController({
    name: 'ticketType',
    control,
  });
  const { field: extras, fieldState: extrasState } = useController({ name: 'extras', control });
  const { field: groupNumber } = useController({ name: 'groupNumber', control });
  const { fieldState: usersState } = useController({ name: 'users', control });

  const { data } = useAllowedActivityTypesQuery({
    variables: {
      allowedForMembershipIds: users?.map((slotUser) => slotUser.id) as number[],
      isPublic: canManifestOthers ? null : true,
      operatorId: currentOperatorId?.toString() as string,
    },
    onError: console.error,
  });

  const activityTypes = React.useMemo(
    () =>
      uniqBy(
        [...(data?.operator?.allowedActivityTypes || []), ...(data?.activityTypes || [])],
        ({ id }) => id
      ) || [],
    [data]
  );

  const createToggleTicketAddonHandler = React.useCallback(
    (extra: TicketTypeExtraValue) => () =>
      extras.onChange(
        extras.value?.some(({ id }) => id === extra.id)
          ? extras.value?.filter(({ id }) => id !== extra.id)
          : [...(extras.value || []), extra]
      ),
    [extras]
  );
  return (
    <>
      <View style={{ paddingHorizontal: 8 }} key="manifest-group-config">
        <List.Subheader>Jump type</List.Subheader>
        <ChipSelect
          autoSelectFirst
          items={activityTypes}
          value={activityType.value ? [activityType.value] : []}
          renderItemLabel={(item: ActivityType) => item.name}
          isDisabled={(item: ActivityType) =>
            !data?.operator?.allowedActivityTypes?.map(({ id }) => id).includes(item.id)
          }
          onChange={([selected]) => activityType.onChange(selected)}
        />

        <HelperText type={activityTypeState.error ? 'error' : 'info'}>
          {activityTypeState.error?.message || ''}
        </HelperText>

        <List.Subheader>Ticket</List.Subheader>
        <ChipSelect<TicketTypeValue>
          autoSelectFirst
          items={(data?.operator?.ticketTypes || []) as TicketTypeValue[]}
          value={ticketType.value ? [ticketType.value] : []}
          renderItemLabel={(item) => item.name}
          onChange={([selected]) => ticketType.onChange(selected)}
        />
        <HelperText type={ticketTypeState.error ? 'error' : 'info'}>
          {ticketTypeState.error?.message || ''}
        </HelperText>
        {!ticketType.value?.extras?.length ? null : <List.Subheader>Ticket addons</List.Subheader>}
        <ScrollView horizontal style={styles.ticketAddons}>
          {ticketType.value?.extras?.map((extra) => (
            <Chip
              key={`addon-${extra?.id}`}
              selected={extras.value?.some(({ id }) => id === extra.id)}
              onPress={createToggleTicketAddonHandler(extra)}
            >
              {`${extra.name} (${formatCents(extra.costCents)})`}
            </Chip>
          ))}
        </ScrollView>
        <HelperText type={extrasState.error ? 'error' : 'info'}>
          {extrasState.error?.message || ''}
        </HelperText>
      </View>

      <Divider />

      <View
        style={{ paddingHorizontal: 0, paddingTop: 16, flexGrow: 1 }}
        key="manifest-group-users"
      >
        <List.Subheader style={styles.label}>
          Group
          <GroupPicker
            value={groupNumber.value || null}
            availableGroups={
              (load?.slots?.map(({ groupNumber: number }) => number) as number[]) || []
            }
            onChange={groupNumber.onChange}
          />
        </List.Subheader>
        <HelperText type="error">
          {usersState.error?.message || usersState.error?.root?.message || ''}
        </HelperText>
        {users?.map((slotUser) => (
          <UserCard {...{ slotUser }} key={`manifest-${slotUser.id}`} />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    flex: 1,
  },
  field: {
    marginBottom: 8,
  },
  label: { justifyContent: 'space-between' },
  ticketAddons: {
    marginBottom: 8,
  },
});
