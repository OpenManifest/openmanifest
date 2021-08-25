import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { HelperText, Divider, Chip, List, Card } from 'react-native-paper';
import gql from 'graphql-tag';
import { uniqBy } from 'lodash';

import { actions, useAppSelector, useAppDispatch } from '../../../state';

import useRestriction from '../../../hooks/useRestriction';
import ChipSelect from '../../input/chip_select/ChipSelect';
import { createQuery } from '../../../api/createQuery';
import { JumpType, Permission, TicketType } from '../../../api/schema.d';

import UserRigCard from './UserRigCard';

const QUERY_DROPZONE_USERS_ALLOWED_JUMP_TYPES = gql`
  query DropzoneUsersAllowedJumpTypes($dropzoneId: Int!, $userIds: [Int!]!, $isPublic: Boolean) {
    dropzone(id: $dropzoneId) {
      id

      allowedJumpTypes(userId: $userIds) {
        id
        name
      }

      ticketTypes(isPublic: $isPublic) {
        id
        name
        cost
        isTandem

        extras {
          id
          cost
          name
        }
      }
    }
    jumpTypes {
      id
      name
    }
  }
`;

const useAllowedJumpTypes = createQuery<
  {
    jumpTypes: JumpType[];
    allowedJumpTypes: JumpType[];
    ticketTypes: TicketType[];
  },
  {
    dropzoneId: number;
    userIds: number[];
    isPublic: boolean | null;
  }
>(QUERY_DROPZONE_USERS_ALLOWED_JUMP_TYPES, {
  getPayload: (query) => ({
    allowedJumpTypes: query?.dropzone?.allowedJumpTypes || [],
    ticketTypes: query?.dropzone?.ticketTypes || [],
    jumpTypes: query?.jumpTypes || [],
  }),
});

export default function SlotForm() {
  const state = useAppSelector((root) => root.forms.manifestGroup);
  const globalState = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();
  const canManifestOthers = useRestriction(Permission.CreateUserSlot);
  const { data } = useAllowedJumpTypes({
    variables: {
      userIds: state.fields.users?.value?.map((slotUser) => slotUser.id) as number[],
      dropzoneId: globalState.currentDropzoneId as number,
      isPublic: canManifestOthers ? null : true,
    },
    onError: console.error,
  });

  const isTandem = !!state.fields.ticketType.value?.isTandem;

  return (
    <>
      <List.Subheader>Jump type</List.Subheader>
      <Card elevation={2} style={{ marginBottom: 16, flexShrink: 1, marginHorizontal: 16 }}>
        <Card.Content>
          <ChipSelect
            autoSelectFirst
            items={
              uniqBy(
                [...(data?.allowedJumpTypes || []), ...(data?.jumpTypes || [])],
                ({ id }) => id
              ) || []
            }
            selected={state.fields.jumpType.value ? [state.fields.jumpType.value] : []}
            renderItemLabel={(jumpType: JumpType) => jumpType.name}
            isDisabled={(jumpType: JumpType) =>
              !data?.allowedJumpTypes?.map(({ id }) => id).includes(jumpType.id)
            }
            onChangeSelected={([first]) =>
              dispatch(actions.forms.manifestGroup.setField(['jumpType', first as JumpType]))
            }
          />

          <HelperText type={state.fields.jumpType.error ? 'error' : 'info'}>
            {state.fields.jumpType.error || ''}
          </HelperText>
        </Card.Content>
      </Card>

      <List.Subheader>Ticket</List.Subheader>
      <Card elevation={2} style={{ marginHorizontal: 16 }}>
        <Card.Content>
          <ChipSelect
            autoSelectFirst
            items={data?.ticketTypes || []}
            selected={state.fields.ticketType.value ? [state.fields.ticketType.value] : []}
            renderItemLabel={(ticketType: TicketType) => ticketType.name}
            onChangeSelected={([first]) =>
              dispatch(actions.forms.manifestGroup.setField(['ticketType', first as TicketType]))
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
        </Card.Content>
      </Card>
      <Divider />

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
