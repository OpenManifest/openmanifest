import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { HelperText, Divider, Chip, List } from 'react-native-paper';
import { uniqBy } from 'lodash';
import { useAllowedJumpTypesQuery } from 'app/api/reflection';

import { actions, useAppSelector, useAppDispatch } from 'app/state';

import useRestriction from 'app/hooks/useRestriction';
import { JumpType, Permission, TicketType } from 'app/api/schema.d';
import { RigEssentialsFragment, TicketTypeExtraEssentialsFragment } from 'app/api/operations';
import ChipSelect from '../../input/chip_select/ChipSelect';

import UserRigCard from './UserRigCard';
import { SlotUserWithRig } from './slice';
import GroupPicker from './GroupPicker';

interface IUserCardProps {
  slotUser: SlotUserWithRig;
}

function UserCard(props: IUserCardProps) {
  const { slotUser } = props;
  const state = useAppSelector((root) => root.forms.manifestGroup);
  const dispatch = useAppDispatch();

  const isTandem = !!state.fields.ticketType.value?.isTandem;

  const onChangeExitWeight = React.useCallback(
    (exitWeight: number) =>
      dispatch(
        actions.forms.manifestGroup.setField([
          'users',
          state.fields.users.value?.map((user) =>
            user.id === slotUser.id ? { ...slotUser, exitWeight } : user
          ),
        ])
      ),
    [dispatch, slotUser, state.fields.users.value]
  );

  const onRemove = React.useCallback(
    () =>
      dispatch(
        actions.forms.manifestGroup.setField([
          'users',
          state.fields.users.value?.filter((user) => user.id !== slotUser.id),
        ])
      ),
    [dispatch, slotUser.id, state.fields.users.value]
  );

  const onChangeRig = React.useCallback(
    (newRig: RigEssentialsFragment) =>
      dispatch(
        actions.forms.manifestGroup.setField([
          'users',
          state.fields.users.value?.map((user) =>
            user.id === slotUser.id ? { ...slotUser, rigId: Number(newRig.id), rig: newRig } : user
          ),
        ])
      ),
    [dispatch, slotUser, state.fields.users.value]
  );

  const onChangePassengerName = React.useCallback(
    (passengerName: string) =>
      dispatch(
        actions.forms.manifestGroup.setField([
          'users',
          state.fields.users.value?.map((user) =>
            user.id === slotUser.id ? { ...slotUser, passengerName } : user
          ),
        ])
      ),
    [dispatch, slotUser, state.fields.users.value]
  );
  const onChangePassengerWeight = React.useCallback(
    (passengerExitWeight: number) =>
      dispatch(
        actions.forms.manifestGroup.setField([
          'users',
          state.fields.users.value?.map((user) =>
            user.id === slotUser.id ? { ...slotUser, passengerExitWeight } : user
          ),
        ])
      ),
    [dispatch, slotUser, state.fields.users.value]
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
export default function ManifestGroupForm() {
  const state = useAppSelector((root) => root.forms.manifestGroup);
  const globalState = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();
  const canManifestOthers = useRestriction(Permission.CreateUserSlot);
  const { data } = useAllowedJumpTypesQuery({
    variables: {
      allowedForDropzoneUserIds: state.fields.users?.value?.map(
        (slotUser) => slotUser.id
      ) as number[],
      isPublic: canManifestOthers ? null : true,
      dropzoneId: globalState.currentDropzoneId?.toString() as string,
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
    (extra: TicketTypeExtraEssentialsFragment) => () =>
      dispatch(
        actions.forms.manifestGroup.setField([
          'extras',
          state?.fields?.extras.value?.some(({ id }) => id === extra.id)
            ? state?.fields?.extras.value?.filter(({ id }) => id !== extra.id)
            : [...(state?.fields?.extras?.value || []), extra],
        ])
      ),
    [dispatch, state?.fields?.extras.value]
  );
  return (
    <>
      <View style={{ paddingHorizontal: 8 }} key="manifest-group-config">
        <List.Subheader>Jump type</List.Subheader>
        <ChipSelect
          autoSelectFirst
          items={jumpTypes}
          value={state.fields.jumpType.value ? [state.fields.jumpType.value] : []}
          renderItemLabel={(jumpType: JumpType) => jumpType.name}
          isDisabled={(jumpType: JumpType) =>
            !data?.dropzone?.allowedJumpTypes?.map(({ id }) => id).includes(jumpType.id)
          }
          onChange={([firstUser]) =>
            dispatch(actions.forms.manifestGroup.setField(['jumpType', firstUser as JumpType]))
          }
        />

        <HelperText type={state.fields.jumpType.error ? 'error' : 'info'}>
          {state.fields.jumpType.error || ''}
        </HelperText>

        <List.Subheader>Ticket</List.Subheader>
        <ChipSelect
          autoSelectFirst
          items={data?.dropzone?.ticketTypes || []}
          value={state.fields.ticketType.value ? [state.fields.ticketType.value] : []}
          renderItemLabel={(ticketType: TicketType) => ticketType.name}
          onChange={([firstUser]) =>
            dispatch(actions.forms.manifestGroup.setField(['ticketType', firstUser as TicketType]))
          }
        />
        <HelperText type={state.fields.ticketType.error ? 'error' : 'info'}>
          {state.fields.ticketType.error || ''}
        </HelperText>
        {!state?.fields?.ticketType?.value?.extras?.length ? null : (
          <List.Subheader>Ticket addons</List.Subheader>
        )}
        <ScrollView horizontal style={styles.ticketAddons}>
          {state?.fields?.ticketType?.value?.extras?.map((extra) => (
            <Chip
              key={`addon-${extra?.id}`}
              selected={state?.fields?.extras.value?.some(({ id }) => id === extra.id)}
              onPress={createToggleTicketAddonHandler(extra as TicketTypeExtraEssentialsFragment)}
            >
              {`${extra.name} ($${extra.cost})`}
            </Chip>
          ))}
        </ScrollView>
        <HelperText type={state.fields.extras.error ? 'error' : 'info'}>
          {state.fields.extras.error || ''}
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
            value={state?.fields?.groupNumber?.value || null}
            availableGroups={
              state?.fields?.load?.value?.slots?.map(({ groupNumber }) => groupNumber) || []
            }
            onChange={(groupNumber) =>
              dispatch(actions.forms.manifestGroup.setField(['groupNumber', groupNumber]))
            }
          />
        </List.Subheader>
        {state.fields?.users?.value?.map((slotUser) => (
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
