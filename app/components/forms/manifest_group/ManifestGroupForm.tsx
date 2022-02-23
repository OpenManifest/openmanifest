import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { HelperText, Divider, Chip, List } from 'react-native-paper';
import { uniqBy } from 'lodash';
import { useAllowedJumpTypesQuery } from 'app/api/reflection';

import { actions, useAppSelector, useAppDispatch } from 'app/state';

import useRestriction from 'app/hooks/useRestriction';
import { JumpType, Permission, TicketType } from 'app/api/schema.d';
import ChipSelect from '../../input/chip_select/ChipSelect';

import UserRigCard from './UserRigCard';

export default function SlotForm() {
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
      dropzoneId: Number(globalState.currentDropzoneId),
    },
    onError: console.error,
  });

  const isTandem = !!state.fields.ticketType.value?.isTandem;

  return (
    <>
      <View style={{ paddingHorizontal: 8 }}>
        <List.Subheader>Jump type</List.Subheader>
        <ChipSelect
          autoSelectFirst
          items={
            uniqBy(
              [...(data?.dropzone?.allowedJumpTypes || []), ...(data?.jumpTypes || [])],
              ({ id }) => id
            ) || []
          }
          selected={state.fields.jumpType.value ? [state.fields.jumpType.value] : []}
          renderItemLabel={(jumpType: JumpType) => jumpType.name}
          isDisabled={(jumpType: JumpType) =>
            !data?.dropzone?.allowedJumpTypes?.map(({ id }) => id).includes(jumpType.id)
          }
          onChangeSelected={([first]) =>
            dispatch(actions.forms.manifestGroup.setField(['jumpType', first as JumpType]))
          }
        />

        <HelperText type={state.fields.jumpType.error ? 'error' : 'info'}>
          {state.fields.jumpType.error || ''}
        </HelperText>

        <List.Subheader>Ticket</List.Subheader>
        <ChipSelect
          autoSelectFirst
          items={data?.dropzone?.ticketTypes || []}
          selected={state.fields.ticketType.value ? [state.fields.ticketType.value] : []}
          renderItemLabel={(ticketType: TicketType) => ticketType.name}
          onChangeSelected={([first]) =>
            dispatch(actions.forms.manifestGroup.setField(['ticketType', first as TicketType]))
          }
        />
        <HelperText type={state.fields.ticketType.error ? 'error' : 'info'}>
          {state.fields.ticketType.error || ''}
        </HelperText>
      </View>

      {!state?.fields?.ticketType?.value?.extras?.length ? null : (
        <List.Subheader>Ticket addons</List.Subheader>
      )}
      <ScrollView horizontal style={styles.ticketAddons}>
        {state?.fields?.ticketType?.value?.extras?.map((extra) => (
          <Chip
            selected={state?.fields?.extras.value?.some(({ id }) => id === extra.id)}
            onPress={
              state?.fields?.extras.value?.some(({ id }) => id === extra.id)
                ? () =>
                    dispatch(
                      actions.forms.manifestGroup.setField([
                        'extras',
                        state?.fields?.extras.value?.filter(({ id }) => id !== extra.id),
                      ])
                    )
                : () =>
                    dispatch(
                      actions.forms.manifestGroup.setField([
                        'extras',
                        [...(state?.fields?.extras?.value || []), extra],
                      ])
                    )
            }
          >
            {`${extra.name} ($${extra.cost})`}
          </Chip>
        ))}
      </ScrollView>
      <HelperText type={state.fields.extras.error ? 'error' : 'info'}>
        {state.fields.extras.error || ''}
      </HelperText>
      <Divider />

      <View style={{ paddingHorizontal: 16 }}>
        <List.Subheader>Group</List.Subheader>
        {state.fields?.users?.value?.map((slotUser) => (
          <UserRigCard
            dropzoneId={globalState.currentDropzoneId as number}
            dropzoneUserId={Number(slotUser.id)}
            selectedRig={slotUser.rig || undefined}
            exitWeight={slotUser.exitWeight}
            onChangeExitWeight={(exitWeight) =>
              dispatch(
                actions.forms.manifestGroup.setField([
                  'users',
                  state.fields.users.value?.map((user) =>
                    user.id === slotUser.id ? { ...slotUser, exitWeight } : user
                  ),
                ])
              )
            }
            onRemove={() =>
              dispatch(
                actions.forms.manifestGroup.setField([
                  'users',
                  state.fields.users.value?.filter((user) => user.id !== slotUser.id),
                ])
              )
            }
            onChangeRig={(newRig) =>
              dispatch(
                actions.forms.manifestGroup.setField([
                  'users',
                  state.fields.users.value?.map((user) =>
                    user.id === slotUser.id
                      ? { ...slotUser, rigId: Number(newRig.id), rig: newRig }
                      : user
                  ),
                ])
              )
            }
            {...{ isTandem }}
            passengerName={slotUser.passengerName}
            passengerWeight={slotUser.passengerExitWeight}
            onChangePassengerName={(passengerName) =>
              dispatch(
                actions.forms.manifestGroup.setField([
                  'users',
                  state.fields.users.value?.map((user) =>
                    user.id === slotUser.id ? { ...slotUser, passengerName } : user
                  ),
                ])
              )
            }
            onChangePassengerWeight={(passengerExitWeight) =>
              dispatch(
                actions.forms.manifestGroup.setField([
                  'users',
                  state.fields.users.value?.map((user) =>
                    user.id === slotUser.id ? { ...slotUser, passengerExitWeight } : user
                  ),
                ])
              )
            }
          />
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
  ticketAddons: {
    marginBottom: 8,
  },
});
