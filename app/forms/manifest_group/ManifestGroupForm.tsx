import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import { HelperText, Divider, Chip, List } from 'react-native-paper';
import uniqBy from 'lodash/uniqBy';
import { useAllowedJumpTypesQuery } from 'app/api/reflection';
import { useSession } from 'app/state';
import useRestriction from 'app/hooks/useRestriction';
import { JumpType, Permission } from 'app/api/schema.d';
import type { RigEssentialsFragment } from 'app/api/operations';
import ChipSelect from 'app/components/input/chip_select/ChipSelect';
import UserRigCard from './UserRigCard';
import GroupPicker from './GroupPicker';
import {
  ManifestGroupFields,
  SlotUserWithRig,
  TicketTypeExtraValue,
  TicketTypeValue,
} from './useForm';

interface IUserCardProps {
  slotUser: SlotUserWithRig;
}

function UserCard(props: IUserCardProps) {
  const { slotUser } = props;
  const { control, setValue, getValues } = useFormContext<ManifestGroupFields>();
  const isTandem = !!useWatch({ control, name: 'ticketType' })?.isTandem;

  /** Changes this jumper, or removes them when `changes` is null */
  const update = React.useCallback(
    (changes: Partial<SlotUserWithRig> | null) => {
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

  const onChangeExitWeight = React.useCallback(
    (exitWeight: number) => update({ exitWeight }),
    [update]
  );
  const onRemove = React.useCallback(() => update(null), [update]);
  const onChangeRig = React.useCallback(
    (newRig: RigEssentialsFragment) => update({ rigId: Number(newRig.id), rig: newRig }),
    [update]
  );
  const onChangePassengerName = React.useCallback(
    (passengerName: string) => update({ passengerName }),
    [update]
  );
  const onChangePassengerWeight = React.useCallback(
    (passengerExitWeight: number) => update({ passengerExitWeight }),
    [update]
  );

  return (
    <UserRigCard
      key={`user-rig-card-${slotUser.id}`}
      dropzoneUserId={slotUser.id?.toString()}
      selectedRig={slotUser.rig || undefined}
      exitWeight={slotUser.exitWeight}
      {...{
        onChangeExitWeight,
        onRemove,
        onChangeRig,
        onChangePassengerName,
        onChangePassengerWeight,
      }}
      {...{ isTandem }}
      passengerName={slotUser.passengerName}
      passengerWeight={slotUser.passengerExitWeight}
    />
  );
}

/** The jump, ticket and jumpers of a group. Needs to be inside the group form's `FormProvider`. */
export default function ManifestGroupForm() {
  const { control } = useFormContext<ManifestGroupFields>();
  const currentDropzoneId = useSession((session) => session.currentDropzoneId);
  const canManifestOthers = useRestriction(Permission.CreateUserSlot);

  const users = useWatch({ control, name: 'users' });
  const load = useWatch({ control, name: 'load' });
  const { field: jumpType, fieldState: jumpTypeState } = useController({
    name: 'jumpType',
    control,
  });
  const { field: ticketType, fieldState: ticketTypeState } = useController({
    name: 'ticketType',
    control,
  });
  const { field: extras, fieldState: extrasState } = useController({ name: 'extras', control });
  const { field: groupNumber } = useController({ name: 'groupNumber', control });
  const { fieldState: usersState } = useController({ name: 'users', control });

  const { data } = useAllowedJumpTypesQuery({
    variables: {
      allowedForDropzoneUserIds: users?.map((slotUser) => slotUser.id) as number[],
      isPublic: canManifestOthers ? null : true,
      dropzoneId: currentDropzoneId?.toString() as string,
    },
    onError: console.error,
  });

  const jumpTypes = React.useMemo(
    () =>
      uniqBy(
        [...(data?.dropzone?.allowedJumpTypes || []), ...(data?.jumpTypes || [])],
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
          items={jumpTypes}
          value={jumpType.value ? [jumpType.value] : []}
          renderItemLabel={(item: JumpType) => item.name}
          isDisabled={(item: JumpType) =>
            !data?.dropzone?.allowedJumpTypes?.map(({ id }) => id).includes(item.id)
          }
          onChange={([selected]) => jumpType.onChange(selected)}
        />

        <HelperText type={jumpTypeState.error ? 'error' : 'info'}>
          {jumpTypeState.error?.message || ''}
        </HelperText>

        <List.Subheader>Ticket</List.Subheader>
        <ChipSelect<TicketTypeValue>
          autoSelectFirst
          items={(data?.dropzone?.ticketTypes || []) as TicketTypeValue[]}
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
              {`${extra.name} ($${extra.cost})`}
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
