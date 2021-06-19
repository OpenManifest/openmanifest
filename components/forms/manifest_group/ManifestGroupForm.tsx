import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { HelperText, Divider, Chip, List, Card } from 'react-native-paper';
import gql from 'graphql-tag';
import { uniqBy } from 'lodash';

import { actions, useAppSelector, useAppDispatch } from '../../../redux';


import ChipSelect from '../../input/chip_select/ChipSelect';
import { createQuery } from '../../../graphql/createQuery';
import { JumpType, TicketType } from '../../../graphql/schema';

import UserRigCard from "./UserRigCard";
import useCurrentDropzone from '../../../graphql/hooks/useCurrentDropzone';


const QUERY_DROPZONE_USERS_ALLOWED_JUMP_TYPES = gql`
query DropzoneUsersAllowedJumpTypes(
  $dropzoneId: Int!,
  $userIds: [Int!]!
) {
  dropzone(id: $dropzoneId) {
    id

    allowedJumpTypes(userId: $userIds) {
      id
      name
    }

    ticketTypes(isPublic: true) {
      id
      name
      cost

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

const useAllowedJumpTypes = createQuery<{ jumpTypes: JumpType[], allowedJumpTypes: JumpType[], ticketTypes: TicketType[] }, {
  dropzoneId: number,
  userIds: number[],
 }>(QUERY_DROPZONE_USERS_ALLOWED_JUMP_TYPES, {
   getPayload: (query) => ({
     allowedJumpTypes: query?.dropzone?.allowedJumpTypes || [],
     ticketTypes: query?.dropzone?.ticketTypes || [],
     jumpTypes: query?.jumpTypes || [],
   })
 });

export default function SlotForm() {
  const state = useAppSelector(state => state.forms.manifestGroup);
  const globalState = useAppSelector(state => state.global);
  const currentDropzone = useCurrentDropzone();
  const dispatch = useAppDispatch();
  const { data, loading } = useAllowedJumpTypes({
    variables: {
      userIds: state.fields.users?.value?.map((slotUser) => slotUser.id) as number[],
      dropzoneId: Number(currentDropzone?.dropzone?.id),
    },
    onError: console.error
  });

  return ( 
    <>
      <List.Subheader>Jump type</List.Subheader>
      <Card elevation={2} style={{ marginBottom: 16, flexShrink: 1 }}>
        <Card.Content>
            <ChipSelect
              autoSelectFirst
              items={uniqBy([
                  ...(data?.allowedJumpTypes || []),
                  ...(data?.jumpTypes || [])
                ], ({ id }) => id) || []
              }
              selected={state.fields.jumpType.value ? [state.fields.jumpType.value] : []}
              renderItemLabel={(jumpType) => jumpType.name}
              isDisabled={(jumpType) => !data?.allowedJumpTypes?.map(({ id }) => id).includes(jumpType.id)}
              onChangeSelected={([first]) =>
                dispatch(actions.forms.manifestGroup.setField(["jumpType", first]))
              }
            />
            
            <HelperText type={!!state.fields.jumpType.error ? "error" : "info"}>
              { state.fields.jumpType.error || "" }
            </HelperText>
          </Card.Content>
        </Card>

        <List.Subheader>Ticket</List.Subheader>
        <Card elevation={2} style={{ width: "100%" }}>
          <Card.Content>
            <ChipSelect
              autoSelectFirst
              items={data?.ticketTypes || []}
              selected={state.fields.ticketType.value ? [state.fields.ticketType.value] : []}
              renderItemLabel={(ticketType) => ticketType.name}
              isDisabled={() => false}
              onChangeSelected={([first]) =>
                dispatch(actions.forms.manifestGroup.setField(["ticketType", first]))
              }
            />
            <HelperText type={!!state.fields.ticketType.error ? "error" : "info"}>
              { state.fields.ticketType.error || "" }
            </HelperText>

          {
            !state?.fields?.ticketType?.value?.extras?.length ? null:  (
              <List.Subheader>
                Ticket addons
              </List.Subheader>
            )
          }
          <ScrollView horizontal style={styles.ticketAddons}>
            {state?.fields?.ticketType?.value?.extras?.map((extra) =>
              <Chip
                selected={state?.fields?.extras.value?.some(({id}) => id === extra.id)}
                onPress={
                  state?.fields?.extras.value?.some(({id}) => id === extra.id)
                  ? () => dispatch(actions.forms.manifestGroup.setField(["extras", state?.fields?.extras.value?.filter(({ id }) => id !== extra.id)]))
                  : () => dispatch(actions.forms.manifestGroup.setField(["extras", [...(state?.fields?.extras?.value || []), extra]]))
                }
              >
                {`${extra.name} ($${extra.cost})`}
              </Chip>
            )}
          </ScrollView>
          <HelperText type={!!state.fields.extras.error ? "error" : "info"}>
            { state.fields.extras.error || "" }
          </HelperText>
      </Card.Content>
    </Card>
    <Divider />
        

      <List.Subheader>Group</List.Subheader>
      {
        state.fields?.users?.value?.map((slotUser) =>
          <UserRigCard
            dropzoneId={Number(currentDropzone?.dropzone?.id)}
            dropzoneUserId={Number(slotUser.id)}
            rigId={Number(slotUser.rigId) || undefined}
            exitWeight={slotUser.exitWeight}
            onChangeExitWeight={(exitWeight) =>
              dispatch(
                actions.forms.manifestGroup.setField([
                  "users", state.fields.users.value?.map((user) => user.id === slotUser.id
                    ? { ...slotUser, exitWeight }
                    : user
                  )
                ]))
            }
            onChangeRig={(newRig) =>
              dispatch(
                actions.forms.manifestGroup.setField([
                  "users", state.fields.users.value?.map((user) => user.id === slotUser.id
                    ? { ...slotUser, rigId: Number(newRig.id) }
                    : user
                  )
                ]))
            }
          />
        )
      }
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
    marginBottom: 8
  }
});
